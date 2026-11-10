# My Fitness Coach (PWA + Web Push)

Node server (Express + web-push) serving the app, plus a daily push scheduler.

## 1. Generate push keys (once)
No computer needed: deploy once without keys. The server prints a fresh key pair in the logs. Copy them into the environment variables and redeploy.
Or on a computer:
    npm install
    npx web-push generate-vapid-keys
Keep the private key secret.

## 2. Run locally (HTTP on localhost works for the service worker)
    VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com npm start

## 3. Deploy (needs HTTPS, required by iPhone)
Example: Render.com, new Web Service from your GitHub repo.
- Build command: `npm install`  Start command: `npm start`
- Environment variables: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (a mailto: address), DATA_DIR=/data
- Add a Persistent Disk mounted at `/data`, or subscriptions are lost on each restart.
- The server must be running at your reminder time. Free plans that sleep will miss reminders. Use an always-on plan, Fly.io, Railway or a small VPS.
Your URL will look like https://your-app.onrender.com

## 4. Install on iPhone
1. Open the URL in Safari.  2. Tap Share.  3. Add to Home Screen.  4. Add.
5. Open My Fitness Coach from the Home Screen.  6. Go to Me, then Daily reminders.
7. Tap ENABLE NOTIFICATIONS.  8. Tap Allow.  9. Tap Send a test notification.
iPhone web push works only for Home Screen apps (iOS 16.4 or later) after you allow it.

## Limits
Progress and profile are stored on the phone (localStorage), not on the server. The server stores only the push subscription, reminder time and timezone.
