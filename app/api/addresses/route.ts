import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET: Fetch user's addresses
export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const addresses = await prisma.address.findMany({
        where: { userId: session.id },
        orderBy: { isDefault: 'desc' }
    })

    return NextResponse.json(addresses)
}

// POST: Create a new address
export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { street, city, state, postalCode, country, isDefault } = await request.json()

        if (!street || !city || !state || !postalCode) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        // If setting as default, unset all other defaults first
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.id },
                data: { isDefault: false }
            })
        }

        const address = await prisma.address.create({
            data: {
                userId: session.id,
                street,
                city,
                state,
                postalCode,
                country: country || 'India',
                isDefault: isDefault ?? true,
            }
        })

        return NextResponse.json(address, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
