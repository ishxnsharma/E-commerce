import prisma from '@/lib/prisma'
import Image from 'next/image'

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
    const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Products List</h1>
                <button className="bg-amazon-blue text-white px-4 py-2 rounded font-medium hover:bg-amazon-light">
                    Add New Product
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-sm">Image</th>
                                <th className="px-6 py-3 font-semibold text-sm">Name</th>
                                <th className="px-6 py-3 font-semibold text-sm">Category</th>
                                <th className="px-6 py-3 font-semibold text-sm">Price</th>
                                <th className="px-6 py-3 font-semibold text-sm">Stock</th>
                                <th className="px-6 py-3 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 relative bg-gray-100 rounded">
                                            <Image src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} alt={product.name} fill sizes="48px" className="object-cover rounded" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                                    <td className="px-6 py-4 text-sm">{product.category.name}</td>
                                    <td className="px-6 py-4 text-sm font-bold">₹{product.price.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={product.inventory > 0 ? 'text-green-600' : 'text-red-500 font-bold'}>
                                            {product.inventory}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <button className="text-blue-500 hover:underline mr-3">Edit</button>
                                        <button className="text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
