// Boards for the 3 finalists (01 TERMINAL, 06 BRUTALIST, 12 NIGHT FLIGHT).
// Each theme gets 4 screens: drawer, edit-hub, discipline, flight.
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','concept-mono.html'),'utf8');
const dogD=src.match(/id="dogpath" d="([^"]*)"/)[1];
const DOGDEF=`<svg width="0" height="0" style="position:absolute"><defs><path id="dog" d="${dogD}"/></defs></svg>`;
const dog=(cls)=>`<svg class="${cls}" viewBox="585 290 1090 1390"><use href="#dog"/></svg>`;
const HEAD=`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;600;700;800&family=Archivo:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{height:100%;background:#050505;display:flex;align-items:center;justify-content:center;}
.bezel{padding:15px;background:#141414;border:1px solid #2a2a2c;border-radius:18px;}
.s{position:relative;width:960px;height:544px;border-radius:9px;overflow:hidden;background:#0a0a0a;color:#e9e9e6;font-family:"IBM Plex Mono",monospace;}
.lime{color:#c6f24e;}.mut{color:#5f6157;}.red{color:#ff5e5e;}
</style>`;

// shared content
const DISC=[['esc_motor','ESC / MOTOR','set'],['main_rotor','MAIN ROTOR','set'],['swashplate','SWASHPLATE','warn'],['tail_rotor','TAIL ROTOR','set'],['governor','GOVERNOR','off'],['flight_tuning','FLIGHT TUNING','set']];
const CHIPS=[['swash_type','H3-120','dng'],['rotor_dir','CW','dng'],['collective_pitch','12.0','deg','on'],['cyclic_pitch','8.0','deg'],['swash_phase','0','deg'],['swash_ring','100','%']];

const SCR=[]; // {root, theme, key, label, style, body}

