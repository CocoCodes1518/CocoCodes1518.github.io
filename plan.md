# Senbuzy Portfolio — Implementation Plan

## Product scope

A single-page English portfolio inspired by `about.senbuzy.com`, using the user's supplied character and facts without copying the reference creator's personal claims or assets. The page is a film-grain, editorial poster-like experience with a fixed full-screen Three.js scene behind semantic scrolling HTML: Hero/About → five resume focus stops → a pinned horizontal Works gallery → candid closing → Contact.

## Design direction

- **Design movement:** Film-grain 3D resume / digital-craft editorial.
- **Core principles:** restrained poster staging; content-paced camera movement; sparse metadata; honest editable placeholders.
- **Color philosophy:** soft sage-to-sand scene warmth against midnight ink and ivory content, with restrained apricot for focus and links.
- **Layout paradigm:** full-viewport fixed 3D canvas with editorial HTML rails rather than a conventional centered portfolio grid.
- **Signature elements:** fine moving grain, plus-sign frame marks with monospaced metadata, and flat milestone decals printed on the face.
- **Interaction philosophy:** scrolling scrubs the camera journey; pointer movement guides the pupils; work rows open an accessible detail dialog.
- **Animation:** smooth camera interpolation and restrained portrait turns; reduced-motion mode removes pointer/camera motion and keeps the content readable.
- **Typography:** expressive serif/script display treatment for section headings paired with compact monospaced/uppercase metadata and readable system sans body text.
- **Brand essence:** a candid software-developer portfolio for collaborators who value thoughtful craft; personal, precise, quietly playful.
- **Brand voice:** specific, self-aware, and honest. Example lines: “It’s still not perfect. It’s very good though.” and “Please hire me!”
- **Wordmark / mark concept:** the owner name is carried by the editorial frame and face decals rather than a separate generic logo.
- **Signature brand color:** apricot `#ffd9b3` used sparingly for focus dots, links, and scene accents.

## Implementation

- `src/App.tsx` owns the page shell, hero controls, scroll-to-scene state, reduced-motion preference, and fixed canvas.
- `src/scene/Scene.tsx` builds a shallow-relief mesh from the supplied transparent character PNG, overlays the unchanged NIMS University logo as the first number-free sticker, and creates five resume camera focus stops plus a Works camera frame.
- `src/data/portfolio.ts` is the single editable source for identity, links, resume chapters, Works entries, candid reasons, and contact details. Unknown user facts remain placeholders.
- `src/ui/Resume.tsx`, `Works.tsx`, `WhyNotHire.tsx`, and `Contact.tsx` provide semantic content sections. Works includes keyboard focus restoration, Escape handling, and a focus-trapped modal dialog.
- `src/styles.css` provides the fixed scene, editorial frame, timeline, pinned horizontal gallery, candid close, contact layout, mobile breakpoints, focus states, and reduced-motion rules.
- `public/assets/` contains the migrated user-supplied portrait/eye image and NIMS reference screenshot used by the scene.
- `public/manus-routes.json` declares the `/` page route.
- Vite serves on `0.0.0.0:3000`; the production build is emitted to `dist/`.

## Material constraints

The supplied character is a front-view relief, not a faithful 360-degree model; camera turns stay restrained. Do not invent biography, project claims, contact details, a GitHub URL, a resume file, additional milestone logos, or a personal photo. Replace placeholders only when the user supplies accurate content.
