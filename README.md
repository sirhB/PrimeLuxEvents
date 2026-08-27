# PrimeLux Events

A premium event rental platform built with Next.js and Supabase.

## Documentation
- **[Features Guide](FEATURES.md)** - Overview of core platform functionality.
- **[Admin Guide](ADMIN.md)** - Detailed look at administrative tools and management.
- **[Production Launch Plan](PRODUCTION_LAUNCH_PLAN.md)** - Go-live checklist: database security, Stripe, Vercel, and ops.
- **[Future Roadmap](FUTURE_ROADMAPPING.md)** - Suggestions for expansion and future features.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PrimeLuxEvents
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file based on `.env.local.example` and fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Database Setup:**
   Apply the migrations found in `supabase/migrations` to your Supabase instance.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**
   Visit `http://localhost:3000` to see the site.

## Deployment

This project is optimized for deployment on Vercel. Connect your repository to Vercel and ensure environment variables are configured.

For a full production go-live (secure Supabase RLS, secret rotation, Stripe live mode, CI, and cutover), follow **[PRODUCTION_LAUNCH_PLAN.md](PRODUCTION_LAUNCH_PLAN.md)**.