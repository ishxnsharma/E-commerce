'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface ProductResult {
    product: {
        id: string
        name: string
        slug: string
        description: string
        price: number
        compareAtPrice: number | null
        images: string[]
        rating: number
        numReviews: number
        category: { name: string; slug: string }
    }
    score: number
    explanation: string
}

interface Message {
    id: string
    type: 'user' | 'assistant'
    text: string
    results?: ProductResult[]
    timestamp: Date
}

export default function AICopilot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            type: 'assistant',
            text: "Hi! I'm your AI Shopping Assistant 🛍️ Ask me anything like \"Best phone under 30000\" or \"Affordable running shoes for beginners\"",
            timestamp: new Date(),
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
        }
    }, [isOpen])

    const handleSend = async () => {
        const query = input.trim()
        if (!query || isLoading) return

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            type: 'user',
            text: query,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/ai-copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to get recommendations')
            }

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                type: 'assistant',
                text: data.message,
                results: data.results,
                timestamp: new Date(),
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error: any) {
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                type: 'assistant',
                text: `Sorry, something went wrong: ${error.message}. Please try again!`,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Floating Chat Button */}
            <button
                id="ai-copilot-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen
                        ? 'bg-gray-700 hover:bg-gray-600 rotate-0'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 animate-pulse'
                    }`}
                aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                )}
            </button>

            {/* Chat Panel */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${isOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
            >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden" style={{ height: '520px' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base">AI Shopping Copilot</h3>
                            <p className="text-white/70 text-xs">Powered by intelligent search</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth" style={{ minHeight: 0 }}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${msg.type === 'user'
                                        ? 'bg-orange-500 text-white rounded-2xl rounded-br-md px-4 py-2.5'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md px-4 py-2.5'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                    {/* Product Cards */}
                                    {msg.results && msg.results.length > 0 && (
                                        <div className="mt-3 space-y-2.5">
                                            {msg.results.map((r) => (
                                                <Link
                                                    key={r.product.id}
                                                    href={`/products/${r.product.slug}`}
                                                    className="block bg-white dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-400 transition-all hover:shadow-md group"
                                                >
                                                    <div className="flex gap-3">
                                                        {r.product.images?.[0] && (
                                                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 shrink-0">
                                                                <img
                                                                    src={r.product.images[0]}
                                                                    alt={r.product.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-500 transition-colors">
                                                                {r.product.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                                                    ₹{r.product.price.toLocaleString('en-IN')}
                                                                </span>
                                                                {r.product.compareAtPrice && (
                                                                    <span className="text-xs text-gray-400 line-through">
                                                                        ₹{r.product.compareAtPrice.toLocaleString('en-IN')}
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-yellow-500">
                                                                    {'★'.repeat(Math.round(r.product.rating))} {r.product.rating}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic leading-snug">
                                                        {r.explanation}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-3 shrink-0 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                id="ai-copilot-input"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                disabled={isLoading}
                                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 border-0"
                            />
                            <button
                                id="ai-copilot-send"
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                aria-label="Send message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
