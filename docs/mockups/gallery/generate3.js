// Brutalist (06) with an expanded functional color system.
// Roles: LIME=primary/go, ORANGE=pro/advanced, RED=danger, DOG=brand accent.
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','concept-mono.html'),'utf8');
const dogD=src.match(/id="dogpath" d="([^"]*)"/)[1];
const DOGDEF=`<svg width="0" height="0" style="position:absolute"><defs><path id="dog" d="${dogD}"/></defs></svg>`;
const dog=(cls)=>`<svg class="${cls}" viewBox="585 290 1090 1390"><use href="#dog"/></svg>`;
const HEAD=`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Archivo:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{background:#050505;}
.s{position:relative;width:960px;height:544px;border-radius:9px;overflow:hidden;background:#0a0a0a;color:#e9e9e6;font-family:"Archivo",sans-serif;}
.mono{font-family:"IBM Plex Mono";}
/* role colors */
.c-lime{color:#c6f24e;}.c-orng{color:#ff8a3d;}.c-red{color:#ff5e5e;}.c-dog{color:#ffffff;}
.bg-lime{background:#c6f24e;color:#0a0a0a;}.bg-orng{background:#ff8a3d;color:#0a0a0a;}.bg-red{background:#ff5e5e;color:#0a0a0a;}.bg-dog{background:#ffffff;color:#0a0a0a;}
/* brutalist bar */
.bar{position:absolute;top:0;left:0;right:0;height:46px;display:flex;align-items:center;padding:0 20px;font-weight:800;font-size:19px;letter-spacing:1px;gap:11px;}
.bar svg{height:22px;}.bar .sp{flex:1;}.bar .r{font-family:"IBM Plex Mono";font-size:15px;}
</style>`;

const CHIPS=[['swash_type','H3-120','','dng'],['rotor_dir','CW','','dng'],['collective_pitch','12.0','deg','on'],['cyclic_pitch','8.0','deg',''],['swash_phase','0','deg',''],['swash_ring','100','%','']];
const PIDS=[['ROLL P','45',''],['ROLL I','80',''],['ROLL D','30',''],['PITCH P','48',''],['PITCH I','85',''],['PITCH D','34',''],['YAW P','70',''],['YAW I','45',''],['YAW CW','55','dng'],['I-DECAY','12',''],['ERR LIM','40',''],['HSI GAIN','80','dng']];

// ---------- screen builders (return inner html for a .s) ----------
function discipline(){return `
<div class="bar bg-lime"><svg viewBox="585 290 1090 1390" style="fill:#0a0a0a"><use href="#dog"/></svg>EVORA<span class="sp"></span><span class="r">EDIT / MAIN_ROTOR</span></div>
<div style="position:absolute;top:62px;left:24px;font-weight:900;font-size:54px;letter-spacing:-2px;">MAIN ROTOR</div>
<div style="position:absolute;top:140px;left:24px;right:24px;bottom:78px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;align-content:start;">
${CHIPS.map(c=>{const b=c[3]=='dng'?'#ff5e5e':c[3]=='on'?'#c6f24e':'#2a2a2a';const v=c[3]=='dng'?'#ff5e5e':c[3]=='on'?'#c6f24e':'#e9e9e6';return `<div style="border:3px solid ${b};padding:12px 15px;"><div class="mono" style="color:#5f6157;font-size:13px;">${c[0]}</div><div style="font-weight:900;font-size:34px;letter-spacing:-1px;color:${v};">${c[1]}<span style="font-size:15px;color:#5f6157;"> ${c[2]}</span></div></div>`}).join('')}
</div>
<div class="bar bg-orng" style="top:auto;bottom:0;height:60px;font-size:27px;font-weight:900;"><svg viewBox="0 0 24 24" style="fill:none;stroke:#0a0a0a;stroke-width:2.5;height:24px"><path d="M12 2 L22 20 H2 Z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r=".6"/></svg>PRO MODE<span class="sp"></span><span style="font-size:15px" class="mono">advanced — handle with care ▸</span></div>`;}

