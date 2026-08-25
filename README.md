V11 Premium Portfolio — Final polished build

# Fahad Badsha Shamim — Research Portfolio

A GitHub Pages-ready, static research portfolio with a private-by-design browser dashboard. No paid hosting, database or server is required.

## Public pages

- `index.html` — portfolio home, About, research preview, skills, education and contact.
- `research.html` — dedicated research index.
- `research-detail.html?slug=...` — one clean page per research project with methods, results, publication metadata, authentic publication URL, PDF URL and GitHub URL.
- `skills.html` — skill index.
- `skill-detail.html?skill=...` — dedicated page for each skill, including evidence/examples.

## Dashboard

Open `/admin/` after deployment. It includes:

- Overview
- Home editor
- About editor
- Research CRUD with project detail metadata and links
- Skill categories + individual skill detail pages
- Education
- Contact channels
- Media Library for reusable images
- Appearance controls: colors, button colors, typography, radius, gradient, background image, background fit/position/opacity
- Navigation editor
- Language selector: English, German, Bangla, Spanish, Italian
- My Profile
- CV Manager: upload/replace PDF + editable CV metadata
- Security and session controls

## GitHub Pages setup

1. Create a repository and keep it public if you want a public portfolio.
2. Upload the **contents** of this ZIP to the repository root. Do not create an extra nesting folder.
3. Keep `.nojekyll` in the root.
4. Settings → Pages → Deploy from branch → `main` → `/ (root)`.
5. Wait for GitHub Pages to publish.
6. Open `/admin/` and connect the repository.

## Dashboard security model

GitHub Pages is static, so there is no server-side admin authentication. This build therefore uses a layered practical model:

- Fine-grained GitHub token is stored only in `sessionStorage` for the active browser session.
- Repository owner/name/branch are stored separately from the token.
- Token is never committed to the repository, JSON files, HTML, CSS or JavaScript.
- Dashboard password uses salted PBKDF2 (150,000 iterations) and the verifier is stored in `data/access.json`.
- Dashboard automatically locks after 20 minutes of inactivity.
- Disconnect removes the token and repository configuration from the browser.
- Use a short-lived token (7–30 days is a sensible operational choice) and restrict it to this repository with the minimum required permission: Contents → Read and write (plus GitHub-required metadata read-only).
- Never use the dashboard on an untrusted/shared computer.

This is not equivalent to server-side authentication. The safest workflow is to connect a short-lived, tightly scoped token only when editing, save changes, lock the dashboard, and revoke the token when finished.

## Multilingual content

The interface translations are curated locally in `data/i18n.json`. This avoids sending unpublished academic content or credentials to third-party translation APIs. For research titles/descriptions, enter verified translations manually through the content files/dashboard when needed.

## Media and CV

- Reusable images live in `assets/images/`.
- CV PDFs live in `assets/files/`.
- The dashboard can upload new images and replace the CV PDF.
- Background images use responsive `cover` fitting so aspect-ratio differences do not distort the image.

## Important link behaviour

External links are opened with `noopener noreferrer`. Only `http`, `https`, `mailto` and same-origin URLs are accepted by the public URL helper.

## Repository structure

```text
/
├── index.html
├── research.html
├── research-detail.html
├── skills.html
├── skill-detail.html
├── admin/index.html
├── assets/
│   ├── images/
│   └── files/
├── css/
├── data/
└── js/
```