/* ================= 01 TERMINAL ================= */
const T1=`
.e1{font-family:"IBM Plex Mono";}
.e1 .top{display:flex;align-items:center;gap:12px;padding:15px 24px;border-bottom:1px solid #232323;font-weight:600;font-size:18px;letter-spacing:1px;}
.e1 .top svg{height:21px;fill:#c6f24e;}.e1 .sp{flex:1;}.e1 .top .m{color:#9a9a93;font-weight:500;}
.e1 .lead{padding:14px 24px 4px;color:#7f8175;font-size:18px;}`;
// drawer
SCR.push({root:'e1 e1d',theme:'01',key:'drawer',label:'app drawer (new / edit model + nav)',style:T1+`
.e1d .ghostwm{position:absolute;left:30px;top:150px;font-family:"IBM Plex Sans";font-weight:800;font-size:120px;color:#141414;letter-spacing:-4px;}
.e1d .scrim{position:absolute;inset:0;background:rgba(4,4,4,.55);}
.e1d .drw{position:absolute;top:0;right:0;bottom:0;width:430px;background:#0d0d0d;border-left:1.5px solid #c6f24e;padding:22px 24px;}
.e1d .dh{display:flex;align-items:center;gap:10px;font-weight:600;font-size:19px;letter-spacing:1px;margin-bottom:6px;}
.e1d .dh svg{height:20px;fill:#c6f24e;}.e1d .dh .sp{flex:1;}.e1d .dh .x{color:#5f6157;}
.e1d .it{border:1px solid #2f2f2f;background:#131313;padding:15px 18px;margin-top:13px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:24px;}
.e1d .it.on{border-color:#c6f24e;background:rgba(198,242,78,.08);color:#c6f24e;}
.e1d .it .k{color:#5f6157;font-size:18px;}
.e1d .sep{color:#5f6157;font-size:15px;letter-spacing:2px;margin:22px 0 4px;}
.e1d .nv{display:flex;justify-content:space-between;padding:13px 4px;border-bottom:1px solid #1c1c1c;font-size:21px;}
.e1d .nv .k{color:#5f6157;}`,
body:`<div class="ghostwm">EVORA</div><div class="scrim"></div>
<div class="drw"><div class="dh">${dog('')}<span class="lime">EVORA</span><span class="sp"></span><span class="x">✕</span></div>
<div class="it on">new_model<span class="k">↵</span></div>
<div class="it">edit_model<span class="k">→</span></div>
<div class="sep">// NAVIGATE</div>
<div class="nv">helicopters<span class="k">→</span></div>
<div class="nv">system<span class="k">→</span></div>
<div class="nv">bind_heli<span class="k">→</span></div>
<div class="nv">tools<span class="k">→</span></div></div>`});
// edit hub
SCR.push({root:'e1 e1h',theme:'01',key:'edithub',label:'edit model — disciplines',style:T1+`
.e1h .grid{position:absolute;top:104px;left:22px;right:22px;bottom:22px;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:14px;}
.e1h .t{border:1px solid #2a2a2a;background:#121212;padding:16px;display:flex;flex-direction:column;justify-content:space-between;}
.e1h .t .n{color:#5f6157;font-size:15px;}
.e1h .t .nm{font-weight:600;font-size:23px;margin-top:auto;}
.e1h .t .dot{font-size:14px;}.e1h .t .dot.set{color:#c6f24e;}.e1h .t .dot.warn{color:#ff5e5e;}.e1h .t .dot.off{color:#5f6157;}
.e1h .t.sel{border-color:#c6f24e;}`,
body:`<div class="top">${dog('')}<span class="lime">EVORA</span><span class="mut">/ EDIT</span><span class="sp"></span><span class="m">92% 14:32</span></div>
<div class="lead">// pick a discipline to set up</div>
<div class="grid">${DISC.map((d,i)=>`<div class="t ${d[0]=='main_rotor'?'sel':''}"><div style="display:flex;justify-content:space-between"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="dot ${d[2]}">●</span></div><div class="nm">${d[0]}</div></div>`).join('')}</div>`});
// discipline
SCR.push({root:'e1 e1c',theme:'01',key:'disc',label:'discipline — main_rotor + PRO',style:T1+`
.e1c .chips{position:absolute;top:104px;left:22px;right:22px;bottom:74px;display:grid;grid-template-columns:1fr 1fr;gap:13px;align-content:start;}
.e1c .c{border:1px solid #2a2a2a;background:#121212;padding:13px 16px;display:flex;flex-direction:column;gap:5px;}
.e1c .c.dng{border-color:#5a2626;}.e1c .c.on{border-color:#c6f24e;}
.e1c .c .k{color:#5f6157;font-size:15px;}
.e1c .c .v{font-weight:700;font-size:30px;line-height:1;}.e1c .c .v .u{font-size:16px;color:#5f6157;margin-left:4px;}
.e1c .c.dng .v{color:#ff7a7a;}.e1c .c.on .v{color:#c6f24e;}
.e1c .pro{position:absolute;bottom:0;left:0;right:0;height:56px;background:rgba(198,242,78,.08);border-top:1.5px solid #c6f24e;display:flex;align-items:center;justify-content:center;gap:12px;}
.e1c .pro .b{font-weight:700;font-size:22px;letter-spacing:2px;color:#c6f24e;}.e1c .pro .x{color:#7f9a3a;font-size:16px;}`,
body:`<div class="top">${dog('')}<span class="lime">EVORA</span><span class="mut">/ EDIT / main_rotor</span><span class="sp"></span><span class="m">92% 14:32</span></div>
<div class="lead">// the essentials — tap a value to change it</div>
<div class="chips">${CHIPS.map(c=>`<div class="c ${c[3]||(c[2]=='dng'?'dng':'')}"><span class="k">${c[0]}</span><span class="v">${c[1]}${c[2]&&c[2]!='dng'?`<span class="u">${c[2]}</span>`:''}</span></div>`).join('')}</div>
<div class="pro"><span class="b">[ PRO ]</span><span class="x">all main_rotor settings →</span></div>`});
// flight
SCR.push({root:'e1 e1f',theme:'01',key:'flight',label:'flight — live telemetry',style:T1+`
.e1f .top .armed{color:#c6f24e;border:1px solid #c6f24e;padding:2px 9px;font-size:14px;}
.e1f svg.dial{position:absolute;left:34px;top:120px;}
.e1f .big{position:absolute;left:84px;top:228px;width:240px;text-align:center;}
.e1f .big .n{font-family:"IBM Plex Sans";font-weight:700;font-size:64px;line-height:.9;color:#c6f24e;}
.e1f .big .u{color:#5f6157;font-size:16px;}
.e1f .r{position:absolute;left:380px;top:116px;right:30px;}
.e1f .pn{border:1px solid #232323;background:#101010;padding:15px 18px;margin-bottom:12px;}
.e1f .pl{display:flex;justify-content:space-between;align-items:baseline;}
.e1f .pl .k{color:#5f6157;font-size:15px;}.e1f .pl .v{font-family:"IBM Plex Sans";font-weight:700;font-size:32px;}
.e1f .bar{height:11px;background:#1c1c1c;margin-top:11px;position:relative;}.e1f .bar i{position:absolute;left:0;top:0;bottom:0;width:72%;background:#c6f24e;}
.e1f .row3{display:flex;gap:12px;}.e1f .cell{flex:1;border:1px solid #232323;background:#101010;padding:11px 14px;}
.e1f .cell .k{color:#5f6157;font-size:13px;}.e1f .cell .v{font-family:"IBM Plex Sans";font-weight:700;font-size:28px;margin-top:2px;}`,
body:`<div class="top">${dog('')}<span class="lime">EVORA</span><span class="mut">/ goblin_770 · bank_3</span><span class="sp"></span><span class="armed">ARMED</span><span class="m">14:32</span></div>
<svg class="dial" width="300" height="300" viewBox="0 0 300 300"><circle cx="150" cy="150" r="130" fill="none" stroke="#1f1f1f" stroke-width="16"/><path d="M 60 240 A 130 130 0 0 1 196 60" fill="none" stroke="#c6f24e" stroke-width="16"/><text x="150" y="200" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="#5f6157">HEADSPEED</text></svg>
<div class="big"><div class="n">1850</div><div class="u">rpm · gov hold</div></div>
<div class="r"><div class="pn"><div class="pl"><span class="k">PACK · 6s · 5500mah</span><span class="v">24.6<span style="font-size:17px;color:#5f6157">v</span></span></div><div class="bar"><i></i></div></div>
<div class="row3"><div class="cell"><div class="k">esc °c</div><div class="v">61</div></div><div class="cell"><div class="k">curr a</div><div class="v">38</div></div><div class="cell"><div class="k">thr %</div><div class="v lime">72</div></div></div>
<div class="pn" style="margin-top:12px"><div class="pl"><span class="k">flight_time</span><span class="v">04:31</span></div></div></div>`});

