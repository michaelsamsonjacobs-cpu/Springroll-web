/**
 * Access Control Service
 * 
 * Checks if a user's email is whitelisted in Firebase Firestore.
 * Only whitelisted users (paying customers) can access the app.
 */

import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const WHITELIST_COLLECTION = 'allowed_users';

/**
 * Check if a user's email is in the whitelist
 * @param {string} email - The user's email address
 * @returns {Promise<boolean>} - True if user is allowed, false otherwise
 */
export async function checkAccess(email) {
    if (!email) return false;

    try {
        // Document ID is the email (lowercase, normalized)
        const normalizedEmail = email.toLowerCase().trim();
        const docRef = doc(db, WHITELIST_COLLECTION, normalizedEmail);
        const docSnap = await getDoc(docRef);

        return docSnap.exists();
    } catch (error) {
        console.error('Access check failed:', error);
        // If Firestore is unavailable, deny access for safety
        return false;
    }
}

/**
 * Get the pricing/purchase URL
 */
export function getPurchaseUrl() {
    return 'https://springroll.ai/pricing.html';
}

export default { checkAccess, getPurchaseUrl };
