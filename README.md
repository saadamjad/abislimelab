# Abi's Slime Lab

Online store for **Abi's Slime Lab**: handmade slimes and DIY kits, sold in Pakistan (PKR).

🌐 **Live site:** [www.abislimelab.com](https://www.abislimelab.com)

The site is **100% static**: plain HTML, CSS and JavaScript. There is no server code, no database and no build step, so it runs on any Hostinger shared hosting plan.

## How ordering works

1. Customer adds slimes to the cart and checks out. **No online payment.**
2. The order gets a reference like `ASL-7KQ2M9XP` and is saved in the customer's browser. Customers can reopen it from **My orders**.
3. The confirmation page offers **Download Invoice (PDF)** and **Send Order Details on WhatsApp**.
4. The customer sends the invoice to the store's WhatsApp, and the store confirms the order there.
5. If EmailJS is set up, the customer and the store also get an order email.

Orders start as **Awaiting WhatsApp confirmation** with payment status **Unpaid**.

### Limits of a static site

- There is no database. The store's record of an order is the WhatsApp message, the invoice and the admin email.
- There is no admin panel for orders. Products are managed with the product editor (`admin.html`), which exports `data/products.js`.
- Prices are recalculated from the catalog in the browser, but a determined user could edit their own browser. Always check the invoice total against your prices before confirming on WhatsApp.

## Project structure

```
index.html shop.html product.html cart.html checkout.html order.html orders.html admin.html
about.html faq.html contact.html shipping.html returns.html privacy.html terms.html 404.html
assets/css/      tokens.css, base.css, components.css, pages.css
assets/js/       config.js, catalog.js, cart.js, orders.js, layout.js, whatsapp.js,
                 hero3d.js, invoice.js, email.js, utils.js
assets/js/pages/ one script per page
assets/img/      favicon.svg, og.png (social preview)
tools/           stamp-version.py (run before each release)
data/products.js products, collections and FAQs
.htaccess robots.txt sitemap.xml
```

Slime visuals are drawn in code: each texture (butter, cloud, clear, jelly, crunchy, glitter, kit) has its own illustration in `assets/js/slime-svg.js`, colored by each product's `c1` and `c2`. The homepage hero is an interactive 3D slime with six textures; phones without WebGL, or with reduced motion, see the drawn version.

Libraries load from CDNs, pinned to exact versions: Three.js 0.160.0 for the homepage only, jsPDF 2.5.1 on the order page only, and EmailJS 4.4.1 only when emails are configured.

## Editing the store

**Store settings** live in `assets/js/config.js`. Lines marked `EDIT` need your real details:

| Setting | What it does |
| --- | --- |
| `whatsappNumber` / `whatsappDisplay` | Business WhatsApp, currently +92 333 1831004 |
| `storeEmail` | Public email shown in the footer (hidden when empty) |
| `adminEmail` | Where new-order emails go |
| `shipping.flatFee`, `shipping.freeOver` | Delivery charge in PKR, and optional free-delivery threshold |
| `showSampleBadges` | Set to `false` once real products replace the samples |
| `instagram`, `tiktok`, `facebook` | Social links (hidden when empty) |
| `emailjs` | Email keys, see below |

**Product editor (easiest way).** Open `yourdomain.com/admin.html`. Edit products and collections in a form, then download `products.js` and `sitemap.xml` and upload them to Hostinger, as the page explains. The editor only builds files on your computer. It cannot change the live site, so it is safe to leave online, and search engines are told to skip it.

**Products and collections** live in `data/products.js`. Each product has a slug, name, category, price, description, variants, stock (`in`, `low`, `out`), and best-seller and new flags. To use real photos, upload them to `assets/img/` and add `images: ["assets/img/your-photo.webp"]`. Without photos, a drawn slime in the product's colors is shown.

After adding or renaming products, update `sitemap.xml` with the new product URLs.

**Policy pages** (shipping, returns, privacy, terms) contain `<!-- EDIT -->` notes. Review them for your business before launch.

## Setting up order emails (EmailJS)

1. Create a free account at [emailjs.com](https://www.emailjs.com).
2. Add an **Email Service** (for example your Gmail or Hostinger mailbox) and copy its Service ID.
3. Create two **Email Templates**. In each, set **To Email** to `{{to_email}}`.
   - Customer template: subject `Your order {{order_ref}} at {{store_name}}`.
   - Admin template: subject `New order {{order_ref}} from {{customer_name}}`.
4. In the template bodies you can use: `{{to_name}}`, `{{order_ref}}`, `{{order_date}}`, `{{order_status}}`, `{{payment_status}}`, `{{customer_name}}`, `{{customer_email}}`, `{{customer_phone}}`, `{{delivery_address}}`, `{{order_notes}}`, `{{items}}`, `{{subtotal}}`, `{{shipping}}`, `{{total}}`, `{{whatsapp_number}}`, `{{whatsapp_link}}`.
   Tell customers to send their invoice PDF to `{{whatsapp_number}}`, and link `{{whatsapp_link}}`.
5. Copy your **Public Key** (Account → General) and the IDs into `config.js` → `emailjs`, and set `adminEmail`.
6. In EmailJS → Account → Security, restrict requests to your domain.

The EmailJS public key is designed to be visible in the browser. Never put your email password in this project. Until EmailJS is set up, the order page says that email confirmation is not set up, and orders still work.

## Run locally

The site needs a web server, because browsers block its scripts when `index.html` is opened directly as a file. If that happens, a banner explains it.

**Easiest:** double-click `start-mac.command` (Mac) or `start-windows.bat` (Windows). It starts a local server with caching turned off and opens the site. Keep its window open while you browse.

Or from a terminal:

```bash
python3 preview-server.py
# opens http://localhost:5500
```

## Releasing changes (important)

Hostinger's CDN can keep serving old copies of scripts after a deploy. If old and new files mix, the site breaks. Before every commit that changes code, styles or products, run:

```bash
python3 tools/stamp-version.py
```

It adds a fresh `?v=` version to every script and stylesheet URL, so each release always loads as a complete, matching set.

If you upload a new `data/products.js` from the product editor without running the script, flush the CDN afterwards: hPanel → **Performance → CDN → Flush cache**.

## Deploy to Hostinger

1. In hPanel open **Files → File Manager → public_html**.
2. Upload everything in this repository except `.git`, `README.md`, `LICENSE`, `start-mac.command`, `start-windows.bat` and `preview-server.py`. Keep the folder structure.
3. Make sure `.htaccess` was uploaded. It enables HTTPS, the 404 page, caching and compression.
4. Visit your domain and place a test order.

You can also use hPanel → **Advanced → Git** to deploy straight from this repository into `public_html`.

## License

Released under the [MIT License](LICENSE).
