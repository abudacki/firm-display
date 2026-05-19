# Firm Display

A locally hosted replacement for DAKboard-style office displays, built for Raspberry Pi 4 kiosk screens in a law firm. The MVP runs with mock calendar and weather data, then switches to Microsoft Graph when app credentials are configured.

## What Is Included

- `/morning` - large clock, date, multi-office weather, quote background, attorney calendar rotation, announcements.
- `/attorneys` - selected attorney calendars with privacy-safe upcoming events.
- `/rooms/[roomId]` - conference room status, current meeting, next meeting, room timeline.
- `/announcements` - office notices and urgent banner display.
- `/admin` - local browser admin for quotes, background uploads, announcements, display profiles, calendars, rotation timing, and privacy mode.

The app uses Next.js, TypeScript, Tailwind CSS, SQLite, and small provider modules for calendar and weather data.

## Local Development

```bash
cp .env.example .env
npm install
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Raspberry Pi 4 Setup

Target:

- Raspberry Pi 4
- Raspberry Pi OS Lite or Desktop
- Node.js LTS
- PM2
- Nginx optional
- SQLite database stored locally
- Git-based update workflow

### 1. Install System Packages

```bash
sudo apt update
sudo apt install -y git curl build-essential sqlite3 nginx
```

### 2. Install Node.js LTS

Use NodeSource or another trusted Node.js LTS installer:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 3. Clone And Configure

```bash
git clone <your-repo-url> firm-display
cd firm-display
cp .env.example .env
nano .env
```

At minimum, set:

```bash
NEXT_PUBLIC_APP_NAME="Firm Display"
DATABASE_PATH="./data/kiosk.sqlite"
DISPLAY_REFRESH_SECONDS=60
```

Leave Microsoft Graph values blank until Entra ID credentials are ready. The app will use mock calendar data.

### 4. Install, Seed, And Build

```bash
./scripts/setup.sh
```

This installs dependencies, creates the SQLite database, seeds MVP content, and builds the Next.js app.

### 5. Run With PM2

```bash
sudo npm install -g pm2
./scripts/start.sh
pm2 startup systemd
```

Run the command printed by `pm2 startup`, then:

```bash
pm2 save
```

The app listens on `0.0.0.0:3000` by default.

### 6. Optional Nginx Reverse Proxy

Create `/etc/nginx/sites-available/firm-display`:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/firm-display /etc/nginx/sites-enabled/firm-display
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Optional Chromium Kiosk Startup

On Raspberry Pi OS Desktop:

```bash
sudo apt install -y chromium-browser unclutter
mkdir -p ~/.config/autostart
nano ~/.config/autostart/firm-display.desktop
```

Example:

```ini
[Desktop Entry]
Type=Application
Name=Firm Display Kiosk
Exec=chromium-browser --kiosk --disable-infobars --noerrdialogs http://localhost/morning
```

Use different URLs per screen:

- `http://localhost/morning`
- `http://localhost/attorneys`
- `http://localhost/rooms/main-conference`
- `http://localhost/announcements`

## Updating The Pi

```bash
./scripts/update.sh
```

The script runs:

- `git pull --ff-only`
- `npm install`
- `npm run db:seed`
- `npm run build`
- PM2 restart

## Backups

```bash
./scripts/backup-db.sh
```

Backups are written to `backups/kiosk-YYYYMMDD-HHMMSS.sqlite`.

## Microsoft 365 / Graph Setup

The app is structured to use Microsoft Graph Calendar API with app-only authentication through Entra ID client credentials.

Configure these in `.env`:

```bash
MICROSOFT_TENANT_ID="..."
MICROSOFT_CLIENT_ID="..."
MICROSOFT_CLIENT_SECRET="..."
MICROSOFT_GRAPH_SCOPE="https://graph.microsoft.com/.default"
CALENDAR_PRIVACY_SAFE=true
```

The calendar provider calls:

```text
GET /users/{calendar-id}/calendarView?startDateTime=...&endDateTime=...
```

To override attorney labels on display cards, set:

```bash
CALENDAR_DISPLAY_NAMES="paul@tibbottrichardson.com|Smith;djr@tibbottrichardson.com|Richards"
```

For least privilege:

- Prefer `Calendars.ReadBasic` where the display only needs free/busy-style subject, time, and location metadata.
- Use broader calendar permissions only when the firm explicitly needs full event detail.
- Configure Exchange Application Access Policies so this app can read only approved attorney calendars and room mailboxes.
- Store the client secret only in `.env` on the Pi or in a local secret-management process controlled by IT.
- Use room mailbox addresses for conference displays, for example `main-conference-room@example.com`.

## Weather Provider

`lib/weather/provider.ts` uses mock office weather unless `WEATHER_PROVIDER="openmeteo"` is set. For one local weather card:

```bash
WEATHER_PROVIDER="openmeteo"
WEATHER_LOCATION="Pittsburgh, PA"
WEATHER_API_BASE_URL="https://api.open-meteo.com/v1/forecast"
```

For multiple weather cards:

```bash
WEATHER_LOCATIONS="Pittsburgh Office|Pittsburgh, PA;Ebensburg Office|Ebensburg, PA;Arkansas Office|Russellville, AR;Mexico Office|Tepic, Nayarit, Mexico;South Africa Office|Krugersdorp, Gauteng, South Africa"
```

The provider falls back to mock weather if the live request fails.

## Maintenance Notes

- SQLite is created automatically at `data/kiosk.sqlite`.
- Uploaded backgrounds are stored in `public/uploads`.
- The admin UI is intended for trusted local-network use. Put it behind VPN, LAN controls, or Nginx basic auth if the Pi is reachable from broader networks.
- No Docker is required for the MVP.
