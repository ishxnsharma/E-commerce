'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const [name, setName] = useState('')
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
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })

            if (res.ok) {
                router.push('/login')
            } else {
                const data = await res.json()
                setError(data.message || 'Registration failed')
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
                    <h1 className="text-3xl font-bold text-black dark:text-white">IndieMart</h1>
                </div>
            </Link>

            <div className="w-full max-w-[350px] p-6 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                <h1 className="text-3xl font-medium mb-4 text-black dark:text-white">Create Account</h1>

                {error && <div className="text-red-600 bg-red-50 p-3 rounded mb-4 text-sm font-medium border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-black dark:text-gray-200">Your name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-400 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none bg-white text-black"
                            required
                        />
                    </div>

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
                            placeholder="At least 6 characters"
                            className="w-full p-2 border border-gray-400 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none bg-white text-black"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f0c14b] hover:bg-[#e3b544] border border-[#a88734] text-black py-2 rounded shadow-sm text-sm font-medium mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Continue'}
                    </button>
                </form>

                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-black dark:text-gray-200">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline hover:text-amazon-orange">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