/* ================= 06 BRUTALIST ================= */
const T6=`
.e6{font-family:"Archivo",sans-serif;background:#0a0a0a;}
.e6 .bar{position:absolute;top:0;left:0;right:0;height:48px;background:#c6f24e;color:#0a0a0a;display:flex;align-items:center;padding:0 22px;font-weight:800;font-size:21px;letter-spacing:1px;gap:12px;}
.e6 .bar svg{height:24px;fill:#0a0a0a;}.e6 .bar .sp{flex:1;}.e6 .bar .r{font-family:"IBM Plex Mono";font-size:16px;}`;
// drawer
SCR.push({root:'e6 e6d',theme:'06',key:'drawer',label:'app drawer (slab menu)',style:T6+`
.e6d .wm{position:absolute;top:80px;left:26px;font-weight:900;font-size:150px;letter-spacing:-7px;color:#161616;line-height:.8;}
.e6d .drw{position:absolute;top:0;right:0;bottom:0;width:470px;background:#0d0d0d;border-left:5px solid #c6f24e;padding:30px 26px;}
.e6d .mh{font-weight:900;font-size:60px;letter-spacing:-1px;margin-bottom:18px;}
.e6d .it{font-weight:800;font-size:34px;padding:18px 22px;border:3px solid #e9e9e6;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;}
.e6d .it.on{background:#c6f24e;color:#0a0a0a;border-color:#c6f24e;}
.e6d .nv{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;}
.e6d .nv span{font-family:"IBM Plex Mono";font-size:18px;border:2px solid #333;padding:8px 14px;color:#aab0a6;}`,
body:`<div class="bar">${dog('')}EVORA<span class="sp"></span><span class="r">MENU</span></div>
<div class="wm">MENU</div>
<div class="drw"><div class="mh">MENU</div>
<div class="it on">NEW MODEL<span>↵</span></div>
<div class="it">EDIT MODEL<span>▸</span></div>
<div class="nv"><span>HELIS</span><span>SYSTEM</span><span>BIND</span><span>TOOLS</span></div></div>`});
// edit hub
SCR.push({root:'e6 e6h',theme:'06',key:'edithub',label:'edit model — disciplines',style:T6+`
.e6h .grid{position:absolute;top:66px;left:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:4px;background:#222;}
.e6h .t{background:#0a0a0a;padding:20px 22px;display:flex;flex-direction:column;justify-content:space-between;}
.e6h .t .num{font-weight:900;font-size:64px;line-height:.8;color:#2a2a2a;}
.e6h .t .nm{font-weight:800;font-size:26px;letter-spacing:-.5px;}
.e6h .t.sel{background:#c6f24e;color:#0a0a0a;}.e6h .t.sel .num{color:rgba(0,0,0,.25);}
.e6h .t.warn .nm{color:#ff5e5e;}.e6h .t.sel.warn .nm{color:#0a0a0a;}`,
body:`<div class="bar">${dog('')}EDIT MODEL<span class="sp"></span><span class="r">06 DISCIPLINES</span></div>
<div class="grid">${DISC.map((d,i)=>`<div class="t ${d[0]=='main_rotor'?'sel':''} ${d[2]=='warn'?'warn':''}"><div class="num">${String(i+1).padStart(2,'0')}</div><div class="nm">${d[1]}</div></div>`).join('')}</div>`});
// discipline
SCR.push({root:'e6 e6c',theme:'06',key:'disc',label:'discipline — MAIN ROTOR',style:T6+`
.e6c .h{position:absolute;top:66px;left:24px;font-weight:900;font-size:62px;letter-spacing:-2px;}
.e6c .chips{position:absolute;top:150px;left:24px;right:24px;bottom:80px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;align-content:start;}
.e6c .c{border:3px solid #2a2a2a;padding:14px 16px;}
.e6c .c.dng{border-color:#ff5e5e;}.e6c .c.on{border-color:#c6f24e;}
.e6c .c .k{font-family:"IBM Plex Mono";color:#5f6157;font-size:14px;}
.e6c .c .v{font-weight:900;font-size:38px;margin-top:6px;letter-spacing:-1px;}
.e6c .c.dng .v{color:#ff5e5e;}.e6c .c.on .v{color:#c6f24e;}.e6c .c .v .u{font-size:17px;color:#5f6157;}
.e6c .pro{position:absolute;left:0;right:0;bottom:0;height:62px;background:#c6f24e;color:#0a0a0a;display:flex;align-items:center;padding:0 24px;font-weight:900;font-size:30px;letter-spacing:1px;}
.e6c .pro .sp{flex:1;}`,
body:`<div class="bar">${dog('')}EVORA<span class="sp"></span><span class="r">EDIT / MAIN_ROTOR</span></div>
<div class="h">MAIN ROTOR</div>
<div class="chips">${CHIPS.map(c=>`<div class="c ${c[3]||(c[2]=='dng'?'dng':'')}"><div class="k">${c[0]}</div><div class="v">${c[1]}${c[2]&&c[2]!='dng'?`<span class="u"> ${c[2]}</span>`:''}</div></div>`).join('')}</div>
<div class="pro">PRO MODE<span class="sp"></span>▸</div>`});
// flight
SCR.push({root:'e6 e6f',theme:'06',key:'flight',label:'flight — live telemetry',style:T6+`
.e6f .hs{position:absolute;top:60px;left:24px;font-weight:900;font-size:260px;letter-spacing:-14px;line-height:.78;color:#c6f24e;}
.e6f .hsu{position:absolute;top:120px;right:34px;text-align:right;font-family:"IBM Plex Mono";color:#5f6157;font-size:20px;}
.e6f .blocks{position:absolute;left:24px;right:24px;bottom:24px;display:flex;gap:4px;background:#222;}
.e6f .bk{flex:1;background:#0a0a0a;padding:16px 18px;}
.e6f .bk .k{font-family:"IBM Plex Mono";color:#5f6157;font-size:14px;}
.e6f .bk .v{font-weight:900;font-size:44px;letter-spacing:-1px;}
.e6f .bk.l{background:#c6f24e;color:#0a0a0a;}.e6f .bk.l .k{color:rgba(0,0,0,.5);}`,
body:`<div class="bar">${dog('')}GOBLIN_770<span class="sp"></span><span class="r">● ARMED</span></div>
<div class="hs">1850</div><div class="hsu">RPM<br>HEADSPEED<br>GOV HOLD</div>
<div class="blocks"><div class="bk"><div class="k">PACK V</div><div class="v">24.6</div></div><div class="bk"><div class="k">ESC °C</div><div class="v">61</div></div><div class="bk l"><div class="k">THR %</div><div class="v">72</div></div><div class="bk"><div class="k">TIME</div><div class="v">4:31</div></div></div>`});

