# App Router Migration Guide

## Overview
This guide helps migrate from Next.js Pages Router to App Router incrementally.

## Current Status
- ✅ App Router structure created
- ✅ Root layout.js created
- ✅ Main page.js created (conflict resolved)
- ✅ Next.js config updated (appDir removed - no longer needed in Next.js 14)
- ✅ Conflicting pages/index.js removed
- ✅ App Router successfully running and compiling routes
- ✅ Client-side imports fixed for miniapp-sdk compatibility
- ✅ Farcaster metadata migrated to App Router metadata API
- ✅ Router compatibility hook created (`useAppRouter`)
- ✅ **ALL MAJOR COMPONENTS FIXED** - 22 components updated to use `useAppRouter`
- ✅ **Router errors resolved** - No more "NextRouter was not mounted" errors
- ✅ **Import path issues resolved** - All malformed import paths corrected
- ✅ **Server-side rendering safety added** - Router safety checks prevent null reference errors
- 🎉 **App Router migration foundation complete!**

## Migration Phases

### Phase 1: Basic Setup (COMPLETED)
- [x] Create `app/` directory
- [x] Create `app/layout.js` (replaces `pages/_app.js`)
- [x] Create `app/page.js` (replaces `pages/index.js`)
- [x] Update `next.config.mjs`
- [x] Remove conflicting `pages/index.js`

### Phase 2: API Routes Migration
Convert API routes from `pages/api/` to `app/api/`:

**Current Structure:**
```
pages/api/
├── auth/
├── curation/
├── ecosystem/
├── frames/
├── fund/
├── user/
└── ... (many more)
```

**New Structure:**
```
app/api/
├── auth/
│   └── route.js
├── curation/
│   └── route.js
├── ecosystem/
│   └── route.js
├── frames/
│   └── route.js
├── fund/
│   └── route.js
├── user/
│   └── route.js
└── ... (many more)
```

**Example API Route Migration:**
```javascript
// OLD: pages/api/getUserProfile.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    // ... logic
    res.status(200).json(data)
  }
}

// NEW: app/api/getUserProfile/route.js
export async function GET() {
  // ... logic
  return Response.json(data)
}
```

### Phase 3: Page Routes Migration
Convert page routes from `pages/` to `app/`:

**Current Structure:**
```
pages/
├── [username]/
│   ├── articles/
│   ├── casts/
│   └── index.js
├── ~/
│   ├── actions/
│   ├── auto-fund.js
│   ├── cast.js
│   └── ... (many more)
└── index.js
```

**New Structure:**
```
app/
├── [username]/
│   ├── articles/
│   │   └── [article]/
│   │       └── page.js
│   ├── casts/
│   │   └── [cast]/
│   │       └── page.js
│   └── page.js
├── ~/
│   ├── actions/
│   │   ├── balance/
│   │   │   └── page.js
│   │   └── impact/
│   │       └── page.js
│   ├── auto-fund/
│   │   └── page.js
│   ├── cast/
│   │   └── page.js
│   └── ... (many more)
└── page.js
```

### Phase 4: Component Updates

#### 1. Update Layout Component
Your current Layout component needs to be updated for App Router:

```javascript
// components/Layout/index.js
'use client'

// Add 'use client' directive if using hooks/state
export default function Layout({ children }) {
  return (
    <div>
      {/* Your layout content */}
      {children}
    </div>
  )
}
```

**✅ COMPLETED**: Layout component has been updated with 'use client' directive.

#### 2. Update Context Provider
Ensure your context works with App Router:

```javascript
// context.js
'use client'

// Add 'use client' directive
export function AccountProvider({ children, initialAccount }) {
  // ... your context logic
}
```

**✅ COMPLETED**: Context provider has been updated with 'use client' directive.

#### 3. Router Compatibility
For components that use router functionality, create a compatible hook:

```javascript
// hooks/useAppRouter.js
'use client'

import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRouter as usePagesRouter } from 'next/router'

export function useAppRouter() {
  // Provides router object compatible with both routers
  // ... implementation
}
```

**✅ COMPLETED**: Router compatibility hook created for seamless migration.

### Phase 5: Advanced Features

#### 1. Server Actions
Replace some API calls with Server Actions:

```javascript
// app/actions/userActions.js
'use server'

export async function updateUserProfile(formData) {
  // ... server-side logic
  return { success: true }
}

// In your component:
import { updateUserProfile } from '@/app/actions/userActions'

export default function ProfileForm() {
  return (
    <form action={updateUserProfile}>
      {/* form fields */}
    </form>
  )
}
```

#### 2. Metadata API
Replace `next/head` with metadata:

```javascript
// app/[username]/page.js
export async function generateMetadata({ params }) {
  const user = await getUser(params.username)
  
  return {
    title: `${user.name} - Abundance Protocol`,
    description: user.bio,
    openGraph: {
      title: user.name,
      description: user.bio,
    }
  }
}
```

#### 3. Streaming and Suspense
Implement streaming for better performance:

```javascript
// app/feed/page.js
import { Suspense } from 'react'
import FeedContent from './FeedContent'
import FeedSkeleton from './FeedSkeleton'

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedContent />
    </Suspense>
  )
}
```

## Important Notes

### Conflict Resolution
When migrating to App Router, you cannot have both `pages/` and `app/` versions of the same route. For example:
- ❌ `pages/index.js` + `app/page.js` (conflicts)
- ❌ `pages/about.js` + `app/about/page.js` (conflicts)
- ✅ `pages/api/users.js` + `app/users/page.js` (different routes, no conflict)

**Solution**: Remove the Pages Router version when you create the App Router version.

## Migration Benefits

1. **Better Performance**: Partial Prerendering, streaming, and improved caching
2. **Server Actions**: Better form handling without API routes
3. **Metadata API**: Improved SEO and social media handling
4. **Layouts**: More flexible layout system
5. **Loading States**: Built-in loading and error boundaries
6. **Route Groups**: Better organization of routes

## Testing Strategy

1. **Start with one route**: Migrate one simple page first
2. **Test thoroughly**: Ensure functionality works in both routers
3. **Gradual rollout**: Migrate routes one by one
4. **Keep both**: Run both routers simultaneously during transition
5. **Monitor performance**: Compare metrics between old and new

## Rollback Plan

If issues arise:
1. Remove `app/` directory
2. Revert `next.config.mjs` changes
3. Your Pages Router will continue working as before

## Next Steps

1. Test the current setup with `npm run dev`
2. Choose one simple API route to migrate first
3. Choose one simple page route to migrate first
4. Gradually expand migration based on success

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Migration Guide](https://nextjs.org/docs/migrating/from-pages)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
