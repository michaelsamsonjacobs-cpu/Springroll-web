---
description: Setting up Firebase Google Auth with Firestore whitelist access control
---

# Firebase Authentication + Access Control Workflow

This workflow sets up Firebase Google OAuth with a Firestore-based whitelist for payment-gated access control.

## Prerequisites

1. A Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Google OAuth enabled in Firebase Console → Authentication → Sign-in method
3. Firestore database created in Firebase Console → Firestore Database

---

## Step 1: Install Firebase SDK

// turbo
```bash
npm install firebase
```

---

## Step 2: Create Firebase Config

Create `src/firebaseConfig.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
```

> [!TIP]
> Find these values in Firebase Console → Project Settings → Your apps → Web app

---

## Step 3: Create Access Control Service

Create `src/services/AccessControlService.js`:

```javascript
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const checkAccess = async (email) => {
    try {
        const userDoc = await getDoc(doc(db, 'allowed_users', email));
        return userDoc.exists();
    } catch (error) {
        console.error('Access check failed:', error);
        return false;
    }
};
```

---

## Step 4: Implement Google Sign-In

In your auth component:

```javascript
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { checkAccess } from '../services/AccessControlService';

const handleGoogleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check whitelist access
        const hasAccess = await checkAccess(user.email);
        
        if (hasAccess) {
            // Grant access - proceed to app
            onLogin({ name: user.displayName, email: user.email });
        } else {
            // Deny access - show purchase required screen
            setAccessDenied(true);
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
};
```

---

## Step 5: Set Up Firestore Whitelist

In Firebase Console → Firestore Database:

1. Create collection: `allowed_users`
2. Add documents where **Document ID = user's email**
3. Document can contain metadata like:
   ```json
   {
       "plan": "pro",
       "addedAt": "2026-01-23",
       "addedBy": "admin@example.com"
   }
   ```

---

## Step 6: Create Admin Portal (Optional)

For managing users without Firebase Console access, create an admin page:

```html
<!-- admin.html -->
<script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
    import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
    import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

    const ADMIN_EMAILS = ['admin1@example.com', 'admin2@example.com'];
    
    // Add user to whitelist
    async function addUser(email) {
        await setDoc(doc(db, 'allowed_users', email), {
            addedAt: new Date().toISOString(),
            addedBy: currentUser.email
        });
    }
    
    // Remove user from whitelist
    async function removeUser(email) {
        await deleteDoc(doc(db, 'allowed_users', email));
    }
</script>
```

---

## Step 7: Secure Firestore Rules

> [!CAUTION]
> Default "Test Mode" allows all reads/writes. Update rules before production!

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow reads for authenticated users checking their own access
    match /allowed_users/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
      allow write: if request.auth != null && 
                      request.auth.token.email in ['admin1@example.com', 'admin2@example.com'];
    }
  }
}
```

---

## Payment Flow Integration

For manual payments (Venmo/PayPal):

1. Customer pays and includes their Google email in payment note
2. Admin receives payment notification
3. Admin adds email to `allowed_users` via admin portal
4. Customer can now sign in and access the app

For automated payments (Stripe/Gumroad):

1. Use Firebase Extensions or Cloud Functions
2. Set up webhook to listen for payment events
3. Auto-add customer email to `allowed_users` on successful payment

---

## File Structure

```
src/
├── firebaseConfig.js          # Firebase initialization
├── services/
│   └── AccessControlService.js # Whitelist check logic
└── components/
    └── AuthScreen.jsx         # Login UI with access control

website/
├── members.html               # Member portal (requires auth)
├── admin.html                 # Admin user management
└── js/
    └── auth.js                # Legacy auth shim (if needed)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Popup blocked | Ensure popup is triggered by user action (click) |
| CORS errors | Add your domain to Firebase authorized domains |
| Access denied after payment | Check email spelling in Firestore exactly matches Google email |
| Admin portal won't load | Verify admin emails are hardcoded correctly |
