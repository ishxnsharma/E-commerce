'use client'

import { useCartStore } from '@/store/cart'
import { useState } from 'react'

export default function AddToCartButton({ product, disabled }: { product: any, disabled: boolean }) {
    const addItem = useCartStore(state => state.addItem)
    const [added, setAdded] = useState(false)

    if (disabled) {
        return (
            <button disabled className="w-full bg-gray-300 text-gray-500 py-3 rounded-full font-medium mb-2 cursor-not-allowed">
                Out of Stock
            </button>
        )
    }

    const handleAdd = () => {
        addItem({ ...product, quantity: 1 })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <button
            onClick={handleAdd}
            className={`w-full py-3 rounded-full font-medium mb-2 transition-colors ${added ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary hover:bg-primary-dark text-black'}`}
        >
            {added ? 'Added to Cart' : 'Add to Cart'}
        </button>
    )
}
