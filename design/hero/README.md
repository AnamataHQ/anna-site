# Paper hero: source of the assets in `public/hero/`

Direction chosen by Ezra on 2026-10-27 after five sketch rounds (reports and contact sheets
in the session handoff). The hero is a paper-craft diorama: a pale off-white paper room with
a window on the right; a small paper figure seated at a desk, seen from behind, raises one
coral card (the ask); a thick stack of paper in a navy sling hangs above the desk; from one
knot a thread mobile holds five paper trays, each with one work object (clock, calendar,
envelope, ID card, folder: the systems); sheets peel off the stack into the trays; one slim
folder drifts back down to the desk (done, returned). The window is the light source, not an
exit: the work never leaves the room, it comes back done.

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
  may light briefly when a sheet travels. The relay mark goes small on the sling's tag.
- A paper tag on the sling is a real HTML element (translatable), never text in the image.

## Files
| file | what | role in the page |
|---|---|---|
| plate-morning / plate-midday / plate-afternoon.webp | the empty room with desk and cup, three lights | cross-faded by the real sun altitude (vlieger method) |
| sling.webp | navy sling with the stack, no thread | hangs from a code-drawn thread; sways, lifts |
| tray-1..5.webp | clock, calendar, envelope, ID card, folder | hang from the mobile; tilt when a sheet lands |
| seated-1..3.webp | figure on its chair, seen from behind at eye level: hands on desk; arm up with coral card; holding folder | pose swap, stop-motion style; chair included, so no separate chair layer |
| sheet-1..5.webp, sheet-6.webp | five loose sheets; sheet-6 is the slim folder | glide from stack to trays; the folder drifts down |
| chair.webp | spare: the empty chair seen from behind at eye level | only if a pose without the figure is ever needed |

Layer order, back to front: plate, sling, trays, sheets, seated figure, folder. The desk is in
the plate. The thread, the knot and the mobile arms are drawn in code so they can move.

## Loop (about 12 s, first motion within 2 s of load)
1. seated-2 (card up) for 0.8 s, then seated-1.
2. The sling takes the weight: rises a hand's width over 1.2 s, thread goes taut.
3. Five sheets peel off one at a time (every 0.9 s) and glide to a tray; the tray tilts and
   settles; its thread brightens for 300 ms.
4. The folder descends to the desk over 1.5 s; seated-3 (holding folder) for 1 s; back to
   seated-1.
Ambient, always: sling sways 2–3 degrees, window light patch follows the real sun (plates),
paper fibres drift in the beam, grain over everything. Reduced motion: one static frame with
the folder on the desk.

## Generation record (Higgsfield, 2026-10-27)
Sketch: seedream_v5_pro, 16:9, image reference = round-five paper sketch (job
a6b5eba8-bf96-44ce-b844-77d2a38c056a); chosen take job 2f17d9ae-4fe8-435a-9fc7-58fe34c726bd.
Plates and sprites: seedream_v5_pro with the chosen take as `image_references`:
- plates: 6e282180 (morning), ff854338 (midday), ae36e0fe (afternoon)
- sling 70599559, trays sheet 89b2c0f0, sheets 26247a4b; seated figure sheet c63e20b9 and
  spare chair f39c59bb (both from directly behind at eye level; the first chair take,
  2289ef0b, was seen from above and rejected by Ezra)
Backgrounds removed with `image_background_remover`; sheets split by alpha column runs
(`cut-sprites.sh` in the session scratchpad; re-create: ImageMagick `-alpha extract`,
column profile, crop runs, `-trim`). WebP at quality 82 (plates, 2400 px) and 85 (sprites).
Whole day's spend: about 75 credits.

Prompt pattern for a new sprite: "In the exact paper-craft style of this reference: <one
object>, seen <angle>. Isolated on a flat pure white background, no thread, no shadow on the
ground, nothing else. Visible paper edges, soft shading. No text, no lettering, no logos."
