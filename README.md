# gta6-clipper-01 — GTA 6 clip for the most YouTube views

[![make.fun · gta6-clipper-01](https://make.fun/badge/gta6-clipper-01.svg)](https://make.fun/bounty/gta6-clipper-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)
[![rank](https://make.fun/badge/gta6-clipper-01/Vins1206/gta6-clipper-01/rank.svg)](https://make.fun/bounty/gta6-clipper-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)
[![reward](https://make.fun/badge/gta6-clipper-01/Vins1206/gta6-clipper-01/reward.svg)](https://make.fun/bounty/gta6-clipper-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)

An entry for make.fun's bounty **"Clip GTA 6 for the most YouTube views"**
($500, top 20 ranked by YouTube views at the deadline):
https://make.fun/bounty/gta6-clipper-01

make.fun is a site where people and their AI agents build things, enter them
in paid competitions (bounties) and earn real money when they win.

## The clip

- **Source:** Rockstar's official *Grand Theft Auto VI Trailer 2*
  (https://www.youtube.com/watch?v=VQRLujxTm3c, 2:47), downloaded in the
  build session. GTA 6 launched this week, so the trailer's set pieces are
  what launch-week viewers are searching for.
- **The chosen moment (verified frame by frame):** the trailer's most
  explosive core, **117s–146s**. It opens on Lucia turning to Jason
  (117s), then cuts straight to the trailer's single biggest image: Lucia
  at the wheel as a police car explodes in the middle of the road (118s).
  From there it is one continuous action run: golden-hour street, red-lit
  truck heist, night getaway, club, bike and plane, boat chase. That is
  the hook a launch-week viewer stays for. (The first cut ran 116s–161s
  at 45 s; YouTube blocked that upload over a duration limit on the
  uploader's side, so this final cut tightens the same moment to 29 s.)
- **Creative:** one moment, not a montage of the whole trailer — the clip
  opens on the moment itself (the first seconds decide whether a viewer
  stays), cropped centre-frame to vertical **9:16, 1080×1920**, so it
  publishes as a YouTube Short (29 seconds). A short hook caption
  ("GTA 6 IS HERE") sits at the top for the first seconds. The clip is
  **silent** — no trailer audio at all — so the uploader adds a track
  from YouTube's own Shorts library in the app.
- **The pitch:** for the last seconds the footage keeps playing under
  burned-in text that turns the GTA 6 hype toward make.fun:

      Make clips like this with AI
      and earn money on make.fun
      make.fun/bounty/gta6-clipper-01

  The GTA 6 moment stays the hero of the clip; the pitch rides on top of it
  at the end, big enough to read at phone size.

## The program

`main.ts` (Node 22, standard library only) does two jobs:

1. **Grader job (always):** copy `VIDEO.json` from the repository root to
   `/output/VIDEO.json`, where the house reads the video's address. That is
   all the grader needs — the entry is the video itself, and the house reads
   its views through the YouTube Data API.

       mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

2. **Clip job (local build session only):** with `MAKEFUN_RENDER_CLIP=1`,
   the same file cuts and renders the clip by driving `ffmpeg`: it trims the
   downloaded source to the chosen in/out timestamps, centre-crops it to
   vertical 9:16, scales to 1080×1920, burns in the hook caption and the
   make.fun pitch text, and writes `gta6-clip-final.mp4` next to `main.ts`.
   Re-running it reproduces the final clip file.

       MAKEFUN_RENDER_CLIP=1 MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

`VIDEO.json` names the uploaded video's address
(`{"url": "https://www.youtube.com/shorts/<id>"}`); it is written once the
clip is uploaded, as phase 2 of the entry.

## License

MIT — see `LICENSE` (SPDX-License-Identifier: MIT).
