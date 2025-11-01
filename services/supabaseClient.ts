import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqpzhpcglfbydcwgqdsu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxcHpocGNnbGZieWRjd2dxZHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Njc3MTksImV4cCI6MjA3NzQ0MzcxOX0.XMH8J8QzayRL48TCThYBtPweeDPSOw_IuFWxPJfrK9g';

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is not defined.");
}

/**
 * =================================================================================
 * 🔴 IMPORTANT: SUPABASE GOOGLE AUTH CONFIGURATION
 * =================================================================================
 * To enable Google Sign-In with Supabase, you MUST perform the following steps:
 *
 * 1.  **Enable the Google Provider in Supabase:**
 *     - Go to your Supabase Project Dashboard.
 *     - Navigate to "Authentication" -> "Providers".
 *     - Find "Google" in the list and enable it.
 *
 * 2.  **Get Google OAuth Credentials:**
 *     - Go to the Google Cloud Console: https://console.cloud.google.com/apis/credentials
 *     - Create an "OAuth 2.0 Client ID" for a "Web application".
 *
 * 3.  **Configure Credentials in Supabase:**
 *     - Copy the "Client ID" and "Client Secret" from your Google Cloud credential.
 *     - Paste them into the corresponding fields in the Supabase Google provider settings.
 *
 * 4.  **Configure Redirect URI in Google Cloud:**
 *     - In your Supabase Google provider settings, you will find a "Redirect URL".
 *       It will look like: `https://<your-project-ref>.supabase.co/auth/v1/callback`
 *     - Copy this URL.
 *     - In your Google Cloud credential settings, under "Authorized redirect URIs",
 *       add this exact URL.
 *
 * 5.  **Save all configurations.**
 *
 * =================================================================================
 */
export const supabase = createClient(supabaseUrl, supabaseKey);