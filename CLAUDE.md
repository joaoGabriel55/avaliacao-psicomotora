# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Avaliação Psicomotora": an offline-first PWA for a single pediatric therapist to apply a psychomotor questionnaire (0–15 years), track each child's evolution, and generate a parent-facing A4 PDF. No backend, no login: all data lives in the browser's IndexedDB. UI and PDF are in Brazilian Portuguese; code identifiers are in Portuguese too (`paciente`, `avaliacao`, `faixa`, `dominio`, `respostas`).

- `SPEC.md` is the functional source of truth (item bank, scoring, PDF sections, acceptance criteria).
- `PRODUCT.md` holds product context; `DESIGN.md` + `.impeccable/design.json` hold the visual system ("Caderneta da Criança" world). Read DESIGN.md before UI changes.

## Commands

```bash
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build (type errors fail the build; tests are type-checked too)
npm run preview        # serve dist/ (needed to exercise the service worker)
npm run lint           # oxlint
npx vitest run                         # all tests (there is no npm test script)
npx vitest run src/lib/domain.test.ts  # one file
npx vitest run -t "faixa sugerida"     # one test by name
npx vercel@latest deploy --prod --yes  # deploy (project already linked: .vercel/)
```

Production: https://avaliacao-psicomotora.vercel.app (static Vite output on Vercel).

## Architecture

**Questionnaire data.** `src/data/questionario.json` (versioned, `versao`) holds 5 age bands (A–E) with items `{codigo, dominio, texto}`. It was generated from the tables in SPEC.md; item codes (`C-MF-1` = band + domain + n) are how answers and the PDF item-by-item table link the same question across assessments. Editing the questionnaire means editing this JSON (not editable in-app by design); bump `versao` when items change, since each `Avaliacao` stores `versaoQuestionario`.

**Domain logic — `src/lib/domain.ts`.** Types, the 7 domains with their fixed chart colors (`DOMINIOS`), age/band math (`idadeEmMeses`, `faixaSugerida`), scoring (`pontuar`: domain % = sum ÷ (2 × items) × 100, overall = mean of the 7 unrounded domains, then rounded), `itensPendentes`, and the auto sentence for the PDF (`maiorAvanco`). Scoring by percentage is what lets charts compare assessments across different bands. Dates are stored as `AAAA-MM-DD` strings, not `Date`.

**Persistence — `src/lib/db.ts`.** Dexie with tables `pacientes`, `avaliacoes` (indexed by `pacienteId`, `status`), and a single-row `config` (`id: 'config'`, therapist info, logo as data URL, and `concluidasNoUltimoBackup`, which drives the "back up every 5 completed assessments" banner in `App.tsx`). Schema changes need a new `db.version(n)` and a matching update to the zod schema in `backup.ts`.

**Backup — `src/lib/backup.ts`.** zod-validated JSON export/import; import replaces all tables in one transaction. Any new persisted field must be added to the zod schema or it will be rejected/lost on restore.

**Pages** use `useLiveQuery` and `HashRouter` (hash routing keeps static hosting and the SW simple). `pages/Avaliacao.tsx` keeps the assessment in local state and persists every change (answers immediately, text debounced 500 ms, flushed on unmount); an assessment is a `rascunho` until every item of its band is answered, then `concluida`. Band and date are fixed at creation in `NovaAvaliacao.tsx`.

**Charts — `src/lib/charts.ts`.** Chart.js config builders shared by the app and the PDF. Custom canvas plugins draw the caderneta "curve sheet" (band fills + graph-paper grid), the printed age-band strip with a dashed rule where the band changes, and bar value labels. `opts.estatico` disables animation/responsiveness; `graficoComoImagem` renders a config offscreen to a PNG data URL for the PDF.

**PDF — `src/pdf/Relatorio.tsx`.** `@react-pdf/renderer` document (7 sections, fixed footer, built-in Helvetica). It is dynamically imported from `pages/Relatorio.tsx` because the chunk is ~1.2 MB; `vite.config.ts` raises `workbox.maximumFileSizeToCacheInBytes` so that chunk is still precached and PDFs work offline. If the PDF chunk grows past that limit, offline PDF generation silently breaks.

**PWA.** `vite-plugin-pwa` with `registerType: 'autoUpdate'`. After a deploy, installed clients get the new version on the second launch. Icons in `public/` were rendered from the logo SVG in `components/ui.tsx`.

## Conventions

- Answers are always shown as icon + text (`Marca` in `components/ui.tsx` and in the PDF), never color alone — a SPEC requirement.
- Styling is one global stylesheet, `src/index.css`, with tokens on `:root`; no CSS framework. Mobile breakpoint is 760px (rail becomes a bottom bar), 1080px collapses two-column layouts.
- Demo/test data must be labeled as example ("Exemplo: …"); never fabricate clinical claims.
