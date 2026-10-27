# Paper hero: source of the assets in `public/hero/`

Direction chosen by Ezra on 2026-10-27 after five sketch rounds (reports and contact sheets
in the session handoff). The hero is a paper-craft diorama: a pale off-white paper room with
a window on the right; a small paper figure (the visitor, not Anna) seated at a desk, seen
from behind, raises one coral card (the ask); a thick stack of paper, tagged "for Anna", lies
on the desk; from one knot a thread mobile holds five paper trays, each with one work object
(clock, calendar, envelope, ID card, folder: the systems); sheets lift off the desk stack into
the trays; one slim folder, stamped with Anna's mark, drifts back down onto the stack (done,
returned). The window is the light source, not an exit: the work never leaves the room, it
comes back done.

Until 2026-10-27 the stack hung in a navy sling above the desk (the pile handed to Anna).
Ezra asked why the work came out of a pile instead of being lifted off the desk; the desk
stack is the answer, kept if it conveys the idea better. Anna's identity stays on the objects
(tag, returned folder), never on the figure: the figure is the visitor's chair.

`sketch-approved-2026-10-27.png` is the frame Ezra picked ("right one"). Everything in
`public/hero/` was generated from it as style reference.

## Decisions recorded here (Ezra, 2026-10-27)
- Brand on the site: "Anna" (not uppercase ANNA); relay mark stays until the #530 logo lands.
- Slack may be named alongside Teams (Slack POC works since 19 Oct).
- CTA is early access, not "Book a demo". No hours-saved figures. No prices.
- Headline carries Peter's line: "Anna does the work nobody should waste time on."
  Sub: "Ask her in Teams or Slack. She connects to the systems your work lives in, asks
  before she acts, and reports back." Both EN and NL still need Ezra's verbatim approval.
- Palette: off-white paper, navy sling (#041524 family), sky-blue trays with the brand's
  yellow and teal, one coral card (#E15857), no lilac. The page from it is light, navy text,
  coral action.
- The brand README says the design system prevails unless a deliverable has an explicitly
  approved alternative: this paper direction is that approved alternative for anna-site.
- No neural-network diagram. The thread mobile from one knot is the only "network"; a thread
  may light briefly when a sheet travels. The relay mark goes small on the stack's tag and
  as a stamp on the returned folder.
- A paper tag on the stack is a real HTML element (translatable), never text in the image.

## Files
`public/hero/` holds the served versions: plates at 2400 px, sprites re-encoded at about twice
their largest on-screen size (figure 360 px, trays 320 px, stack 300 px, sheets 170 px). The
full-resolution originals, straight from generation, are in `design/hero/source/`; regenerate
a served sprite from there with ImageMagick (`convert <src> -resize <w>x -quality 85
-define webp:alpha-quality=90 <dst>`).

| file | what | role in the page |
|---|---|---|
| plate-morning / plate-midday / plate-afternoon.webp | the empty room with desk and cup, three lights | cross-faded by the real sun altitude (vlieger method) |
| stack.webp | the stack of work on the desk | sits at the left end of the desk; thins while sheets are away; carries the tag |
| tray-1..5.webp | clock, calendar, envelope, ID card, folder | hang from the mobile; tilt when a sheet lands |
| seated-1..3.webp | figure on its chair, seen from behind at eye level: hands on desk; arm up with coral card; holding folder (2 and 3 generated from 1 as reference, so figure and chair match) | pose swap, stop-motion style; chair included, so no separate chair layer |
| sheet-1..5.webp, sheet-6.webp | five loose sheets; sheet-6 is the slim folder | glide from stack to trays; the folder drifts down |
| chair.webp | spare: the empty chair seen from behind at eye level | only if a pose without the figure is ever needed |

Layer order, back to front: plate, trays, stack, sheets, folder, seated figure. The desk is in
the plate. The thread, the knot and the mobile arms are drawn in code so they can move.

## Loop (about 12 s, first motion within 2 s of load)
1. seated-2 (card up) for 0.8 s, then seated-1.
2. Five sheets lift off the desk stack one at a time (every 0.9 s from 2.0 s) and glide to a
   tray; the tray tilts and settles; its thread brightens for 300 ms. The stack thins as
   they go.
3. The folder, stamped with Anna's mark, descends from the folder tray onto the stack over
   1.5 s; seated-3 (holding folder) for 1 s; back to seated-1. The stack is whole again
   before the loop restarts.
Ambient, always: the mobile sways, window light patch follows the real sun (plates), grain
over everything. Reduced motion: one static frame with the folder on the desk.

## Generation record (Higgsfield, 2026-10-27)
Sketch: seedream_v5_pro, 16:9, image reference = round-five paper sketch (job
a6b5eba8-bf96-44ce-b844-77d2a38c056a); chosen take job 2f17d9ae-4fe8-435a-9fc7-58fe34c726bd.
Plates and sprites: seedream_v5_pro with the chosen take as `image_references`:
- plates: 6e282180 (morning), ff854338 (midday), ae36e0fe (afternoon)
- trays sheet 89b2c0f0, sheets 26247a4b; seated figure sheet c63e20b9 (pose 1 is cut from
  it) and spare chair f39c59bb (both from directly behind at eye level; the first chair
  take, 2289ef0b, was seen from above and rejected by Ezra); the sling (70599559) was
  retired on 2026-10-27
- desk stack 80d75d87 (1:1, chosen take as reference); seated-2 7bb13c13 and seated-3
  bd693a7e regenerated with seated-1 uploaded as `image_references` ("this exact figure on
  this exact chair ... identical except the pose"), so the chair legs scale the same figure
Backgrounds removed with `image_background_remover`; sheets split by alpha column runs
(`cut-sprites.sh` in the session scratchpad; re-create: ImageMagick `-alpha extract`,
column profile, crop runs, `-trim`). WebP at quality 82 (plates, 2400 px) and 85 (sprites).
Whole day's spend: about 75 credits on 2026-10-27 morning; the desk-stack round added 7.5.

Prompt pattern for a new sprite: "In the exact paper-craft style of this reference: <one
object>, seen <angle>. Isolated on a flat pure white background, no thread, no shadow on the
ground, nothing else. Visible paper edges, soft shading. No text, no lettering, no logos."
