import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = "force-dynamic";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { category?: string; search?: string }
}) {
    const { category, search } = searchParams

    const whereClause: any = {}

    if (category) {
        whereClause.category = { slug: category }
    }

    if (search) {
        whereClause.name = { contains: search, mode: 'insensitive' }
    }

    const products = await prisma.product.findMany({
        where: whereClause,
        include: { category: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {category ? `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' & ')}` : 'All Products'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{products.length} products found</p>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sorry, Not Available</h2>
                        {search ? (
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                We couldn&apos;t find any products matching <strong className="text-gray-700 dark:text-gray-300">&ldquo;{search}&rdquo;</strong>. Try a different search term or browse our categories.
                            </p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 mb-6">No products found in this category.</p>
                        )}
                        <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:-translate-y-0.5">
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                href={`/products/${product.slug}`}
                                key={product.id}
                                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                <div className="aspect-square relative bg-gray-50 dark:bg-gray-700 overflow-hidden">
                                    <Image
                                        src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {product.compareAtPrice && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">
                                        {product.category.name}
                                    </span>
                                    <h2 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" title={product.name}>
                                        {product.name}
                                    </h2>
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">({product.numReviews})</span>
                                    </div>
                                    <div className="mt-auto flex items-baseline gap-2">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                                        {product.compareAtPrice && (
                                            <span className="text-sm text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
