# AI-Powered E-Commerce Platform

A production-ready, full-stack e-commerce project with an integrated AI recommendation engine and AI Shopping Copilot. Designed inspired by Amazon/Flipkart.

## Tech Stack
- **Frontend**: Next.js 14 App Router, Tailwind CSS, TypeScript, Zustand
- **Backend**: Next.js API Routes, Next.js Edge Middleware
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT & bcrypt
- **Payments**: Stripe (Checkout Sessions + Webhooks)
- **AI**: Built-in NLP Shopping Copilot

## Features
- **🤖 AI Shopping Copilot**: Conversational assistant that understands natural language queries, parses intent, and returns ranked product recommendations with explanations.
- **💳 Stripe Payments**: Secure hosted checkout with webhook-verified payment confirmation.
- **📊 Intelligent Recommendations**: SQL-based "Trending", "Customers Also Bought", and "Personalized" tracking arrays.
- **🛒 Shopping System**: Local/DB synced Zustand Cart and checkout flow.
- **🔒 Authentication**: Secure JWT-based access control with Next.js edge-route protection.
- **⚙️ Admin Dashboard**: High-level Analytics, order tracking, and product management lists.

---

## Why Stripe Replaced Razorpay

| Aspect | Previous (Razorpay) | Current (Stripe) |
|--------|---------------------|-------------------|
| Checkout | Client-side SDK in page | Hosted Checkout Session (PCI-compliant) |
| Verification | Client-side signature check | Server-side Webhook verification |
| Security | Key exposed on frontend | Secret key stays server-side only |
| Global support | India-focused | International support |
| Vercel compat. | Required script injection | Fully serverless-compatible |

### Stripe Payment Flow Architecture

```
Customer clicks "Place Order"
        │
        ▼
  POST /api/orders/create
        │
        ├── Create Order in DB (status: PENDING)
        ├── Create Stripe Checkout Session
        └── Return sessionUrl
        │
        ▼
  Redirect to Stripe hosted checkout page
        │
   ┌────┴────┐
   │         │
 Success   Cancel
   │         │
   ▼         ▼
/checkout  /checkout
/success   /cancel
   │
   ▼
Stripe Webhook → POST /api/webhook/stripe
        │
        ├── Verify signature with STRIPE_WEBHOOK_SECRET
        ├── checkout.session.completed → Update Order → PROCESSING
        └── checkout.session.expired → Update Order → CANCELLED
```

### Webhook Verification

Stripe signs every webhook event with a signature using your `STRIPE_WEBHOOK_SECRET`. The webhook endpoint:
1. Reads the raw request body (not parsed JSON)
2. Extracts the `stripe-signature` header
3. Calls `stripe.webhooks.constructEvent(body, sig, secret)` to verify
4. Only processes the event if verification passes

This prevents forged payment confirmations and ensures data integrity.

---

## AI Copilot System Architecture

The AI Shopping Copilot is a fully self-contained NLP system that requires no external AI API keys.

### Query Parsing

Natural language queries are parsed into structured filters:

| Query | Extracted Filters |
|-------|-------------------|
| "Best phone under 30000" | category: electronics, maxPrice: 30000 |
| "Affordable running shoes for beginners" | category: fashion, tags: [running, beginner, budget] |
| "Gaming laptop with high refresh rate" | category: electronics, tags: [gaming, high-refresh] |

**Extraction methods:**
- **Price**: Regex patterns for "under X", "above X", "between X and Y"
- **Category**: Keyword-to-category mapping (e.g., "phone" → electronics)
- **Tags**: Keyword-to-tag mapping (e.g., "noise cancel" → noise-canceling)
- **Sort**: Detects "cheapest", "best rated", "most popular"

### Ranking Algorithm

Products are scored using a weighted combination:

| Factor | Max Points | Logic |
|--------|-----------|-------|
| Price relevance | 30 | Closer to budget = higher score, over-budget penalized |
| Rating weight | 25 | Normalized rating out of 5 |
| Tag match | 25 | Proportion of requested tags found on product |
| Popularity | 20 | Based on review count (proxy for order volume) |
| Keyword match | 15 | Bonus for name/description keyword hits |
| Discount | 5 | Bonus for products currently on sale |

### Explainable Output

Every recommendation includes a human-readable explanation:
> "Recommended because: Fits your budget of ₹30,000. Highly rated at 4.8★. Matches 2 of your requested features."

Explanations are stored in the `AIInteraction` table for transparency and analytics.

---

## Database Modifications

### Updated Models
- **Order**: `razorpayOrderId` → `stripeSessionId`, `razorpayPaymentId` → `stripePaymentIntentId`
- **Product**: Added `tags String[]` for AI-powered filtering

### New Tables
- **SearchLog**: Records every AI copilot query with parsed filters (userId, query, parsedFilters, timestamp)
- **AIInteraction**: Records recommendation reasoning per result (userId, inputQuery, recommendationReason)

---

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables**:
   Open `.env` and configure your local Postgres connection, JWT secret, and Stripe test credentials.
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
   JWT_SECRET="your_secret"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```
3. **Initialize database schema and seed data**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## Future Scope (ML Upgrade Path)

The current AI Copilot uses deterministic NLP logic. It can be upgraded to use:

1. **LLM-powered parsing**: Replace `parseQuery()` with OpenAI/Gemini API call for better intent understanding
2. **Embedding-based search**: Store product embeddings in pgvector for semantic similarity search
3. **Collaborative filtering**: Use order history to build user-user similarity matrices
4. **A/B testing**: Compare AI recommendation click-through rates across algorithm versions
5. **Personalized re-ranking**: Weight results by individual purchase history and browsing patterns

---

## Architecture
This project follows a Serverless Monolith Architecture designed for scalable edge deployment on Vercel. Communication with the relational database operates through Prisma, serving as a strictly typed ORM ensuring 3NF Data Normalization over PostgreSQL.

## AI Recommendation Logic Detail

The robust SQL/Prisma implementation ensures dynamic content generation without heavy ML external dependencies:

1. **Customers Also Bought**: Employs an inner subquery on the `OrderItem` relational table bridging across all orders containing the active product, grouping by distinct products, and ordering by concurrent co-occurrence frequency to render high-confidence related items.
2. **Trending Products**: Aggregates the `quantity` sum over all `OrderItem` transactional records globally to extract top-selling lists.
3. **Personalized Recommendations**: Reads the specific user's historical order history, maps unique `categoryId` graphs, and retrieves high-rated proxy items localized within those category sectors, strictly excluding previously bought IDs.
