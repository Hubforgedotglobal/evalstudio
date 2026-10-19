// Helper: node public/brand/logo-concepts/build.mjs (run from artifacts/evalstudio)
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const dir = path.dirname(new URL(import.meta.url).pathname);
const buf = fs.readFileSync(path.join(dir, '..', 'Inter-Bold.woff'));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const C = { ink: '#1f1d22', paper: '#faf7f0', yellow: '#FFD93D', purple: '#7B68EE', lime: '#A8E86D', coral: '#FF6B6B', lilac: '#e6e1fc' };

// wordmark: returns {d1,d2,w}
function word(size) {
  font.letterSpacing = 0;
  const a = font.getPath('Eval', 0, size * 0.76, size, { letterSpacing: -0.03 });
  const aw = font.getAdvanceWidth('Eval', size, { letterSpacing: -0.03 }) - size * 0.01;
  const b = font.getPath('Studio', aw, size * 0.76, size, { letterSpacing: -0.03 });
  const w = aw + font.getAdvanceWidth('Studio', size, { letterSpacing: -0.03 });
  return { d1: a.toPathData(2), d2: b.toPathData(2), w };
}

const icons = {
  loop: {
    name: 'Learning Loop', file: 'learning-loop',
    draw(m) {
      const tile = m === 'mono' ? 'none' : m === 'dark' ? C.yellow : C.yellow;
      const fg = m === 'monoLight' ? C.paper : C.ink;
      const acc = m === 'mono' || m === 'monoLight' ? fg : C.coral;
      return `${tile === 'none' ? '' : `<rect x="2" y="2" width="60" height="60" rx="18" fill="${tile}"/>`}<path d="M13 32H51A19 19 0 1 0 43 47.5" fill="none" stroke="${fg}" stroke-width="9" stroke-linecap="round"/><path d="M53.5 38.5 50.4 53.8 38.6 42.3Z" fill="${acc}" stroke="${fg}" stroke-width="${acc === fg ? 0 : 3}" stroke-linejoin="round"/>`;
    },
    word: [C.ink, C.purple], wordDark: [C.paper, C.yellow],
    story: 'The e is a feedback loop: draw a line, circle back, learn, and push the arrow forward again. Every eval cycle, in one stroke.',
    palette: 'Yellow tile, ink loop, coral arrow. Studio set in purple.',
  },
  maker: {
    name: "Maker's Mark", file: 'makers-mark',
    draw(m) {
      const mono = m === 'mono' || m === 'monoLight';
      const fg = m === 'monoLight' ? C.paper : C.ink;
      const fill = mono ? 'none' : C.lime;
      const bubble = 'M18 6H46A14 14 0 0 1 60 20V32A14 14 0 0 1 46 46H28L10 59 15 45A14 14 0 0 1 4 32V20A14 14 0 0 1 18 6Z';
      const bars = `<rect x="15" y="15" width="28" height="6.5" rx="3.25" fill="${fg}"/><rect x="15" y="23" width="18" height="6.5" rx="3.25" fill="${fg}"/><rect x="15" y="31" width="28" height="6.5" rx="3.25" fill="${fg}"/><circle cx="46" cy="26.2" r="5" fill="${mono ? fg : C.coral}" stroke="${mono ? 'none' : fg}" stroke-width="2.5"/>`;
      return `<path d="${bubble}" fill="${fill}" stroke="${fg}" stroke-width="${mono ? 5 : 4}" stroke-linejoin="round"/>${bars}`;
    },
    word: [C.ink, C.ink], wordDark: [C.paper, C.lime],
    story: 'A speech bubble that is secretly an E, with a blinking cursor dot that has not decided yet. Half meme, half workshop handout, all half-finished ideas welcome.',
    palette: 'Lime bubble, ink E bars, coral cursor. Single-colour ink wordmark.',
  },
  modular: {
    name: 'Modular E', file: 'modular-e',
    draw(m) {
      const mono = m === 'mono' || m === 'monoLight';
      const fg = m === 'monoLight' ? C.paper : C.ink;
      const st = m === 'color' ? `stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"` : '';
      const f = (c) => (mono ? fg : c);
      return `<rect x="6" y="6" width="17" height="52" rx="6" fill="${f(C.purple)}" ${st}/><rect x="27" y="6" width="31" height="15" rx="6" fill="${f(C.yellow)}" ${st}/><rect x="32" y="24.5" width="22" height="15" rx="7.5" fill="${f(C.coral)}" ${st}/><rect x="27" y="43" width="31" height="15" rx="6" fill="${f(C.lime)}" ${st}/>`;
    },
    word: [C.ink, C.purple], wordDark: [C.paper, C.lilac],
    story: 'Four small studios snap into one E. The middle module is pill-shaped and nudged out, still plugging in, so there is always room for the next one.',
    palette: 'The four HF colours as blocks, each a studio. Purple spine.',
  },
};