/* ================= 12 NIGHT FLIGHT ================= */
const T12=`
.e12{font-family:"IBM Plex Sans";background:#070a05;}
.e12 .top{display:flex;align-items:center;gap:11px;padding:18px 26px;font-family:"IBM Plex Mono";font-weight:600;font-size:17px;letter-spacing:1px;}
.e12 .top svg{height:22px;fill:#c6f24e;filter:drop-shadow(0 0 7px rgba(198,242,78,.6));}.e12 .sp{flex:1;}.e12 .top .m{color:#aeb4a6;}
.e12 .glow{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(198,242,78,.18),transparent 65%);pointer-events:none;}
.e12 .lead{padding:4px 26px;font-family:"IBM Plex Mono";color:#8a917f;font-size:17px;}`;
// drawer
SCR.push({root:'e12 e12d',theme:'12',key:'drawer',label:'app drawer (glow)',style:T12+`
.e12d .glow{right:120px;top:80px;width:360px;height:360px;}
.e12d .dogwm{position:absolute;right:70px;top:60px;height:420px;fill:#0a0d07;stroke:#c6f24e;stroke-width:2.5;opacity:.8;filter:drop-shadow(0 0 14px rgba(198,242,78,.35));}
.e12d .wm{position:absolute;left:46px;top:200px;font-weight:800;font-size:96px;letter-spacing:-4px;color:#11160c;}
.e12d .drw{position:absolute;top:0;right:0;bottom:0;width:430px;background:rgba(8,11,6,.92);border-left:1.5px solid #c6f24e;padding:24px 26px;}
.e12d .dh{display:flex;align-items:center;gap:10px;font-family:"IBM Plex Mono";font-weight:600;font-size:18px;margin-bottom:8px;}
.e12d .dh svg{height:19px;fill:#c6f24e;}.e12d .dh .sp{flex:1;}.e12d .dh .x{color:#5f6157;}
.e12d .it{border:1px solid #3a4a2c;background:rgba(10,13,7,.6);border-radius:9px;padding:16px 20px;margin-top:13px;display:flex;justify-content:space-between;align-items:center;font-family:"IBM Plex Mono";font-weight:600;font-size:24px;color:#cdd3c4;}
.e12d .it.on{border-color:#c6f24e;color:#c6f24e;box-shadow:0 0 22px rgba(198,242,78,.18);}
.e12d .sep{font-family:"IBM Plex Mono";color:#6f7d66;font-size:14px;letter-spacing:2px;margin:20px 0 4px;}
.e12d .nv{display:flex;justify-content:space-between;padding:13px 4px;border-bottom:1px solid #1b2415;font-family:"IBM Plex Mono";font-size:20px;color:#aeb4a6;}.e12d .nv .k{color:#5f6157;}`,
body:`<div class="glow"></div>${dog('dogwm')}<div class="wm">EVORA</div>
<div class="drw"><div class="dh">${dog('')}<span class="lime">EVORA</span><span class="sp"></span><span class="x">✕</span></div>
<div class="it on">new model<span>↵</span></div><div class="it">edit model<span>▸</span></div>
<div class="sep">NAVIGATE</div>
<div class="nv">helicopters<span class="k">→</span></div><div class="nv">system<span class="k">→</span></div><div class="nv">bind heli<span class="k">→</span></div><div class="nv">tools<span class="k">→</span></div></div>`});
// edit hub
SCR.push({root:'e12 e12h',theme:'12',key:'edithub',label:'edit model — disciplines',style:T12+`
.e12h .glow{left:300px;top:120px;width:420px;height:420px;}
.e12h .grid{position:absolute;top:104px;left:24px;right:24px;bottom:24px;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:16px;}
.e12h .t{border:1px solid #2a3a1f;border-radius:16px;background:rgba(14,18,10,.6);padding:18px 20px;display:flex;flex-direction:column;justify-content:space-between;}
.e12h .t .n{font-family:"IBM Plex Mono";color:#6f7d66;font-size:15px;}
.e12h .t .nm{font-weight:700;font-size:24px;}
.e12h .t .dot{font-size:13px;}.e12h .t .dot.set{color:#c6f24e;}.e12h .t .dot.warn{color:#ff5e5e;}.e12h .t .dot.off{color:#5f6157;}
.e12h .t.sel{border-color:#c6f24e;box-shadow:0 0 26px rgba(198,242,78,.16);}`,
body:`<div class="glow"></div>
<div class="top">${dog('')}<span class="lime">EVORA</span><span class="m">/ edit</span><span class="sp"></span><span class="m">92% 14:32</span></div>
<div class="lead">choose a discipline to set up</div>
<div class="grid">${DISC.map((d,i)=>`<div class="t ${d[0]=='main_rotor'?'sel':''}"><div style="display:flex;justify-content:space-between"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="dot ${d[2]}">●</span></div><div class="nm">${d[1].toLowerCase()}</div></div>`).join('')}</div>`});
// discipline
SCR.push({root:'e12 e12c',theme:'12',key:'disc',label:'discipline — main rotor',style:T12+`
.e12c .glow{left:280px;top:100px;width:400px;height:400px;}
.e12c .chips{position:absolute;top:104px;left:24px;right:24px;bottom:76px;display:grid;grid-template-columns:1fr 1fr;gap:14px;align-content:start;}
.e12c .c{border:1px solid #2a3a1f;border-radius:14px;background:rgba(14,18,10,.6);padding:14px 18px;display:flex;flex-direction:column;gap:5px;}
.e12c .c.dng{border-color:#5a2626;box-shadow:0 0 18px rgba(255,94,94,.12);}.e12c .c.on{border-color:#c6f24e;box-shadow:0 0 18px rgba(198,242,78,.16);}
.e12c .c .k{font-family:"IBM Plex Mono";color:#6f7d66;font-size:15px;}
.e12c .c .v{font-weight:700;font-size:32px;line-height:1;}.e12c .c .v .u{font-size:16px;color:#6f7d66;margin-left:4px;}
.e12c .c.dng .v{color:#ff7a7a;}.e12c .c.on .v{color:#c6f24e;}
.e12c .pro{position:absolute;bottom:0;left:0;right:0;height:58px;background:rgba(198,242,78,.1);border-top:1.5px solid #c6f24e;display:flex;align-items:center;justify-content:center;gap:12px;font-family:"IBM Plex Mono";}
.e12c .pro .b{font-weight:700;font-size:22px;letter-spacing:2px;color:#c6f24e;}.e12c .pro .x{color:#7f9a3a;font-size:16px;}`,
body:`<div class="glow"></div>
<div class="top">${dog('')}<span class="lime">EVORA</span><span class="m">/ edit / main rotor</span><span class="sp"></span><span class="m">92% 14:32</span></div>
<div class="lead">the essentials — tap a value to change it</div>
<div class="chips">${CHIPS.map(c=>`<div class="c ${c[3]||(c[2]=='dng'?'dng':'')}"><span class="k">${c[0]}</span><span class="v">${c[1]}${c[2]&&c[2]!='dng'?`<span class="u">${c[2]}</span>`:''}</span></div>`).join('')}</div>
<div class="pro"><span class="b">PRO</span><span class="x">all main rotor settings →</span></div>`});
// flight
SCR.push({root:'e12 e12f',theme:'12',key:'flight',label:'flight — live telemetry',style:T12+`
.e12f .glow{left:60px;top:90px;width:360px;height:360px;}
.e12f .top .armed{color:#c6f24e;border:1px solid #c6f24e;border-radius:4px;padding:2px 9px;font-size:14px;box-shadow:0 0 14px rgba(198,242,78,.2);}
.e12f svg.dial{position:absolute;left:40px;top:118px;filter:drop-shadow(0 0 16px rgba(198,242,78,.3));}
.e12f .big{position:absolute;left:90px;top:222px;width:240px;text-align:center;}
.e12f .big .n{font-weight:800;font-size:66px;line-height:.9;color:#c6f24e;text-shadow:0 0 24px rgba(198,242,78,.4);}
.e12f .big .u{font-family:"IBM Plex Mono";color:#8a917f;font-size:15px;}
.e12f .r{position:absolute;left:390px;top:120px;right:32px;}
.e12f .pn{border:1px solid #2a3a1f;border-radius:14px;background:rgba(14,18,10,.55);padding:16px 18px;margin-bottom:13px;}
.e12f .pl{display:flex;justify-content:space-between;align-items:baseline;}
.e12f .pl .k{font-family:"IBM Plex Mono";color:#6f7d66;font-size:15px;}.e12f .pl .v{font-weight:700;font-size:34px;}
.e12f .bar{height:11px;background:#1b2415;border-radius:6px;margin-top:11px;position:relative;overflow:hidden;}.e12f .bar i{position:absolute;left:0;top:0;bottom:0;width:72%;background:#c6f24e;box-shadow:0 0 12px rgba(198,242,78,.5);}
.e12f .row3{display:flex;gap:13px;}.e12f .cell{flex:1;border:1px solid #2a3a1f;border-radius:12px;background:rgba(14,18,10,.55);padding:12px 14px;}
.e12f .cell .k{font-family:"IBM Plex Mono";color:#6f7d66;font-size:13px;}.e12f .cell .v{font-weight:700;font-size:30px;margin-top:2px;}`,
body:`<div class="glow"></div>
<div class="top">${dog('')}<span class="lime">EVORA</span><span class="m">/ goblin 770</span><span class="sp"></span><span class="armed">ARMED</span><span class="m">14:32</span></div>
<svg class="dial" width="300" height="300" viewBox="0 0 300 300"><circle cx="150" cy="150" r="130" fill="none" stroke="#16210d" stroke-width="16"/><path d="M 60 240 A 130 130 0 0 1 196 60" fill="none" stroke="#c6f24e" stroke-width="16" stroke-linecap="round"/><text x="150" y="200" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="#6f7d66">HEADSPEED</text></svg>
<div class="big"><div class="n">1850</div><div class="u">rpm · gov hold</div></div>
<div class="r"><div class="pn"><div class="pl"><span class="k">pack · 6s · 5500mah</span><span class="v">24.6<span style="font-size:17px;color:#6f7d66">v</span></span></div><div class="bar"><i></i></div></div>
<div class="row3"><div class="cell"><div class="k">esc °c</div><div class="v">61</div></div><div class="cell"><div class="k">curr a</div><div class="v">38</div></div><div class="cell"><div class="k">thr %</div><div class="v lime">72</div></div></div></div>`});

