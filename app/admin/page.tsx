import prisma from '@/lib/prisma'

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const usersCount = await prisma.user.count()
    const productsCount = await prisma.product.count()
    const ordersCount = await prisma.order.count()

    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    })

    // Calculate total revenue
    const allOrders = await prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { totalAmount: true }
    })
    const totalRevenue = allOrders.reduce((acc, order) => acc + order.totalAmount, 0)

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-gray-500 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-gray-500 mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold">{ordersCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-gray-500 mb-2">Total Products</h3>
                    <p className="text-3xl font-bold">{productsCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-gray-500 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold">{usersCount}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-bold">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-sm text-gray-600 dark:text-gray-200">Order ID</th>
                                <th className="px-6 py-3 font-semibold text-sm text-gray-600 dark:text-gray-200">Customer</th>
                                <th className="px-6 py-3 font-semibold text-sm text-gray-600 dark:text-gray-200">Date</th>
                                <th className="px-6 py-3 font-semibold text-sm text-gray-600 dark:text-gray-200">Amount</th>
                                <th className="px-6 py-3 font-semibold text-sm text-gray-600 dark:text-gray-200">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 text-sm font-medium">{order.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 text-sm">{order.user.name}</td>
                                    <td className="px-6 py-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm font-bold border-l pl-4 border-gray-200 dark:border-gray-700">
                                        ₹{order.totalAmount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'PROCESSING' || order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentOrders.length === 0 && <div className="p-6 text-center text-gray-500">No orders yet.</div>}
                </div>
            </div>
        </div>
    )
}
