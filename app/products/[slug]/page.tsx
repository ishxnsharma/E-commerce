import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from './AddToCartButton'
import RelatedProducts from '@/components/store/RelatedProducts'

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
    const product = await prisma.product.findUnique({
        where: { slug: params.slug },
        include: { category: true, reviews: { include: { user: true } } }
    })

    if (!product) return notFound()

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/2 md:max-w-[500px] aspect-square relative bg-white border border-border rounded-lg overflow-hidden flex items-center justify-center p-8">
                    <Image
                        src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                <div className="w-full md:w-1/2 flex flex-col pt-4">
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <Link href={`/products?category=${product.category.slug}`} className="text-amazon-orange hover:underline mb-4 inline-block">
                        Visit the {product.category.name} Store
                    </Link>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-amazon-orange text-xl">★★★★☆</span>
                        <span className="text-amazon-orange hover:underline cursor-pointer">{product.rating.toFixed(1)} ({product.numReviews} ratings)</span>
                    </div>

                    <div className="border-t border-b border-border py-4 mb-6">
                        <span className="text-sm align-top">₹</span>
                        <span className="text-4xl font-semibold">{product.price.toLocaleString('en-IN')}</span>
                        {product.compareAtPrice && (
                            <span className="text-gray-500 line-through ml-3">M.R.P.: ₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold mb-2">About this item</h3>
                        <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
                            {product.description}
                        </p>
                    </div>

                    <div className="p-4 border border-border rounded-lg bg-gray-50 dark:bg-gray-800 w-full md:w-80">
                        <h3 className="font-bold text-xl mb-4 text-black dark:text-white">₹{product.price.toLocaleString('en-IN')}</h3>
                        <div className="text-green-600 font-bold mb-4">
                            {product.inventory > 0 ? 'In stock' : 'Out of stock'}
                        </div>

                        <AddToCartButton product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.images[0],
                        }} disabled={product.inventory === 0} />
                    </div>
                </div>
            </div>
            {/* Customers Also Bought functionality based on SQL queries */}
            <RelatedProducts productId={product.id} />
        </div>
    )
}
