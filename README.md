# Tariku Teshome — Full-Stack Developer Portfolio

A responsive personal portfolio built with HTML, CSS, vanilla JavaScript, Node.js, Express and PostgreSQL. Your supplied brand banner is included at `public/images/tariku-brand.png`.

## Features

- Creative gradient visual identity inspired by your blue/cyan developer logo
- Responsive navigation and mobile layout
- About, skills, projects, services and contact sections
- Projects loaded dynamically from PostgreSQL
- Separate graphic design showcase section (sample concepts are clearly identified)
- Admin dashboard at `/admin.html` to add/delete projects and review contact messages
- Contact form stores messages in PostgreSQL
- Private admin API for adding/deleting projects and reading messages
- Helmet security headers, input validation and contact rate limiting
- Render-ready start command and PostgreSQL configuration

## Requirements

- Node.js 20+
- PostgreSQL database (local PostgreSQL, Render PostgreSQL, Neon, etc.)

## Run locally on Windows

1. Extract the ZIP.
2. Open Command Prompt in the extracted `tariku-teshome-portfolio` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env` and edit `DATABASE_URL`, `DB_SSL`, and `ADMIN_API_KEY`.

   Windows CMD:

   ```cmd
   copy .env.example .env
   notepad .env
   ```

5. Create a PostgreSQL database named `tariku_portfolio` (or use a database you already have).
6. Run the schema in that database:

   ```bash
   psql -d tariku_portfolio -f database/schema.sql
   ```

   Alternatively, open `database/schema.sql` in pgAdmin Query Tool and execute it.

7. Start the server:

   ```bash
   npm start
   ```

8. Open http://localhost:3000

## PostgreSQL connection examples

Local:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/tariku_portfolio
DB_SSL=false
```

Hosted PostgreSQL providers commonly require SSL:

```env
DATABASE_URL=YOUR_PROVIDER_CONNECTION_STRING
DB_SSL=true
```

Do not commit `.env` or expose your database URL/admin key publicly.

## Admin dashboard

Open `http://localhost:3000/admin.html` (or `/admin.html` on your deployed site). Enter the `ADMIN_API_KEY` value from your server environment to unlock the dashboard. From there you can add and delete projects and review contact messages. The key is entered by the administrator and is not embedded in frontend source code.

The same protected API can also be used with an API client such as Postman or curl by sending the secret in the `x-admin-key` header.

Read messages:

```bash
curl -H "x-admin-key: YOUR_ADMIN_API_KEY" http://localhost:3000/api/admin/messages
```

Add a project:

```bash
curl -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  -d "{\"title\":\"My new project\",\"category\":\"Development\",\"description\":\"Project summary\",\"tech\":[\"Node.js\",\"PostgreSQL\"],\"featured\":true}"
```

Delete a project:

```bash
curl -X DELETE -H "x-admin-key: YOUR_ADMIN_API_KEY" http://localhost:3000/api/admin/projects/1
```

Keep your admin key private. For a public production admin dashboard, add proper user accounts, password hashing, sessions and CSRF protection rather than exposing a shared key in browser JavaScript.

## Deploy to Render

1. Push this folder to a GitHub repository.
2. Create a PostgreSQL database on Render or use another hosted PostgreSQL provider.
3. Create a Render Web Service connected to the repository.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `DATABASE_URL` = your database internal/external connection string as appropriate
   - `DB_SSL` = `true` if your provider requires SSL
   - `ADMIN_API_KEY` = a long random secret
   - `NODE_ENV` = `production`
7. Execute `database/schema.sql` against the hosted database once.
8. Deploy and test `/api/health`.

## Customize

- Replace the sample project records in `database/schema.sql` with your confirmed project descriptions.
- Add design work by creating a gallery section and placing approved images under `public/images/`.
- Update email and social links in `public/index.html`.
- Edit colors and layout in `public/css/styles.css`.

## Important notes

- Project entries are initial sample portfolio content based on the projects you have described; verify and edit details before publishing.
- The contact form requires a working PostgreSQL connection. It does not send email; it saves messages in the database.
- No passwords, database credentials or admin secrets are included in this ZIP.
