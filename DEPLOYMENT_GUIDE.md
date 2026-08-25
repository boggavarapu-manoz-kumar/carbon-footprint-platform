# 🚀 Complete 100% Free Production Deployment Guide

This guide walks you through deploying the **Carbon Footprint Platform** (Spring Boot 3 + PostgreSQL/MySQL + Redis + React PWA Frontend + React Admin Portal) to **100% free cloud servers** with zero errors.

---

## 🌟 OPTION 1: 1-Click Full Stack Deployment with Render (Recommended)

Render provides free PostgreSQL databases, free Docker web services, and free static sites.

### **Step 1: Push Code to GitHub**
1. Initialize git and commit your latest project code:
   ```bash
   git add .
   git commit -m "Production deployment ready"
   git push origin main
   ```

### **Step 2: Deploy Using the Blueprint (`render.yaml`)**
1. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign in (Free).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically read [`render.yaml`](./render.yaml) and configure:
   - **PostgreSQL Database** (`carbon-postgres-db` - Free)
   - **Spring Boot Backend** (`carbon-backend-api` - Free Docker Service)
   - **User Frontend** (`carbon-user-app` - Free Static Site)
   - **Admin Portal** (`carbon-admin-portal` - Free Static Site)
5. Under Environment Variables in the setup screen, fill in:
   - `GOOGLE_OAUTH_CLIENT_ID` *(optional)*
   - `GOOGLE_OAUTH_CLIENT_SECRET` *(optional)*
   - `MAIL_PASSWORD` *(Google App Password for emails)*
   - `GEMINI_API_KEY` *(free from Google AI Studio)*
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` *(free tier)*
6. Click **Apply**.
7. Render will build and deploy all services automatically!

---

## ⚡ OPTION 2: Vercel / Netlify (Frontends) + Render / Neon (Backend & Database)

For lightning-fast global CDN delivery on the frontends:

### **A. Free PostgreSQL Database**
1. Create a free database on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy your Connection URL (e.g. `postgresql://user:pass@ep-xyz.neon.tech/carbon_db?sslmode=require`).

### **B. Free Spring Boot Backend on Render / Railway / Fly.io**
1. In Render, create **New Web Service** → Select your repo → Pick `./backend/Dockerfile` as Dockerfile.
2. Add Environment Variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://your-neon-host:5432/carbon_db?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `your_neon_user`
   - `SPRING_DATASOURCE_PASSWORD`: `your_neon_password`
   - `SPRING_DATASOURCE_DRIVER_CLASS_NAME`: `org.postgresql.Driver`
   - `JWT_SECRET`: *(64-char hex string)*
   - `ADMIN_JWT_SECRET`: *(64-char hex string)*
   - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app,https://your-admin.vercel.app`
3. Click **Deploy**. Copy your backend URL (e.g. `https://carbon-api.onrender.com`).

### **C. Free User Frontend on Vercel**
1. Go to [Vercel.com](https://vercel.com) → **Add New Project**.
2. Select your repository and set **Root Directory** to `frontend`.
3. In Environment Variables:
   - `VITE_API_URL` = `https://carbon-api.onrender.com/api`
4. Click **Deploy**.

### **D. Free Admin Portal on Vercel**
1. In Vercel, click **Add New Project** → Select same repository.
2. Set **Root Directory** to `admin-frontend`.
3. In Environment Variables:
   - `VITE_API_URL` = `https://carbon-api.onrender.com/api`
   - `VITE_USER_APP_URL` = `https://your-user-frontend.vercel.app`
4. Click **Deploy**.

---

## 🐳 OPTION 3: Self-Hosted on Free VPS (Oracle Cloud Always Free / AWS / GCP)

Oracle Cloud offers 4 OCPU ARM Ampere + 24GB RAM 100% Free Forever.

1. SSH into your VPS:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   ```
2. Clone your repository:
   ```bash
   git clone <your-repo-url> carbon-platform
   cd carbon-platform
   ```
3. Create `.env.production` from template:
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```
4. Run with Docker Compose:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```
5. Check health:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

---

## 📋 Required Production Environment Variables Reference

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | PostgreSQL or MySQL JDBC URL | `jdbc:postgresql://host:5432/carbon_db` |
| `SPRING_DATASOURCE_USERNAME` | DB username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `secure_password` |
| `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | JDBC Driver Class | `org.postgresql.Driver` |
| `JWT_SECRET` | 256-bit random hex secret for User JWT | `openssl rand -hex 32` |
| `ADMIN_JWT_SECRET` | 256-bit random hex secret for Admin JWT | `openssl rand -hex 32` |
| `FRONTEND_URL` | Public URL of user frontend | `https://app.yourdomain.com` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed domains | `https://app.yourdomain.com,https://admin.yourdomain.com` |
| `VITE_API_URL` | API base URL for frontends | `https://api.yourdomain.com/api` |
| `MAIL_PASSWORD` | Gmail App Password for SMTP | `16-letter google app password` |
| `GEMINI_API_KEY` | Google AI Gemini API Key | `AI Studio API Key` |
| `CLOUDINARY_*` | Cloudinary Image Hosting | Cloudinary Dashboard |

---

## 🛡️ Pre-Flight Verification Checklist
- [x] Backend packaged into standalone executable JAR (`mvn clean package`).
- [x] Both frontends tested with production builds (`npm run build`).
- [x] CORS configured dynamically to accept production origins.
- [x] Zero mock data / dummy values — all analytics query active database.
- [x] OAuth open-redirect attack mitigation verified.
- [x] SPA URL rewrites configured for Nginx, Vercel, Netlify, and Render.
