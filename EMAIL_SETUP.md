# Email Setup Instructions

This document explains how to set up the contact form email functionality for the pianist portfolio website.

## Prerequisites

- A Gmail account to send emails from
- Node.js and npm/pnpm installed

## Setup Steps

### 1. Create App Password for Gmail

Google requires using an "App Password" instead of your regular password for less secure apps:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select "Security" from the left menu
3. Under "Signing in to Google," select "2-Step Verification" (you must have this enabled)
4. At the bottom of the page, select "App passwords"
5. Select "Mail" as the app and "Other" as the device (name it "Pianist Portfolio")
6. Click "Generate" and copy the 16-character password

### 2. Create Environment Variables

Create a `.env.local` file in the root of your project with the following content:

```
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_character_app_password
```

Replace the placeholders with your actual Gmail address and the app password you generated.

### 3. Restart the Development Server

If your development server is running, restart it to load the new environment variables:

```bash
pnpm dev
```

## Testing the Contact Form

1. Fill out the contact form with valid information
2. Submit the form
3. You should see a success message if everything is configured correctly
4. Check the recipient email inbox to confirm the message was received

## Troubleshooting

If emails are not being sent:

1. Check your browser console for error messages
2. Verify your `.env.local` file contains the correct credentials
3. Make sure you're using an App Password, not your regular Gmail password
4. Check your Gmail account settings to ensure less secure apps are allowed
5. Check your server logs for more detailed error information

## Production Deployment

When deploying to production:

1. Add the environment variables to your hosting platform (Vercel, Netlify, etc.)
2. Consider using a more robust email service like SendGrid or Mailgun for production use
3. Update the `env.ts` file with any new email service configurations 