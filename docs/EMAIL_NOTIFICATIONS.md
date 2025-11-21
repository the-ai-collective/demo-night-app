# Email Notifications System

## Overview

The Email Notifications System automatically sends email notifications to demo submitters at key points in the submission lifecycle. This ensures submitters are kept informed about their submission status and provides a professional communication channel.

## Features

- **Submission Confirmation**: Automatic email sent immediately when a demo is submitted
- **Status Updates**: Email notifications when submission status changes to `CONFIRMED` or `REJECTED`
- **Personalized Content**: Emails include submission details, event information, and next steps
- **Graceful Degradation**: System works without API key configured (logs warnings, doesn't break functionality)
- **Development Preview**: Preview email templates in browser during development
- **Error Handling**: Email failures are logged but don't interrupt submission flow

## Architecture

### Components

1. **Email Utility** (`src/lib/email.ts`)
   - Core email sending functions
   - Resend API integration
   - Error handling and logging

2. **Email Templates** (`src/emails/`)
   - React Email components for HTML email generation
   - Responsive, professional designs

3. **Integration Points**
   - `submission.create` mutation - sends confirmation email
   - `submission.adminUpdate` mutation - sends status update emails

4. **Preview Route** (`src/app/api/emails/preview/route.ts`)
   - Development-only endpoint for previewing templates

## Environment Configuration

### Required Environment Variable

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Note**: The API key is optional. If not configured, the system will log warnings but continue to function normally (emails simply won't be sent).

### Setup

1. Sign up for a [Resend](https://resend.com) account
2. Create an API key in the Resend dashboard
3. Add the key to your `.env` file
4. Verify your sending domain in Resend (or update the "from" address in code)

## Email Templates

### Submission Confirmation Email

**Trigger**: When a submission is created via `submission.create`

**Template**: `src/emails/SubmissionConfirmationEmail.tsx`

**Content Includes**:
- Personalized greeting with submitter name
- Submission details (name, tagline)
- Event information (name, date)
- Next steps information
- Link to event details

**Subject**: `Submission Received: {submissionName}`

### Status Update Email

**Trigger**: When submission status changes to `CONFIRMED` or `REJECTED` via `submission.adminUpdate`

**Template**: `src/emails/SubmissionStatusUpdateEmail.tsx`

**Content Includes**:
- Status-specific messaging (congratulations for confirmed, encouragement for rejected)
- Submission and event details
- Admin comments (if provided)
- Next steps based on status
- Link to event details

**Subject**:
- `🎉 Your Demo Has Been Confirmed: {submissionName}` (for CONFIRMED)
- `Update on Your Demo Submission: {submissionName}` (for REJECTED)

## API Integration

### Submission Router (`src/server/api/routers/submission.ts`)

#### `submission.create` Mutation

```typescript
mutation(async ({ input }) => {
  // 1. Fetch event data
  const event = await db.event.findUnique({
    where: { id: input.eventId },
  });

  // 2. Create submission
  const result = await db.submission.create({
    data: input,
  });

  // 3. Send confirmation email (non-blocking)
  sendSubmissionConfirmationEmail({
    submissionName: result.name,
    submissionTagline: result.tagline,
    submitterEmail: result.email,
    submitterName: result.pocName,
    eventName: event.name,
    eventDate: event.date,
    eventUrl: event.url,
  }).catch((error) => {
    console.error("Failed to send confirmation email:", error);
  });

  return result;
});
```

**Key Points**:
- Email sending is asynchronous and non-blocking
- Errors are caught and logged but don't affect submission creation
- Event data is fetched to include in email

#### `submission.adminUpdate` Mutation

```typescript
mutation(async ({ input }) => {
  // 1. Fetch current submission with event
  const currentSubmission = await db.submission.findUnique({
    where: { id },
    include: { event: true },
  });

  // 2. Update submission
  const updatedSubmission = await db.submission.update({
    where: { id },
    data,
  });

  // 3. Send status update email if status changed to CONFIRMED or REJECTED
  if (
    data.status &&
    data.status !== currentSubmission.status &&
    (data.status === "CONFIRMED" || data.status === "REJECTED")
  ) {
    sendSubmissionStatusUpdateEmail({
      submissionName: updatedSubmission.name,
      submissionTagline: updatedSubmission.tagline,
      submitterEmail: updatedSubmission.email,
      submitterName: updatedSubmission.pocName,
      eventName: currentSubmission.event.name,
      eventDate: currentSubmission.event.date,
      eventUrl: currentSubmission.event.url,
      status: data.status,
      adminComment: updatedSubmission.comment,
    }).catch((error) => {
      console.error("Failed to send status update email:", error);
    });
  }

  return updatedSubmission;
});
```

**Key Points**:
- Only sends email when status changes to `CONFIRMED` or `REJECTED`
- Compares old and new status to detect changes
- Includes admin comment if provided
- Non-blocking error handling

## Email Utility Functions

### `sendSubmissionConfirmationEmail(data: SubmissionEmailData)`

Sends a confirmation email when a submission is created.

**Parameters**:
```typescript
interface SubmissionEmailData {
  submissionName: string;
  submissionTagline: string;
  submitterEmail: string;
  submitterName: string;
  eventName: string;
  eventDate: Date;
  eventUrl: string;
}
```

**Behavior**:
- Checks if Resend API key is configured
- Logs warning if not configured (doesn't throw)
- Renders React Email template to HTML
- Sends email via Resend API
- Logs success or error

### `sendSubmissionStatusUpdateEmail(data: SubmissionStatusUpdateData)`

Sends a status update email when submission status changes.

**Parameters**:
```typescript
interface SubmissionStatusUpdateData extends SubmissionEmailData {
  status: "CONFIRMED" | "REJECTED";
  adminComment?: string | null;
}
```

**Behavior**:
- Same as confirmation email
- Uses different template based on status
- Includes admin comment if provided

## Development Preview

### Preview Route

**Endpoint**: `GET /api/emails/preview`

**Query Parameters**:
- `template` (optional): `"confirmation"` or `"status-update"` (default: `"confirmation"`)
- `status` (optional): `"CONFIRMED"` or `"REJECTED"` (default: `"CONFIRMED"`)

**Examples**:
- `http://localhost:3000/api/emails/preview?template=confirmation`
- `http://localhost:3000/api/emails/preview?template=status-update&status=CONFIRMED`
- `http://localhost:3000/api/emails/preview?template=status-update&status=REJECTED`

**Security**: Only available in development mode (returns 403 in production)

**Sample Data**: Uses mock data for preview purposes

## Email Template Structure

### React Email Components

Templates use [React Email](https://react.email/) components for type-safe, component-based email development:

- `Html`, `Head`, `Body` - Document structure
- `Container`, `Section` - Layout
- `Heading`, `Text` - Typography
- `Button`, `Link` - Interactive elements
- `Preview` - Email preview text

### Styling

- Inline styles for maximum email client compatibility
- Responsive design principles
- Professional color scheme
- Clear visual hierarchy

## Error Handling

### Graceful Degradation

1. **Missing API Key**: System logs warning and continues (emails not sent)
2. **Email Send Failure**: Error is caught, logged, and doesn't affect submission flow
3. **Template Rendering Error**: Would throw (should be caught by caller)

### Logging

- Success: `✅ Confirmation email sent to {email}`
- Warning: `⚠️  Resend API key not configured. Email not sent.`
- Error: `❌ Failed to send {type} email: {error}`

## Key Design Decisions

1. **Non-blocking Email Sending**: Emails are sent asynchronously to prevent delays in submission processing
2. **Optional API Key**: System works without configuration for easier development/testing
3. **Status Change Detection**: Only sends emails when status actually changes (not on every update)
4. **Template-based**: React Email provides type safety and component reusability
5. **Development Preview**: Makes it easy to test and iterate on email designs

## Future Enhancements

Potential improvements for the email notification system:

- [ ] Email templates for other status changes (WAITLISTED, AWAITING_CONFIRMATION)
- [ ] Email preferences/unsubscribe functionality
- [ ] Retry logic for failed email sends
- [ ] Email delivery tracking
- [ ] Customizable email templates per event
- [ ] Batch email sending for bulk operations
- [ ] Email analytics and open/click tracking

## Dependencies

- `resend`: Email sending service SDK
- `@react-email/components`: React components for email templates
- `@react-email/render`: Template rendering to HTML

## Testing

### Manual Testing

1. **Submission Confirmation**:
   - Submit a new demo via the submission form
   - Check email inbox for confirmation email
   - Verify all details are correct

2. **Status Update (CONFIRMED)**:
   - As admin, change submission status to CONFIRMED
   - Check email inbox for confirmation email
   - Verify admin comment is included if provided

3. **Status Update (REJECTED)**:
   - As admin, change submission status to REJECTED
   - Check email inbox for rejection email
   - Verify messaging is appropriate

4. **Preview Route**:
   - Visit preview URLs in development
   - Verify templates render correctly
   - Test different status values

### Error Scenarios

1. **Missing API Key**: Verify warnings are logged but submission succeeds
2. **Invalid API Key**: Verify errors are logged but submission succeeds
3. **Invalid Email Address**: Verify Resend handles gracefully

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set in `.env`
2. Verify API key is valid in Resend dashboard
3. Check domain verification status in Resend
4. Review server logs for error messages
5. Test with preview route to verify templates render

### Email Delivery Issues

1. Check spam folder
2. Verify sender domain is verified in Resend
3. Check Resend dashboard for delivery status
4. Review email content for spam triggers

## Related Files

- `src/lib/email.ts` - Email utility functions
- `src/emails/SubmissionConfirmationEmail.tsx` - Confirmation template
- `src/emails/SubmissionStatusUpdateEmail.tsx` - Status update template
- `src/server/api/routers/submission.ts` - Submission router with email integration
- `src/app/api/emails/preview/route.ts` - Preview route
- `src/env.js` - Environment variable configuration

