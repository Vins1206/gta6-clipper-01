// gta6-clipper-01 entry (Node 22, standard library only).
//
// Two jobs, one file:
//   1. Grader job (always): copy VIDEO.json from the repository root to
//      /output/VIDEO.json, where the house reads the video's address. That is
//      all the grader needs. Outside the grader, MAKEFUN_BOT_DIR and
//      MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//        mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//   2. Clip job (only when MAKEFUN_RENDER_CLIP=1, i.e. the local build
//      session): cut and render the vertical clip itself by driving ffmpeg
//      from the downloaded Rockstar source footage, so re-running this file
//      reproduces the final clip file:
//        MAKEFUN_RENDER_CLIP=1 MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The clip: one high-hype moment from Rockstar's Grand Theft Auto VI Trailer 2
// (https://www.youtube.com/watch?v=VQRLujxTm3c), cropped to vertical 9:16
// (1080x1920), with a short hook caption at the top, then make.fun's pitch
// burned in as on-screen text for the last PITCH_SECONDS seconds:
//   "Make clips like this with AI"
//   "and earn money on make.fun"
//   "make.fun/bounty/gta6-clipper-01"
// No network, no wall clock, no files outside this repository are touched.

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync as spawn } from 'node:child_process';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// --- The cut: one moment, chosen in the build session. ---------------------
// Source: Rockstar's Grand Theft Auto VI Trailer 2 (2:47, 1280x720 with
// audio), downloaded in the build session and verified frame by frame.
// Why this moment: the trailer's climax run, 116s-161s. It opens on the
// "we're really doing this" beat — Jason walks in and Lucia turns to him
// (116s-117s) — then cuts straight to the trailer's single biggest image,
// Lucia at the wheel as a police car explodes in the middle of the road
// (118s). From there it is one continuous action montage: golden-hour
// street, red-lit truck heist, night getaway, club, bike and plane, boat
// chase, sunset cityscape, and the "VI" title card. That is the hook a
// launch-week viewer stays for, and it ends on black where the pitch reads.
// Timestamps are seconds into Trailer 2.
const SOURCE_FILE = 'source.mp4';
const CLIP_START = 116; // Jason walks in; Lucia turns to him
const CLIP_END = 161; // end of the "VI" logo, before the title card
const PITCH_SECONDS = 13; // pitch text on screen for the last 13 s
const CLIP_FILE = 'gta6-clip-final.mp4';
const FONT_FILE =
  process.env.CLIP_FONT ??
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

function renderClip(): void {
  const source = join(BOT_DIR, SOURCE_FILE);
  if (!existsSync(source)) {
    throw new Error(`source footage not found: ${source} (download it first)`);
  }
  if (!existsSync(FONT_FILE)) {
    throw new Error(`drawtext font not found: ${FONT_FILE}`);
  }
  const duration = CLIP_END - CLIP_START;
  if (duration <= 0 || duration > 60) {
    throw new Error(`clip must be 1-60 s, got ${duration} s`);
  }
  const pitchFrom = duration - PITCH_SECONDS;
  // Landscape 1280x720 -> vertical 9:16: centre-crop the middle 405 px
  // wide (720 * 9/16), then scale up to 1080x1920. The money shots are all
  // centre-frame (the explosion, the truck heist, the boat chase), so the
  // centre crop keeps them. Pitch lines are fontsize 60 so the longest
  // line fits the 1080 px width; drawtext text uses plain words, no quotes.
  const vf = [
    'crop=405:720:(in_w-405)/2:0',
    'scale=1080:1920',
    'fps=30',
    // Hook caption, first 4 s: the game is out now.
    `drawtext=fontfile=${FONT_FILE}:text='GTA 6 IS HERE':fontsize=58:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=120:enable='between(t,0,4)'`,
    // make.fun pitch, last PITCH_SECONDS seconds, lower-middle safe area.
    `drawtext=fontfile=${FONT_FILE}:text='Make clips like this with AI':fontsize=60:fontcolor=white:borderw=3:bordercolor=black:box=1:boxcolor=black@0.55:boxborderw=28:x=(w-text_w)/2:y=h*0.60:enable='between(t,${pitchFrom},${duration})'`,
    `drawtext=fontfile=${FONT_FILE}:text='and earn money on make.fun':fontsize=60:fontcolor=white:borderw=3:bordercolor=black:box=1:boxcolor=black@0.55:boxborderw=28:x=(w-text_w)/2:y=h*0.67:enable='between(t,${pitchFrom},${duration})'`,
    `drawtext=fontfile=${FONT_FILE}:text='make.fun/bounty/gta6-clipper-01':fontsize=44:fontcolor=white:borderw=2:bordercolor=black:box=1:boxcolor=black@0.55:boxborderw=20:x=(w-text_w)/2:y=h*0.74:enable='between(t,${pitchFrom},${duration})'`,
  ].join(',');
  const out = join(BOT_DIR, CLIP_FILE);
  const args = [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(CLIP_START), '-to', String(CLIP_END),
    '-i', source,
    '-vf', vf,
    '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    out,
  ];
  console.log(`rendering ${CLIP_FILE}: Trailer 2 ${CLIP_START}s-${CLIP_END}s -> 1080x1920, pitch last ${PITCH_SECONDS}s`);
  const res = spawn('ffmpeg', args, { stdio: 'inherit' });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`ffmpeg exited with status ${res.status}`);
  const probe = spawn('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,duration', '-of', 'csv=p=0', out,
  ], { encoding: 'utf8' });
  if (probe.status === 0) console.log(`clip: ${out} (${probe.stdout.trim()})`);
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const videoJson = join(BOT_DIR, 'VIDEO.json');
  if (existsSync(videoJson)) {
    copyFileSync(videoJson, join(OUTPUT_DIR, 'VIDEO.json'));
  } else if (process.env.MAKEFUN_RENDER_CLIP === '1') {
    // Phase 1: no VIDEO.json yet (the video is uploaded after the clip is
    // rendered). The render below is the work; the copy happens in phase 2.
    console.log('VIDEO.json not present yet (phase 1); skipping the copy.');
  } else {
    console.error(`VIDEO.json could not be copied from ${BOT_DIR}: file not found`);
    process.exit(1);
  }
  if (process.env.MAKEFUN_RENDER_CLIP === '1') renderClip();
}

main();
