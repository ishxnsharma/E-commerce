import Link from 'next/link'

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage({
    searchParams
}: {
    searchParams: { session_id?: string; mock?: string }
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchParams.mock
                        ? 'Your order has been placed in test mode.'
                        : 'Your payment was processed securely. Thank you for your purchase!'}
                </p>

                <div className="space-y-3">
                    <Link
                        href="/orders"
                        className="block w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/products"
                        className="block w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    )
}
