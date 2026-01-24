/**
 * Springroll Auth - Firebase Version
 * Simple authentication for website pages
 */

// Firebase is loaded via ES modules in individual pages
// This file provides compatibility stubs for legacy onclick handlers

window.SpringrollAuth = {
    signInWithGoogle: function () {
        // Redirect to members page which handles Firebase auth
        window.location.href = '/members.html';
    },

    startProCheckout: function () {
        // Scroll to payment instructions
        const el = document.getElementById('payment-instructions');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    },

    startTeamCheckout: function () {
        // Scroll to payment instructions
        const el = document.getElementById('payment-instructions');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
};

console.log('Springroll Auth loaded (Firebase version)');
