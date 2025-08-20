# Netlify Setup for Next.js 14 App Router

## Overview
This guide covers the necessary changes to make your Netlify deployment work with Next.js 14 App Router.

## ✅ What's Already Configured

1. **Netlify Next.js Plugin**: `@netlify/plugin-nextjs@^5.12.0` ✅
2. **Build Command**: `next build` ✅
3. **Publish Directory**: `.next` ✅
4. **Functions Directory**: `netlify/functions` ✅

## 🔧 Required Netlify Configuration Updates

### 1. Updated netlify.toml

Your `netlify.toml` has been updated with:

```toml
[build]
  command = "next build"
  publish = ".next"
  environment = { NODE_VERSION = "20.18.0" }

[build.environment]
  NEXT_USE_NETLIFY_EDGE = "true"
  NODE_VERSION = "20.18.0"

# App Router specific redirects for dynamic routes
[[redirects]]
  from = "/:username"
  to = "/:username"
  status = 200

[[redirects]]
  from = "/~/ecosystems/:ecosystem"
  to = "/~/ecosystems/:ecosystem"
  status = 200

[[redirects]]
  from = "/~/tip/:id"
  to = "/~/tip/:id"
  status = 200
```

### 2. Key Changes Explained

- **`NODE_VERSION = "20.18.0"`**: Ensures compatibility with Next.js 14
- **`NEXT_USE_NETLIFY_EDGE = "true"`**: Enables Netlify Edge Functions for better performance
- **Dynamic Route Redirects**: Ensures App Router dynamic routes work properly

## 🚀 Deployment Steps

### Step 1: Commit and Push Changes

```bash
git add .
git commit -m "Update Netlify config for Next.js 14 App Router"
git push
```

### Step 2: Netlify Dashboard Settings

In your Netlify dashboard, ensure these settings:

1. **Build Settings**:
   - Build command: `next build`
   - Publish directory: `.next`
   - Node version: `20.18.0`

2. **Environment Variables**:
   - `NODE_VERSION`: `20.18.0`
   - `NEXT_USE_NETLIFY_EDGE`: `true`

### Step 3: Trigger a New Deployment

Netlify should automatically detect the changes and redeploy, or you can manually trigger a new deployment.

## 🔍 Troubleshooting Common Issues

### Issue 1: Build Failures

**Symptoms**: Build fails with App Router errors

**Solutions**:
- Ensure Node.js version is 20.18.0 or higher
- Check that `@netlify/plugin-nextjs` is up to date
- Verify all App Router files are properly formatted

### Issue 2: Dynamic Routes Not Working

**Symptoms**: 404 errors on dynamic routes like `/~/ecosystems/[ecosystem]`

**Solutions**:
- Ensure redirects are properly configured in `netlify.toml`
- Check that App Router pages are in the correct directory structure
- Verify the Netlify plugin is handling App Router correctly

### Issue 3: API Routes Not Working

**Symptoms**: API calls return 404 or errors

**Solutions**:
- Keep API routes in `pages/api/` during migration (they don't conflict)
- Ensure functions are properly configured in `netlify.toml`
- Check that serverless functions are working

## 📋 Pre-Deployment Checklist

Before deploying to Netlify:

- [ ] `netlify.toml` updated with App Router configurations
- [ ] Node.js version set to 20.18.0
- [ ] `@netlify/plugin-nextjs` is latest version
- [ ] App Router pages are properly structured
- [ ] No conflicting routes between `pages/` and `app/`
- [ ] All imports and dependencies are correct
- [ ] Local development server works without errors

## 🔄 Migration Strategy for Netlify

### Phase 1: Deploy Basic App Router (Current)
- ✅ Basic App Router structure
- ✅ Netlify configuration updated
- ✅ Home page migrated

### Phase 2: Gradual Route Migration
- Migrate one route at a time
- Test each route locally before deploying
- Keep Pages Router for unmigrated routes

### Phase 3: Full App Router
- Migrate all remaining routes
- Remove Pages Router files
- Optimize for Netlify Edge Functions

## 🎯 Netlify-Specific Benefits

With App Router on Netlify, you get:

1. **Edge Functions**: Better performance with `NEXT_USE_NETLIFY_EDGE`
2. **Improved Caching**: Better static generation and caching
3. **Streaming**: Support for React 18 streaming features
4. **Partial Prerendering**: Hybrid static/dynamic rendering
5. **Better SEO**: Improved metadata handling

## 📞 Support

If you encounter issues:

1. **Check Netlify Build Logs**: Look for specific error messages
2. **Verify Local Build**: Ensure `npm run build` works locally
3. **Check Node Version**: Ensure Netlify is using Node.js 20.18.0
4. **Review Plugin Version**: Ensure `@netlify/plugin-nextjs` is latest

## 🔗 Resources

- [Netlify Next.js Plugin Documentation](https://github.com/netlify/netlify-plugin-nextjs)
- [Next.js 14 App Router Documentation](https://nextjs.org/docs/app)
- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
