# 🚀 Deploy Vue.js App to GitHub Pages (Step-by-Step Guide)

This guide explains how to deploy your **Vue.js frontend app** (connected to Google Apps Script backend) to **GitHub Pages** for free hosting.

---

# 📌 Prerequisites

- Node.js installed
- Git installed
- GitHub account
- Vue project (created using Vite)

---

# 🧠 Project Architecture

```
Vue.js (Frontend - GitHub Pages)
        ↓ API Calls
Apps Script (Backend API)
        ↓
Google Sheets (Database)
```

---

# ⚡ Step 1: Create Vue App (if not created)

```bash
npm create vite@latest homeschool-app
cd homeschool-app
npm install
npm run dev
```

Select:

Framework: Vue  
Variant: JavaScript

---

# 🔗 Step 2: Connect to Apps Script API

Create file:

src/services/api.js

Example:

```javascript
const BASE_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL";

export async function getStudents() {
  const res = await fetch(`${BASE_URL}?action=getStudents`);
  return res.json();
}
```

---

# 🏗️ Step 3: Build the Project

```bash
npm run build
```

This creates a `dist/` folder (production build).

---

# 🌐 Step 4: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
```

---

# 📂 Step 5: Create GitHub Repository

1. Go to GitHub
2. Click **New Repository**
3. Name it (e.g., `homeschool-app`)
4. Do NOT initialize with README

---

# 🔗 Step 6: Connect Local Repo to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/homeschool-app.git
git branch -M main
git push -u origin main
```

---

# 🚀 Step 7: Install GitHub Pages Deployment Tool

```bash
npm install gh-pages --save-dev
```

---

# ⚙️ Step 8: Update `package.json`

Add:

```json
"homepage": "https://YOUR_USERNAME.github.io/homeschool-app",
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist"
}
```

---

# 🚀 Step 9: Deploy to GitHub Pages

```bash
npm run deploy
```

---

# 🌍 Step 10: Enable GitHub Pages

1. Go to your repository
2. Click **Settings**
3. Go to **Pages**
4. Source: `gh-pages` branch
5. Save

---

# ✅ Your Site URL

https://YOUR_USERNAME.github.io/homeschool-app

---

# ⚠️ Important Fix (Routing Issue)

If using Vue Router:

```javascript
export default defineConfig({
  base: '/homeschool-app/',
  plugins: [vue()]
})
```

---

# 🔐 CORS Note (Apps Script)

```javascript
return ContentService
  .createTextOutput(JSON.stringify(data))
  .setMimeType(ContentService.MimeType.JSON);
```

---

# 🧪 Testing Checklist

- ✅ API working
- ✅ Vue app loads data
- ✅ No CORS errors
- ✅ GitHub Pages URL working

---

# 🔥 Bonus Tips

## Use Environment Variables

Create `.env`:

```
VITE_API_URL=YOUR_APPS_SCRIPT_URL
```

Use in code:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL;
```

---

# 🎯 Final Result

- ⚡ Fast UI (Vue.js)
- ☁️ Free Backend (Apps Script)
- 📊 Google Sheets DB
- 🌍 Free Hosting (GitHub Pages)

---

# 🧰 CLASP Command Cheat Sheet

## 🔹 1. Authentication

```bash
clasp login

Login with your Google account

clasp logout

Logout current session

🔹 2. Create / Clone Projects
clasp create --title "MyApp" --type webapp

Create new Apps Script project

clasp clone <SCRIPT_ID>

Clone existing Apps Script project

Script ID example:

https://script.google.com/d/SCRIPT_ID/edit
🔹 3. Push & Pull Code
clasp push

Upload local code → Apps Script

clasp pull

Download latest code → local

clasp push --force

Force overwrite (use carefully ⚠️)

🔹 4. Open Project
clasp open

Opens project in browser

clasp open-script

Opens Apps Script editor

🔹 5. Deployments
clasp deploy

Create new deployment

clasp deployments

List all deployments

clasp deploy --deploymentId <DEPLOYMENT_ID>

Update existing deployment

🔹 6. Web App Deployment

After deploy, you’ll get a Web App URL

To update after code change:

clasp push
clasp deploy --deploymentId <DEPLOYMENT_ID>
🔹 7. Logs & Debugging
clasp logs

View execution logs

clasp logs --watch

Live logs

clasp logs --json

Logs in JSON format

🔹 8. Run Functions from CLI
clasp run functionName

Example:

clasp run getData
🔹 9. Versions
clasp version "Added API endpoint"

Create version for deployment

🔹 10. Project Settings
clasp status

See changed files

clasp setting

Open .clasp.json

🔹 11. Enable APIs
clasp apis list
clasp apis enable drive
⚡ Typical Workflow
🧩 First Time Setup
clasp login
clasp create --type webapp
clasp push
clasp deploy
🔁 Daily Development Flow
clasp push
clasp deploy --deploymentId <ID>
🔍 Debugging
clasp logs --watch
💡 Pro Tips
.clasp.json Example
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "dist"
}
.claspignore Example
node_modules/
.git/
