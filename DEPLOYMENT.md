# Production deployment

This project is deployed as a Node.js service behind Nginx. The Node service serves the Vite build and proxies API requests, so iMentor and OpenAI credentials never reach the browser.

## Server prerequisites

- Ubuntu/Debian server with Node.js 20 or newer, Nginx and Git
- A domain pointed to the server
- TLS certificate configured with Certbot after Nginx is running

## First deployment

```bash
sudo mkdir -p /var/www/fjsti-web
sudo chown "$USER":www-data /var/www/fjsti-web
git clone <YOUR_GITHUB_REPOSITORY_URL> /var/www/fjsti-web
cd /var/www/fjsti-web
npm ci
npm run build
```

Create the server-only secret file. Do not use `VITE_` prefixes and do not put these values in GitHub.

```bash
sudo cp deploy/fjsti-web.env.example /etc/fjsti-web.env
sudo nano /etc/fjsti-web.env
sudo chmod 600 /etc/fjsti-web.env
sudo chown root:root /etc/fjsti-web.env
```

Install and start the service:

```bash
sudo cp deploy/systemd/fjsti-web.service /etc/systemd/system/fjsti-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now fjsti-web
sudo systemctl status fjsti-web
```

Install the Nginx configuration, replacing `your-domain.uz` with the real domain first:

```bash
sudo cp deploy/nginx/fjsti-web.conf /etc/nginx/sites-available/fjsti-web
sudo ln -s /etc/nginx/sites-available/fjsti-web /etc/nginx/sites-enabled/fjsti-web
sudo nginx -t
sudo systemctl reload nginx
```

Then configure HTTPS:

```bash
sudo certbot --nginx -d your-domain.uz -d www.your-domain.uz
```

## Updating after a Git push

```bash
cd /var/www/fjsti-web
git pull --ff-only
npm ci
npm run build
sudo systemctl restart fjsti-web
sudo systemctl status fjsti-web
```

## Verification

```bash
curl -I https://your-domain.uz/
curl -I https://your-domain.uz/test
sudo journalctl -u fjsti-web -n 100 --no-pager
```

The production server binds to `127.0.0.1:3001`; only Nginx should be public. It caches iMentor statistics for 60 seconds, keeps question requests uncached for random selection, and limits AI requests per IP.
