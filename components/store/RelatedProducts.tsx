import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function RelatedProducts({ productId }: { productId: string }) {
    // Find other product IDs in the same orders where this product exists
    const relatedOrderItems = await prisma.$queryRaw`
    SELECT "productId", COUNT(*) as frequency
    FROM "OrderItem"
    WHERE "orderId" IN (
      SELECT "orderId" FROM "OrderItem" WHERE "productId" = ${productId}
    )
    AND "productId" != ${productId}
    GROUP BY "productId"
    ORDER BY frequency DESC
    LIMIT 4
  ` as { productId: string, frequency: number }[]

    if (!relatedOrderItems || relatedOrderItems.length === 0) return null

    const productIds = relatedOrderItems.map(item => item.productId)

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    })

    const sortedProducts = productIds.map(id => products.find(p => p.id === id)).filter(Boolean)

    return (
        <section className="py-8 mt-12 border-t border-border w-full">
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Customers who bought this item also bought</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {sortedProducts.map((product: any) => (
                    <Link href={`/products/${product.slug}`} key={product.id} className="group border border-border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 flex flex-col justify-between">
                        <div>
                            <div className="aspect-square relative mb-4 bg-gray-100 rounded-md overflow-hidden">
                                <Image src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} alt={product.name} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform" />
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
