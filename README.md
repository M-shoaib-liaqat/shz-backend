# SHZ Backend (Express + SQLite)

### Endpoints
- `POST /api/auth/login`
- `GET /api/projects` (public)
- `POST /api/projects` (auth, multipart field: `image`)
- `DELETE /api/projects/:id` (auth)
- `GET /api/services` (public)
- `POST /api/services` (auth)
- `DELETE /api/services/:id` (auth)
- `GET /api/testimonials` (public)
- `POST /api/testimonials` (auth)
- `DELETE /api/testimonials/:id` (auth)
- `POST /api/messages` (public; website contact form)
- `GET /api/messages` (auth)

### Quick Start
```bash
npm install
cp .env.example .env   # or create .env on Windows manually
npm run dev            # or: npm start
```
Frontend `.env` should point to this API:
```
VITE_API_URL=http://localhost:5000
```
Uploads are served at `/uploads/...` (absolute URL like `http://localhost:5000/uploads/xxx.jpg`).
