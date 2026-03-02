'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar({ user }: { user?: { name: string, role: string } | null }) {
    const totalItems = useCartStore((state) => state.totalItems())
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const query = searchQuery.trim()
        if (query) {
            router.push(`/products?search=${encodeURIComponent(query)}`)
        } else {
            router.push('/products')
        }
    }

    return (
        <header className="bg-amazon-blue text-white sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-3 gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1 font-bold text-xl hover:border hover:border-white p-1 rounded min-w-max">
                    <span className="text-white">Indie</span>
                    <span className="text-amazon-orange">Mart</span>
                </Link>

                {/* Search Bar - Hidden on small mobile, visible on sm and up */}
                <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-3xl">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full text-black px-4 py-2 rounded-l-md focus:outline-none"
                    />
                    <button type="submit" className="bg-amazon-orange hover:bg-primary-dark text-black px-4 py-2 rounded-r-md transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                </form>

                {/* Actions */}
                <div className="flex items-center gap-4 min-w-max">
                    {user ? (
                        <div className="flex flex-col hover:border hover:border-white p-1 rounded group relative">
                            <span className="text-xs text-gray-300">Hello, {user.name.split(' ')[0]}</span>
                            <span className="text-sm font-bold flex items-center">Account & Lists</span>

                            {/* Dropdown handle basic logout and admin navigation */}
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:flex flex-col py-2 z-50">
                                {user.role === 'ADMIN' && (
                                    <Link href="/admin" className="px-4 py-2 hover:bg-gray-100 text-sm text-black">
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link href="/profile" className="px-4 py-2 hover:bg-gray-100 text-sm text-black">
                                    Your Profile
                                </Link>
                                <Link href="/orders" className="px-4 py-2 hover:bg-gray-100 text-sm text-black">
                                    Your Orders
                                </Link>
                                <button
                                    onClick={async () => {
                                        await fetch('/api/auth/logout', { method: 'POST' })
                                        window.location.href = '/'
                                    }}
                                    className="px-4 py-2 hover:bg-gray-100 text-sm text-red-600 text-left flex items-center justify-between"
                                >
                                    Sign Out <LogOut size={14} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="flex flex-col hover:border hover:border-white p-1 rounded">
                            <span className="text-xs text-gray-300">Hello, Sign in</span>
                            <span className="text-sm font-bold flex items-center">Account & Lists</span>
                        </Link>
                    )}

                    <Link href="/orders" className="hidden md:flex flex-col hover:border hover:border-white p-1 rounded">
                        <span className="text-xs text-gray-300">Returns</span>
                        <span className="text-sm font-bold flex items-center">& Orders <Heart className="w-4 h-4 ml-1" /></span>
                    </Link>

                    <Link href="/cart" className="flex items-end hover:border hover:border-white p-1 rounded relative">
                        <ShoppingCart className="w-8 h-8" />
                        <span className="absolute top-0 right-1 text-amazon-orange font-bold text-sm bg-amazon-blue px-1 rounded-full">
                            {mounted ? totalItems : 0}
                        </span>
                        <span className="text-sm font-bold ml-1 hidden sm:inline">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Search Bar - Mobile Only */}
            <form onSubmit={handleSearch} className="sm:hidden px-4 pb-3 flex">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full text-black px-4 py-2 rounded-l-md focus:outline-none"
                />
                <button type="submit" className="bg-amazon-orange text-black px-4 py-2 rounded-r-md">
                    <Search className="w-5 h-5" />
                </button>
            </form>

            {/* Category Nav Menu */}
            <div className="bg-amazon-light py-2 px-4 flex gap-4 text-sm overflow-x-auto whitespace-nowrap hide-scrollbar">
                <Link href="/products" className="hover:border hover:border-white p-1 leading-none">All</Link>
                <Link href="/products?category=electronics" className="hover:border hover:border-white p-1 leading-none">Electronics</Link>
                <Link href="/products?category=fashion" className="hover:border hover:border-white p-1 leading-none">Fashion</Link>
                <Link href="/products?category=home-kitchen" className="hover:border hover:border-white p-1 leading-none">Home & Kitchen</Link>
                <Link href="/products?category=books" className="hover:border hover:border-white p-1 leading-none">Books</Link>
            </div>
        </header>
    )
}
