---
name: Avaliação Psicomotora
description: The child's own caderneta, a blue booklet with a milestone grid and a growth-curve sheet, built for one therapist on a tablet.
colors:
  blue: "#1e5f8c"
  blue-deep: "#154a6e"
  blue-ink: "#123f5e"
  blue-tint: "#e3eef5"
  blue-wash: "#eef4f8"
  sun: "#f2b630"
  sun-ink: "#3b2a00"
  paper: "#f3f7fa"
  sheet: "#ffffff"
  ink: "#1b2b36"
  ink-2: "#4b5e6c"
  ink-3: "#5c6e7b"
  line: "#d6e2ea"
  line-strong: "#b9cbd7"
  ok: "#24804f"
  ok-tint: "#e2f2e8"
  dev: "#b07a00"
  dev-ink: "#7d5700"
  dev-tint: "#fbf0d2"
  no: "#b0473a"
  no-tint: "#f8e6e2"
  domain-mf: "#2f7fc1"
  domain-mg: "#d2513c"
  domain-ee: "#2e9467"
  domain-ed: "#c58a00"
  domain-en: "#8457b5"
  domain-es: "#9c5f2c"
  domain-la: "#cc4f8a"
typography:
  display:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  headline:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  item:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 800
    lineHeight: 1.5
  meta:
    fontFamily: "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  pill: "99px"
  booklet: "6px 16px 16px 6px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  sheet-x: "28px"
  page-x: "40px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.sheet}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.blue-deep}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.blue-wash}"
  button-sun:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.sun-ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "48px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
    height: "50px"
  sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.lg}"
    padding: "24px 28px"
  rail:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.sheet}"
    width: "232px"
  rail-link-active:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.md}"
    height: "48px"
  booklet-cover:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.booklet}"
    padding: "22px 20px 20px 34px"
  stamp:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    height: "72px"
    width: "128px"
  stamp-realiza:
    backgroundColor: "{colors.ok-tint}"
    textColor: "#165536"
  stamp-desenvolvimento:
    backgroundColor: "{colors.dev-tint}"
    textColor: "{colors.dev-ink}"
  stamp-nao-realiza:
    backgroundColor: "{colors.no-tint}"
    textColor: "#8a3329"
  step:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "44px"
  chip:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "36px"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
  badge-draft:
    backgroundColor: "{colors.dev-tint}"
    textColor: "{colors.dev-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  badge-done:
    backgroundColor: "{colors.ok-tint}"
    textColor: "#1a5e3a"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
---

# Design System: Avaliação Psicomotora

## Overview

**Creative North Star: "The Caderneta da Criança"**

The app is the child's own health booklet. Caderneta blue is the booklet's cover. It owns the navigation rail, the patient header band and the booklet covers on the patient list. Inside, content sits on white sheets laid on a cool blue-white paper. Each chart is printed like a growth-curve page: banded fills, a fine graph-paper grid, and the age bands marked along the top. Answers are stamped onto the page as shaped marks, never as bare colour.

The density is set for a therapist holding a tablet while she watches a child. Targets are large (48px buttons, 72px answer stamps), there is one family and one heavy weight, and numbers are tabular everywhere. The tone is warm without going soft. The warmth comes from Nunito Sans's rounded forms, the blue-tinted shadows and a single sun-yellow accent, not from cream paper or illustration. The system rejects the cold white-card clinic dashboard. The Painel is one sheet divided by hairlines, not a grid of floating cards.

**Key Characteristics:**
- Blue booklet chrome around white sheets on cool paper (never cream).
- One family, Nunito Sans, at weight 800 for every heading, value and label; tabular numerals.
- Answer stamps: a shape, a word and a colour, always all three.
- Seven fixed domain inks, used only to identify a domain.
- Growth-curve sheet charts with printed bands and graph-paper grid.
- Soft, blue-tinted, two-layer shadows; flat everywhere else.

## Colors

A cool caderneta-blue world with one warm accent and a three-step answer scale, plus seven fixed domain inks reserved for data.

