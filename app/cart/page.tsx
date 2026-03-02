'use client'

import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="p-8 text-center">Loading cart...</div>

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-7xl min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Your Cart is Empty</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">Looks like you haven't added any items yet. Explore our collection and find something you'll love.</p>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Browse Products
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 text-black dark:text-white">
            <div className="container mx-auto px-4 max-w-7xl flex flex-col lg:flex-row gap-6">

                <div className="flex-grow bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h1 className="text-2xl font-bold pb-4 border-b border-gray-200 dark:border-gray-700">Shopping Cart</h1>

                    <div className="mt-4 flex flex-col gap-6">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                <div className="w-32 h-32 relative bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                                </div>
                                <div className="flex-grow flex flex-col justify-between">
                                    <div className="flex justify-between w-full">
                                        <div>
                                            <h3 className="text-lg font-semibold">{item.name}</h3>
                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium">✓ In Stock</p>
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                            ₹{item.price.toLocaleString('en-IN')}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4">
                                        <select
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-black dark:text-white"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>Qty: {n}</option>)}
                                        </select>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 hover:underline font-medium transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-right mt-6 text-xl">
                        Subtotal ({totalItems()} items): <span className="font-bold">₹{totalPrice().toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="w-full lg:w-80 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit sticky top-24">
                    <div className="text-lg mb-4">
                        Subtotal ({totalItems()} items)
                        <span className="font-bold block text-2xl mt-1 text-gray-900 dark:text-white">₹{totalPrice().toLocaleString('en-IN')}</span>
                    </div>
                    <Link
                        href="/checkout"
                        className="w-full block text-center bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Proceed to Checkout
                    </Link>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Secure checkout with Stripe
                    </div>
                </div>

            </div>
        </div>
    )
}
