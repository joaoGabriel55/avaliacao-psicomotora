# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite, vite-plugin-pwa, Dexie (IndexedDB), Chart.js, @react-pdf/renderer, zod, Vitest. Static hosting (Vercel, Netlify or GitHub Pages). Pinned by SPEC.md and the user's request ("React com PWA").

## Users

One pediatric psychomotor therapist. She applies an observational questionnaire to children aged 0–15 during sessions, mostly on a tablet held or set beside her while the child moves, and also on phone and desktop. Secondary audience: the parents who receive the PDF report and read it without clinical vocabulary.

## Product Purpose

Apply a 7-domain psychomotor questionnaire across 5 age bands, track each child's evolution as per-domain percentages, and produce a parent-facing A4 PDF report. Success: an assessment filled in under 10 minutes during a session, and a report parents understand.

## Positioning

A private, single-therapist instrument: all data stays on the device (LGPD, children's health data), no login, no server, works offline. Percent-per-domain scoring lets evolution compare across age bands even when the items change.

## Operating Context

- Used live during therapy sessions: the therapist watches the child, then taps one of three answers (Realiza / Em desenvolvimento / Não realiza). Large tap targets matter.
- Drafts save automatically; completion requires every item answered.
- The PDF is printed or sent to parents by the therapist outside the app.
- Backup is a manual JSON export; the app reminds every 5 completed assessments.

## Capabilities and Constraints

- Full functional spec, item bank and scoring rules: `SPEC.md`.
- Questionnaire lives in a versioned JSON in code; not editable in-app.
- Recommendations: free text plus a ready-made suggestion library per domain (authored as a starting set; therapist may insert and edit).
- Out of scope: login, cloud, multiple professionals, email/WhatsApp, population norms.
- Not a validated standardized scale; must be stated in the report.
- No PIN/password (confirmed).

## Brand Commitments

- Name: neutral and descriptive, "Avaliação Psicomotora". No invented brand.
- No existing visual identity; the therapist's own logo appears only in the PDF via Settings.
- Must not feel cold/hospital-like, and must not be dense on the tablet.
- Interface and PDF in Brazilian Portuguese.

## Evidence on Hand

Only SPEC.md. No real patient data, testimonials or clinical validation; never fabricate them. Any demo data must be labeled as example.

## Product Principles

1. The session comes first: the child, not the screen, has the therapist's attention.
2. Nothing leaves the device.
3. Parents must understand the report without a glossary.
4. Answers are always text + icon, never color alone.

## Accessibility & Inclusion

Large touch targets for tablet use; meaning never carried by color alone (explicit in SPEC for the PDF, applied to the app as well).
