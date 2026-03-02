import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out' })

    // Explicitly set the cookie to expire immediately with matching path
    response.cookies.set({
        name: 'token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    })

    return response
}
