# ₹0 ($0) Commercial Deployment Guide — AshuTeacher

Follow these 5 steps to deploy **AshuTeacher** live with **zero upfront cost** using free tiers that allow commercial SaaS monetization.

---

## Step 1: Free Cloud PostgreSQL Database (2 mins)

1. Go to **https://neon.tech** (or **https://supabase.com**) and create a free project.
2. Copy your PostgreSQL connection string (`postgresql://...`).
3. Open `prisma/schema.prisma` and change line 8 from:
   ```prisma
   provider = "sqlite"
   ```
   to:
   ```prisma
   provider = "postgresql"
   ```
4. Push the schema to your cloud database:
   ```bash
   DATABASE_URL="your_postgres_url_here" npx prisma db push
   ```

---

## Step 2: Free Google 1-Click Sign-In Setup (3 mins)

1. Open **https://console.cloud.google.com/apis/credentials**.
2. Click **Create Credentials → OAuth client ID → Web application**.
3. Add Authorized Redirect URIs:
   - Local testing: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://YOUR_CLOUD_RUN_OR_CUSTOM_DOMAIN/api/auth/google/callback`
4. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## Step 3: Gemini 3.8 Flash API Key

1. Open **https://aistudio.google.com/apikey** and generate your `GEMINI_API_KEY`.
2. Activate Google Cloud's **$300 free credit** (or link Pay-As-You-Go with a $10 budget alert) so `gemini-3.8-flash` runs with commercial data privacy and production rate limits.

---

## Step 4: Connect ₹0-Monthly-Fee Payments

### Option A: India UPI / QR / Cards (Razorpay)
1. Create a free merchant account at **https://razorpay.com**.
2. Generate API Keys (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`).
3. Optional: Add a Webhook pointing to `https://YOUR_DOMAIN/api/webhooks/razorpay` for `order.paid` events (`RAZORPAY_WEBHOOK_SECRET`).

### Option B: Global USD Cards / Apple Pay (Lemon Squeezy — No US LLC Required)
1. Create a free store at **https://lemonsqueezy.com**.
2. Create 3 one-time products (`Starter 50 Credits`, `Exam Cram 200 Credits`, `Scholar 600 Credits`) and paste their checkout URLs into `LEMONSQUEEZY_STARTER_URL`, `LEMONSQUEEZY_CRAM_URL`, and `LEMONSQUEEZY_SCHOLAR_URL`.
3. Add a Webhook pointing to `https://YOUR_DOMAIN/api/webhooks/lemonsqueezy` (`order_created` event) and set `LEMONSQUEEZY_WEBHOOK_SECRET`.

---

## Step 5: 1-Command Free Deploy to Google Cloud Run

Google Cloud Run allows commercial apps on its **Always-Free Tier** (2 million requests/month free; scales to `0` instances when idle = ₹0.00 idle cost).

```bash
gcloud run deploy ashuteacher \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars="DATABASE_URL=YOUR_POSTGRES_URL,AUTH_SECRET=YOUR_64_CHAR_HEX_SECRET,GEMINI_API_KEY=YOUR_GEMINI_KEY,GEMINI_MODEL=gemini-3.8-flash,GOOGLE_CLIENT_ID=YOUR_GOOGLE_ID,GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_SECRET,RAZORPAY_KEY_ID=YOUR_RZP_ID,RAZORPAY_KEY_SECRET=YOUR_RZP_SECRET"
```

After deployment finishes, copy the generated `https://ashuteacher-xxxx.run.app` URL and set `NEXT_PUBLIC_APP_URL` to that URL!
