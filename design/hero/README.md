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

**Anna is the mobile** (Ezra, 2026-10-27, after the desk-stack round): the figure is the
visitor, never Anna, so Anna needs a body that is not a person. The knot where the threads
meet is a paper disc with her mark (HTML, so the #530 logo drops in). Every beat connects to
it: the ask (the coral card flies from the hand to the knot, the knot flashes), the work
(an arm lights from the knot outward, and only then does that tray's sheet lift off the
desk), the return (the stamped folder comes down from the knot onto the stack). Her mark is
on the knot, the tag and the folder, never on the figure.

Until 2026-10-27 the stack hung in a navy sling above the desk (the pile handed to Anna).
Ezra asked why the work came out of a pile instead of being lifted off the desk; the desk
stack is the answer. A "asks before she acts" beat (a small card coming back down before
the sheets move) was discussed and parked: add it only if the loop feels too automatic.

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

Layer order, back to front: plate, mobile (threads, arms, knot, trays), stack, sheets,
folder, seated figure, card. The desk is in the plate. The thread, the arms, their coral
pulses, the knot and the card are drawn in code so they can move and so the mark and the
colour stay exact.

## Loop (about 12 s, first motion within 2 s of load)
1. The ask: seated-2 (card up) for 0.8 s; the card leaves the hand and flies to the knot
   over 1.2 s; seated-1. At 2.0 s the knot flashes a coral ring: Anna has it.
2. The work: every 0.9 s from 2.0 s an arm pulses coral from the knot to its tray (0.6 s),
   then that tray's sheet lifts off the desk stack and glides into it (1.2 s); the tray
   tilts and settles. The stack thins as they go. Sheets fade out of the trays about 5 s
   after they left the desk.
3. The return: at 8.0 s the folder, stamped with Anna's mark, comes down from the knot onto
   the stack (1.5 s); seated-3 (holding folder) for 1 s; back to seated-1. The stack is
   whole again before the loop restarts.
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