function protune(){return `
<div class="bar bg-orng"><svg viewBox="0 0 24 24" style="fill:none;stroke:#0a0a0a;stroke-width:2.5;height:22px"><path d="M12 2 L22 20 H2 Z"/><line x1="12" y1="9" x2="12" y2="14"/></svg>PRO MODE<span class="sp"></span><span class="r">PID TUNING · PROFILE 2</span></div>
<div style="position:absolute;top:60px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:baseline;">
<div style="font-weight:900;font-size:40px;letter-spacing:-1px;">PID <span class="c-orng">TUNING</span></div>
<div class="mono" style="color:#5f6157;font-size:15px;">12 of 73 params · main_rotor</div></div>
<div style="position:absolute;top:126px;left:24px;right:24px;bottom:24px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;align-content:start;">
${PIDS.map(p=>{const dng=p[2]=='dng';return `<div style="border-left:5px solid ${dng?'#ff5e5e':'#ff8a3d'};background:#121212;padding:11px 14px;display:flex;justify-content:space-between;align-items:center;"><span class="mono" style="color:#8a8f82;font-size:15px;">${p[0]}</span><span style="font-weight:900;font-size:30px;color:${dng?'#ff5e5e':'#e9e9e6'};">${p[1]}</span></div>`}).join('')}
</div>`;}

function edithub(){const D=[['ESC / MOTOR','set'],['MAIN ROTOR','sel'],['SWASHPLATE','warn'],['TAIL ROTOR','set'],['GOVERNOR','off'],['FLIGHT TUNING','set']];
return `<div class="bar"><svg viewBox="585 290 1090 1390" style="fill:#ffffff"><use href="#dog"/></svg><span class="c-dog">EVORA</span><span style="color:#e9e9e6"> EDIT MODEL</span><span class="sp"></span><span class="r c-dog">06 DISCIPLINES</span></div>
<div style="position:absolute;top:64px;left:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:4px;background:#202020;">
${D.map((d,i)=>{const sel=d[1]=='sel';const warn=d[1]=='warn';return `<div style="background:${sel?'#c6f24e':'#0a0a0a'};color:${sel?'#0a0a0a':'#e9e9e6'};padding:18px 20px;display:flex;flex-direction:column;justify-content:space-between;"><div style="display:flex;justify-content:space-between;"><span style="font-weight:900;font-size:54px;line-height:.8;color:${sel?'rgba(0,0,0,.22)':'#2a2a2a'};">${String(i+1).padStart(2,'0')}</span><span style="color:${warn?'#ff5e5e':sel?'#0a0a0a':'#ffffff'};font-size:14px;">●</span></div><div style="font-weight:800;font-size:23px;letter-spacing:-.5px;color:${warn&&!sel?'#ff5e5e':'inherit'};">${d[0]}</div></div>`}).join('')}
</div>`;}

function identity(){return `
<div class="bar"><svg viewBox="585 290 1090 1390" style="fill:#43e0e6"><use href="#dog"/></svg><span class="c-dog">EVORA</span><span class="sp"></span><span class="r" style="color:#5f6157;">STANDBY · 14:32</span></div>
<div style="position:absolute;left:30px;top:96px;font-weight:900;font-size:120px;letter-spacing:-6px;line-height:.8;">EVO<span class="c-lime">RA</span></div>
<div class="mono" style="position:absolute;left:34px;top:236px;color:#5f6157;font-size:18px;letter-spacing:3px;">OPEN HELI OS · 0.3.0</div>
<div style="position:absolute;right:20px;top:70px;width:250px;height:340px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;"><svg viewBox="585 290 1090 1390" style="fill:#ffffff;filter:drop-shadow(0 0 18px rgba(255,255,255,.22))"><use href="#dog"/></svg></div>
<div style="position:absolute;left:30px;bottom:30px;display:flex;gap:0;">
<div class="bg-lime" style="font-weight:800;font-size:26px;padding:14px 26px;">NEW MODEL</div>
<div style="font-weight:800;font-size:26px;padding:14px 26px;border:3px solid #e9e9e6;border-left:0;">EDIT</div></div>`;}

