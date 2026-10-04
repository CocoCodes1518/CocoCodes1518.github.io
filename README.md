# Vasundhara Portfolio

A scroll-led developer portfolio built with React, Vite, Three.js, React Three Fiber, and Framer Motion. The experience combines an interactive 3D character with a résumé timeline and a four-project Works gallery.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build for deployment

```bash
npm ci
npm run build
```

The static production output is written to `dist/`. For static hosting, configure the build command as `npm run build` and the publish directory as `dist`. Because this is a single-page app, configure the host to serve `index.html` for unknown non-asset routes.

## GitHub setup

This folder is ready to put in a GitHub repository. The package intentionally excludes `.git/` and `node_modules/`; GitHub and deployment platforms should install dependencies from `package-lock.json`.

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Editable content

Most personal content is centralized in [`src/data/portfolio.ts`](src/data/portfolio.ts). The remaining blank or placeholder values have intentionally been left as-is so they can be replaced manually.

- Identity, role, location, About text, links, résumé timeline, and contact data are in `portfolio.identity`, `portfolio.links`, `portfolio.resume`, and `portfolio.contact`.
- The four Works project panels are in `portfolio.works`. Project 1 currently has `public/assets/portfolio-cover.png`; Projects 2–4 retain cover-photo placeholders until their images are supplied.
- Project descriptions, links, tech stacks, and tags can be edited in each Work item.
- The candid section is in `portfolio.whyNotHire`; `photoUrl` is still blank until a personal photo is supplied.
- Scene sticker/logo assets live in `public/assets/`.
- The route declaration is `public/manus-routes.json`.

See [`TODO.md`](TODO.md) for the remaining content fields.

## Included assets

The package includes the supplied character artwork, NIMS University artwork, résumé milestone logos, and the current Project 1 cover image. Replace or add assets in `public/assets/`, then update the corresponding `/assets/...` path in `src/data/portfolio.ts`.

## Notes

- `npm run typecheck` runs TypeScript checks only.
- `npm run build` runs TypeScript checks and the Vite production build.
- Do not commit `node_modules/`, local `.env` files, or generated deployment secrets.
