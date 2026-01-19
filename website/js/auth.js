/**
 * Springroll Auth & Subscription Management
 * Uses Supabase for auth and subscription status
 */

// ============ CONFIGURATION ============
// Replace these with your actual keys from SETUP_GUIDE.md
const SUPABASE_URL = 'https://gcbhergzqzibxylyywlh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PV-oXo9t-cS1wd14R3EvXA_E2kiHX5H';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SqLvPFk77apSaVLMl7PjOpot3jmyPsYv4BzlXmWXxCO4IvWRWZgOIwDnRY3OQdFG9dKCacOBTpfY3QOUnYvaKy100aa62t4if';
const STRIPE_PRO_PRICE_ID = 'price_1SqLzWFk77apSaVLMEv43CZk';
const STRIPE_TEAM_PRICE_ID = 'price_1SqLzzFk77apSaVL7eHKa8WX';

// App download URL (update after building)
const DOWNLOAD_URL = 'https://github.com/springroll-ai/releases/latest/download/SpringrollTeam-Setup.exe';

// ============ SUPABASE CLIENT ============
let supabase = null;

async function initSupabase() {
    if (supabase) return supabase;

    // Load Supabase SDK dynamically
    if (!window.supabase) {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ============ AUTHENTICATION ============
async function signInWithGoogle() {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/members.html'
        }
    });

    if (error) {
        console.error('Sign in error:', error);
        showError('Failed to sign in. Please try again.');
    }
}

async function signOut() {
    const sb = await initSupabase();
    await sb.auth.signOut();
    window.location.href = '/';
}

async function getUser() {
    const sb = await initSupabase();
    const { data: { user } } = await sb.auth.getUser();
    return user;
}

async function getSession() {
    const sb = await initSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return session;
}

// ============ SUBSCRIPTION STATUS ============
async function getSubscription(userId) {
    const sb = await initSupabase();
    const { data, error } = await sb
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Subscription fetch error:', error);
    }

    return data || { plan: 'free', status: 'inactive' };
}

function isSubscriptionActive(subscription) {
    if (!subscription) return false;
    if (subscription.plan === 'free') return false;

    const validStatuses = ['active', 'trialing'];
    if (!validStatuses.includes(subscription.status)) return false;

    // Check if subscription hasn't expired
    if (subscription.current_period_end) {
        const endDate = new Date(subscription.current_period_end);
        if (endDate < new Date()) return false;
    }

    return true;
}

// ============ STRIPE CHECKOUT ============
async function startCheckout(priceId) {
    const user = await getUser();
    if (!user) {
        showError('Please sign in first');
        signInWithGoogle();
        return;
    }

    // Load Stripe SDK
    if (!window.Stripe) {
        await loadScript('https://js.stripe.com/v3/');
    }

    const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);

    // In production, you'd call a Supabase Edge Function to create the checkout session
    // For now, redirect to Stripe payment link or show instructions

    // Create checkout session via Supabase Edge Function
    const sb = await initSupabase();
    const { data, error } = await sb.functions.invoke('create-checkout', {
        body: {
            priceId: priceId,
            userId: user.id,
            email: user.email,
            successUrl: window.location.origin + '/members.html?checkout=success',
            cancelUrl: window.location.origin + '/pricing.html?checkout=canceled'
        }
    });

    if (error) {
        console.error('Checkout error:', error);
        showError('Failed to start checkout. Please try again.');
        return;
    }

    if (data?.url) {
        window.location.href = data.url;
    } else if (data?.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
    }
}

function startProCheckout() {
    startCheckout(STRIPE_PRO_PRICE_ID);
}

function startTeamCheckout() {
    startCheckout(STRIPE_TEAM_PRICE_ID);
}

// ============ DOWNLOAD MANAGEMENT ============
async function downloadApp() {
    const user = await getUser();
    if (!user) {
        showError('Please sign in to download');
        return;
    }

    const subscription = await getSubscription(user.id);

    if (!isSubscriptionActive(subscription)) {
        showError('Active subscription required. Please subscribe to download.');
        window.location.href = '/pricing.html';
        return;
    }

    // Track download
    const sb = await initSupabase();
    await sb.from('downloads').insert({
        user_id: user.id,
        version: '1.0.0', // Update with actual version
        platform: 'windows'
    });

    // Start download
    window.location.href = DOWNLOAD_URL;
}

// ============ UI HELPERS ============
function showError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
}

// ============ PAGE INITIALIZATION ============
async function initMembersPage() {
    const user = await getUser();

    if (!user) {
        // Redirect to login
        window.location.href = '/?login=required';
        return;
    }

    // Update UI with user info
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const userAvatarEl = document.getElementById('user-avatar');

    if (userNameEl) userNameEl.textContent = user.user_metadata?.full_name || 'User';
    if (userEmailEl) userEmailEl.textContent = user.email;
    if (userAvatarEl) userAvatarEl.src = user.user_metadata?.avatar_url || '';

    // Get subscription
    const subscription = await getSubscription(user.id);
    const isActive = isSubscriptionActive(subscription);

    // Update subscription status UI
    const planEl = document.getElementById('plan-name');
    const statusEl = document.getElementById('subscription-status');
    const downloadBtn = document.getElementById('download-btn');
    const upgradeSection = document.getElementById('upgrade-section');

    if (planEl) planEl.textContent = subscription.plan?.toUpperCase() || 'FREE';
    if (statusEl) {
        statusEl.textContent = subscription.status || 'No active subscription';
        statusEl.className = isActive ? 'text-green-400' : 'text-yellow-400';
    }

    if (downloadBtn) {
        downloadBtn.disabled = !isActive;
        downloadBtn.className = isActive
            ? 'w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity'
            : 'w-full bg-slate-700 text-slate-400 px-8 py-4 rounded-xl font-bold cursor-not-allowed';
    }

    if (upgradeSection) {
        upgradeSection.style.display = isActive ? 'none' : 'block';
    }

    // Check for checkout success
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
        showSuccess('Welcome! Your subscription is now active.');
        // Clear the URL param
        window.history.replaceState({}, '', '/members.html');
    }
}

// Export for use in pages
window.SpringrollAuth = {
    signInWithGoogle,
    signOut,
    getUser,
    getSession,
    getSubscription,
    isSubscriptionActive,
    startProCheckout,
    startTeamCheckout,
    downloadApp,
    initMembersPage
};
