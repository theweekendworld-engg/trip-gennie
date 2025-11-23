# 🧞 TripGenie

> Discover amazing weekend getaways from your city. Filter by budget, time, and interests.

A modern, SEO-optimized platform for discovering 1-day and 2-day trips from major Indian cities. Built with Next.js 14, TypeScript, PostgreSQL, and Google Maps API.

## ✨ Features

- **🎯 Smart Filters**: Budget, travel time, category, and transport mode
- **💰 Budget Friendly**: Find trips from ₹1,000 to ₹5,000
- **⚡ Quick Getaways**: Destinations within 2-6 hours
- **🗺️ 6 Major Cities**: Bengaluru, Mumbai, Pune, Delhi, Chennai, Hyderabad
- **🏞️ 8 Categories**: Hills, Lakes, Waterfalls, Forts, Temples, Adventure, Beaches, Wildlife
- **📱 Mobile Responsive**: Beautiful UI on all devices
- **🚀 SEO Optimized**: Static generation for fast loading and great SEO

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Vercel Postgres)
- **APIs**: Google Maps Distance Matrix, Places API
- **Deployment**: Vercel
- **Styling**: Custom design system with glassmorphism & gradients

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd tripgenie
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create `.env.local` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/tripgenie"
   
   # Google Maps API Keys
   # Frontend key (with HTTP referrer restrictions) - exposed to browser
   NEXT_PUBLIC_GOOGLE_MAP_KEY="your_frontend_key_here"
   # Backend key (without HTTP referrer restrictions) - server-side only
   GOOGLE_MAPS_API_KEY="your_backend_key_here"
   ```
   
   **Important**: 
   - Frontend key (`NEXT_PUBLIC_GOOGLE_MAP_KEY`) should have HTTP referrer restrictions in Google Cloud Console
   - Backend key (`GOOGLE_MAPS_API_KEY`) should have no HTTP referrer restrictions (or IP restrictions if available)

4. **Set up the database**
   ```bash
   # Generate Prisma client
   bun run db:generate
   
   # Run migrations
   bun run db:migrate
   
   # Seed initial data
   bun run db:seed
   ```

5. **Start development server**
   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses 12 PostgreSQL tables:

- **cities**: Origin cities (6 major cities)
- **destinations**: Trip locations (~150 destinations)
- **city_destinations**: Pre-calculated distances, times, costs
- **nearby_attractions**: Related places for detail pages
- **user_sessions**: Privacy-preserving anonymous tracking
- **search_logs**: Analytics without PII
- **seo_pages**: Pre-generated static content
- **rate_limits**: API protection
- **api_cache**: Generic API response caching
- **destination_photos**: Google Places photos
- **distance_matrix_cache**: Google Maps distance data
- **places_cache**: Google Places details

## 🔑 API Caching Strategy

**Problem**: External APIs are expensive (~₹48,000/year without caching)

**Solution**: Cache-first architecture
- ✅ Fetch from Google Maps API ONCE during setup
- ✅ Store all responses in PostgreSQL
- ✅ Serve all user requests from database (0 API calls)
- ✅ Background refresh via Vercel Cron (weekly)

**Cost Savings**: 99% reduction (~₹510/year)

## 📝 Scripts

```bash
# Development
bun run dev          # Start dev server
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:studio    # Open Prisma Studio
bun run db:migrate   # Run migrations
bun run db:seed      # Seed database
bun run db:generate  # Generate Prisma client

# Type checking
bun run type-check   # Check TypeScript types
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `GOOGLE_MAPS_API_KEY`
   - Deploy!

3. **Set up database**
   ```bash
   # Run migrations on production
   npx prisma migrate deploy
   
   # Seed production database
   npx prisma db seed
   ```

## 🗺️ Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable APIs:
   - Distance Matrix API
   - Places API
   - Geocoding API
4. Create API credentials
5. Add to `.env.local`

**Important**: Restrict API key to your domain in production!

## 📊 Project Structure

```
tripgenie/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── src/
│   ├── app/
│   │   ├── [city]/        # City search pages
│   │   ├── api/           # API routes
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Homepage
│   │   └── globals.css    # Design system
│   ├── components/
│   │   └── ui/            # UI components
│   ├── lib/
│   │   ├── api/           # API services
│   │   ├── db.ts          # Prisma client
│   │   ├── utils.ts       # Utilities
│   │   └── constants.ts   # Constants
│   └── types/
│       └── index.ts       # TypeScript types
├── public/
│   └── images/            # Static images
└── package.json
```

## 🎨 Design System

The app uses a custom design system with:

- **Modern Fonts**: Inter (sans), Outfit (display)
- **Color Palette**: HSL-based with primary/accent gradients
- **Glassmorphism**: Backdrop blur effects
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design

## 🔒 Privacy & Security

- **No user authentication** required
- **Anonymous tracking** using hashed fingerprints
- **No PII storage** (no IP addresses, emails, etc.)
- **Rate limiting** to prevent abuse
- **GDPR compliant** analytics

## 📈 SEO Optimization

- **Static generation** for city/filter pages
- **Dynamic metadata** for all pages
- **JSON-LD** structured data
- **Sitemap** generation
- **Fast loading** with image optimization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Google Maps API for location data
- Vercel for hosting
- Prisma for database ORM
- Next.js team for the amazing framework

---

Made with ❤️ by TheWeekendWorld
