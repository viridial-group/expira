# Setup Instructions

## Environment Variables

Your `.env` file has been created with the following configuration:

- ✅ Database: PostgreSQL connection configured
- ✅ SMTP: Hostinger email settings configured
- ✅ Security: NEXTAUTH_SECRET and CRON_SECRET generated

## Fix Permission Issues

If you encounter permission errors with Prisma, run:

```bash
# Fix node_modules permissions
sudo chown -R $(whoami) node_modules

# Or remove and reinstall
rm -rf node_modules
npm install
```

## Database Setup

1. **Make sure PostgreSQL is running:**
   ```bash
   # Check if PostgreSQL is running
   pg_isready
   ```

2. **Create the database (if it doesn't exist):**
   ```bash
   createdb sass-verification
   # Or using psql:
   psql -U postgres -c "CREATE DATABASE \"sass-verification\";"
   ```

3. **Run Prisma migrations:**
   ```bash
   # First, fix permissions if needed
   sudo chown -R $(whoami) node_modules
   
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   ```

## Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Next Steps

1. **Set up Stripe** (for payments):
   - Go to https://stripe.com
   - Get your API keys
   - Create products/prices in Stripe dashboard
   - Update `.env` with your Stripe keys

2. **Test Email Notifications**:
   - Your SMTP is configured with Hostinger
   - Test by adding a product and setting an expiration date

3. **Set up Cron Jobs** (for automated checks):
   - Use Vercel Cron (if deploying to Vercel)
   - Or set up a server cron job
   - Or use a service like cron-job.org

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check connection string in `.env`
- Ensure database exists: `psql -U postgres -l`

### Permission Issues
- Run `sudo chown -R $(whoami) node_modules`
- Or reinstall: `rm -rf node_modules && npm install`

### Email Not Working
- Verify SMTP credentials
- Check firewall/port 465 is open
- Test with a simple email script

