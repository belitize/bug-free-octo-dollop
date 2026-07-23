# Hair Fetishism Research Survey

Anonymous, single-page academic research survey built with HTML, Tailwind CSS, and vanilla JavaScript.

## Quick start (local preview)

Open `index.html` in a browser, or serve locally:

```bash
npx serve .
# or: python -m http.server 8080
```

## Configure form backend (Formspree)

1. **Create a throwaway email** — e.g. [ProtonMail](https://proton.me) (`researcher@protonmail.com`). Do not use your personal email.

2. **Sign up at [Formspree.io](https://formspree.io)** with that throwaway email.

3. **Create a new form** → copy the endpoint URL (e.g. `https://formspree.io/f/xyzabcde`).

4. **Edit `js/config.js`**:
   ```js
   FORMSPREE_ENDPOINT: 'https://formspree.io/f/YOUR_FORM_ID',
   ADMIN_PASSPHRASE: 'your-strong-secret-here',
   ```

5. **Formspree privacy settings** (dashboard):
   - Use a project name that does not identify you personally.
   - Enable email notifications to your throwaway inbox only.
   - Export submissions as CSV from the Formspree dashboard anytime.
   - Formspree may log IPs on free tier — for maximum anonymity, consider their paid plan or self-hosted alternatives (see below).

6. **Retrieve data privately**:
   - **Primary:** Formspree dashboard → Submissions → Export CSV.
   - **Backup:** Visit `yoursite.github.io/.../#admin`, enter your `ADMIN_PASSPHRASE`, export local backup CSV/JSON (only submissions from browsers that successfully ran the submit script; Formspree is the authoritative store).

## Host on GitHub Pages (throwaway account)

### 1. Create anonymous GitHub account

- Use a VPN or Tor if you want separation from your real IP.
- Sign up with a new throwaway email (ProtonMail, etc.).
- Do **not** use your real name, photo, or linked accounts.

### 2. Create repository

```bash
git init
git add .
git commit -m "Add anonymous hair fetishism research survey"
git branch -M main
git remote add origin https://github.com/YOUR_THROWAWAY_USER/bug-free-octo-dollop.git
git push -u origin main
```

Or upload files via GitHub web UI: **New repository** → upload `index.html`, `js/`, `README.md`.

### 3. Enable GitHub Pages

1. Repository → **Settings** → **Pages**
2. Source: **Deploy from branch**
3. Branch: `main` / `/ (root)`
4. Save — site live at `https://YOUR_THROWAWAY_USER.github.io/bug-free-octo-dollop/`

### 4. Optional: custom domain

Use a neutral domain purchased with privacy WHOIS via Njalla or similar — not required for GitHub Pages default URL.

## Keeping researcher identity hidden

| Layer | Recommendation |
|-------|----------------|
| GitHub account | Throwaway email, VPN at signup |
| Formspree | Separate throwaway email; no personal details in form name |
| Contact email | ProtonMail alias only (`researcher@protonmail.com`) |
| Hosting | GitHub Pages on throwaway account (no billing info needed) |
| Code | No real names in commits — use generic messages |
| Analytics | **Do not** add Google Analytics or similar (tracks visitors) |

## Alternative backends

- **Formspree (recommended):** Easiest; free tier = 50 submissions/month.
- **Web3Forms / Getform:** Similar to Formspree.
- **Google Sheets + Apps Script:** Free but ties to Google account; less anonymous.
- **Self-hosted:** Node/Python endpoint on a VPS paid with crypto — maximum control, more setup.

## File structure

```
bug-free-octo-dollop/
├── index.html      # Main survey page
├── js/
│   ├── config.js   # Formspree endpoint & admin passphrase
│   └── app.js      # Form logic, localStorage, submission
└── README.md
```

## Features

- Multi-section form with progress bar
- Save & continue later (localStorage)
- Download my responses (CSV) before submit
- Consent flow with early exit on "No"
- Terms & Privacy accordion
- Success screen with share link
- Admin export at `#admin` (local backup only)

## License

Independent research project — use responsibly and ethically. Participants must be 18+.
