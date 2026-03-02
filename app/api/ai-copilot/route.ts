import { NextResponse } from 'next/server'
import { searchProducts } from '@/lib/ai-copilot'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { query } = await request.json()

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json({ error: 'Please provide a search query' }, { status: 400 })
        }

        const trimmedQuery = query.trim()
        const { results, parsedFilters, message } = await searchProducts(trimmedQuery)

        // Log the search (optional — fails gracefully for unauthenticated users)
        let userId: string | null = null
        try {
            const session = await getSession()
            userId = session?.id || null
        } catch {
            // Guest user — still allow search
        }

        // Log to SearchLog
        try {
            await prisma.searchLog.create({
                data: {
                    userId,
                    query: trimmedQuery,
                    parsedFilters: parsedFilters as any,
                }
            })
        } catch (e) {
            // Non-critical — don't fail the request
            console.warn('Failed to log search:', e)
        }

        // Log AIInteraction for each result
        if (results.length > 0 && userId) {
            try {
                await prisma.aIInteraction.createMany({
                    data: results.map(r => ({
                        userId,
                        inputQuery: trimmedQuery,
                        recommendationReason: r.explanation,
                    }))
                })
            } catch (e) {
                console.warn('Failed to log AI interactions:', e)
            }
        }

        return NextResponse.json({
            message,
            results,
            filtersUsed: parsedFilters,
        })
    } catch (error: any) {
        console.error('AI Copilot error:', error)
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 })
    }
}
