# Instagram API Setup

This project is prepared for a live Instagram feed on `kontakt.html` using a PHP endpoint.

## 1. Meta account setup

1. Convert your Instagram account to a Professional account.
2. Connect that Instagram account to a Facebook Page.
3. Create a Meta developer app.
4. Add the Instagram API / Instagram Graph API product.
5. Generate an access token for your own connected account.

For your own account in development mode, your app usually works as long as your Meta user is added to the app and the Instagram account is connected correctly.

## 2. Environment variables

Add these variables in your hosting panel or server config:

- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_USER_ID`
- `INSTAGRAM_PROFILE_URL`
- `INSTAGRAM_GRAPH_API_VERSION`

Optional:

- `INSTAGRAM_PAGE_ID`

If you do not know the Instagram user ID yet, you can temporarily use `INSTAGRAM_PAGE_ID` and the function will try to resolve the connected Instagram business account automatically.

## 3. Deploy

1. Upload the project to a PHP-enabled host.
2. Add the environment variables in your hosting panel or web server config.
3. Make sure the `api` directory is served by PHP.
4. Reload or redeploy the site.

## 4. What the endpoint does

The endpoint lives at `api/instagram.php`.

It fetches:

- Instagram username
- Profile picture
- Biography
- Latest 3 posts

The frontend on `kontakt.html` then renders that data automatically.

## 5. If the feed does not load

Check:

- the token is valid
- the Instagram account is Professional
- the account is connected to a Facebook Page
- the app user has access in Meta
- the server environment variables are saved correctly
