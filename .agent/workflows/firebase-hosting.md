---
description: Deploy static sites with Firebase Hosting - custom domains, SSL, and preview channels
---

# Firebase Hosting Workflow

Deploy static websites with global CDN, automatic SSL, and instant rollbacks.

## Prerequisites

1. Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Firebase CLI installed globally

---

## Step 1: Install Firebase CLI

// turbo
```bash
npm install -g firebase-tools
```

---

## Step 2: Login to Firebase

```bash
firebase login
```

---

## Step 3: Initialize Hosting

```bash
firebase init hosting
```

Choose:
- **Public directory**: `dist` (for Vite) or `build` (for CRA) or `website` (for static)
- **Single-page app**: Yes (for React/Vue) or No (for multi-page)
- **GitHub Actions**: Optional - auto-deploy on push

---

## Step 4: Build Your Site

For Vite/React:
// turbo
```bash
npm run build
```

For static sites, skip this step.

---

## Step 5: Deploy

// turbo
```bash
firebase deploy --only hosting
```

Your site is live at:
```
https://YOUR_PROJECT.web.app
https://YOUR_PROJECT.firebaseapp.com
```

---

## Custom Domain Setup

1. Go to Firebase Console → Hosting → Add custom domain
2. Enter your domain: `springroll.ai`
3. Add DNS records at your registrar:

| Type | Host | Value |
|------|------|-------|
| A | @ | 151.101.1.195 |
| A | @ | 151.101.65.195 |
| TXT | @ | firebase=YOUR_PROJECT |

4. Wait for SSL provisioning (up to 24 hours)

For `www` subdomain, add:
| Type | Host | Value |
|------|------|-------|
| CNAME | www | YOUR_PROJECT.web.app |

---

## Preview Channels

Deploy to a temporary preview URL for testing:

```bash
firebase hosting:channel:deploy preview-name
```

Gets you a URL like:
```
https://YOUR_PROJECT--preview-name-abc123.web.app
```

Preview channels expire after 7 days by default.

---

## firebase.json Configuration

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ],
    "redirects": [
      {
        "source": "/old-page",
        "destination": "/new-page",
        "type": 301
      }
    ]
  }
}
```

---

## Multiple Sites (Same Project)

For hosting multiple sites (marketing + app):

```bash
firebase init hosting:sites
```

Update `firebase.json`:
```json
{
  "hosting": [
    {
      "target": "marketing",
      "public": "website",
      "rewrites": []
    },
    {
      "target": "app",
      "public": "dist",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```

Link targets:
```bash
firebase target:apply hosting marketing YOUR_PROJECT
firebase target:apply hosting app YOUR_PROJECT-app
```

Deploy specific target:
```bash
firebase deploy --only hosting:marketing
```

---

## Rollback

View deployment history:
```bash
firebase hosting:releases:list
```

Rollback to previous version:
```bash
firebase hosting:rollback
```

---

## GitHub Actions Auto-Deploy

Create `.github/workflows/firebase-hosting.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: YOUR_PROJECT_ID
```

Generate service account:
```bash
firebase init hosting:github
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on refresh | Enable SPA rewrites in firebase.json |
| SSL not working | Wait 24h, verify DNS records |
| Deploy fails | Check `public` directory exists and has index.html |
| Old version cached | Deploy creates new cache-busted URLs automatically |
