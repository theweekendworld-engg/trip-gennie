# Admin Panel Environment Variables

Add these environment variables to your `.env` file:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your_random_32_character_secret_key_here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000  # Change to your production URL in production

# Existing variables
DATABASE_URL=postgresql://...
GOOGLE_MAPS_API_KEY=...
```

## Creating Your First Admin User

1. Run the admin user creation script:
   ```bash
   bun run create-admin.ts
   ```

2. Enter your email, password, and name when prompted

3. The script will create a super_admin user with hashed password

## Accessing the Admin Panel

1. Navigate to: `http://localhost:3000/admin`

2. Login with the credentials you created

3. You'll be redirected to the dashboard

## Security Notes

- **Never commit** your `.env` file
- **Use a strong password** for your admin account (16+ characters)
- **Change NEXTAUTH_SECRET** in production
- **Use HTTPS** in production (never HTTP)
