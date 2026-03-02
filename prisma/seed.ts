import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up in reverse dependency order
  await prisma.aIInteraction.deleteMany()
  await prisma.searchLog.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'user@example.com',
      password: passwordHash,
      role: 'USER',
      addresses: {
        create: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
          isDefault: true
        }
      }
    },
  })

  // 2. Create Categories
  const catElectronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics', description: 'Gadgets, phones, laptops and devices' }
  })
  const catFashion = await prisma.category.create({
    data: { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes and accessories' }
  })
  const catHome = await prisma.category.create({
    data: { name: 'Home & Kitchen', slug: 'home', description: 'Home appliances, décor and kitchenware' }
  })
  const catBooks = await prisma.category.create({
    data: { name: 'Books', slug: 'books', description: 'Fiction, non-fiction, textbooks and more' }
  })

  // 3. Create Products across all categories
  const products = [
    // ═══════════════════ ELECTRONICS ═══════════════════
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      slug: 'sony-wh-1000xm5',
      description: 'Industry leading noise canceling headphones. Two processors control 8 microphones for unprecedented noise cancellation. With Auto NC Optimizer, noise canceling is automatically optimized based on your wearing conditions and environment.',
      price: 29990,
      compareAtPrice: 34990,
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['noise-canceling', 'wireless', 'audio', 'premium', 'bluetooth'],
      inventory: 50,
      rating: 4.8,
      numReviews: 120,
      categoryId: catElectronics.id,
      isFeatured: true,
    },
    {
      name: 'Apple iPhone 15 Pro Max',
      slug: 'apple-iphone-15-pro-max',
      description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system for stunning photos in any light.',
      price: 159900,
      images: ['/products/apple-iphone.png'],
      tags: ['premium', 'photography', 'flagship', '5g', 'titanium'],
      inventory: 30,
      rating: 4.9,
      numReviews: 200,
      categoryId: catElectronics.id,
      isFeatured: true,
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'The ultimate Galaxy experience with built-in S Pen, Galaxy AI features, titanium frame, and a stunning 200MP camera for professional photography.',
      price: 129999,
      compareAtPrice: 139999,
      images: ['/products/samsung-galaxy.png'],
      tags: ['premium', 'photography', 'flagship', '5g', 'ai', 's-pen'],
      inventory: 25,
      rating: 4.7,
      numReviews: 180,
      categoryId: catElectronics.id,
      isFeatured: true,
    },
    {
      name: 'ASUS ROG Strix Gaming Laptop',
      slug: 'asus-rog-strix-gaming-laptop',
      description: 'Powerful gaming laptop with RTX 4070, 16GB RAM, 165Hz display, and advanced cooling system. Built for competitive esports and AAA gaming.',
      price: 124990,
      images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['gaming', 'high-refresh', 'premium', 'laptop', 'rtx'],
      inventory: 15,
      rating: 4.6,
      numReviews: 95,
      categoryId: catElectronics.id,
      isFeatured: true,
    },
    {
      name: 'OnePlus 12R 5G',
      slug: 'oneplus-12r-5g',
      description: 'Flagship performance at an incredible price. Snapdragon 8 Gen 2, 100W SUPERVOOC charging, 120Hz AMOLED display, and a 50MP Sony camera.',
      price: 39999,
      compareAtPrice: 43999,
      images: ['/products/realme-phone.png'],
      tags: ['photography', '5g', 'fast-charging', 'high-refresh', 'budget'],
      inventory: 40,
      rating: 4.5,
      numReviews: 150,
      categoryId: catElectronics.id,
      isFeatured: true,
    },
    {
      name: 'Apple MacBook Air M3',
      slug: 'apple-macbook-air-m3',
      description: 'Strikingly thin and fast. Apple M3 chip, 18-hour battery life, Liquid Retina display, 8GB unified memory. The best laptop for productivity and creative work.',
      price: 114900,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['premium', 'laptop', 'productivity', 'lightweight', 'apple'],
      inventory: 20,
      rating: 4.8,
      numReviews: 250,
      categoryId: catElectronics.id,
      isFeatured: true,
    },
    {
      name: 'JBL Charge 5 Bluetooth Speaker',
      slug: 'jbl-charge-5-speaker',
      description: 'Portable waterproof Bluetooth speaker with 20 hours playtime, deep bass, and IP67 waterproof and dustproof rating. Built-in power bank to charge your devices.',
      price: 14999,
      compareAtPrice: 18999,
      images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['wireless', 'audio', 'budget', 'portable', 'waterproof'],
      inventory: 60,
      rating: 4.4,
      numReviews: 320,
      categoryId: catElectronics.id,
      isFeatured: false,
    },
    {
      name: 'Apple AirPods Pro 2nd Gen',
      slug: 'apple-airpods-pro-2',
      description: 'Active Noise Cancellation up to 2x more effective. Adaptive Transparency. Personalized Spatial Audio. USB-C MagSafe charging case with speaker and lanyard loop.',
      price: 24900,
      images: ['/products/airpods-pro.png'],
      tags: ['noise-canceling', 'wireless', 'audio', 'premium', 'apple'],
      inventory: 45,
      rating: 4.7,
      numReviews: 410,
      categoryId: catElectronics.id,
      isFeatured: false,
    },
    {
      name: 'Realme Narzo 70 Pro 5G',
      slug: 'realme-narzo-70-pro-5g',
      description: 'Best phone under 20000 with MediaTek Dimensity 7050, 120Hz AMOLED display, 50MP AI camera, and 5000mAh battery with 67W fast charging.',
      price: 17999,
      compareAtPrice: 19999,
      images: ['/products/realme-phone.png'],
      tags: ['budget', '5g', 'photography', 'fast-charging', 'beginner'],
      inventory: 70,
      rating: 4.2,
      numReviews: 85,
      categoryId: catElectronics.id,
      isFeatured: false,
    },

    // ═══════════════════ FASHION ═══════════════════
    {
      name: 'Men\'s Classic T-Shirt',
      slug: 'mens-classic-tshirt',
      description: 'Comfortable premium cotton t-shirt. A timeless classic made from 100% organic cotton for ultimate comfort and durability.',
      price: 999,
      compareAtPrice: 1499,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['cotton', 'casual', 'budget', 'comfortable', 'organic'],
      inventory: 100,
      rating: 4.5,
      numReviews: 45,
      categoryId: catFashion.id,
      isFeatured: false,
    },
    {
      name: 'Nike Revolution 6 Running Shoes',
      slug: 'nike-revolution-6-running',
      description: 'Lightweight and breathable mesh running shoes perfect for beginners. Cushioned foam midsole for everyday comfort on road runs.',
      price: 3495,
      compareAtPrice: 4995,
      images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['running', 'beginner', 'budget', 'lightweight', 'comfortable'],
      inventory: 80,
      rating: 4.3,
      numReviews: 310,
      categoryId: catFashion.id,
      isFeatured: false,
    },
    {
      name: 'Levi\'s 501 Original Fit Jeans',
      slug: 'levis-501-original-jeans',
      description: 'The original blue jean since 1873. Straight leg, button fly, sits at waist. Made with premium denim that softens and molds to your body over time.',
      price: 4499,
      compareAtPrice: 5999,
      images: ['/products/levis-jeans.png'],
      tags: ['premium', 'casual', 'denim', 'classic', 'comfortable'],
      inventory: 65,
      rating: 4.6,
      numReviews: 220,
      categoryId: catFashion.id,
      isFeatured: true,
    },
    {
      name: 'Adidas Ultraboost 23 Running Shoes',
      slug: 'adidas-ultraboost-23',
      description: 'Premium running shoes with BOOST midsole energy return technology. Primeknit upper, Continental rubber outsole, perfect for long distance running.',
      price: 16999,
      compareAtPrice: 19999,
      images: ['/products/adidas-ultraboost.png'],
      tags: ['running', 'premium', 'comfortable', 'sports', 'marathon'],
      inventory: 35,
      rating: 4.7,
      numReviews: 175,
      categoryId: catFashion.id,
      isFeatured: true,
    },
    {
      name: 'Ray-Ban Aviator Classic Sunglasses',
      slug: 'rayban-aviator-classic',
      description: 'Iconic pilot-shape sunglasses with crystal green G-15 lenses. Gold metal frame. Timeless design originally made for US aviators in 1937.',
      price: 12990,
      images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['premium', 'accessories', 'classic', 'iconic', 'uv-protection'],
      inventory: 40,
      rating: 4.8,
      numReviews: 340,
      categoryId: catFashion.id,
      isFeatured: true,
    },
    {
      name: 'Women\'s Casual Summer Dress',
      slug: 'womens-casual-summer-dress',
      description: 'Flowy and comfortable A-line summer dress made from breathable cotton blend. Flattering fit with side pockets. Perfect for casual outings and beach days.',
      price: 1799,
      compareAtPrice: 2499,
      images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['casual', 'budget', 'cotton', 'lightweight', 'summer'],
      inventory: 90,
      rating: 4.4,
      numReviews: 128,
      categoryId: catFashion.id,
      isFeatured: false,
    },
    {
      name: 'Premium Leather Crossbody Bag',
      slug: 'premium-leather-crossbody-bag',
      description: 'Handcrafted genuine leather crossbody bag with adjustable strap. Multiple compartments, RFID blocking pocket. Minimalist design for everyday carry.',
      price: 3999,
      compareAtPrice: 5499,
      images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['premium', 'accessories', 'leather', 'minimalist', 'everyday'],
      inventory: 30,
      rating: 4.5,
      numReviews: 87,
      categoryId: catFashion.id,
      isFeatured: false,
    },

    // ═══════════════════ HOME & KITCHEN ═══════════════════
    {
      name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
      slug: 'instant-pot-duo-7in1',
      description: '7-in-1 programmable cooker: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker and warmer. 6 quart capacity, 13 smart programs.',
      price: 8999,
      compareAtPrice: 11999,
      images: ['/products/instant-pot.png'],
      tags: ['kitchen', 'cooking', 'smart', 'budget', 'versatile'],
      inventory: 55,
      rating: 4.7,
      numReviews: 450,
      categoryId: catHome.id,
      isFeatured: true,
    },
    {
      name: 'Dyson V15 Detect Cordless Vacuum',
      slug: 'dyson-v15-detect-vacuum',
      description: 'The most powerful, intelligent cordless vacuum. Laser reveals microscopic dust. Piezo sensor counts and sizes dust particles. HEPA filtration captures 99.97% of particles.',
      price: 52900,
      images: ['/products/dyson-vacuum.png'],
      tags: ['premium', 'smart', 'cordless', 'cleaning', 'hepa'],
      inventory: 18,
      rating: 4.8,
      numReviews: 190,
      categoryId: catHome.id,
      isFeatured: true,
    },
    {
      name: 'Philips Air Fryer XXL',
      slug: 'philips-air-fryer-xxl',
      description: 'Rapid Air technology for healthy frying with up to 90% less fat. Extra large family size, 1.4kg capacity. Digital display with 7 presets.',
      price: 14999,
      compareAtPrice: 19999,
      images: ['/products/air-fryer.png'],
      tags: ['kitchen', 'cooking', 'healthy', 'budget', 'family'],
      inventory: 42,
      rating: 4.5,
      numReviews: 280,
      categoryId: catHome.id,
      isFeatured: true,
    },
    {
      name: 'Minimalist Ceramic Table Lamp',
      slug: 'minimalist-ceramic-table-lamp',
      description: 'Elegant handcrafted ceramic table lamp with linen shade. Warm ambient lighting, dimmable E27 bulb compatible. Scandinavian inspired design.',
      price: 3499,
      compareAtPrice: 4999,
      images: ['/products/ceramic-lamp.png'],
      tags: ['decor', 'minimalist', 'budget', 'lighting', 'scandinavian'],
      inventory: 35,
      rating: 4.3,
      numReviews: 65,
      categoryId: catHome.id,
      isFeatured: false,
    },
    {
      name: 'Organic Bamboo Cutting Board Set',
      slug: 'bamboo-cutting-board-set',
      description: 'Set of 3 premium organic bamboo cutting boards in different sizes. Naturally antimicrobial, knife-friendly surface, built-in juice grooves.',
      price: 1999,
      compareAtPrice: 2999,
      images: ['/products/cutting-board.png'],
      tags: ['kitchen', 'organic', 'budget', 'eco-friendly', 'bamboo'],
      inventory: 70,
      rating: 4.4,
      numReviews: 145,
      categoryId: catHome.id,
      isFeatured: false,
    },
    {
      name: 'Smart Robot Vacuum Cleaner',
      slug: 'smart-robot-vacuum-cleaner',
      description: 'AI-powered robot vacuum with LiDAR navigation, 3000Pa suction, auto-empty station. Works with Alexa and Google Home. Maps your home for efficient cleaning.',
      price: 24999,
      compareAtPrice: 34999,
      images: ['/products/robot-vacuum.png'],
      tags: ['smart', 'cleaning', 'ai', 'premium', 'cordless'],
      inventory: 22,
      rating: 4.3,
      numReviews: 112,
      categoryId: catHome.id,
      isFeatured: false,
    },

    // ═══════════════════ BOOKS ═══════════════════
    {
      name: 'Atomic Habits by James Clear',
      slug: 'atomic-habits-james-clear',
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. #1 New York Times bestseller. Over 15 million copies sold worldwide. Transform your life with tiny changes.',
      price: 499,
      compareAtPrice: 799,
      images: ['/products/atomic-habits.png'],
      tags: ['self-help', 'bestseller', 'productivity', 'budget', 'habits'],
      inventory: 200,
      rating: 4.9,
      numReviews: 580,
      categoryId: catBooks.id,
      isFeatured: true,
    },
    {
      name: 'The Psychology of Money by Morgan Housel',
      slug: 'psychology-of-money-morgan-housel',
      description: 'Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the strange ways people think about money. A must-read for personal finance.',
      price: 399,
      compareAtPrice: 599,
      images: ['/products/psychology-money.png'],
      tags: ['finance', 'bestseller', 'self-help', 'budget', 'money'],
      inventory: 150,
      rating: 4.8,
      numReviews: 420,
      categoryId: catBooks.id,
      isFeatured: true,
    },
    {
      name: 'Clean Code by Robert C. Martin',
      slug: 'clean-code-robert-martin',
      description: 'A Handbook of Agile Software Craftsmanship. Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
      price: 2999,
      images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['programming', 'tech', 'software', 'professional', 'coding'],
      inventory: 40,
      rating: 4.6,
      numReviews: 320,
      categoryId: catBooks.id,
      isFeatured: true,
    },
    {
      name: 'Sapiens: A Brief History of Humankind',
      slug: 'sapiens-yuval-noah-harari',
      description: 'By Yuval Noah Harari. A groundbreaking narrative of humanity\'s creation and evolution. From the Stone Age to the Silicon Age, explore how humans conquered the world.',
      price: 599,
      compareAtPrice: 899,
      images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['non-fiction', 'bestseller', 'history', 'science', 'budget'],
      inventory: 110,
      rating: 4.7,
      numReviews: 390,
      categoryId: catBooks.id,
      isFeatured: false,
    },
    {
      name: 'System Design Interview by Alex Xu',
      slug: 'system-design-interview-alex-xu',
      description: 'An insider\'s guide. Step-by-step framework for system design interviews. Covers 16 real-world systems including YouTube, Google Drive, Twitter, and more.',
      price: 3499,
      images: ['/products/system-design.png'],
      tags: ['programming', 'tech', 'interview', 'professional', 'career'],
      inventory: 30,
      rating: 4.5,
      numReviews: 210,
      categoryId: catBooks.id,
      isFeatured: false,
    },
    {
      name: 'The Alchemist by Paulo Coelho',
      slug: 'the-alchemist-paulo-coelho',
      description: 'A magical story about following your dreams. A fable about an Andalusian shepherd boy who travels from Spain to the Egyptian desert in search of treasure.',
      price: 299,
      compareAtPrice: 499,
      images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      tags: ['fiction', 'bestseller', 'classic', 'inspirational', 'budget'],
      inventory: 180,
      rating: 4.6,
      numReviews: 680,
      categoryId: catBooks.id,
      isFeatured: false,
    },
  ]

  for (const p of products) {
    await prisma.product.create({ data: p })
  }

  console.log(`✅ Seed complete: ${products.length} products across 4 categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
