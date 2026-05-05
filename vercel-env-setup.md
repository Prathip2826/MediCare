# Vercel Deployment & Firebase Security Setup

This guide outlines the steps to securely deploy the MediCare application and configure Firebase for production.

## 1. Vercel Environment Variables

Add the following environment variables in your Vercel Dashboard (**Settings > Environment Variables**). You can copy these from your `.env.local` file.

### Firebase Keys
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Supabase Keys
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### AI Keys
- `GOOGLE_GENERATIVE_AI_API_KEY`

---

## 2. Firebase Console Configuration

To ensure Authentication and other services work correctly after deployment, you must authorize your production domains.

### Add Authorized Domains
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **medicare-188f8**.
3. Go to **Authentication > Settings > Authorized Domains**.
4. Click **Add Domain**.
5. Add your Vercel deployment domains (e.g., `medicare-app.vercel.app`).
6. Also ensure `localhost` is present for local development.

### Update Redirect URIs (if using OAuth)
If you are using Google Login, ensure the redirect URI is allowed in the [Google Cloud Console](https://console.cloud.google.com/) under **APIs & Services > Credentials**.

---

## 3. Deployment Checklist
- [ ] Environment variables added to Vercel.
- [ ] Vercel domain added to Firebase Authorized Domains.
- [ ] `.env.local` is excluded from Git (check `.gitignore`).
- [ ] `npm run build` passes locally with the environment variables.