// ---- emit individual screens ----
SCR.forEach(s=>{
  const html=`${HEAD}<style>${s.style}</style></head><body>${DOGDEF}<div class="bezel"><div class="s"><div class="${s.root}" style="position:absolute;inset:0">${s.body}</div></div></div></body></html>`;
  fs.writeFileSync(path.join(__dirname,`board-${s.theme}-${s.key}.html`),html);
});

// ---- emit one board per theme (2x2 of its 4 screens) ----
const THEMES={'01':'TERMINAL','06':'BRUTALIST','12':'NIGHT FLIGHT'};
const BOARD_CSS=`
html,body{display:block;background:#050505;}
.board{width:1010px;padding:28px;}
.bt{font-family:"IBM Plex Mono";color:#e9e9e6;font-size:26px;font-weight:700;margin-bottom:20px;}
.bt .nn{background:#c6f24e;color:#0a0a0a;padding:2px 13px;border-radius:6px;margin-right:13px;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
.cell .cl{font-family:"IBM Plex Mono";color:#8a8f82;font-size:16px;margin:0 0 8px 2px;}
.cell .fr{width:456px;height:258px;overflow:hidden;border-radius:9px;border:1px solid #2a2a2c;}
.cell .fr .s{transform:scale(.475);transform-origin:top left;border-radius:0;}`;
Object.keys(THEMES).forEach(th=>{
  const scr=SCR.filter(s=>s.theme===th);
  const allStyle=scr.map(s=>s.style).join('\n');
  const cells=scr.map(s=>`<div class="cell"><div class="cl">${s.label}</div><div class="fr"><div class="s"><div class="${s.root}" style="position:absolute;inset:0">${s.body}</div></div></div></div>`).join('\n');
  const html=`${HEAD}<style>${allStyle}${BOARD_CSS}</style></head><body>${DOGDEF}<div class="board"><div class="bt"><span class="nn">${th}</span>${THEMES[th]}</div><div class="grid2">${cells}</div></div></body></html>`;
  fs.writeFileSync(path.join(__dirname,`board-${th}.html`),html);
});
console.log('wrote',SCR.length,'screens +',Object.keys(THEMES).length,'boards');