### Primary
- **Caderneta Blue** (blue): the booklet cover. Rail background, patient cover band, booklet covers, primary buttons, the selected age band, progress fill, links and the caret.
- **Spine Blue** (blue-deep): the hover state for primary buttons, the booklet spine strip, and the alternate age-band segment printed above the chart.
- **Cover Ink** (blue-ink): blue text on light ground, used for secondary button labels, big score numerals, the active rail link and the active tab.
- **Blue Tint** (blue-tint) / **Blue Wash** (blue-wash): avatars, plain badges, the active tab counter (tint), and hover rows, notes, the age box, suggestion items and meter tracks (wash).

### Secondary
- **Sun** (sun): the one warm accent. It marks the single most urgent action in a view ("Fazer backup", "Nova avaliação" on the cover), the draft tab on a booklet cover, the logo spine, and the focus outline on blue surfaces (rail, cover band, booklet covers); on paper and sheets the focus outline is Cover Ink. The label on Sun is always **Sun Ink** (sun-ink), never white.

### Tertiary (answer scale)
- **Realiza Green** (ok) on **ok-tint**: the answer "Realiza", completed badges and positive deltas.
- **Development Amber** (dev, text dev-ink) on **dev-tint**: the answer "Em desenvolvimento", draft badges, the backup banner and warnings.
- **Não-realiza Brick** (no) on **no-tint**: the answer "Não realiza", negative deltas, errors and destructive buttons.

### Domain inks
Motricidade fina (domain-mf), Motricidade grossa (domain-mg), Equilíbrio estático (domain-ee), Equilíbrio dinâmico (domain-ed), Engatinhar (domain-en), Escalar (domain-es), Lateralidade (domain-la). The source of truth is `DOMINIOS` in `src/lib/domain.ts`.

### Neutral
- **Cool Paper** (paper): the app ground behind every sheet, and the active tab that cuts into the cover band.
- **Sheet White** (sheet): sheets, inputs, stamps, chips and booklet name plates.
- **Ink** (ink): body text, the "Geral" curve and ledger row, the selected chip, toasts and tooltips.
- **Ink 2** (ink-2): secondary text and descriptions. **Ink 3** (ink-3): hints, item codes and meta text.
- **Line** (line): hairline dividers between rows and sheet sections. **Line Strong** (line-strong): control borders and unanswered marks.

### Named Rules
**The Caderneta Blue Rule.** Blue is the booklet's cover and belongs to chrome: rail, cover band, booklet covers, primary action, selected state. Content is never set on a blue sheet. It lives on white sheets over cool paper.

**The Seven Inks Rule.** Each domain keeps its ink everywhere: chart line, dot, meter, active step, heading swatch, PDF legend. Domain inks identify a domain and nothing else. Never use them for status, chrome or decoration. The overall score ("Geral") is always Ink and always the heaviest line.

**The One Sun Rule.** Sun yellow appears at most once per view as an action. Everything else in yellow is a marker (draft tab, logo spine).

## Typography

**Display Font:** Nunito Sans Variable (with Nunito Sans, system-ui, sans-serif)
**Body Font:** the same family
**PDF:** Helvetica / Helvetica-Bold (see Do's and Don'ts)

**Character:** a single rounded humanist sans that carries the whole system through weight alone. Weight 800 does the work other systems hand to a second family, so the result reads friendly but sure-footed.

### Hierarchy
- **Display** (800, 44px, 1): the overall score numeral on the Painel.
- **Headline** (800, 32px page title; 36px on the patient cover; 28px domain heading in the runner; 26-28px on phones): one per screen.
- **Title** (800, 20px): sheet headings, the runner title and dialog titles.
- **Item** (700, 18px, 1.35): questionnaire item text and patient names in lists. Both are read at arm's length during a session.
- **Body** (400, 16px, 1.5): running text. Input text stays at 16px.
- **Label** (800, 14-15px): field labels, buttons (15px), steps and stamps (13px).
- **Meta** (700, 12-13px): item codes, data labels on covers and id boxes, counters.