const modes = { color: [C.ink, null], dark: [C.paper, null] };
const icon = (k, m, size = 64, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img"${title ? ` aria-label="${title}"` : ''}>${icons[k].draw(m)}</svg>`;

function lockup(k, dark, mono) {
  const fs_ = 40, W = word(fs_), gap = 14, ic = 56, h = 64;
  const [c1, c2] = mono ? (dark ? [C.paper, C.paper] : [C.ink, C.ink]) : dark ? icons[k].wordDark : icons[k].word;
  const w = Math.ceil(ic + gap + W.w + 2);
  const im = mono ? (dark ? 'monoLight' : 'mono') : dark ? 'dark' : 'color';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * 3}" height="${h * 3}" role="img" aria-label="EvalStudio"><g transform="translate(0 4) scale(${ic / 64})">${icons[k].draw(im)}</g><g transform="translate(${ic + gap} ${(h - fs_ * 0.76) / 2 + 1})"><path d="${W.d1}" fill="${c1}"/><path d="${W.d2}" fill="${c2}"/></g></svg>`;
}

const files = [];
for (const k of Object.keys(icons)) {
  const f = icons[k].file;
  const out = {
    [`${f}-icon.svg`]: icon(k, 'color', 512),
    [`${f}-icon-mono.svg`]: icon(k, 'mono', 512),
    [`${f}-icon-mono-light.svg`]: icon(k, 'monoLight', 512),
    [`${f}-lockup.svg`]: lockup(k, false, false),
    [`${f}-lockup-dark.svg`]: lockup(k, true, false),
    [`${f}-lockup-mono.svg`]: lockup(k, false, true),
  };
  for (const [n, s] of Object.entries(out)) { fs.writeFileSync(path.join(dir, n), s + '\n'); files.push(n); }
}

