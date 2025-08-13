# Netlify Deployment Troubleshooting

## Common Netlify Build Failures

### 1. **Build Command Issues**
**Problem**: `npm run build` fails
**Solution**: 
```bash
# In Netlify build settings:
Build command: npm run build
Publish directory: .next
```

### 2. **Node Version Issues**
**Problem**: Build fails due to Node version
**Solution**: Set environment variable in Netlify:
- Go to Site settings > Build & deploy > Environment
- Add: `NODE_VERSION` = `18`

### 3. **Dependency Issues**
**Problem**: PDF.js or other dependencies fail to install
**Solution**: Add to Netlify environment:
- `NPM_FLAGS` = `--legacy-peer-deps`

### 4. **Build Timeout**
**Problem**: Build takes too long (>15 minutes)
**Solution**: 
- Check for large dependencies
- Optimize build process
- Consider using Vercel (better Next.js support)

## Netlify Build Settings

### **Build Command:**
```bash
npm run build
```

### **Publish Directory:**
```
.next
```

### **Environment Variables:**
```
NODE_VERSION=18
NPM_FLAGS=--legacy-peer-deps
```

## Alternative: Use Vercel Instead

If Netlify continues to fail, Vercel is highly recommended for Next.js:

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Automatic deployment** - no configuration needed
4. **Better Next.js support** out of the box

## Manual Build Test

Test locally before deploying:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Check if .next folder is created
ls -la .next
```

## Common Error Messages

### **"Module not found"**
- Check if all dependencies are in package.json
- Run `npm install` locally first

### **"Build timeout"**
- Reduce dependencies
- Use Vercel instead

### **"PDF.js error"**
- The app will fallback to CDN version
- Should still work for basic functionality

## Quick Fix Steps

1. **Clear Netlify cache** (Site settings > Build & deploy > Clear cache)
2. **Redeploy** with updated settings
3. **Check build logs** for specific errors
4. **Consider Vercel** for better Next.js support

## Support

- **Netlify Support**: [help.netlify.com](https://help.netlify.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Alternative**: [vercel.com](https://vercel.com)
