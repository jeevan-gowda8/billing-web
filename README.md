# ATS Corporate Reimbursement Portal

Enterprise reimbursement management application for **Abhyudaya Techno Solutions**. Easily track individual and collective tour expense claims, enforce travel & allowance policy caps, and export audit-ready Excel workbooks.

---

## 🚀 Live Demo & GitHub Pages Hosting

This application is fully configured for deployment on **GitHub Pages**:
- **Expected URL**: `https://jeevan-gowda8.github.io/billing-web/`
- **Relative Base Asset Routing**: Configured in `vite.config.js` (`base: './'`) to work smoothly under any repository subpath.
- **Client-Side Resilient Storage**: When hosted on GitHub Pages (static mode), claims and rosters persist in browser `localStorage` seeded with sample data. If a FastAPI backend is connected, it seamlessly switches to live database sync.

---

## 🛠️ Deployment Methods

You have two simple ways to deploy to GitHub Pages:

### Method 1: Automatic Deployment with GitHub Actions (Recommended)

1. Push your latest code to the `main` branch:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```
2. Go to your repository on GitHub:
   - Navigate to **Settings** > **Pages** (under "Code and automation").
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The included workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) will automatically trigger, build the Vite app, and publish it to GitHub Pages.

---

### Method 2: Manual 1-Command Deploy (`gh-pages`)

If you prefer deploying directly from your local terminal:
```bash
npm run deploy
```
This runs `npm run build` and automatically pushes the compiled `dist/` directory to the `gh-pages` branch on GitHub.
- In **GitHub** > **Settings** > **Pages**, ensure **Source** is set to **Deploy from a branch** and select `gh-pages` / `/ (root)`.

---

## 💻 Local Development

### 1. Frontend (React + Vite)
```bash
npm install
npm run dev
```
Accessible at: `http://localhost:5173`

### 2. Backend (FastAPI + SQLite, Optional for Full Sync)
```bash
cd backend
python main.py
```
API running on: `http://127.0.0.1:8000`

---

## ⚙️ Environment Variables (Optional)

If you host the FastAPI backend separately (e.g., on Render, Railway, or Fly.io) and want your GitHub Pages frontend to sync with that live backend:

1. Create a `.env.production` file:
   ```env
   VITE_API_BASE=https://your-backend-api.onrender.com/api
   ```
2. Re-deploy. The frontend will automatically target your cloud backend API instead of the local fallback.
