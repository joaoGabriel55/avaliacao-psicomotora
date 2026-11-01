---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# App shell (all screens)

Scope: the whole PWA (pacientes, avaliação, painel, relatório, backup, configurações). Mode: Operate.
Audience/job: one therapist, tablet during session; answer items fast, then show evolution and build a parent PDF.
Constraints: offline, local-only data, big targets, not cold/hospital, not dense, pt-BR.
Memorable moment: the evolution chart drawn as a caderneta growth-curve sheet.

## Direction contract

THESIS: The app is the child's own caderneta: a booklet with a cover, a milestone grid and a growth-curve sheet. Refuses the white-card clinic dashboard.

OWN-WORLD: Caderneta blue (#1E5F8C) owns the shell rail and headers; paper is cool white (#F6F9FB), never cream; ink #1B2B36. Curve-sheet greens/ambers band the charts. Seven domain inks fixed. Marks are stamped tokens: ✓-mark circle (Realiza), half-circle (Em desenvolvimento), empty ring with dash (Não realiza), always with text. Nunito Sans, tabular numerals.

STORY: She opens a patient's booklet, starts a new assessment, taps one stamp per item domain by domain, finishes, sees the curve rise, exports the PDF.

FIRST VIEWPORT: Blue left rail (Pacientes, Configurações, Backup). Patient list as booklet covers: name plate, birth date, age, last score. In a patient: header band with plate, tabs Painel / Avaliações; primary "Nova avaliação" top right.

FORM: Caderneta da Criança, my #1 candidate (pick card); seed a16a719d.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
