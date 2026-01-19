# Supabase + Stripe Setup Guide

## Step 1: Create Supabase Project

1. Go to **https://supabase.com** → Sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `springroll-prod`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to your users
4. Wait ~2 minutes for project creation

### Get Your Keys
From your project dashboard → Settings → API:
- **Project URL**: `https://xxxxx.supabase.co`
- **Anon public key**: `eyJhbGci...`

> 📋 **Copy both and paste here when ready**

---

## Step 2: Enable Google OAuth

1. In Supabase: **Authentication → Providers → Google**
2. Toggle **Enable**
3. You need a Google OAuth Client ID:

### Create Google OAuth Credentials
1. Go to **https://console.cloud.google.com**
2. Create new project or select existing
3. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
4. Choose **Web application**
5. Add authorized redirect URI:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   (Replace xxxxx with your Supabase project ID)
6. Copy **Client ID** and **Client Secret**
7. Paste into Supabase Google provider settings

> 📋 **Save your Google Client ID**

---

## Step 3: Create Stripe Account

1. Go to **https://stripe.com** → Sign up
2. Complete account setup
3. Get your keys from **Developers → API Keys**:
   - **Publishable key**: `pk_live_...` (or `pk_test_...` for testing)
   - **Secret key**: `sk_live_...` (keep this private!)

### Create Products & Prices
1. **Products → Add Product**
2. Create **"Springroll Pro"**:
   - Price: $29/month, recurring
   - Copy the **Price ID**: `price_xxxxx`
3. Create **"Springroll Team"**:
   - Price: $49/month per seat, recurring
   - Copy the **Price ID**: `price_yyyyy`

> 📋 **Copy both Price IDs when ready**

---

## Step 4: Create Database Tables

Run this SQL in Supabase → SQL Editor:

```sql
-- Users table (extends Supabase auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free', -- 'free', 'pro', 'team', 'enterprise'
  status TEXT DEFAULT 'inactive', -- 'active', 'trialing', 'past_due', 'canceled'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Downloads tracking
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  version TEXT,
  platform TEXT DEFAULT 'windows',
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

---

## What I Need From You

Once you complete the above, paste these values:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=
STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_TEAM_PRICE_ID=
```

Then I'll implement the website code!
