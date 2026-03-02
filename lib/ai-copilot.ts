import prisma from '@/lib/prisma'

// ============================================================
// QUERY PARSING — Natural Language → Structured Filters
// ============================================================

interface ParsedFilters {
    category: string | null
    minPrice: number | null
    maxPrice: number | null
    tags: string[]
    keywords: string[]
    sortBy: 'price' | 'rating' | 'popularity' | null
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    electronics: ['phone', 'mobile', 'laptop', 'tablet', 'headphone', 'earphone', 'earbud', 'speaker', 'camera', 'tv', 'television', 'monitor', 'gaming', 'console', 'gadget', 'tech', 'computer', 'pc', 'smartwatch', 'watch', 'charger', 'powerbank', 'airpod', 'macbook'],
    fashion: ['shirt', 'tshirt', 't-shirt', 'jeans', 'pants', 'dress', 'jacket', 'shoes', 'sneaker', 'boots', 'clothing', 'wear', 'apparel', 'fashion', 'hoodie', 'bag', 'bags', 'accessory', 'accessories', 'running', 'sports', 'sunglasses', 'glasses'],
    home: ['home', 'kitchen', 'cook', 'cooker', 'vacuum', 'clean', 'lamp', 'light', 'decor', 'furniture', 'appliance', 'air fryer', 'fryer', 'cutting board', 'robot', 'blender', 'mixer'],
    books: ['book', 'books', 'novel', 'read', 'reading', 'fiction', 'non-fiction', 'author', 'programming', 'coding', 'self-help', 'textbook', 'study', 'learn'],
}

const TAG_KEYWORDS: Record<string, string[]> = {
    'noise-canceling': ['noise cancel', 'noise-cancel', 'anc', 'noise reduction'],
    'wireless': ['wireless', 'bluetooth', 'bt'],
    'gaming': ['gaming', 'gamer', 'esports'],
    'photography': ['photography', 'camera', 'photo', 'portrait'],
    'premium': ['premium', 'luxury', 'high-end', 'flagship', 'pro'],
    'budget': ['budget', 'cheap', 'affordable', 'value', 'low cost'],
    'high-refresh': ['high refresh', '120hz', '144hz', '165hz', '240hz', 'refresh rate'],
    'running': ['running', 'jogging', 'marathon', 'athletic'],
    'beginner': ['beginner', 'starter', 'entry-level', 'first time'],
    'kitchen': ['kitchen', 'cooking', 'cook', 'baking', 'recipe'],
    'smart': ['smart', 'intelligent', 'ai', 'automated', 'iot'],
    'self-help': ['self-help', 'self help', 'personal development', 'motivation', 'habits'],
    'bestseller': ['bestseller', 'best seller', 'popular', 'top rated'],
    'programming': ['programming', 'coding', 'software', 'developer', 'code'],
    'fiction': ['fiction', 'novel', 'story', 'stories'],
    'non-fiction': ['non-fiction', 'nonfiction', 'history', 'science', 'biography'],
    'productivity': ['productivity', 'efficiency', 'time management', 'focus'],
    'eco-friendly': ['eco', 'sustainable', 'organic', 'green', 'bamboo'],
}

