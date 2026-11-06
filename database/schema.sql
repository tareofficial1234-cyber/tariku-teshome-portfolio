CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(140) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Development',
  description TEXT NOT NULL,
  tech TEXT[] NOT NULL DEFAULT '{}',
  link TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(180) NOT NULL,
  subject VARCHAR(180),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(80) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO projects (title, category, description, tech, link, featured)
SELECT 'Student Attendance Management System', 'Full-stack development',
       'A student attendance platform with manual attendance, QR-based check-in, dashboards and reporting.',
       ARRAY['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'SQLite'], NULL, true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Student Attendance Management System');

INSERT INTO projects (title, category, description, tech, link, featured)
SELECT 'Werabe University CS Learning Hub', 'Education technology',
       'A learning hub concept for computer science students, bringing course materials, quizzes, discussions and learning resources together.',
       ARRAY['JavaScript', 'Node.js', 'Express', 'Database'], 'https://werabe-university-cs-learning-hub-2.onrender.com/', true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Werabe University CS Learning Hub');

INSERT INTO projects (title, category, description, tech, link, featured)
SELECT 'King Academy Registration Management', 'School management',
       'A school registration management project concept designed to organize student information and administrative workflows.',
       ARRAY['Web development', 'Database design'], NULL, true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'King Academy Registration Management');