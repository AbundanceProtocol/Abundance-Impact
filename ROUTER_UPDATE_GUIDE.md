# Router Import Update Guide

## Overview
This guide helps you manually update all components that use `useRouter` from `next/router` to use our new `useAppRouter` hook for App Router compatibility.

## What We've Fixed
- ✅ `context.js` - Updated to use `useAppRouter`
- ✅ `components/Layout/index.js` - Updated to use `useAppRouter`
- ✅ `components/Layout/EcosystemNav/index.js` - Updated to use `useAppRouter`
- ✅ `components/Layout/EcosystemNav/EcosystemMenu/index.js` - Updated to use `useAppRouter`
- ✅ `components/Layout/BottomBar/index.js` - Updated to use `useAppRouter`
- ✅ `components/Layout/Modals/LogoutModal/index.js` - Updated to use `useAppRouter`
- ✅ **BULK FIXED: 17 additional components** - All major Layout, Page, and Cast components updated

## Components Status - ✅ **ALL MAJOR COMPONENTS FIXED!**

### Layout Components (High Priority) - ✅ **ALL FIXED**
- ✅ `components/Layout/UserMenu/index.js` - **FIXED**
- ✅ `components/Layout/CastActionNav/index.js` - **FIXED**
- ✅ `components/Layout/RightMenu/Leaderboard/index.js` - **FIXED**
- ✅ `components/Layout/CastActionNav/CuratorNav/index.js` - **FIXED**
- ✅ `components/Layout/CastActionNav/CreatorNav/index.js` - **FIXED**
- ✅ `components/Layout/RightMenu/index.js` - **FIXED**
- ✅ `components/Layout/BottomMenu/index.js` - **FIXED**
- ✅ `components/Layout/RightMenu/Ecoboard/index.js` - **FIXED**
- ✅ `components/Layout/BottomBar/index.js` - **FIXED**
- ✅ `components/Layout/LeftMenu/index.js` - **FIXED**
- ✅ `components/Layout/LeftMenu/LeftNav/index.js` - **FIXED**
- ✅ `components/Layout/BottomMenu/BottomNav/index.js` - **FIXED**
- ✅ `components/Layout/Mobile/index.js` - **FIXED**
- ✅ `components/Layout/Mobile/MobileMenu/NavItem/index.js` - **FIXED**

### Page Components (Medium Priority) - ✅ **ALL FIXED**
- ✅ `components/Page/CuratorData/index.js` - **FIXED**
- ✅ `components/Page/CuratorBlock/index.js` - **FIXED**

### Cast Components (Medium Priority) - ✅ **ALL FIXED**
- ✅ `components/Cast/Subcast/index.js` - **FIXED**
- ✅ `components/Cast/index.js` - **FIXED**

### Page Files (Lower Priority - these are Pages Router files)
- All files in `pages/` directory (these can keep using `next/router`)

## How to Update Each Component

### Step 1: Update Import
Replace:
```javascript
import { useRouter } from 'next/router';
```

With:
```javascript
import { useAppRouter } from '../../hooks/useAppRouter';
// Adjust the path based on component location
```

### Step 2: Update Hook Usage
Replace:
```javascript
const router = useAppRouter()
```

With:
```javascript
const router = useAppRouter()
```

## Quick Update Commands

You can use these search and replace commands in your editor:

### For components in `components/Layout/`:
**Search:** `import { useRouter } from 'next/router';`
**Replace:** `import { useAppRouter } from '../../hooks/useAppRouter';`

**Search:** `const router = useAppRouter()`
**Replace:** `const router = useAppRouter()`

### For components in `components/Page/`:
**Search:** `import { useRouter } from 'next/router';`
**Replace:** `import { useAppRouter } from '../../hooks/useAppRouter';`

### For components in `components/Cast/`:
**Search:** `import { useRouter } from 'next/router';`
**Replace:** `import { useAppRouter } from '../../hooks/useAppRouter';`

## Testing After Updates

1. **Start development server:** `npm run dev`
2. **Check for router errors** in the console
3. **Navigate between pages** to ensure routing works
4. **Test App Router pages** (like `/` - your home page)

## Why This Approach?

- **Incremental Migration**: Update components one by one
- **No Breaking Changes**: Components work in both routers
- **Easy Rollback**: Can revert individual components if needed
- **Immediate Testing**: Test each component after update

## Next Steps

1. **Update Layout Components First** (they're most likely to cause errors)
2. **Test after each major component update**
3. **Update Page Components** once Layout is stable
4. **Leave Pages Router files** as-is for now

## Troubleshooting

If you get import path errors:
- Check the relative path from your component to the `hooks/` directory
- Use `../` to go up one directory level
- Use `../../` to go up two directory levels

Example paths:
- `components/Layout/UserMenu/` → `../../hooks/useAppRouter`
- `components/Page/` → `../../hooks/useAppRouter`
- `components/Cast/` → `../../hooks/useAppRouter`
