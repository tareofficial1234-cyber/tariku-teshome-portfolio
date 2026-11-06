const $ = (id) => document.getElementById(id);
let adminKey = '';
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey, ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); adminKey = $('adminKey').value;
  $('loginStatus').textContent = 'Checking access…';
  try {
    await api('/api/admin/messages');
    $('loginPanel').hidden = true; $('dashboard').hidden = false;
    await refreshDashboard();
  } catch (err) { adminKey = ''; $('loginStatus').textContent = err.message + ' Check your server ADMIN_API_KEY.'; }
});
$('logoutBtn').addEventListener('click', () => { adminKey = ''; $('adminKey').value = ''; $('dashboard').hidden = true; $('loginPanel').hidden = false; $('loginStatus').textContent = 'Dashboard locked.'; });
$('refreshBtn').addEventListener('click', refreshDashboard);
async function refreshDashboard() {
  $('adminProjects').textContent = 'Loading projects…'; $('adminMessages').textContent = 'Loading messages…';
  try {
    const [projects, messages, health] = await Promise.all([api('/api/projects'), api('/api/admin/messages'), fetch('/api/health').then(r => r.json())]);
    $('projectCount').textContent = projects.length; $('messageCount').textContent = messages.length; $('dbStatus').textContent = health.database === 'connected' ? 'Connected' : 'Offline';
    $('adminProjects').innerHTML = projects.length ? projects.map(p => `<article class="admin-item"><strong>${esc(p.title)}</strong><p>${esc(p.description)}</p><small>${esc(p.category)} · ${(p.tech || []).map(esc).join(', ')}</small><div class="item-actions"><button class="delete-button" data-delete="${Number(p.id)}">Delete project</button></div></article>`).join('') : '<p class="empty-state">No projects yet.</p>';
    $('adminMessages').innerHTML = messages.length ? messages.map(m => `<article class="admin-item"><strong>${esc(m.name)} · ${esc(m.subject || 'No subject')}</strong><p>${esc(m.message)}</p><small><a href="mailto:${esc(m.email)}">${esc(m.email)}</a> · ${new Date(m.created_at).toLocaleString()}</small></article>`).join('') : '<p class="empty-state">No contact messages yet.</p>';
    document.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => { if (!confirm('Delete this project?')) return; try { await api('/api/admin/projects/' + btn.dataset.delete, { method: 'DELETE' }); await refreshDashboard(); } catch (e) { alert(e.message); } }));
  } catch (err) { $('adminProjects').textContent = err.message; $('adminMessages').textContent = err.message; }
}
$('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault(); const form = new FormData(e.currentTarget);
  const payload = { title: form.get('title'), category: form.get('category'), description: form.get('description'), tech: String(form.get('tech') || '').split(',').map(x => x.trim()).filter(Boolean), link: form.get('link'), featured: form.get('featured') === 'on' };
  try { await api('/api/admin/projects', { method: 'POST', body: JSON.stringify(payload) }); $('projectStatus').textContent = 'Project saved successfully.'; e.currentTarget.reset(); await refreshDashboard(); }
  catch (err) { $('projectStatus').textContent = err.message; }
});
