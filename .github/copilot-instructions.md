# PrimeLux Events - AI Coding Agent Instructions

## Project Overview
PrimeLux Events is a luxury event rental platform built with **Next.js 15+**, **TypeScript**, **Supabase**, **Stripe**, and **Tailwind CSS**. The codebase features both customer-facing UI (marketing site, catalog, checkout) and an admin dashboard for inventory, orders, consultations, and event management.

## Architecture

### Core Tech Stack
- **Framework**: Next.js (App Router) with SSR/SSG
- **Database**: Supabase (PostgreSQL) with server/client SDKs in `lib/supabase/`
- **Auth**: Supabase Auth with role-based access control (RBAC) 
- **Payments**: Stripe integration for checkout
- **UI**: Radix UI components + Tailwind CSS (see `components/ui/`)
- **Animations**: Framer Motion for premium motion
- **CMS**: Content system using `lib/content-client.ts` and `lib/content.ts`

### Key Directories
- `app/` - Next.js App Router with routes, server actions, API endpoints
- `components/` - Reusable React components (UI, admin, pages)
- `lib/` - Utility functions, auth, Supabase clients, data formatting
- `supabase/` - Database schema and seed data

## Data Access Patterns

### Supabase Client Instantiation
Always use one of these factory functions:
- **Server Components/Actions**: `createClient()` from `lib/supabase/server.ts` (must be awaited)
- **Client Components**: `createClient()` from `lib/supabase/client.ts` (synchronous)
- **Middleware**: Use `updateSession()` from `lib/supabase/middleware.ts`

```tsx
// Server-side (page.tsx, actions.ts)
const supabase = await createClient()

// Client-side (use client)
const supabase = createClient()
```

### Query Patterns
- Use `.select()` with specific columns and relations (e.g., `categories(name)` for joins)
- For pagination: combine `.range(start, end)` with `.select('*', { count: 'exact' })` 
- Filter with `.eq()`, `.ilike()` (case-insensitive), `.or()` (multiple conditions)
- Always include `.order()` for consistency and UX
- Handle errors explicitly with `if (error) { ... }`

```tsx
// Example: Paginated search with filters
const { data, count, error } = await supabase
  .from('products')
  .select('*, categories(name)', { count: 'exact' })
  .ilike('name', `%${search}%`)
  .eq('category_id', categoryId)
  .order('created_at', { ascending: false })
  .range(start, end)
```

### Server Actions
Place async operations in `**/actions.ts` files with `'use server'` directive. Always:
- Import `revalidatePath` from `next/cache` to invalidate caches after mutations
- Use `requirePermission()` from `lib/auth/authorization.ts` for RBAC checks
- Return `{ success: boolean; data?: T; error?: string }` objects for predictable error handling

```tsx
export async function updateProduct(id: string, updates: Partial<Product>) {
  'use server'
  await requirePermission('products.update')
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/products')
  return { success: true, data }
}
```

## UI & Design Patterns

### Admin Dashboard Structure
All admin pages follow this standard layout (`ADMIN_DESIGN_GUIDE.md`):
```tsx
export default async function AdminPage() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header: title + description + action button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Title</h1>
      </div>
      {/* Tabs for complex pages */}
      <Tabs defaultValue="tab1">
        <TabsList className="grid w-full grid-cols-2" />
      </Tabs>
    </div>
  )
}
```

### Component Hierarchy
- Import UI components from `components/ui/` (Radix-based primitives)
- Use Tailwind classes for styling (no inline styles)
- Admin components in `components/admin/` follow consistent naming and patterns
- Use `<Card>`, `<Table>`, `<Tabs>`, `<Dialog>` from the UI library

### Luxury Aesthetic
- Serif fonts (`--font-serif` via Playfair Display) for headings
- Gold accents (`gold` color tokens) with transparency classes (`gold/10`, `gold/20`)
- Framer Motion for entrance animations and scroll effects
- Generous whitespace and smooth transitions
- See `AESTHETIC_GUIDE.md` for detailed patterns

## Critical Developer Workflows

