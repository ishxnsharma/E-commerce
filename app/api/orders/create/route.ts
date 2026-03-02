import { NextResponse } from 'next/server'
import { stripe, isMockMode } from '@/lib/stripe'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { items, addressId } = await request.json()

        // Validate and resolve product IDs — handles stale cart data after re-seeding
        const resolvedItems = []
        for (const item of items) {
            // First try to find by ID
            let product = await prisma.product.findUnique({ where: { id: item.id } })

            // If not found by ID, try to find by name (handles stale cart data)
            if (!product) {
                product = await prisma.product.findFirst({
                    where: { name: { equals: item.name, mode: 'insensitive' } }
                })
            }

            if (!product) {
                return NextResponse.json(
                    { error: `Product "${item.name}" is no longer available. Please remove it from your cart and try again.` },
                    { status: 400 }
                )
            }

            resolvedItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: item.image,
            })
        }

        // Server-side price calculation using resolved prices
        let totalAmount = 0
        const lineItems = []
        for (const item of resolvedItems) {
            totalAmount += item.price * item.quantity
            lineItems.push({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.name,
                        images: item.image && item.image.startsWith('https://') ? [item.image] : [],
                    },
                    unit_amount: Math.round(item.price * 100), // paise
                },
                quantity: item.quantity,
            })
        }

        // Resolve shipping address
        let targetAddressId = addressId
        if (!targetAddressId || targetAddressId === 'placeholder-address-id') {
            const userWithAddress = await prisma.user.findUnique({
                where: { id: session.id },
                include: { addresses: true }
            })
            if (userWithAddress?.addresses.length) {
                targetAddressId = userWithAddress.addresses[0].id
            } else {
                // Auto-create a default address for new users
                const defaultAddress = await prisma.address.create({
                    data: {
                        userId: session.id,
                        street: 'Default Address',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        postalCode: '400001',
                        country: 'India',
                        isDefault: true,
                    }
                })
                targetAddressId = defaultAddress.id
            }
        }

        // Check if we're in mock mode (no real Stripe keys)
        if (isMockMode()) {
            const newOrder = await prisma.order.create({
                data: {
                    userId: session.id,
                    stripeSessionId: `mock_session_${Date.now()}`,
                    stripePaymentIntentId: `mock_pi_${Date.now()}`,
                    status: 'PROCESSING',
                    totalAmount,
                    shippingAddressId: targetAddressId,
                    orderItems: {
                        create: resolvedItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            })

            return NextResponse.json({
                isMock: true,
                dbOrderId: newOrder.id,
                sessionUrl: null,
            })
        }

        // Create order in DB BEFORE payment (status: PENDING)
        const newOrder = await prisma.order.create({
            data: {
                userId: session.id,
                status: 'PENDING',
                totalAmount,
                shippingAddressId: targetAddressId,
                orderItems: {
                    create: resolvedItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        })

        // Create Stripe Checkout Session
        const origin = request.headers.get('origin') || 'http://localhost:3000'
        try {
            const checkoutSession = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/checkout/cancel`,
                metadata: {
                    dbOrderId: newOrder.id,
                },
            })

            // Store Stripe session ID in the order
            await prisma.order.update({
                where: { id: newOrder.id },
                data: { stripeSessionId: checkoutSession.id }
            })

            return NextResponse.json({
                isMock: false,
                sessionUrl: checkoutSession.url,
                dbOrderId: newOrder.id,
            })
        } catch (stripeError: any) {
            console.error('=== STRIPE ERROR DETAILS ===')
            console.error('Message:', stripeError.message)
            console.error('Type:', stripeError.type)
            console.error('Code:', stripeError.code)
            console.error('Status:', stripeError.statusCode)
            console.error('Full:', JSON.stringify(stripeError, null, 2))
            // Stripe call failed — fallback to mock mode so the user isn't stuck
            await prisma.order.update({
                where: { id: newOrder.id },
                data: {
                    status: 'PROCESSING',
                    stripeSessionId: `fallback_mock_${Date.now()}`
                }
            })

            return NextResponse.json({
                isMock: true,
                dbOrderId: newOrder.id,
                sessionUrl: null,
            })
        }
    } catch (error: any) {
        console.error('Order creation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
