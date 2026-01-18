# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/yowftihsnzrtlxdeptsz

2. Click on **Settings** (gear icon in sidebar)

3. Click on **API** 

4. Copy your credentials:
   - **Project URL**: `https://yowftihsnzrtlxdeptsz.supabase.co`
   - **anon/public key**: Copy the `anon` `public` key

## Step 2: Update Environment Variables

1. Open `.env` file in your project root

2. Replace `your_anon_key_here` with your actual anon key:
   ```env
   VITE_SUPABASE_URL=https://yowftihsnzrtlxdeptsz.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

## Step 3: Create the Table (if not already created)

1. Go to **SQL Editor** in your Supabase dashboard

2. Run this SQL:
   ```sql
   CREATE TABLE schools (
       id SERIAL PRIMARY KEY,
       school_name VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Step 4: Restart Development Server

```bash
npm run dev
```

## How It Works

- When a school name is entered and "Next" is clicked, it's saved to Supabase `schools` table
- The data is also saved to localStorage for offline functionality
- You can view all entries in your Supabase Table Editor

## View Your Data

Go to: https://supabase.com/dashboard/project/yowftihsnzrtlxdeptsz/editor/17484?schema=public

You'll see all school names that have been submitted!
