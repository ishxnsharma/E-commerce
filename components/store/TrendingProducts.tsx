import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function TrendingProducts() {
    const trendingItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 4
    })

    // If no orders exist (e.g. brand new DB), fallback to featured products
    if (trendingItems.length === 0) {
        const featured = await prisma.product.findMany({ take: 4, orderBy: { rating: 'desc' } })
        return renderGrid(featured)
    }

    const productIds = trendingItems.map(item => item.productId)

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    })

    const sortedProducts = productIds.map(id => products.find(p => p.id === id)).filter(Boolean)

    return renderGrid(sortedProducts)
}

function renderGrid(products: any[]) {
    if (!products.length) return null

    return (
        <section className="py-8 w-full max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-black dark:text-white">Trending Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product: any) => (
                    <Link href={`/products/${product.slug}`} key={product.id} className="group border border-border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 flex flex-col justify-between">
                        <div>
                            <div className="aspect-square relative mb-4 bg-gray-100 rounded-md overflow-hidden">
                                <Image src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} alt={product.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <h3 className="font-medium text-blue-600 dark:text-blue-400 hover:text-amazon-orange hover:underline line-clamp-2 mb-1" title={product.name}>{product.name}</h3>
                            <div className="flex items-center gap-1 mb-2 text-sm text-gray-500">
                                <span className="text-amazon-orange text-lg">★</span>
                                <span className="font-medium text-black dark:text-gray-300">{product.rating.toFixed(1)}</span>
                                <span>({product.numReviews})</span>
                            </div>
                        </div>
                        <p className="text-red-700 dark:text-red-400 font-bold mt-2 text-xl">₹{product.price.toLocaleString('en-IN')}</p>
                    </Link>
                ))}
            </div>
        </section>
    )
}