### Named Rules
**The Weight-Not-Family Rule.** Hierarchy comes from size and weight 800 inside one family. Do not add a second typeface.

**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set at the root. Scores, dates and counts always align in columns.

**The Sentence-Case Rule.** Labels are sentence case at natural tracking. Only headings get the -0.01em tightening.

## Layout

On desktop the app is a two-column shell: a sticky Caderneta Blue rail (232px) and a main column. Pages are centred at 1120px max width (760px for narrow forms), padded 32px on top and 40px on the sides. A patient screen opens with a full-width blue cover band: back link, name, an id box of facts, actions at the top right, and tabs whose active tab takes the paper colour so it reads as a page pulled from the booklet.

The Painel is one sheet (`folha`) whose sections are separated by hairlines. Below the chart it splits 1.35fr / 1fr (comparison chart beside the ledger). The patient list is a fill grid of booklet covers (min 280px). In the assessment runner, a sticky translucent paper header (progress bar plus a wrapping row of domain steps) sits above the item list. Each item row is the item text with three 128px stamps beside it.

Rhythm: gaps of 10, 16 and 20px between controls and blocks. Sheets are padded 24px × 28px. List rows are padded 16-18px × 24px.

Responsive behaviour:
- At 1080px or less, the dashboard and the Painel split collapse to one column.
- At 900px or less, item rows stack the stamps under the text (stamps fill thirds) and the age bands go to 3 columns.
- At 760px or less, the rail becomes a fixed bottom tab bar (56px targets, icon over label). Page padding drops to 16px, headings step down, and the booklet covers go to a single column.

## Elevation & Depth

The system is mostly flat, with a quiet paper-stack depth. Sheets sit on the paper with a soft, blue-tinted two-layer shadow. Stronger lift is reserved for things that are chosen or in front: the selected age band, dialogs, toasts and a hovered booklet cover. Sections inside a sheet are separated by 1px hairlines, never by nested shadows.

### Shadow Vocabulary
- **Sheet** (`0 1px 2px rgba(18,63,94,0.06), 0 4px 14px rgba(18,63,94,0.06)`): every sheet at rest.
- **Lift** (`0 2px 4px rgba(18,63,94,0.08), 0 12px 28px rgba(18,63,94,0.12)`): selected band, dialog, toast.
- **Booklet** (`0 2px 3px rgba(18,63,94,0.12), 0 10px 24px rgba(18,63,94,0.14)`). On hover the cover rises 3px and the shadow deepens to `0 4px 6px …0.12, 0 18px 36px …0.2`.

### Named Rules
**The Blue Shadow Rule.** Shadows are tinted with Cover Ink (rgba 18,63,94), never neutral black, and always come in two soft layers.

## Shapes

Corners are gently rounded on a three-step scale: 6px for small parts and focus outlines, 10px for controls, stamps, notes and boxes, 16px for sheets and dialogs. Pills (99px) are used for steps, chips, badges, counters, meters and the progress bar. The booklet cover has its own silhouette: a tight 6px spine-side corner and 16px open-side corners, a darker 18px spine strip with a light seam, and two metal staple rings on the spine. Avatars are circles, and so are answer marks.

## Components

### Buttons
Big, heavy-labelled and calm.
- **Shape:** 10px corners, 48px minimum height (40px small, 44px square icon button).
- **Secondary (default):** white with a Line Strong border and a Cover Ink label. On hover the border turns blue over a Blue Wash fill.
- **Primary:** solid Caderneta Blue, white label, hairline shadow. Hover is Spine Blue.
- **Sun:** Sun fill, Sun Ink label, darker amber border. For the single urgent action.
- **Ghost / Danger / Danger solid:** transparent with a wash hover; a Brick label with a no-tint hover; solid Brick for confirmed destruction.
- **On the cover band:** secondary buttons turn transparent with a 35% white border.
- **Press:** translateY(1px). Transitions run 0.18s on the out-expo ease.

