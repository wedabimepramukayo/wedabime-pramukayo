# Wedabime Pramukayo — CMS & Public Website

Sri Lanka's trusted provider of premium i-Panel ceiling systems, wall cladding, and roofing solutions. This repository contains the full Content Management System (CMS) and public-facing website.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite dev / Neon PostgreSQL production)
- **Image Storage**: Cloudinary (only URLs stored in DB — lightweight database)
- **Authentication**: NextAuth.js v4 (Credentials provider)
- **State**: Zustand + TanStack Query

## Features

### Public Website
- Homepage with hero, product categories, featured services
- Service listing & detail pages with category filtering
- Blog with posts and dynamic content
- About & Advantages pages
- Contact form with WhatsApp integration
- Dynamic SEO metadata on every page
- Responsive design with mobile navigation
- Breadcrumb navigation & scroll-to-top

### Admin CMS (`/admin`)
- Dashboard with stats and quick actions
- Pages Manager — Full CRUD with hero & SEO sections
- Services Manager — Products with features, advantages, specifications, gallery
- Categories Manager — With service count and active/inactive toggle
- Blog Manager — Posts with tags, author, cover images
- **Media Manager** — Cloudinary-powered image gallery
  - Drag & drop upload to Cloudinary
  - Grid/list view with thumbnails
  - Search, copy URL, preview, delete
  - Only image URLs stored in database
- Messages — Contact form submissions with read/replied tracking
- Settings — Tabbed editor (General, SEO, Theme, Contact, Social)

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Cloudinary account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/wedabimepramukayo/wedabime-pramukayo.git
cd wedabime-pramukayo

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Set up database
bunx prisma db push

# Generate Prisma client
bunx prisma generate

# Run the development server
bun run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Database — SQLite for dev, Neon PostgreSQL for production
DATABASE_URL="file:./db/custom.db"

# Authentication
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary — Sign up at https://cloudinary.com
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_FOLDER="wedabime-pramukayo"
```

### Default Admin Login
- **Email**: admin@wedabimepramukayo.site
- **Password**: admin123

> ⚠️ Change the default password after first login!

## Database Setup

### Development (SQLite)
The project uses SQLite by default. Just run `bunx prisma db push` to create the database.

### Production (Neon PostgreSQL)
1. Create a free database at [neon.tech](https://neon.tech)
2. Update `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"`
3. Set `DATABASE_URL` to your Neon connection string
4. Run `bunx prisma db push`

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public website pages
│   │   ├── page.tsx       # Homepage
│   │   ├── about/         # About page
│   │   ├── services/      # Services listing & detail
│   │   ├── advantages/    # Advantages page
│   │   ├── blog/          # Blog listing & detail
│   │   └── contact/       # Contact page
│   ├── admin/             # Admin CMS
│   │   ├── dashboard/     # Dashboard
│   │   ├── pages/         # Page manager
│   │   ├── products/      # Service manager
│   │   ├── categories/    # Category manager
│   │   ├── blog/          # Blog manager
│   │   ├── media/         # Media manager (Cloudinary)
│   │   ├── messages/      # Contact submissions
│   │   └── settings/      # Site settings
│   └── api/               # API routes
│       ├── admin/         # Protected admin APIs
│       ├── auth/          # NextAuth
│       ├── contact/       # Public contact form
│       └── public/        # Public settings API
├── components/
│   ├── admin/             # Admin sidebar & header
│   ├── public/            # Header, footer, breadcrumbs, etc.
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── cloudinary.ts      # Cloudinary upload utility
│   ├── db.ts              # Prisma client
│   └── utils.ts           # Shared utilities
└── hooks/                 # Custom React hooks
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Self-Hosted
```bash
bun run build
bun run start
```

## License

Private — Wedabime Pramukayo
