# Closing backend

Backend for the admin panel, exhibits API, auth, uploads, and optional Google
Sheets/Drive import.

## Requirements

- Node.js 21+
- Yarn
- PostgreSQL 14+

## Setup

Install dependencies:

```bash
yarn install
```

Create a local env file:

```bash
cp .env.example .env
```

Fill the database and token values:

```env
USERNAME=postgres
PASSWORD=your_postgres_password
DATABASE=authentic
HOST=localhost

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_DAYS=7

PORT=3000
```

Create the PostgreSQL database manually if it does not exist yet:

```bash
createdb authentic
```

Run migrations:

```bash
yarn start
```

`yarn start` runs migrations first and then starts the server with nodemon.
The default local URL is:

```text
http://localhost:3000
```

## Useful Commands

```bash
yarn start
yarn migrate-undo
yarn seed
yarn seed-undo
yarn format
```

### Google Sheets

1. Open Google Cloud Console:
   https://console.cloud.google.com/
2. Create a project or select an existing one.
3. Open `APIs & Services` then `Library`.
4. Enable: Google Sheets API
5. Open `APIs & Services` go to `Credentials`.
6. Click `Create Credentials` go to `Service Account`.
7. Create a JSON key for the service account.
8. Put the downloaded file here:

```text
app/integrations/config/creds.json
```

9. Share the Google Sheet with the service account email.
10. Add the spreadsheet id to `.env`:

```env
GOOGLE_SPREADSHEET_ID=
GOOGLE_SPREADSHEET_RANGE=A2:J
```
