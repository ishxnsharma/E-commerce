import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const orders = await prisma.order.findMany({
        where: { userId: session.id },
        include: {
            orderItems: {
                include: { product: true }
            },
            shippingAddress: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Your Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Start shopping to see your orders here!</p>
                        <Link href="/products" className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center text-sm">
                                    <div className="flex gap-6">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 block mb-0.5">ORDER PLACED</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 block mb-0.5">TOTAL</span>
                                            <span className="font-bold text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 text-xs">#{order.id.slice(0, 8)}</span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {order.orderItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                                            <div className="w-16 h-16 relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-contain p-1"
                                                    sizes="64px"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <Link href={`/products/${item.product.slug}`} className="font-medium text-gray-900 dark:text-white hover:text-orange-500 transition-colors truncate block">
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 text-xs text-gray-500 dark:text-gray-400">
                                    Ship to: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