export function parseQuery(query: string): ParsedFilters {
    const lower = query.toLowerCase().trim()
    const filters: ParsedFilters = {
        category: null,
        minPrice: null,
        maxPrice: null,
        tags: [],
        keywords: [],
        sortBy: null,
    }

    // --- Extract price constraints ---
    // "under 30000", "below 30k", "less than 30000"
    const underMatch = lower.match(/(?:under|below|less than|upto|up to|max|within|budget of?)\s*(?:rs\.?|₹|inr)?\s*(\d+)\s*k?/i)
    if (underMatch) {
        let val = parseInt(underMatch[1])
        if (lower.includes(underMatch[1] + 'k')) val *= 1000
        filters.maxPrice = val
    }

    // "above 10000", "over 10k", "more than 10000", "starting 10000"
    const overMatch = lower.match(/(?:above|over|more than|starting|from|min|minimum)\s*(?:rs\.?|₹|inr)?\s*(\d+)\s*k?/i)
    if (overMatch) {
        let val = parseInt(overMatch[1])
        if (lower.includes(overMatch[1] + 'k')) val *= 1000
        filters.minPrice = val
    }

    // "between 10000 and 30000"
    const betweenMatch = lower.match(/between\s*(?:rs\.?|₹|inr)?\s*(\d+)\s*k?\s*(?:and|to|-)\s*(?:rs\.?|₹|inr)?\s*(\d+)\s*k?/i)
    if (betweenMatch) {
        let min = parseInt(betweenMatch[1])
        let max = parseInt(betweenMatch[2])
        if (lower.includes(betweenMatch[1] + 'k')) min *= 1000
        if (lower.includes(betweenMatch[2] + 'k')) max *= 1000
        filters.minPrice = min
        filters.maxPrice = max
    }

    // --- Detect category ---
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                filters.category = category
                break
            }
        }
        if (filters.category) break
    }

    // --- Detect tags ---
    for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                filters.tags.push(tag)
                break
            }
        }
    }

    // --- Extract general keywords (words > 3 chars, not stopwords) ---
    const STOPWORDS = new Set(['best', 'good', 'nice', 'great', 'find', 'show', 'give', 'want', 'need', 'looking', 'search', 'with', 'have', 'that', 'this', 'from', 'what', 'which', 'for', 'the', 'and', 'under', 'below', 'above', 'over', 'between', 'less', 'more', 'than', 'price', 'cost', 'range', 'budget', 'around', 'about', 'recommend', 'suggestion'])
    const words = lower.replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w))
    filters.keywords = words

    // --- Detect sort preference ---
    if (lower.includes('cheapest') || lower.includes('lowest price')) {
        filters.sortBy = 'price'
    } else if (lower.includes('best rated') || lower.includes('top rated') || lower.includes('highest rated')) {
        filters.sortBy = 'rating'
    } else if (lower.includes('most popular') || lower.includes('trending') || lower.includes('bestsell')) {
        filters.sortBy = 'popularity'
    }

    return filters
}

// ============================================================
// PRODUCT RANKING — Weighted Scoring Algorithm
// ============================================================

interface ScoredProduct {
    product: any
    score: number
    reasons: string[]
}

function rankProducts(products: any[], filters: ParsedFilters): ScoredProduct[] {
    return products
        .map(product => {
            let score = 0
            const reasons: string[] = []

            // --- Price relevance (0-30 points) ---
            if (filters.maxPrice) {
                if (product.price <= filters.maxPrice) {
                    // Closer to the budget = higher score
                    const ratio = product.price / filters.maxPrice
                    const priceScore = ratio > 0.5 ? 30 * (1 - Math.abs(ratio - 0.8)) : 15
                    score += priceScore
                    reasons.push(`Fits your budget of ₹${filters.maxPrice.toLocaleString('en-IN')}`)
                } else {
                    score -= 20 // Penalize over-budget items
                }
            }
            if (filters.minPrice && product.price >= filters.minPrice) {
                score += 10
            }

            // --- Rating weight (0-25 points) ---
            const ratingScore = (product.rating / 5) * 25
            score += ratingScore
            if (product.rating >= 4.5) {
                reasons.push(`Highly rated at ${product.rating}★`)
            } else if (product.rating >= 4.0) {
                reasons.push(`Well rated at ${product.rating}★`)
            }

            // --- Popularity score from reviews (0-20 points) ---  
            const popularityScore = Math.min(20, (product.numReviews / 50) * 20)
            score += popularityScore
            if (product.numReviews >= 100) {
                reasons.push(`Very popular with ${product.numReviews} reviews`)
            }

            // --- Tag match (0-25 points) ---
            if (filters.tags.length > 0 && product.tags?.length > 0) {
                const productTagsLower = product.tags.map((t: string) => t.toLowerCase())
                let matchCount = 0
                for (const tag of filters.tags) {
                    if (productTagsLower.includes(tag.toLowerCase())) {
                        matchCount++
                    }
                }
                const tagScore = (matchCount / filters.tags.length) * 25
                score += tagScore
                if (matchCount > 0) {
                    reasons.push(`Matches ${matchCount} of your requested features`)
                }
            }

            // --- Keyword match in name/description (0-15 bonus) ---
            const combined = `${product.name} ${product.description}`.toLowerCase()
            let keywordMatches = 0
            for (const kw of filters.keywords) {
                if (combined.includes(kw)) keywordMatches++
            }
            if (filters.keywords.length > 0) {
                score += (keywordMatches / filters.keywords.length) * 15
            }

            // --- Sale/discount bonus ---
            if (product.compareAtPrice && product.compareAtPrice > product.price) {
                const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                score += 5
                reasons.push(`${discount}% off (₹${product.compareAtPrice.toLocaleString('en-IN')} → ₹${product.price.toLocaleString('en-IN')})`)
            }

            return { product, score, reasons }
        })
        .filter(sp => sp.score > 0)
        .sort((a, b) => b.score - a.score)
}

