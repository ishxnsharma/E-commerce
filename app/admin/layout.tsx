import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react'

export const metadata = {
    title: 'Admin Dashboard - IndieMart',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <aside className="w-64 bg-amazon-blue text-white flex-col hidden md:flex">
                <div className="p-4 text-2xl font-bold border-b border-gray-700">
                    Admin Panel
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 p-3 rounded hover:bg-amazon-light transition-colors">
                        <LayoutDashboard size={20} />
                        Overview
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded hover:bg-amazon-light transition-colors">
                        <Package size={20} />
                        Products
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded hover:bg-amazon-light transition-colors">
                        <ShoppingCart size={20} />
                        Orders
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded hover:bg-amazon-light transition-colors">
                        <Users size={20} />
                        Users
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <Link href="/" className="flex items-center gap-3 p-3 rounded hover:bg-amazon-light transition-colors text-amazon-orange">
                        <LogOut size={20} />
                        Back to Store
                    </Link>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 text-black dark:text-white">
                {children}
            </main>
        </div>
    )
}