// set dog fill color in identity (right-side big dog) to brand cyan
// emit board
const LEGEND=[['#c6f24e','LIME','PRIMARY','go · active · live values'],['#ff8a3d','ORANGE','PRO MODE','advanced · expert tuning'],['#ff5e5e','RED','DANGER','crash-risk values · locked'],['#ffffff','WHITE','EVORA','the dog · brand accent']];
const BOARD_CSS=`
.board{width:1010px;padding:26px;font-family:"IBM Plex Mono";}
.legend{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;}
.lg{border:1px solid #2a2a2c;border-radius:10px;overflow:hidden;background:#101010;}
.lg .sw{height:42px;}
.lg .tx{padding:10px 14px;}
.lg .rl{font-family:"Archivo";font-weight:800;font-size:20px;color:#e9e9e6;}
.lg .rl b{font-weight:800;}
.lg .us{color:#6f7269;font-size:13px;margin-top:2px;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:22px;}
.cell .cl{color:#8a8f82;font-size:16px;margin:0 0 8px 2px;}
.cell .fr{width:456px;height:258px;overflow:hidden;border-radius:9px;border:1px solid #2a2a2c;}
.cell .fr .s{transform:scale(.475);transform-origin:top left;border-radius:0;}
.swatches{margin-top:24px;border-top:1px solid #232323;padding-top:18px;}
.swatches .h{color:#e9e9e6;font-family:"Archivo";font-weight:800;font-size:21px;margin-bottom:14px;}
.swrow{display:flex;gap:18px;}
.sw3{flex:1;border:1px solid #2a2a2c;border-radius:12px;background:#0d0d0d;padding:18px;display:flex;align-items:center;gap:18px;}
.sw3 svg{height:84px;}
.sw3 .lbl b{font-family:"Archivo";font-weight:800;font-size:24px;}
.sw3 .lbl .hex{color:#6f7269;font-size:15px;margin-top:3px;}
.sw3.pick{border-color:#43e0e6;}`;

const cells=[
 {cl:'discipline — lime active · red danger · ORANGE pro bar', s:discipline()},
 {cl:'PRO MODE — orange = expert territory', s:protune()},
 {cl:'edit model — dog glyph in brand cyan', s:edithub()},
 {cl:'identity — dog in brand color + lime', s:identity()},
].map(c=>`<div class="cell"><div class="cl">${c.cl}</div><div class="fr"><div class="s">${c.s}</div></div></div>`).join('\n');

const legendHtml=LEGEND.map(l=>`<div class="lg"><div class="sw" style="background:${l[0]}"></div><div class="tx"><div class="rl">${l[1]} <span style="color:${l[0]}">— ${l[2]}</span></div><div class="us">${l[3]}</div></div></div>`).join('');

const DOGS=[['#ffffff','WHITE','#ffffff','clean · neutral · always legible','pick'],['#43e0e6','CYAN','#43e0e6','electric · instrument',''],['#a378ff','VIOLET','#a378ff','bold · premium','']];
const swHtml=DOGS.map(d=>`<div class="sw3 ${d[4]}"><svg viewBox="585 290 1090 1390" style="fill:${d[0]}"><use href="#dog"/></svg><div class="lbl"><b style="color:${d[0]}">${d[1]}</b><div class="hex">${d[2]} ${d[4]?'· recommended':''}</div><div class="hex" style="color:#8a8f82">${d[3]}</div></div></div>`).join('');

const html=`${HEAD}<style>${BOARD_CSS}</style></head><body>${DOGDEF}
<div class="board">
<div class="legend">${legendHtml}</div>
<div class="grid2">${cells}</div>
<div class="swatches"><div class="h">DOG / BRAND ACCENT — pick a number</div><div class="swrow">${swHtml}</div></div>
</div></body></html>`;
fs.writeFileSync(path.join(__dirname,'board-06x.html'),html);
console.log('wrote board-06x.html');
