// Supabase Edge Function for Stripe Webhook
// Deploy this to Supabase: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
})

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    let event
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature ?? '',
            Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message)
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
    }

    console.log('Received event:', event.type)

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object
            const userId = session.metadata?.user_id
            const customerId = session.customer
            const subscriptionId = session.subscription

            if (userId && subscriptionId) {
                // Get subscription details
                const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                const priceId = subscription.items.data[0]?.price.id

                // Determine plan from price
                let plan = 'pro' // Default
                if (priceId === Deno.env.get('STRIPE_TEAM_PRICE_ID')) {
                    plan = 'team'
                }

                // Upsert subscription record
                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                    plan: plan,
                    status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })
            }
            break
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = event.data.object
            const subscriptionId = subscription.id

            // Find and update the subscription
            const { data: existing } = await supabase
                .from('subscriptions')
                .select('user_id')
                .eq('stripe_subscription_id', subscriptionId)
                .single()

            if (existing) {
                await supabase.from('subscriptions').update({
                    status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                }).eq('stripe_subscription_id', subscriptionId)
            }
            break
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object
            const subscriptionId = invoice.subscription

            if (subscriptionId) {
                await supabase.from('subscriptions').update({
                    status: 'past_due',
                    updated_at: new Date().toISOString()
                }).eq('stripe_subscription_id', subscriptionId)
            }
            break
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
})
