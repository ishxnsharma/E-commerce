import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'

// Disable body parsing — Stripe requires the raw body for signature verification
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.text()
        const sig = request.headers.get('stripe-signature')

        if (!sig) {
            return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (!webhookSecret || webhookSecret.includes('placeholder')) {
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
        }

        let event
        try {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message)
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any
                const dbOrderId = session.metadata?.dbOrderId

                if (dbOrderId) {
                    await prisma.order.update({
                        where: { id: dbOrderId },
                        data: {
                            status: 'PROCESSING',
                            stripePaymentIntentId: session.payment_intent || null,
                        }
                    })
                }
                break
            }

            case 'checkout.session.expired': {
                const session = event.data.object as any
                const dbOrderId = session.metadata?.dbOrderId

                if (dbOrderId) {
                    await prisma.order.update({
                        where: { id: dbOrderId },
                        data: { status: 'CANCELLED' }
                    })
                }
                break
            }

            default:
                // Unhandled event type — log and ignore
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Webhook handler error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
