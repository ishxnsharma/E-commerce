'use client'

import Link from 'next/link'

export default function CheckoutCancelPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl min-h-screen flex flex-col items-center justify-center text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-border w-full">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-3 text-black dark:text-white">
                    Payment Cancelled
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Your payment was cancelled. Your cart items are still saved — you can try again whenever you&apos;re ready.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/checkout"
                        className="btn-primary text-base px-6 py-3"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/cart"
                        className="btn-secondary text-base px-6 py-3"
                    >
                        Back to Cart
                    </Link>
                </div>
            </div>
        </div>
    )
}
