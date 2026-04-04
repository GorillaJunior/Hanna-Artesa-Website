# Newsletter Setup

The newsletter form on `index.html` is now connected to the PHP endpoint `api/newsletter.php`.

## Why it was not real before

Previously the form only:

- blocked the normal submit in the browser
- showed an alert
- saved the email into `localStorage`

That means signups existed only on the same device and browser, and no real newsletter service received the email.

## Option 1: Use a webhook

Add this environment variable in your hosting panel or server config:

- `NEWSLETTER_WEBHOOK_URL`

The site will `POST` this JSON payload:

```json
{
  "email": "customer@example.com",
  "source": "hanna-artesa-website"
}
```

This is useful if you already have Zapier, Make, n8n, Google Apps Script, or another automation endpoint.

## Option 2: Use Brevo directly

Add these environment variables in your hosting panel or server config:

- `BREVO_API_KEY`
- `BREVO_NEWSLETTER_LIST_ID` optional but recommended

The API route will create or update the contact in Brevo.

## Deploy

1. Upload the project to a PHP-enabled host.
2. Make sure the `api` folder is publicly reachable.
3. Add either the webhook variable or the Brevo variables in your server environment.
4. Reload or redeploy the site so PHP picks up the new environment values.

## Local behavior

If the endpoint is not configured yet, the form now shows a real error message instead of pretending the signup worked.
