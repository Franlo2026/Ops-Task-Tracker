# Bootlegger Task Tracker — Railway Deployment Guide

## What you're deploying
A Node.js + PostgreSQL application on Railway. Your data lives in a proper
database. The app is accessible at a permanent public URL with no logins required.

---

## Step 1 — Put the project on GitHub

1. Go to github.com and sign in
2. Click **+ New repository** (top right, the + icon)
3. Name it: `bootlegger-task-tracker`
4. Set it to **Private**, click **Create repository**
5. On your computer, open the `bootlegger-tracker` folder you downloaded
6. Follow GitHub's instructions to push the folder:
   - Install Git if you don't have it: git-scm.com/downloads
   - In a terminal/command prompt inside the folder, run:
     ```
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/bootlegger-task-tracker.git
     git push -u origin main
     ```

---

## Step 2 — Create a Railway project

1. Go to **railway.app** and sign in with your GitHub account
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Find and select `bootlegger-task-tracker`
5. Railway will detect it's a Node.js app and start building automatically

---

## Step 3 — Add PostgreSQL database

1. Inside your Railway project, click **+ Add Service**
2. Select **Database → Add PostgreSQL**
3. Railway creates the database and automatically sets the `DATABASE_URL`
   environment variable in your app — no manual config needed

---

## Step 4 — Set environment variable

1. Click on your app service (not the database)
2. Go to **Variables** tab
3. Add: `NODE_ENV` = `production`
4. Railway redeploys automatically

---

## Step 5 — Get your public URL

1. Click on your app service → **Settings** tab
2. Under **Networking**, click **Generate Domain**
3. Railway gives you a URL like `bootlegger-task-tracker.up.railway.app`
4. Share this URL with your team — it's live immediately

---

## Custom domain (optional)

In Settings → Networking → Custom Domain, add your own domain
(e.g. `tasks.bootlegger.coffee`). Update your DNS CNAME record to point
to the Railway domain. Railway handles SSL certificates automatically.

---

## Cost

Railway Hobby plan: **$5/month** flat fee
Includes: 512MB RAM, shared CPU, 1GB PostgreSQL storage
This is more than enough for the Bootlegger tracker at any scale.

---

## Updating the app

Any time you push a change to GitHub, Railway redeploys automatically.
Zero downtime. No manual steps.

```
git add .
git commit -m "Update store list"
git push
```

That's it. Your live URL stays the same.