### Build & Development
```bash
pnpm dev      # Start Next.js dev server (localhost:3000)
pnpm build    # Build for production (fails on TS errors due to strict mode)
pnpm lint     # Run ESLint
pnpm start    # Run production build
```

### Database & Migrations
- Schema defined in `supabase/schema.sql`
- Seed data in `supabase/*_seed.sql` files
- Use Supabase CLI: `supabase db reset` to apply all migrations
- New migrations: create files in `supabase/migrations/` with timestamp prefix

### Search & Filtering
- Products searchable by name/description via `ilike` (case-insensitive)
- Categories searchable by name/slug
- Use combined queries for multi-table search (see `app/actions/search-actions.ts`)

## Project-Specific Conventions

### Naming Conventions
- Files: kebab-case (`product-card.tsx`, `admin-sidebar.tsx`)
- Functions/interfaces: PascalCase for types, camelCase for functions
- Database columns: snake_case (Supabase standard)
- Routes: lowercase with hyphens (`/admin/pack-slip`, `/order-confirmation`)

### Type Safety
- `tsconfig.json` has `"strict": true` - always type all functions and variables
- Database types auto-generated from Supabase schema (when available)
- Use interfaces in `pages/` and `actions.ts` files for request/response data

### Error Handling
- Always check Supabase error responses: `if (error) { ... }`
- Use `try/catch` for async operations in server actions
- Return structured error objects: `{ success: false, error: 'Message' }`
- Client components: use `toast` from `sonner` for user-facing errors

```tsx
import { toast } from 'sonner'
// In client component
toast.error('Failed to update')
```

### Cache Invalidation
After mutations via server actions, call `revalidatePath()` to refresh UI:
```tsx
import { revalidatePath } from 'next/cache'
revalidatePath('/admin/products')
revalidatePath('/admin/products/[id]') // For dynamic routes
```

## Integration Points & Dependencies

### Supabase Schema
Key tables (run `SELECT * FROM information_schema.tables WHERE table_schema='public'`):
- `products` - Catalog items with pricing, images, categories
- `categories` - Product categories with descriptions
- `packages` - Bundled product selections with groups
- `orders` - Customer orders with delivery/rental details
- `customers` - Customer profiles aggregated from orders/consultations
- `appointments` - Scheduled consultations
- `tasks` - Team task management
- `events` - Event records for delivery/planning
- `user_profiles`, `user_roles`, `permissions` - RBAC system

### External Services
- **Stripe**: `lib/stripe.ts` contains payment intent creation
- **Vercel Analytics**: Auto-included in `app/layout.tsx`
- **Sonner Toast**: Used for notifications across admin/client pages

## Common Tasks & Examples

### Adding a New Admin Page
1. Create `app/admin/[section]/page.tsx` with async server component
2. Fetch data using `createClient()` from `lib/supabase/server.ts`
3. Wrap content in standard layout container
4. Use `Tabs` for multiple sections if needed
5. Place mutations in adjacent `actions.ts` with `revalidatePath()`

### Creating a Data Table
1. Use `Table` component from `components/ui/table.tsx`
2. Map over data array inside `<TableBody>`
3. Add action dropdowns with `<DropdownMenu>`
4. Include pagination with `<PaginationControls>`
5. Implement search/filter inputs above table

### Handling Relational Data
Supabase automatically joins data with parentheses syntax:
```tsx
// Include nested relations
.select(`
  id, name,
  categories (id, name),
  package_item_groups (
    id, name,
    package_item_options (id, quantity, products (name, price))
  )
`)
```

## Notes for AI Agents

- **TypeScript Strictness**: Always satisfy `strict: true` compiler - no implicit `any`
- **Async/Await**: Server actions must be async; use `await createClient()`
- **Component Classification**: Check for `'use client'` directive to determine Server vs Client component rules
- **Auth Checks**: Use `requirePermission()` before sensitive operations in server actions
- **Performance**: Leverage Next.js caching with `revalidatePath` rather than client-side polling
- **No `node_modules` edits**: All customizations in application code, not dependencies