const strip = (s) => s.replace(/ width="\d+(\.\d+)?" height="\d+(\.\d+)?"/, '');
const card = (k, i) => {
  const I = icons[k];
  return `<article class="concept c${i}">
<header><span class="num">0${i + 1}</span><div><h2>${I.name}</h2><p class="story">${I.story}</p></div></header>
<div class="hero">${strip(lockup(k, false, false))}</div>
<div class="row3">
<figure class="big">${strip(icon(k, 'color', 64, I.name + ' icon'))}<figcaption>Icon</figcaption></figure>
<figure class="tiny"><div class="t32">${icon(k, 'color', 32)}${icon(k, 'mono', 32)}<span class="ink">${icon(k, 'monoLight', 32)}</span></div><div class="t32 t16">${icon(k, 'color', 16)}${icon(k, 'mono', 16)}</div><figcaption>32px and 16px</figcaption></figure>
</div>
<div class="duo"><div class="dk">${strip(lockup(k, true, false))}</div><div class="mn">${strip(lockup(k, false, true))}</div></div>
<p class="pal">${I.palette}</p>
<p class="files">${I.file}-icon.svg, -icon-mono.svg, -icon-mono-light.svg, -lockup.svg, -lockup-dark.svg, -lockup-mono.svg</p>
</article>`;
};

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EvalStudio logo concepts</title><style>
*{box-sizing:border-box}html,body{margin:0}body{background:#faf7f0;color:#1f1d22;font-family:ui-sans-serif,system-ui,sans-serif;background-image:radial-gradient(circle at 1px 1px,rgba(31,29,34,.08) 1px,transparent 0);background-size:22px 22px;overflow-x:hidden}
svg{display:block;max-width:100%;height:auto}.wrap{width:min(1180px,100% - 28px);margin:0 auto;padding:36px 0 60px}
.top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:16px;border-bottom:3px solid #1f1d22;padding-bottom:20px;margin-bottom:28px}
h1{margin:0;font-size:clamp(2rem,6vw,3.6rem);letter-spacing:-.05em;line-height:1}.lede{margin:10px 0 0;max-width:52ch;line-height:1.5;color:#57525e}
.warn{display:inline-block;background:#FFD93D;border:2.5px solid #1f1d22;padding:8px 12px;font-weight:800;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;transform:rotate(-2deg)}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.concept{background:#fffdf8;border:3px solid #1f1d22;border-radius:24px;box-shadow:5px 5px 0 #1f1d22;padding:18px;display:flex;flex-direction:column;gap:14px;min-width:0}
header{display:flex;gap:12px;align-items:flex-start}.num{flex:none;font-weight:900;font-size:.85rem;background:#1f1d22;color:#faf7f0;border-radius:999px;padding:4px 10px}
h2{margin:0;font-size:1.6rem;letter-spacing:-.04em}.story{margin:6px 0 0;font-size:.92rem;line-height:1.45;color:#57525e}
.hero{background:#faf7f0;border:2px dashed #1f1d22;border-radius:16px;padding:22px 16px}
.row3{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0;border:2px solid #1f1d22;border-radius:16px;padding:12px;display:grid;gap:8px;align-content:space-between;min-width:0}
.big svg{width:min(100%,120px);margin:0 auto}figcaption,.pal,.files{font-size:.75rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#57525e}
.t32{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.t32 svg{width:32px;height:32px}.t16 svg{width:16px;height:16px}.ink{background:#1f1d22;border-radius:8px;padding:4px}
.duo{display:grid;gap:10px}.duo>div{border-radius:16px;padding:18px 16px}.dk{background:#1f1d22}.mn{border:2px solid #1f1d22}
.pal,.files{margin:0;text-transform:none;letter-spacing:0;font-weight:600}.files{font-family:ui-monospace,monospace;overflow-wrap:anywhere;font-size:.7rem}
.c0 .num{background:#7B68EE}.c1 .num{background:#FF6B6B;color:#1f1d22}.c2 .num{background:#A8E86D;color:#1f1d22}
.rec{margin-top:28px;border:3px solid #1f1d22;border-radius:20px;background:#e6e1fc;padding:18px 20px;line-height:1.5}.rec b{font-size:1.1rem}
@media (max-width:980px){.grid{grid-template-columns:1fr}.concept{max-width:640px;margin:0 auto;width:100%}}
@media (max-width:400px){.row3{grid-template-columns:1fr}.concept{padding:14px}}
</style></head><body><main class="wrap">
<div class="top"><div><h1>EvalStudio logo concepts</h1><p class="lede">Three directions for the HubForge studio mark. Pick one; the HF logo stays the parent brand. Wordmarks are outlined Inter Bold in the existing HF palette.</p></div><span class="warn">Original concepts, not trademark-cleared</span></div>
<div class="grid">${Object.keys(icons).map(card).join('\n')}</div>
<p class="rec"><b>Recommended: 02 Maker's Mark.</b> It reads as speech bubble and E at once, survives as a solid silhouette at 16px, and fits memes, printables and stickers equally, so it is not tied to one tool.</p>
</main></body></html>
`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log(files.concat('index.html').join('\n'));
