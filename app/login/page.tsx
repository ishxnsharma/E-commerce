'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (res.ok) {
                // Force a hard refresh to update server components (like the Navbar) with the new auth state
                window.location.href = '/'
            } else {
                const data = await res.json()
                setError(data.message || 'Login failed')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center pt-8 bg-white dark:bg-gray-900">
            <Link href="/">
                <div className="w-32 h-10 relative mb-6">
                    {/* Placeholder for real logo */}
                    <h1 className="text-3xl font-bold text-black dark:text-white">IndieMart</h1>
                </div>
            </Link>

            <div className="w-full max-w-[350px] p-6 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                <h1 className="text-3xl font-medium mb-4 text-black dark:text-white">Sign in</h1>

                {error && <div className="text-red-600 bg-red-50 p-3 rounded mb-4 text-sm font-medium border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-black dark:text-gray-200">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-400 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none bg-white text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1 text-black dark:text-gray-200">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-400 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none bg-white text-black"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f0c14b] hover:bg-[#e3b544] border border-[#a88734] text-black py-2 rounded shadow-sm text-sm font-medium mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-8">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        By continuing, you agree to IndieMart's Conditions of Use and Privacy Notice.
                    </p>
                </div>
            </div>

            <div className="w-full max-w-[350px] mt-6 flex items-center justify-between">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-xs text-gray-500 px-3 bg-white dark:bg-gray-900">New to IndieMart?</span>
                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <Link
                href="/register"
                className="w-full max-w-[350px] mt-4 text-center bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black py-2 rounded shadow-sm text-sm font-medium"
            >
                Create your IndieMart account
            </Link>
        </div>
    )
}
