import Link from 'next/link'
import TrendingProducts from '@/components/store/TrendingProducts'
import PersonalizedRecommendations from '@/components/store/PersonalizedRecommendations'

export default function Home() {
    return (
        <div>
            {/* Development Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black py-3 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm font-medium">
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        🚧 This website is under active development.
                    </span>
                    <span className="bg-black/10 rounded-lg px-3 py-1">
                        Test login: <strong>user@example.com</strong> / <strong>password123</strong>
                    </span>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        AI-Powered Shopping Experience
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                        Welcome to{' '}
                        <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                            IndieMart
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
                        Discover premium products curated by AI. From cutting-edge electronics to timeless fashion —
                        find everything you love, all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/products"
                            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
                        >
                            Shop Now
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 sm:gap-16 text-center">
                        <div>
                            <div className="text-3xl font-bold text-amber-400">28+</div>
                            <div className="text-sm text-gray-400 mt-1">Products</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-amber-400">4</div>
                            <div className="text-sm text-gray-400 mt-1">Categories</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-amber-400">AI</div>
                            <div className="text-sm text-gray-400 mt-1">Copilot</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Highlights */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: 'Electronics', slug: 'electronics', emoji: '💻', gradient: 'from-blue-500 to-cyan-500' },
                        { name: 'Fashion', slug: 'fashion', emoji: '👗', gradient: 'from-pink-500 to-rose-500' },
                        { name: 'Home & Kitchen', slug: 'home-kitchen', emoji: '🏠', gradient: 'from-emerald-500 to-teal-500' },
                        { name: 'Books', slug: 'books', emoji: '📚', gradient: 'from-violet-500 to-purple-500' },
                    ].map(cat => (
                        <Link
                            key={cat.slug}
                            href={`/products?category=${cat.slug}`}
                            className="group relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                            <div className="relative z-10">
                                <span className="text-4xl mb-3 block">{cat.emoji}</span>
                                <h3 className="text-lg font-bold">{cat.name}</h3>
                                <p className="text-sm text-white/70 mt-1 group-hover:text-white/90 transition-colors">Explore →</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Trending Products */}
            <section className="max-w-7xl mx-auto px-4 pb-16">
                <TrendingProducts />
            </section>

            {/* Personalized Recommendations */}
            <section className="max-w-7xl mx-auto px-4 pb-16">
                <PersonalizedRecommendations />
            </section>
        </div>
    )
}
