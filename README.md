<div align="center">
  <img src="public/logo.jpg" alt="TaskFlow Logo" width="120" height="120" />
  <h1>TaskFlow</h1>
</div>

> Async team coordination hub for tracking work handoffs across timezones

TaskFlow is an open source, self-hostable task management tool designed for distributed teams. Track tasks, get real-time notifications, and see who's working on what — all in one place.

## Features

- **Real-time Updates** — See task changes instantly across all users
- **Multi-user Presence** — Know who's viewing and editing tasks
- **Advanced Filtering** — Filter by status, priority, assignee, and date range
- **Bulk Operations** — Change status, priority, or reassign multiple tasks at once
- **Analytics Dashboard** — Visual insights into team workload and task distribution
- **Self-Hostable** — Deploy on your own infrastructure with Docker

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Deployment:** Vercel (recommended) or self-hosted with Docker

## Quick Start

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/krockxz/TaskFlow)

1. Click the button above
2. Connect your GitHub account
3. Configure environment variables (see [Environment Variables](#environment-variables))
4. Deploy!

### Option 2: Self-Host with Docker

```bash
git clone https://github.com/krockxz/TaskFlow.git
cd taskflow
docker build -t taskflow .
docker run -p 3000:3000 --env-file .env.local taskflow
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database (Required)
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://...supabase.co:5432/postgres

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For a complete list, see [`.env.example`](.env.example).

## Development

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Push database schema
bunx prisma db push
bunx prisma generate

# Run development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Documentation

- [Architecture Overview](docs/architecture/overview.md) — System architecture and design
- [API Specification](docs/api/specification.md) — API endpoints and usage
- [Deployment Guide](DEPLOYMENT.md) — Vercel and Docker deployment
- [Changelog](docs/changelog.md) — Version history

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