### Answer Stamps (signature)
Three stamps per item, 128 × 72px (thirds on narrow screens). Each holds a mark over its word. Unanswered stamps are white with a 1.5px Line Strong border. A chosen stamp fills with its tint, takes a doubled border in its colour (border plus 1px inset), and its mark scales to 1.12. Marks: **Realiza** is a solid green disc with a white check; **Em desenvolvimento** is an amber ring half-filled on the right; **Não realiza** is a brick ring with a horizontal dash; unanswered is a dashed grey ring. The PDF uses the same marks.

### Booklet Cover (signature)
Each patient is a blue booklet: a white name plate (name 19px/800, birth date), the facts in light-blue meta labels, and the overall score at 22px on the right. A Sun tab on the top edge marks a draft.

### Growth-Curve Sheet (signature chart)
Line chart on a 0-100% scale. The background alternates green (rgba(46,148,103,0.075)) and amber (rgba(242,182,48,0.07)) bands every 10 points, under a 2-point blue graph-paper grid (10 points on narrow plots). A strip above the plot is printed in alternating Caderneta Blue and Spine Blue with an 800/11px white label per age band, and a dashed Ink-soft rule marks each band change. Domain lines are 1.75px at 80% alpha. "Geral" is a 4.5px Ink line with 5px points. On first draw the curve rises from the baseline. The comparison bar chart ramps Caderneta Blue from light (oldest) to strong (newest), with values printed above bars on wide screens.

### Cards / Containers (Sheets)
- **Corner Style:** 16px.
- **Background:** Sheet White on Cool Paper, with a 1px Line border.
- **Shadow Strategy:** Sheet shadow (see Elevation).
- **Internal Padding:** 24px × 28px (18px × 16px on phones). Rows and sections inside are divided by Line hairlines. The overall ("Geral") row closes with a 2px Ink rule.

### Inputs / Fields
- **Style:** white, 1px Line Strong border, 10px corners, 50px tall, 16px text. Labels sit above at 14px/800. Hints are 13px Ink 3.
- **Focus:** the border turns blue and gains a 3px blue halo (rgba(30,95,140,0.18)).
- **Error:** a 14px/700 Brick line below the field.

### Chips, Steps and Badges
- **Steps (runner):** 44px pills. Each shows the domain dot, a short name and a count. The active step fills with that domain's ink and its text turns white.
- **Chips (suggestion filters):** 36px pills. Pressed chips are solid Ink.
- **Badges:** 13px/800 pills in the answer tints: draft (amber), done (green), plain (blue).

### Navigation
The rail on Caderneta Blue holds the logo mark and name, then 48px links (700, light blue). Hover is 8% white. The active link is a white tab with a Cover Ink label. An offline note is pinned at the foot. On phones the rail becomes a bottom bar of three equal 56px icon-over-label tabs. Patient tabs on the cover band are 50px with top-rounded corners, and the active one takes the paper colour.

## Do's and Don'ts

### Do:
- **Do** put content on white sheets over Cool Paper (#f3f7fa), and keep Caderneta Blue for chrome and the primary action.
- **Do** give every answer, status or delta a shape or word as well as its colour (the stamp marks, the +/− signs on deltas).
- **Do** keep each domain on its fixed ink from `DOMINIOS` everywhere it appears, including the PDF.
- **Do** keep session controls at 44px or more (buttons 48px, stamps 72px, steps 44px).
- **Do** draw evolution on the growth-curve sheet: banded fills, graph-paper grid, and an age-band strip above the plot.
- **Do** separate the Painel's parts with hairlines inside one sheet.

### Don't:
- **Don't** use cream or warm-tinted paper. The paper is cool blue-white.
- **Don't** build the white-card clinic dashboard: no grid of separate KPI cards, and no neutral grey shadows.
- **Don't** use a domain ink for status, buttons or decoration.
- **Don't** put more than one Sun action in a view, or white text on Sun.
- **Don't** add a second typeface, uppercase tracked labels, or non-tabular numerals.
- **Don't** read the chart's green and amber bands as clinical zones. They are sheet material, and their alpha stays under 0.08.
