# Numeroloģija PWA

Šis ir statisks PWA projekts, ko vari ielikt GitHub repo un publicēt caur Netlify, Vercel vai GitHub Pages.

## Faili
- `index.html` – galvenais interfeiss
- `styles.css` – dizains
- `app.js` – UI loģika, rezultātu renderēšana, PWA instalēšana
- `numerology.js` – aprēķinu dzinējs
- `manifest.json` – PWA iestatījumi
- `service-worker.js` – kešošana un offline pamats

## Ātra palaišana lokāli
Vienkāršākais variants:
- atver mapi VS Code
- palaid `Live Server`
vai terminālī:
- `python3 -m http.server 8080`

Tad atver:
- `http://localhost:8080`

## Netlify
1. Izveido GitHub repo
2. Augšupielādē visus failus
3. Netlify izvēlies šo repo
4. Tā kā tas ir statisks projekts:
   - Build command: atstāj tukšu
   - Publish directory: atstāj tukšu vai `.`
5. Deploy

## Svarīgi
PWA pilnvērtīgi strādā tikai caur HTTPS vai localhost.
