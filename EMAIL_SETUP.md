# Email Notifications Setup

This project uses [Resend](https://resend.com/) for sending transactional emails to demo submitters.

## Setup Instructions

### 1. Get a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Navigate to API Keys in your dashboard
3. Create a new API key
4. Copy the API key (it starts with `re_`)

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_EMAIL_FROM=noreply@example.com
```

### 3. Verify Email Domain (Production)

For production use, you'll need to:

1. Add and verify your domain in the Resend dashboard
2. Update the `from` address in `src/lib/email.ts` to use your verified domain:
   ```typescript
   from: `Demo Night <${env.RESEND_EMAIL_FROM}>`
   ```

For development/testing, you can use the default Resend test domain.

## Email Flow

### Submission Confirmation Email
- **Triggered**: When a demo submission is created
- **Sent to**: Submitter's email
- **Content**: Confirmation of receipt with event and demo details

### Status Update Email
- **Triggered**: When submission status changes to `CONFIRMED` or `REJECTED`
- **Sent to**: Submitter's email
- **Content**: 
  - **CONFIRMED**: Congratulations message with next steps
  - **REJECTED**: Polite rejection with encouragement to submit in the future

## Email Templates

Email templates are built with [React Email](https://react.email/) and located in:
- `src/emails/SubmissionConfirmation.tsx`
- `src/emails/SubmissionStatusUpdate.tsx`

### Preview Emails in Development

To preview and test email templates locally:

```bash
yarn email:preview
```

This will start the React Email development server at `http://localhost:3000` where you can see all your email templates rendered.

## Error Handling

Email sending is designed to fail gracefully:
- If an email fails to send, the error is logged but doesn't break the submission/update flow
- All email errors are logged to the console for monitoring
- In production, consider setting up error tracking (e.g., Sentry) to monitor email failures

## Testing

### Test Submission Flow

1. Submit a demo through the public submission form
2. Check the email inbox for the confirmation email
3. Update the submission status to `CONFIRMED` or `REJECTED` in the admin panel
4. Check the email inbox for the status update email

### Development Testing

For development, Resend allows sending to any email address. In production with a verified domain, you can send to any recipient.

## Customization

To customize email templates:

1. Edit the React components in `src/emails/`
2. Update styles using inline CSS objects
3. Preview changes with `yarn email:preview`
4. Test by triggering the actual email flow

## Troubleshooting

### Emails not sending

1. Check that `RESEND_API_KEY` and `RESEND_EMAIL_FROM` are set in your environment
2. Verify the API key is valid in the Resend dashboard
3. Check server logs for error messages
4. Ensure the "from" domain is verified (production)

### Email styling issues

1. Use inline styles (React Email converts these to inline CSS)
2. Test across different email clients using Resend's preview feature
3. Avoid complex CSS that may not be supported in email clients
