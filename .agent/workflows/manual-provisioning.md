---
description: Operational workflow for manually adding users to Springroll (Payment Provisioning)
---

# Manual User Provisioning Workflow

This workflow describes the operational steps to grant access to a user who has paid via a non-automated channel (e.g., Venmo, PayPal, Direct Invoice) or has been invited manually.

## 1. Receive Payment/Request
- **Trigger**: You receive a payment notification or a request for access.
- **Required Data**: The user's **Google Email Address** (must match the one they will use to sign in).

## 2. Access Firebase Console
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Select project: **springroll-171de**.
- Navigate to **Firestore Database** in the left sidebar.

## 3. Add User to Whitelist
We use a "Whitelist" pattern. Users authenticate via Google, but the app only lets them in if their email exists in the `allowed_users` collection.

1.  Click on the **allowed_users** collection.
2.  Click **Add document**.
3.  **Document ID**: enter the user's **email address** (e.g., `customer@gmail.com`).
    *   *Critical:* Must be lowercase and exact match.
4.  **Fields**: Add the following fields:
    *   `plan` (string): `pro` (or relevant tier)
    *   `status` (string): `active`
    *   `addedAt` (string): Current date (e.g., `2026-01-24`)
    *   `source` (string): `manual` (or `venmo`, `invoice`, etc.)
    *   `notes` (string): Optional (e.g., "Paid via Venmo #1234")

## 4. Notify User
- Send a confirmation to the user:
  > "Your access has been enabled! You can now log in at [springroll.ai/app](https://springroll.ai/app) or verify your status at [springroll.ai/members.html](https://springroll.ai/members.html) using your Google account."

## 5. Verification (Optional)
- To verify access without asking the user:
    - You generally trust the Firestore entry. If the document exists, they have access.
    - If they report issues, check:
        1.  Are they using the exact email you added?
        2.  Is the Firestore Document ID exactly that email?

## 6. Revoking Access
- To remove access (e.g., refund or cancellation):
    1.  Go to **Firestore Database** -> **allowed_users**.
    2.  Find the document with their email.
    3.  Click the **three dots** (menu) -> **Delete document**.
    - *Effect:* The next time they try to log in (or refresh), the `AccessControlService` will deny entry.

## Summary Checklist
- [ ] Get Email
- [ ] Add Document to Firestore (`allowed_users`) with Email as ID
- [ ] Send Welcome Message