// ============================================================
// EXPLANATION GENERATOR
// ============================================================

function generateExplanation(scored: ScoredProduct): string {
    if (scored.reasons.length === 0) {
        return 'This product is a relevant match for your query.'
    }
    return 'Recommended because: ' + scored.reasons.slice(0, 3).join('. ') + '.'
}

// ============================================================
// MAIN SEARCH FUNCTION — Pipeline Orchestrator
// ============================================================

export interface CopilotResult {
    product: {
        id: string
        name: string
        slug: string
        description: string
        price: number
        compareAtPrice: number | null
        images: string[]
        tags: string[]
        rating: number
        numReviews: number
        category: { name: string; slug: string }
    }
    score: number
    explanation: string
}

export async function searchProducts(query: string): Promise<{
    results: CopilotResult[]
    parsedFilters: ParsedFilters
    message: string
}> {
    const filters = parseQuery(query)

    // Build Prisma where clause
    const where: any = {}

    if (filters.category) {
        where.category = {
            slug: { contains: filters.category, mode: 'insensitive' }
        }
    }

    if (filters.minPrice || filters.maxPrice) {
        where.price = {}
        if (filters.minPrice) where.price.gte = filters.minPrice
        if (filters.maxPrice) where.price.lte = filters.maxPrice * 1.15 // 15% tolerance
    }

    if (filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags }
    }

    // Keyword search with OR across name and description
    if (filters.keywords.length > 0) {
        where.OR = filters.keywords.flatMap(kw => [
            { name: { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } },
        ])
    }

    // Query DB
    let products = await prisma.product.findMany({
        where,
        include: {
            category: { select: { name: true, slug: true } },
        },
        take: 20,
    })

    // If no results with strict filters, fallback to broader search
    if (products.length === 0 && filters.keywords.length > 0) {
        products = await prisma.product.findMany({
            where: {
                OR: filters.keywords.flatMap(kw => [
                    { name: { contains: kw, mode: 'insensitive' } },
                    { description: { contains: kw, mode: 'insensitive' } },
                    { tags: { hasSome: [kw] } },
                ]),
            },
            include: {
                category: { select: { name: true, slug: true } },
            },
            take: 20,
        })
    }

    // If still no results, return top products
    if (products.length === 0) {
        products = await prisma.product.findMany({
            include: {
                category: { select: { name: true, slug: true } },
            },
            orderBy: { rating: 'desc' },
            take: 5,
        })

        return {
            results: products.map(p => ({
                product: p as unknown as CopilotResult['product'],
                score: 0,
                explanation: "I couldn't find an exact match, but here are our top-rated products you might like.",
            })),
            parsedFilters: filters,
            message: `I couldn't find products matching "${query}" exactly. Here are our top picks instead:`,
        }
    }

    // Rank results
    const scored = rankProducts(products, filters)
    const topResults = scored.slice(0, 5)

    const results: CopilotResult[] = topResults.map(sp => ({
        product: sp.product as CopilotResult['product'],
        score: Math.round(sp.score * 10) / 10,
        explanation: generateExplanation(sp),
    }))

    // Build a friendly message
    let message = `Found ${results.length} product${results.length !== 1 ? 's' : ''} matching your search`
    if (filters.maxPrice) {
        message += ` under ₹${filters.maxPrice.toLocaleString('en-IN')}`
    }
    if (filters.category) {
        message += ` in ${filters.category}`
    }
    message += '.'

    return { results, parsedFilters: filters, message }
}
