# Deployment Guide

## Quick Deploy Options

### 1. **Vercel (Recommended)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy" - it's that simple!

**Why Vercel?**
- Built for Next.js
- Automatic deployments
- Free tier available
- Global CDN

### 2. **Netlify**
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Choose your repository
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Click "Deploy site"

### 3. **GitHub Pages**
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Source: Deploy from a branch
4. Branch: main, folder: / (root)
5. Build command: `npm run build`

## Manual Deployment Steps

### Prerequisites
- Node.js 18+ installed
- Git repository set up

### Build Commands
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test locally (optional)
npm run start
```

### What Gets Generated
- `.next/` folder contains your built app
- Static HTML, CSS, and JavaScript files
- Optimized for production

## Environment Variables

No environment variables are required for basic functionality. The app works entirely client-side for file conversion.

## Custom Domain

After deployment:
1. Go to your hosting platform's domain settings
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for propagation (can take 24-48 hours)

## Performance Tips

- The app is already optimized with Next.js
- Images are automatically optimized
- CSS is automatically minified
- JavaScript is automatically bundled and minified

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version (needs 18+)
2. **Dependencies missing**: Run `npm install` first
3. **Port conflicts**: Change port in package.json scripts

### Support:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review the [README.md](./README.md) file
- Check deployment platform documentation

## Post-Deployment

1. **Test all features**:
   - File upload
   - Format conversion
   - Download functionality
   
2. **Monitor performance**:
   - Page load times
   - File conversion speed
   - User experience

3. **SEO optimization**:
   - Meta tags are already included
   - Sitemap generation (optional)
   - Google Analytics (optional)

Your Vector Converter is now ready for the web! 🚀
