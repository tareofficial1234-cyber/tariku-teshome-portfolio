const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
document.getElementById('year').textContent = new Date().getFullYear();

const grid = document.getElementById('projectGrid');
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function projectCard(project, index) {
  const tech = Array.isArray(project.tech) ? project.tech : [];
  const link = project.link && /^https?:\/\//i.test(project.link)
    ? `<a class="project-link" href="${escapeHtml(project.link)}" target="_blank" rel="noreferrer">View project ↗</a>` : '';
  return `<article class="project-card glass">
    <div class="project-top"><span>0${index + 1}</span><span>✳</span></div>
    <div class="project-body"><div class="project-category">${escapeHtml(project.category)}</div>
    <h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p>
    <div class="project-tech">${tech.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}</div>${link}</div></article>`;
}
async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error('Projects endpoint unavailable');
    const projects = await response.json();
    grid.innerHTML = projects.length ? projects.map(projectCard).join('') : '<div class="loading-card glass">Projects will appear here soon.</div>';
  } catch {
    grid.innerHTML = '<div class="loading-card glass">Projects are temporarily unavailable. Please check back soon.</div>';
  }
}
loadProjects();

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = contactForm.querySelector('button');
  button.disabled = true;
  button.textContent = 'Sending…';
  formStatus.textContent = '';
  try {
    const payload = Object.fromEntries(new FormData(contactForm).entries());
    const response = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to send message.');
    formStatus.textContent = result.message;
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = error.message || 'Something went wrong. Please try again.';
    formStatus.style.color = '#ff9baf';
  } finally {
    button.disabled = false;
    button.innerHTML = 'Send message <span>↗</span>';
  }
});