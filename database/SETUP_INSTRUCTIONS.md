# Supabase Database Setup Instructions

## Problem
Your app is not fetching schools because Supabase has Row Level Security (RLS) enabled by default, blocking anonymous access.

## Solution
Run the following SQL in your Supabase SQL Editor to set up the correct schema with public access:

1. Go to your Supabase project: https://yowftihsnzrtlxdeptsz.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL from `database/setup-public-access.sql`
5. Click **Run** or press `Ctrl+Enter`

## What This Does

- Creates the `schools` table with all required columns
- Adds `session_token` and `session_expires` for session management
- **Disables RLS** to allow public read/write access (no authentication required)
- Sets up triggers to auto-update `pressed_at` and `press_count` on buzzer press
- Creates indexes for better performance

## Security Note

This setup allows **anonymous public access** to the schools table. This is intentional for your buzzer game. The session token mechanism prevents one device from hijacking another's school name during an active session.

If you need admin-only features (Reset/Delete), you'll need to:
1. Create an admin user in Supabase Authentication
2. Use the Login page to authenticate
3. The admin controls will appear on the Display page

## Verification

After running the SQL:
1. The app should automatically start working
2. Try adding a school name and pressing the buzzer
3. Check the Display page to see the leaderboard

If you still see errors, check the browser console (F12) for specific error messages.
