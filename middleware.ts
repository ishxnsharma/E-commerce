import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Protected admin routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        const decoded = await verifyToken(token)
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protected user routes (e.g., checkout, profile)
    const userRoutes = ['/checkout', '/profile', '/orders']
    const isUserRoute = userRoutes.some(route => pathname.startsWith(route))

    // Allow checkout success page without auth (Stripe redirect)
    if (pathname.startsWith('/checkout/success')) {
        return NextResponse.next()
    }

    if (isUserRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        const decoded = await verifyToken(token)
        if (!decoded) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/checkout/:path*', '/profile/:path*', '/orders/:path*'],
}
