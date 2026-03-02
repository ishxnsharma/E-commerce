import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import AICopilot from '@/components/store/AICopilot'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'IndieMart - Buy the best products',
    description: 'An AI-powered e-commerce platform by IndieMart.',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    let user = null

    if (session) {
        user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { name: true, role: true }
        })
    }

    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen flex flex-col`}>
                <Navbar user={user} />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
                <AICopilot />
            </body>
        </html>
    )
}


