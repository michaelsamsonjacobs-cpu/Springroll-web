---
description: Serverless backend with Firebase Cloud Functions for webhooks, scheduled tasks, and APIs
---

# Firebase Cloud Functions Workflow

Deploy serverless Node.js functions that respond to HTTP requests, Firestore triggers, or scheduled events.

## Prerequisites

1. Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Node.js 18+ installed
3. Firebase CLI installed globally

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

## Step 3: Initialize Functions

```bash
firebase init functions
```

Choose:
- **Language**: JavaScript (or TypeScript)
- **ESLint**: Yes
- **Install dependencies**: Yes

This creates a `functions/` directory with `index.js`.

---

## Step 4: Write Your First Function

Edit `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// HTTP endpoint - responds to web requests
exports.helloWorld = functions.https.onRequest((req, res) => {
    res.json({ message: 'Hello from Firebase!' });
});

// Stripe webhook - auto-add paying users to whitelist
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const event = req.body;
    
    if (event.type === 'checkout.session.completed') {
        const customerEmail = event.data.object.customer_email;
        
        await db.collection('allowed_users').doc(customerEmail).set({
            plan: 'pro',
            addedAt: admin.firestore.FieldValue.serverTimestamp(),
            addedBy: 'stripe-webhook'
        });
        
        console.log(`Added ${customerEmail} to whitelist`);
    }
    
    res.status(200).send('OK');
});

// Firestore trigger - runs when a document is created
exports.onUserAdded = functions.firestore
    .document('allowed_users/{email}')
    .onCreate((snap, context) => {
        console.log(`New user added: ${context.params.email}`);
        // Send welcome email, notify admin, etc.
        return null;
    });

// Scheduled function - runs daily at midnight
exports.dailyCleanup = functions.pubsub
    .schedule('0 0 * * *')
    .timeZone('America/Los_Angeles')
    .onRun(async (context) => {
        // Clean up expired trials, send reminders, etc.
        console.log('Running daily cleanup');
        return null;
    });
```

---

## Step 5: Deploy Functions

// turbo
```bash
firebase deploy --only functions
```

Your functions will be available at:
```
https://us-central1-YOUR_PROJECT.cloudfunctions.net/functionName
```

---

## Step 6: Set Up Stripe Webhook (Optional)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://us-central1-YOUR_PROJECT.cloudfunctions.net/stripeWebhook`
3. Select events: `checkout.session.completed`, `customer.subscription.created`
4. Copy webhook signing secret

Add secret to functions config:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_xxx"
```

---

## Common Patterns

### CORS-Enabled API
```javascript
const cors = require('cors')({ origin: true });

exports.api = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        res.json({ data: 'your response' });
    });
});
```

### Authenticated Endpoint
```javascript
exports.protectedEndpoint = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    
    const uid = context.auth.uid;
    const email = context.auth.token.email;
    
    return { message: `Hello ${email}` };
});
```

### Environment Variables
```bash
# Set config
firebase functions:config:set api.key="secret123"

# Access in code
const apiKey = functions.config().api.key;
```

---

## Local Development

// turbo
```bash
firebase emulators:start --only functions
```

Test locally at `http://localhost:5001/PROJECT_ID/us-central1/functionName`

---

## File Structure

```
functions/
├── index.js           # Main entry point
├── package.json       # Dependencies
└── .eslintrc.js       # Linting config

firebase.json          # Firebase project config
.firebaserc            # Project aliases
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Function timeout | Increase timeout in function options (max 540s) |
| Cold start slow | Use min instances: `functions.runWith({ minInstances: 1 })` |
| CORS blocked | Wrap handler with cors middleware |
| Deployment fails | Check Node.js version matches `engines` in package.json |
