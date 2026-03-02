import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_change_in_production'
const key = new TextEncoder().encode(secretKey)

export async function signToken(payload: { id: string; role: string }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key)
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key)
        return payload as { id: string; role: string;[key: string]: any }
    } catch (err) {
        return null
    }
}

export async function getSession() {
    const token = cookies().get('token')?.value
    if (!token) return null
    return await verifyToken(token)
}
