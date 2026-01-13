# expira - SaaS Verification Platform

A modern, full-stack SaaS application for monitoring website expiration, SSL certificates, domains, and APIs with automated notifications.

## Features

- 🎨 **Modern Landing Page** - Beautiful, responsive design with best UX/UI practices
- 🔐 **Authentication System** - Secure login and registration
- 📦 **Product Management** - Add and monitor multiple products (websites, domains, SSL, APIs)
- 💳 **Subscription & Payments** - Stripe integration with multiple pricing tiers
- 🔔 **Notification System** - Email, in-app, and push notifications
- 📊 **Analytics Dashboard** - Real-time monitoring and status tracking
- 🚀 **Performance Optimized** - Fast loading times and SEO-friendly
- 📱 **Responsive Design** - Works perfectly on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth
- **Payments**: Stripe
- **Notifications**: Nodemailer for emails
- **UI Components**: Lucide React icons, Framer Motion animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)
- SMTP credentials (for email notifications)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sass
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for JWT
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `SMTP_*` - Email configuration

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sass/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/           # Authentication pages
│   ├── register/
│   ├── pricing/         # Pricing page
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── lib/                 # Utility functions
├── prisma/              # Database schema
└── public/              # Static assets
```

## Pricing Plans

- **Starter**: $9/month - Up to 10 products, daily checks
- **Professional**: $29/month - Up to 100 products, hourly checks
- **Enterprise**: $99/month - Unlimited products, real-time monitoring

## Features in Detail

### Product Monitoring
- Automatic expiration date tracking
- Status monitoring (active, warning, expired)
- Multiple product types (website, domain, SSL, API)

### Notifications
- Email notifications for expiring products
- In-app notification center
- Configurable notification preferences

### Subscription Management
- Stripe integration for payments
- Automatic subscription management
- Plan upgrades/downgrades

## SEO Optimization

- Semantic HTML structure
- Meta tags and Open Graph
- Sitemap generation
- Robots.txt configuration
- Performance optimizations

## Automated Checks

The application includes automated expiration checks that run periodically:

1. **Cron Job**: Set up a cron job to call `/api/cron/check-expirations` every 6 hours (or as needed)
2. **Manual Script**: Run `npm run check-expirations` to manually check all products
3. **Individual Check**: Use the API endpoint `/api/products/[id]/check` to check a specific product

### Setting up Cron Jobs

For Vercel deployment, the `vercel.json` file is already configured. For other platforms:

- **GitHub Actions**: Create a workflow that calls the API endpoint
- **Cron-job.org**: Set up a free cron job to ping your endpoint
- **Server Cron**: Add to your server's crontab:
  ```
  0 */6 * * * curl https://expira.io/api/cron/check-expirations
  ```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The cron job will automatically be set up via `vercel.json`.

### Other Platforms

1. Build the application: `npm run build`
2. Set environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Start the server: `npm start`

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://expira.io"

# Stripe
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PROFESSIONAL_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# App
NEXT_PUBLIC_APP_URL="https://expira.io"
CRON_SECRET="your-cron-secret"
```

## License

MIT License

## Support

For support, email support@expira.io or visit our documentation.

