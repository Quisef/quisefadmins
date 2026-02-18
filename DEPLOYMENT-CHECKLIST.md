# Production Deployment Checklist

## Resend Email Configuration

### 1. Required Environment Variables (add to Vercel/hosting)
```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=FuturenTrepeneurship <noreply@quietshelter.org>
```

- **RESEND_API_KEY**: From [resend.com/api-keys](https://resend.com/api-keys)
- **RESEND_FROM_EMAIL**: Must use a verified domain. Format: `"Display Name" <email@yourdomain.com>`

### 2. Resend Dashboard – Verify
- [ ] Domain added and verified (quietshelter.org)
- [ ] DNS records (SPF, DKIM) show as verified
- [ ] API key created and copied

### 3. Local Verification
1. Visit **http://localhost:3000/api/email-status** – should show:
   ```json
   { "status": "ok", "message": "Resend configured. Emails should send.", "provider": "resend" }
   ```
2. Use Admin panel → "Send test confirmation" with a registration ID
3. Check inbox (and spam) for the confirmation email

### 4. Production Environment (Vercel)
- Project → Settings → Environment Variables
- Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
- Enable for Production (and Preview if needed)
- Redeploy after adding variables

### 5. Paystack Webhook
- Paystack Dashboard → Settings → API Keys & Webhooks
- Webhook URL: `https://quietshelter.org/api/paystack-webhook`
  (or `https://quietshelter.org/api/webhook/paystack` if you use that route)
- Ensure using correct secret key (live vs test)

### 6. Other Production Variables
- `NEXT_PUBLIC_APP_URL` = `https://quietshelter.org`
- `PAYSTACK_SECRET_KEY` = your live key
- Firebase vars (NEXT_PUBLIC_*, etc.)
- Cloudinary vars (for pitch deck uploads)
