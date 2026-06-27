# 🌾 AgriBot Pro — Deployment Guide
### Get your chatbot live on the web in ~15 minutes (Free)

---

## What you need
- A computer with internet
- A free GitHub account → https://github.com
- A free Vercel account → https://vercel.com
- A free Anthropic API key → https://console.anthropic.com

---

## STEP 1 — Get your Anthropic API Key (2 min)

1. Go to https://console.anthropic.com
2. Sign up for a free account
3. Click **"API Keys"** in the left menu
4. Click **"Create Key"** → give it a name like "AgriBot"
5. **Copy the key** — it looks like: `sk-ant-api03-xxxxxxxxxxxx`
6. Save it somewhere safe (you only see it once)

> Free credits are included — enough for hundreds of conversations

---

## STEP 2 — Upload code to GitHub (5 min)

1. Go to https://github.com and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Name it: `agribot-pro`
4. Set to **Public**, click **"Create repository"**
5. On the next page, click **"uploading an existing file"**
6. Upload ALL the files from this ZIP, keeping the folder structure:
   ```
   app/
     api/
       chat/
         route.js
     layout.jsx
     page.jsx
   package.json
   next.config.js
   ```
7. Click **"Commit changes"**

---

## STEP 3 — Deploy on Vercel (5 min)

1. Go to https://vercel.com and sign up with your GitHub account
2. Click **"Add New Project"**
3. Find your `agribot-pro` repository → click **"Import"**
4. Vercel auto-detects it as Next.js — don't change anything
5. Click **"Environment Variables"** section and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your API key from Step 1
6. Click **"Deploy"**
7. Wait ~2 minutes while it builds

---

## STEP 4 — Get your live URL & QR Code (1 min)

1. After deploy succeeds, Vercel shows your URL:
   **`https://agribot-pro-xxxxxxxxx.vercel.app`**
2. You can also set a custom name:
   - Go to Project Settings → Domains
   - Change to something like: `agribot-olivadevan.vercel.app`
3. To create a QR Code for your presentation:
   - Go to https://qr.io or https://www.qrcode-monkey.com
   - Paste your Vercel URL
   - Download the QR code image
   - Put it in your presentation slide!

---

## That's it! 🎉

Anyone who scans your QR code will open the chatbot instantly in their mobile browser — no app download needed.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "API error" in chat | Check your API key is correct in Vercel env vars |
| Build fails | Make sure all 5 files are uploaded with correct folder structure |
| Blank page | Clear browser cache and reload |
| Slow first response | Normal — first load takes ~2 sec. After that, streaming is fast |

---

## Cost estimate

- Hosting on Vercel: **FREE**
- GitHub: **FREE**
- Anthropic API: ~₹0.10 per conversation (very cheap)
- Free credits when you sign up cover ~500+ conversations

---

*Made by Olivadevan | AgriBot Pro*
