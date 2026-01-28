# Deployment Guide

This guide covers deploying TaskFlow to Vercel (recommended) and self-hosting with Docker.

## Prerequisites

Before deploying, you'll need:

- A Supabase project ([sign up free](https://supabase.com))
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 20+ (for local development)

## Supabase Setup

1. **Create a project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Settings → API:
   - Project URL
   - anon/public key
3. **Get database connection strings** from Database → Connection String:
   - Transaction mode (port 6543) — for `DATABASE_URL`
   - Session mode (port 5432) — for `DIRECT_URL`

## Option 1: Vercel (Recommended)

Vercel provides zero-config deployment for Next.js with automatic HTTPS and global CDN.

### Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your TaskFlow repository
3. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Add environment variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `DATABASE_URL` | Transaction mode connection string |
| `DIRECT_URL` | Session mode connection string |

5. Click **Deploy**

### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production

# Deploy to production
vercel --prod
```

### Database Migration

Before first deployment, push the database schema:

```bash
cd frontend
npx prisma db push
```

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS according to Vercel instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Option 2: Docker (Self-Hosted)

Deploy TaskFlow on any VPS or cloud provider with Docker support.

### Build the Image

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow/frontend
docker build -t taskflow .
```

### Run the Container

```bash
docker run -d \
  --name taskflow \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres" \
  -e DIRECT_URL="postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres" \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  -e NEXT_PUBLIC_APP_URL="http://your-domain.com" \
  --restart unless-stopped \
  taskflow
```

### Using Docker Compose

Create `docker-compose.yml` in the project root:

```yaml
services:
  taskflow:
    build: ./frontend
    container_name: taskflow
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

### Reverse Proxy (Optional)

For production use with a custom domain, use a reverse proxy:

**Nginx example:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `DATABASE_URL` | Yes | Database pooler connection (port 6543) |
| `DIRECT_URL` | Yes | Direct database connection (port 5432) |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: http://localhost:3000) |
| `NODE_ENV` | No | Environment (default: production) |

See [`frontend/.env.example`](frontend/.env.example) for details.

## Troubleshooting

### Connection Refused Errors

If you see "connection refused" or "too many connections" errors:

- Verify `DATABASE_URL` uses port **6543** (pooler)
- Verify `DIRECT_URL` uses port **5432** (direct)
- Don't use the same URL for both variables

### Build Failures

- Ensure Node.js version is 20 or higher
- Run `npm ci` to clean install dependencies
- Clear Next.js cache: `rm -rf .next`

### Realtime Not Working

- Verify Realtime is enabled in Supabase Dashboard
- Check that your tables have Realtime enabled
- Ensure RLS policies don't block realtime access

## Security Checklist

Before going to production:

- [ ] Supabase RLS policies enabled on all tables
- [ ] Strong password requirements configured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Custom domain configured (no *.vercel.app in production)
- [ ] Environment variables not committed to git
- [ ] OAuth providers configured (if using Google/GitHub login)

## Support

- [GitHub Issues](https://github.com/your-username/taskflow/issues) — Bug reports and feature requests
- [Supabase Docs](https://supabase.com/docs) — Database and authentication help
