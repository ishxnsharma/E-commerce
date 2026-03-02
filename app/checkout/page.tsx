'use client'

import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Address {
    id: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault: boolean
}

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)

    // Address state
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string>('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [addressLoading, setAddressLoading] = useState(true)
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
    })

    useEffect(() => {
        setMounted(true)
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/addresses')
            if (res.ok) {
                const data = await res.json()
                setAddresses(data)
                const defaultAddr = data.find((a: Address) => a.isDefault)
                if (defaultAddr) setSelectedAddressId(defaultAddr.id)
                else if (data.length > 0) setSelectedAddressId(data[0].id)
                if (data.length === 0) setShowAddForm(true)
            }
        } catch (err) {
            console.error('Failed to load addresses:', err)
        } finally {
            setAddressLoading(false)
        }
    }

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 })
            })
            if (res.ok) {
                const created = await res.json()
                setAddresses(prev => [...prev, created])
                setSelectedAddressId(created.id)
                setShowAddForm(false)
                setNewAddress({ street: '', city: '', state: '', postalCode: '', country: 'India' })
            }
        } catch (err) {
            alert('Failed to save address')
        }
    }

    if (!mounted) return null
    if (items.length === 0) {
        router.push('/cart')
        return null
    }

    const handlePayment = async () => {
        if (!selectedAddressId) {
            alert('Please add or select a delivery address before placing your order.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, addressId: selectedAddressId })
            })
            const orderData = await res.json()

            if (!res.ok) {
                if (res.status === 401) {
                    alert('Please login first to place an order.')
                    router.push('/login')
                    return
                }
                throw new Error(orderData.error)
            }

            if (orderData.isMock) {
                clearCart()
                router.push('/checkout/success?mock=true')
                return
            } else if (orderData.sessionUrl) {
                clearCart()
                window.location.href = orderData.sessionUrl
                return
            } else {
                throw new Error('Failed to create checkout session.')
            }
        } catch (error: any) {
            console.error(error)
            alert(error.message || 'Error initiating payment')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Checkout</h1>

                {/* ── DELIVERY ADDRESS ── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Delivery Address
                        </h2>

                        {addressLoading ? (
                            <div className="flex items-center gap-2 text-gray-500 py-4">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Loading addresses...
                            </div>
                        ) : (
                            <>
                                {/* Saved addresses */}
                                {addresses.length > 0 && (
                                    <div className="space-y-3 mb-4">
                                        {addresses.map(addr => (
                                            <label
                                                key={addr.id}
                                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id
                                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={addr.id}
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                    className="mt-1 accent-orange-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {addr.street}
                                                        {addr.isDefault && <span className="ml-2 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-0.5 rounded-full">Default</span>}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Add new address button / form */}
                                {!showAddForm ? (
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Add New Address
                                    </button>
                                ) : (
                                    <form onSubmit={handleAddAddress} className="border-2 border-orange-200 dark:border-orange-800 rounded-xl p-5 bg-orange-50/50 dark:bg-orange-900/10 space-y-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">New Delivery Address</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address *</label>
                                            <input
                                                type="text"
                                                value={newAddress.street}
                                                onChange={e => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                                                placeholder="123 Main Street, Apt 4B"
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.city}
                                                    onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                                    placeholder="Mumbai"
                                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.state}
                                                    onChange={e => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                                                    placeholder="Maharashtra"
                                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN Code *</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.postalCode}
                                                    onChange={e => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                                                    placeholder="400001"
                                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.country}
                                                    onChange={e => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2.5 rounded-lg font-bold text-sm hover:from-amber-600 hover:to-orange-700 transition-all"
                                            >
                                                Save Address
                                            </button>
                                            {addresses.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddForm(false)}
                                                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── ORDER SUMMARY ── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Order items */}
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                                    <div className="w-16 h-16 relative bg-white dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-1"
                                            sizes="64px"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                        <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
                            <span>Total</span>
                            <span className="text-2xl bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                ₹{totalPrice().toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {/* Security notice */}
                    <div className="px-6 pb-2">
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Payments are processed securely via <strong>Stripe</strong>. Your card details never touch our servers.</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="p-6 pt-4">
                        <button
                            onClick={handlePayment}
                            disabled={loading || !selectedAddressId}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    {selectedAddressId ? 'Place Your Order & Pay Securely' : 'Add an Address to Continue'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
