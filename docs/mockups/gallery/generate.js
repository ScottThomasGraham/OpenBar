// Generates 12 numbered black+lime+dog concept screens (960x544) into ./out/*.html
// Dog path is read from the real asset so we never hand-paste it.
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'concept-mono.html'), 'utf8');
const dogD = src.match(/id="dogpath" d="([^"]*)"/)[1];
const DOGDEF = `<svg width="0" height="0" style="position:absolute"><defs><path id="dog" d="${dogD}"/></defs></svg>`;
const dog = (cls, vb='585 290 1090 1390') => `<svg class="${cls}" viewBox="${vb}"><use href="#dog"/></svg>`;

const HEAD = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700;800&family=Archivo:wght@600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{height:100%;background:#050505;display:flex;align-items:center;justify-content:center;}
.bezel{padding:15px;background:#141414;border:1px solid #2a2a2c;border-radius:18px;}
.s{position:relative;width:960px;height:544px;border-radius:9px;overflow:hidden;background:#0a0a0a;color:#e9e9e6;font-family:"IBM Plex Mono",monospace;}
.lime{color:#c6f24e;}.mut{color:#5f6157;}.ink{color:#e9e9e6;}.red{color:#ff5e5e;}
</style>`;

// each concept: {tag, desc, style, body}
const C = [];

// 01 TERMINAL ------------------------------------------------------------
C.push({tag:'TERMINAL', desc:'cli · monospace · snake_case', style:`
.t01 .top{display:flex;align-items:center;gap:14px;padding:18px 26px;border-bottom:1px solid #232323;font-weight:600;font-size:19px;letter-spacing:1px;}
.t01 .g{height:24px;fill:#c6f24e;filter:drop-shadow(0 0 6px rgba(198,242,78,.5));}
.t01 .sp{flex:1;}
.t01 .wm{position:absolute;left:28px;top:128px;font-family:"IBM Plex Sans";font-weight:800;font-size:120px;letter-spacing:-4px;line-height:.85;}
.t01 .tx{font-family:"IBM Plex Mono";font-weight:700;font-size:30px;color:#0a0a0a;background:#c6f24e;padding:2px 9px;vertical-align:36px;margin-left:16px;}
.t01 .sub{position:absolute;left:30px;top:262px;letter-spacing:6px;color:#5f6157;font-size:18px;}
.t01 .st{position:absolute;left:30px;top:312px;font-size:20px;}
.t01 .st::before{content:"● ";color:#c6f24e;}
.t01 .acts{position:absolute;left:26px;right:26px;top:356px;display:flex;gap:16px;}
.t01 .ab{flex:1;border:1px solid #2f2f2f;background:#121212;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:25px;}
.t01 .ab.on{border-color:#c6f24e;background:rgba(198,242,78,.07);color:#c6f24e;}
.t01 .ab .k{color:#5f6157;font-size:19px;}
.t01 .wmk{position:absolute;right:-30px;top:70px;height:440px;opacity:.06;fill:#c6f24e;}
.t01 .data{position:absolute;left:0;right:0;bottom:0;display:flex;border-top:1px solid #232323;}
.t01 .c{flex:1;padding:14px 26px;border-right:1px solid #1b1b1b;}
.t01 .c .k{color:#5f6157;font-size:14px;letter-spacing:1px;}.t01 .c .v{font-weight:600;font-size:26px;margin-top:3px;}`,
body:`<div class="t01">${dog('wmk')}
<div class="top">${dog('g')}<span class="lime">EVORA</span><span class="mut">/ HOME</span><span class="sp"></span><span class="mut">92% 14:32</span></div>
<div class="wm">EVORA<span class="tx">TX</span></div><div class="sub">OPEN HELI OS</div>
<div class="st">STANDBY — NO HELI CONNECTED</div>
<div class="acts"><div class="ab on">new_model<span class="k">[ ↵ ]</span></div><div class="ab">edit_model<span class="k">[ → ]</span></div></div>
<div class="data"><div class="c"><div class="k">LINK</div><div class="v mut">idle</div></div><div class="c"><div class="k">HELIS</div><div class="v">04</div></div><div class="c"><div class="k">FIRMWARE</div><div class="v">0.3.0</div></div></div></div>`});

// 02 INSTRUMENT ----------------------------------------------------------
C.push({tag:'INSTRUMENT', desc:'aerospace gauge · cockpit panel', style:`
.t02{font-family:"IBM Plex Mono";}
.t02 .top{display:flex;align-items:center;gap:12px;padding:16px 26px;font-weight:600;font-size:17px;letter-spacing:1px;}
.t02 .g{height:22px;fill:#c6f24e;}.t02 .sp{flex:1;}
.t02 svg.dial{position:absolute;left:40px;top:96px;}
.t02 .dv{position:absolute;left:104px;top:230px;width:212px;text-align:center;}
.t02 .dv .n{font-family:"IBM Plex Sans";font-weight:700;font-size:64px;line-height:.9;color:#c6f24e;}
.t02 .dv .u{color:#5f6157;font-size:16px;}
.t02 .r{position:absolute;left:400px;top:104px;right:34px;}
.t02 .row{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #1e1e1e;padding:15px 2px;}
.t02 .row .k{color:#5f6157;font-size:18px;letter-spacing:1px;}
.t02 .row .v{font-family:"IBM Plex Sans";font-weight:700;font-size:34px;}
.t02 .row .v.l{color:#c6f24e;}
.t02 .foot{position:absolute;left:40px;bottom:22px;right:34px;display:flex;gap:14px;}
.t02 .ab{flex:1;border:1px solid #2f2f2f;text-align:center;padding:13px;font-weight:600;font-size:21px;}
.t02 .ab.on{border-color:#c6f24e;color:#c6f24e;}`,
body:`<div class="t02">
<div class="top">${dog('g')}<span class="lime">EVORA</span><span class="mut">/ goblin_770</span><span class="sp"></span><span class="mut">92% 14:32</span></div>
<svg class="dial" width="320" height="320" viewBox="0 0 320 320">
 <circle cx="160" cy="160" r="138" fill="none" stroke="#1c1c1c" stroke-width="20"/>
 <path d="M 62 258 A 138 138 0 1 1 258 258" fill="none" stroke="#262626" stroke-width="3"/>
 <path d="M 62 258 A 138 138 0 0 1 210 62" fill="none" stroke="#c6f24e" stroke-width="20"/>
 <g stroke="#3a3a3a" stroke-width="3">${Array.from({length:11},(_,i)=>{const a=(135+i*27)*Math.PI/180;return `<line x1="${160+128*Math.cos(a)}" y1="${160+128*Math.sin(a)}" x2="${160+112*Math.cos(a)}" y2="${160+112*Math.sin(a)}"/>`}).join('')}</g>
 <text x="160" y="120" text-anchor="middle" font-family="IBM Plex Mono" font-size="15" fill="#5f6157">HEADSPEED</text></svg>
<div class="dv"><div class="n">1850</div><div class="u">rpm · gov hold</div></div>
<div class="r">
 <div class="row"><span class="k">PACK</span><span class="v">24.6<span style="font-size:18px;color:#5f6157"> v</span></span></div>
 <div class="row"><span class="k">ESC TEMP</span><span class="v">61<span style="font-size:18px;color:#5f6157"> °c</span></span></div>
 <div class="row"><span class="k">LINK · LQ</span><span class="v l">100<span style="font-size:18px;color:#5f6157"> %</span></span></div></div>
<div class="foot"><div class="ab on">new model</div><div class="ab">edit model</div></div></div>`});

// 03 EDITORIAL -----------------------------------------------------------
C.push({tag:'EDITORIAL', desc:'magazine · negative space · refined', style:`
.t03{background:#0a0a0a;font-family:"IBM Plex Sans";}
.t03 .kick{position:absolute;top:40px;left:54px;font-family:"IBM Plex Mono";letter-spacing:7px;font-size:16px;color:#5f6157;}
.t03 .kick b{color:#c6f24e;font-weight:500;}
.t03 .wm{position:absolute;top:120px;left:50px;font-weight:800;font-size:150px;letter-spacing:-6px;line-height:.82;}
.t03 .rule{position:absolute;left:54px;top:300px;width:360px;height:2px;background:#c6f24e;}
.t03 .tag{position:absolute;left:54px;top:322px;font-family:"IBM Plex Mono";font-size:21px;color:#9a9a93;letter-spacing:1px;}
.t03 .dogwrap{position:absolute;right:40px;top:70px;height:420px;}
.t03 .dogwrap svg{height:420px;fill:none;stroke:#c6f24e;stroke-width:6;opacity:.85;}
.t03 .nav{position:absolute;left:54px;bottom:46px;display:flex;gap:40px;font-family:"IBM Plex Mono";font-size:23px;}
.t03 .nav .a{color:#c6f24e;}.t03 .nav .a::before{content:"→ ";}
.t03 .nav .b::before{content:"→ ";color:#5f6157;}
.t03 .pg{position:absolute;right:48px;bottom:46px;font-family:"IBM Plex Mono";color:#5f6157;font-size:18px;}`,
body:`<div class="t03">
<div class="kick"><b>EVORA</b> &nbsp;·&nbsp; OPEN HELI OS &nbsp;·&nbsp; v0.3.0</div>
<div class="wm">EVORA</div>
<div class="rule"></div><div class="tag">standby — no heli connected</div>
<div class="dogwrap">${dog('')}</div>
<div class="nav"><span class="a">new model</span><span class="b">edit model</span></div>
<div class="pg">04 helis · link idle</div></div>`});

// 04 TACTICAL HUD --------------------------------------------------------
C.push({tag:'TACTICAL', desc:'HUD · recon · corner brackets', style:`
.t04{font-family:"IBM Plex Mono";background:#080908;}
.t04 .frame{position:absolute;inset:18px;border:1px solid #233322;}
.t04 .cnr{position:absolute;width:22px;height:22px;border:2px solid #c6f24e;}
.t04 .cnr.tl{left:10px;top:10px;border-right:0;border-bottom:0;}.t04 .cnr.tr{right:10px;top:10px;border-left:0;border-bottom:0;}
.t04 .cnr.bl{left:10px;bottom:10px;border-right:0;border-top:0;}.t04 .cnr.br{right:10px;bottom:10px;border-left:0;border-top:0;}
.t04 .hdr{position:absolute;top:34px;left:42px;right:42px;display:flex;font-size:16px;letter-spacing:2px;color:#7f8f74;}
.t04 .hdr .sp{flex:1;}.t04 .hdr .lime{color:#c6f24e;}
.t04 .reticle{position:absolute;left:150px;top:150px;width:230px;height:230px;}
.t04 .reticle svg{width:230px;height:230px;}
.t04 .dogc{position:absolute;left:196px;top:206px;height:120px;fill:#c6f24e;opacity:.9;}
.t04 .uid{position:absolute;left:150px;top:392px;width:230px;text-align:center;font-size:15px;color:#7f8f74;letter-spacing:2px;}
.t04 .panel{position:absolute;right:54px;top:150px;width:330px;font-size:18px;}
.t04 .panel .l{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #1c241b;}
.t04 .panel .l .k{color:#7f8f74;letter-spacing:1px;}.t04 .panel .l .v{color:#e9e9e6;}.t04 .panel .l .v.g{color:#c6f24e;}
.t04 .cmd{position:absolute;right:54px;bottom:60px;width:330px;display:flex;gap:12px;}
.t04 .cmd .b{flex:1;border:1px solid #2f3f2c;text-align:center;padding:13px;font-size:18px;letter-spacing:1px;}
.t04 .cmd .b.on{border-color:#c6f24e;color:#c6f24e;background:rgba(198,242,78,.06);}`,
body:`<div class="t04"><div class="frame"></div><div class="cnr tl"></div><div class="cnr tr"></div><div class="cnr bl"></div><div class="cnr br"></div>
<div class="hdr"><span class="lime">▲ EVORA</span><span>&nbsp; UNIT.770</span><span class="sp"></span><span>STATUS: <span class="lime">STANDBY</span></span></div>
<div class="reticle"><svg viewBox="0 0 230 230"><circle cx="115" cy="115" r="100" fill="none" stroke="#2f3f2c" stroke-width="1.5"/><circle cx="115" cy="115" r="70" fill="none" stroke="#2f3f2c" stroke-width="1" stroke-dasharray="4 6"/><line x1="115" y1="2" x2="115" y2="28" stroke="#c6f24e" stroke-width="2"/><line x1="115" y1="202" x2="115" y2="228" stroke="#c6f24e" stroke-width="2"/><line x1="2" y1="115" x2="28" y2="115" stroke="#c6f24e" stroke-width="2"/><line x1="202" y1="115" x2="228" y2="115" stroke="#c6f24e" stroke-width="2"/></svg></div>
${dog('dogc')}
<div class="uid">[ HELI 770 · TRACKED ]</div>
<div class="panel"><div class="l"><span class="k">LINK</span><span class="v g">ACQUIRED</span></div><div class="l"><span class="k">RX BIND</span><span class="v">PAIRED</span></div><div class="l"><span class="k">MODELS</span><span class="v">04</span></div><div class="l"><span class="k">FW</span><span class="v">0.3.0</span></div></div>
<div class="cmd"><div class="b on">NEW ▸</div><div class="b">EDIT ▸</div></div></div>`});

// 05 TE / UTILITY --------------------------------------------------------
C.push({tag:'UTILITY', desc:'teenage-engineering · product', style:`
.t05{font-family:"Space Grotesk",sans-serif;background:#0c0c0c;}
.t05 .top{display:flex;align-items:center;gap:12px;padding:20px 26px;font-weight:600;font-size:18px;}
.t05 .g{height:22px;fill:#c6f24e;}.t05 .sp{flex:1;}.t05 .top .mut{font-family:"IBM Plex Mono";font-size:15px;}
.t05 .grid{position:absolute;top:74px;left:24px;right:24px;bottom:24px;display:grid;grid-template-columns:1.4fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:14px;}
.t05 .m{background:#151515;border-radius:14px;padding:18px 20px;position:relative;}
.t05 .m .num{position:absolute;top:14px;right:16px;font-family:"IBM Plex Mono";font-size:14px;color:#5f6157;}
.t05 .m .lab{font-family:"IBM Plex Mono";font-size:14px;letter-spacing:2px;color:#5f6157;}
.t05 .m .big{font-weight:700;font-size:46px;margin-top:6px;}
.t05 .hero{grid-row:span 2;background:#c6f24e;color:#0a0a0a;display:flex;flex-direction:column;justify-content:space-between;}
.t05 .hero .wm{font-weight:700;font-size:54px;letter-spacing:-2px;line-height:.9;}
.t05 .hero svg{height:120px;fill:#0a0a0a;align-self:flex-end;}
.t05 .btn{display:flex;align-items:center;gap:12px;}
.t05 .dot{width:38px;height:38px;border-radius:50%;background:#c6f24e;display:inline-block;}
.t05 .dot.o{background:#2a2a2a;}
.t05 .m.act{display:flex;align-items:center;font-weight:600;font-size:24px;}`,
body:`<div class="t05">
<div class="top">${dog('g')}<span class="lime">EVORA</span><span class="sp"></span><span class="mut">STANDBY · 14:32</span></div>
<div class="grid">
 <div class="m hero"><div class="wm">EVORA<br>TX</div><div style="font-family:'IBM Plex Mono';font-size:15px;letter-spacing:2px;">OPEN HELI OS · 0.3.0</div>${dog('')}</div>
 <div class="m"><span class="num">01</span><div class="lab">HELIS</div><div class="big">04</div></div>
 <div class="m"><span class="num">02</span><div class="lab">LINK</div><div class="big" style="color:#5f6157">idle</div></div>
 <div class="m act"><span class="dot"></span>new model</div>
 <div class="m act"><span class="dot o"></span>edit model</div></div></div>`});

// 06 BRUTALIST -----------------------------------------------------------
C.push({tag:'BRUTALIST', desc:'poster · slabs · oversized', style:`
.t06{font-family:"Archivo",sans-serif;background:#0a0a0a;}
.t06 .bar{position:absolute;top:0;left:0;right:0;height:46px;background:#c6f24e;color:#0a0a0a;display:flex;align-items:center;padding:0 22px;font-weight:800;font-size:20px;letter-spacing:1px;gap:14px;}
.t06 .bar .sp{flex:1;}.t06 .bar svg{height:24px;fill:#0a0a0a;}
.t06 .wm{position:absolute;top:64px;left:30px;font-weight:900;font-size:172px;letter-spacing:-8px;line-height:.78;color:#e9e9e6;}
.t06 .wm em{color:#c6f24e;font-style:normal;}
.t06 .dogblk{position:absolute;right:26px;top:80px;width:240px;height:330px;background:#c6f24e;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;}
.t06 .dogblk svg{height:300px;fill:#0a0a0a;}
.t06 .acts{position:absolute;left:30px;bottom:30px;display:flex;gap:0;}
.t06 .acts .b{font-weight:800;font-size:30px;padding:16px 30px;border:3px solid #e9e9e6;}
.t06 .acts .b.on{background:#c6f24e;color:#0a0a0a;border-color:#c6f24e;}
.t06 .acts .b.off{color:#e9e9e6;border-left:0;}
.t06 .meta{position:absolute;right:30px;bottom:38px;font-family:"IBM Plex Mono";font-size:18px;color:#5f6157;text-align:right;line-height:1.5;}`,
body:`<div class="t06">
<div class="bar">${dog('')}EVORA<span class="sp"></span>STANDBY — NO HELI</div>
<div class="wm">EVO<em>RA</em></div>
<div class="dogblk">${dog('')}</div>
<div class="acts"><div class="b on">NEW MODEL</div><div class="b off">EDIT</div></div>
<div class="meta">HELIS / 04<br>FW / 0.3.0</div></div>`});

// 07 SOFT DASH (fusion) --------------------------------------------------
C.push({tag:'SOFT DASH', desc:'rounded cards · ring medallion', style:`
.t07{font-family:"IBM Plex Sans";background:#0a0b0c;}
.t07 .top{display:flex;align-items:center;gap:12px;padding:16px 24px;font-family:"IBM Plex Mono";font-weight:600;font-size:17px;}
.t07 .g{height:22px;fill:#c6f24e;}.t07 .sp{flex:1;}
.t07 .wrap{position:absolute;top:60px;left:20px;right:20px;bottom:18px;display:grid;grid-template-columns:300px 1fr;gap:16px;}
.t07 .card{background:#15171a;border:1px solid #23262a;border-radius:20px;}
.t07 .hero{display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;}
.t07 .hero .lbl{position:absolute;top:24px;font-family:"IBM Plex Mono";font-size:13px;letter-spacing:2px;color:#6a6d64;}
.t07 .hero .wm{font-weight:800;font-size:44px;letter-spacing:-1px;}.t07 .hero .sub{font-family:"IBM Plex Mono";color:#6a6d64;font-size:14px;margin-top:4px;}
.t07 .hero svg.ring{position:absolute;}
.t07 .right{display:grid;grid-template-rows:1fr 1fr;gap:16px;}
.t07 .acts{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.t07 .ab{border-radius:20px;border:1px solid #23262a;background:#15171a;display:flex;flex-direction:column;justify-content:space-between;padding:20px;}
.t07 .ab.on{border-color:#c6f24e;background:rgba(198,242,78,.06);}
.t07 .ab .t{font-family:"IBM Plex Mono";font-weight:600;font-size:26px;}.t07 .ab.on .t{color:#c6f24e;}
.t07 .ab .k{font-family:"IBM Plex Mono";color:#6a6d64;font-size:15px;}
.t07 .stats{display:flex;gap:16px;}
.t07 .st{flex:1;border-radius:18px;border:1px solid #23262a;background:#15171a;padding:14px 18px;}
.t07 .st .v{font-weight:700;font-size:30px;}.t07 .st .k{font-family:"IBM Plex Mono";color:#6a6d64;font-size:13px;letter-spacing:1px;}
.t07 .wmk{position:absolute;right:-20px;bottom:-20px;height:300px;opacity:.05;fill:#c6f24e;}`,
body:`<div class="t07">${dog('wmk')}
<div class="top">${dog('g')}<span class="lime">EVORA</span><span class="mut">/ home · standby</span><span class="sp"></span><span class="mut">92% 14:32</span></div>
<div class="wrap">
 <div class="card hero"><div class="lbl">EVORA TX</div><svg class="ring" width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="96" fill="none" stroke="#23262a" stroke-width="12"/><circle cx="110" cy="110" r="96" fill="none" stroke="#c6f24e" stroke-width="12" stroke-linecap="round" stroke-dasharray="452 603" transform="rotate(-90 110 110)"/></svg><div class="wm">EVORA</div><div class="sub">open heli os</div></div>
 <div class="right">
  <div class="acts"><div class="ab on"><div class="t">new<br>model</div><div class="k">↵ configure</div></div><div class="ab"><div class="t">edit<br>model</div><div class="k">→ disciplines</div></div></div>
  <div class="stats"><div class="st"><div class="v mut">idle</div><div class="k">LINK</div></div><div class="st"><div class="v">04</div><div class="k">HELIS</div></div><div class="st"><div class="v lime">0.3.0</div><div class="k">FIRMWARE</div></div></div></div></div></div>`});

// 08 BLUEPRINT -----------------------------------------------------------
C.push({tag:'BLUEPRINT', desc:'schematic · line-art dog · grid', style:`
.t08{font-family:"IBM Plex Mono";background:#0a0c0a;background-image:linear-gradient(#10160f 1px,transparent 1px),linear-gradient(90deg,#10160f 1px,transparent 1px);background-size:32px 32px;}
.t08 .hdr{position:absolute;top:26px;left:34px;right:34px;display:flex;font-size:16px;letter-spacing:2px;color:#6f7d66;}
.t08 .hdr .lime{color:#c6f24e;}.t08 .hdr .sp{flex:1;}
.t08 .dogwrap{position:absolute;left:120px;top:96px;height:360px;}
.t08 .dogwrap svg{height:360px;fill:none;stroke:#c6f24e;stroke-width:4;}
.t08 .dim{position:absolute;font-size:14px;color:#7f8f74;}
.t08 .dl{position:absolute;background:#3a4a36;}
.t08 .title{position:absolute;left:34px;bottom:120px;}
.t08 .title .e{font-family:"IBM Plex Sans";font-weight:700;font-size:58px;letter-spacing:-1px;color:#e9e9e6;}
.t08 .title .s{font-size:16px;color:#6f7d66;letter-spacing:3px;margin-top:4px;}
.t08 .stamp{position:absolute;right:40px;bottom:40px;border:1px solid #3a4a36;padding:12px 18px;font-size:15px;color:#7f8f74;line-height:1.6;}
.t08 .stamp b{color:#c6f24e;font-weight:500;}
.t08 .acts{position:absolute;left:34px;bottom:40px;display:flex;gap:14px;}
.t08 .acts .b{border:1px solid #3a4a36;padding:12px 22px;font-size:19px;}
.t08 .acts .b.on{border-color:#c6f24e;color:#c6f24e;}`,
body:`<div class="t08">
<div class="hdr"><span class="lime">⊞ EVORA</span><span>&nbsp; DWG. 770-A</span><span class="sp"></span><span>SCALE 1:1 · REV 0.3</span></div>
<div class="dogwrap">${dog('')}</div>
<div class="dl" style="left:96px;top:120px;width:1px;height:336px;"></div>
<div class="dl" style="left:96px;top:120px;width:18px;height:1px;"></div>
<div class="dl" style="left:96px;top:455px;width:18px;height:1px;"></div>
<div class="dim" style="left:60px;top:280px;transform:rotate(-90deg);">176.0</div>
<div class="title"><div class="e">EVORA TX</div><div class="s">OPEN HELI OS · STANDBY</div></div>
<div class="acts"><div class="b on">new model</div><div class="b">edit model</div></div>
<div class="stamp">UNIT <b>770</b><br>HELIS <b>04</b><br>LINK <b>idle</b></div></div>`});

// 09 MINIMAL -------------------------------------------------------------
C.push({tag:'MINIMAL', desc:'mono-line · restraint · void', style:`
.t09{background:#090909;font-family:"IBM Plex Mono";}
.t09 .g{position:absolute;top:46px;left:54px;height:30px;fill:#c6f24e;}
.t09 .wm{position:absolute;top:44px;left:100px;font-family:"IBM Plex Sans";font-weight:600;font-size:30px;letter-spacing:1px;}
.t09 .clock{position:absolute;top:52px;right:54px;color:#5f6157;font-size:18px;}
.t09 .line{position:absolute;left:54px;right:54px;top:272px;height:1px;background:#c6f24e;opacity:.5;}
.t09 .st{position:absolute;left:54px;top:236px;color:#9a9a93;font-size:22px;}
.t09 .st b{color:#c6f24e;font-weight:500;}
.t09 .acts{position:absolute;left:54px;top:300px;display:flex;gap:18px;}
.t09 .ab{border:1px solid #2a2a2a;padding:14px 28px;font-size:23px;color:#9a9a93;}
.t09 .ab.on{border-color:#c6f24e;color:#c6f24e;}
.t09 .foot{position:absolute;left:54px;bottom:44px;color:#3f413c;font-size:17px;letter-spacing:3px;}`,
body:`<div class="t09">${dog('g')}<div class="wm">evora</div><div class="clock">14:32</div>
<div class="st"><b>standby</b> — no heli connected</div>
<div class="line"></div>
<div class="acts"><div class="ab on">new model</div><div class="ab">edit model</div></div>
<div class="foot">OPEN HELI OS · 04 HELIS · 0.3.0</div></div>`});

// 10 MOTORSPORT ----------------------------------------------------------
C.push({tag:'MOTORSPORT', desc:'race badge · number plate · energy', style:`
.t10{font-family:"Archivo",sans-serif;background:#0b0b0b;overflow:hidden;}
.t10 .stripe{position:absolute;top:0;bottom:0;width:60px;background:repeating-linear-gradient(45deg,#c6f24e 0 14px,#0b0b0b 14px 28px);opacity:.9;}
.t10 .stripe.l{left:-10px;transform:skewX(-10deg);}
.t10 .top{position:absolute;top:22px;left:90px;right:34px;display:flex;align-items:center;gap:12px;font-family:"IBM Plex Mono";font-size:16px;letter-spacing:2px;color:#5f6157;}
.t10 .top svg{height:22px;fill:#c6f24e;}.t10 .top .lime{color:#c6f24e;}.t10 .top .sp{flex:1;}
.t10 .badge{position:absolute;left:110px;top:120px;width:300px;height:300px;border-radius:50%;border:6px solid #c6f24e;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#13160c,#0b0b0b);}
.t10 .badge svg{height:200px;fill:#c6f24e;}
.t10 .arc{position:absolute;left:110px;top:120px;width:300px;height:300px;}
.t10 .plate{position:absolute;right:60px;top:150px;background:#e9e9e6;color:#0a0a0a;font-weight:900;font-size:120px;padding:6px 30px;border-radius:12px;letter-spacing:-4px;}
.t10 .sub{position:absolute;right:60px;top:300px;font-weight:800;font-size:34px;color:#c6f24e;letter-spacing:1px;}
.t10 .acts{position:absolute;right:60px;bottom:50px;display:flex;gap:14px;}
.t10 .acts .b{font-weight:800;font-size:22px;padding:14px 26px;border-radius:10px;background:#1a1a1a;color:#e9e9e6;}
.t10 .acts .b.on{background:#c6f24e;color:#0a0a0a;}`,
body:`<div class="t10"><div class="stripe l"></div>
<div class="top">${dog('')}<span class="lime">EVORA</span><span>RACING</span><span class="sp"></span><span>STANDBY · 14:32</span></div>
<div class="badge">${dog('')}</div>
<svg class="arc" viewBox="0 0 300 300"><circle cx="150" cy="150" r="146" fill="none" stroke="#c6f24e" stroke-width="2" stroke-dasharray="6 8" opacity=".5"/></svg>
<div class="plate">770</div><div class="sub">EVORA · TX</div>
<div class="acts"><div class="b on">NEW MODEL</div><div class="b">EDIT</div></div></div>`});

// 11 WILDCARD — LIME + ICE ----------------------------------------------
C.push({tag:'★ LIME + ICE', desc:'wildcard · second hue for data', style:`
.t11{font-family:"IBM Plex Mono";background:#0a0b0c;}
.ice{color:#5fd6e6;}
.t11 .top{display:flex;align-items:center;gap:12px;padding:16px 24px;font-weight:600;font-size:17px;}
.t11 .g{height:22px;fill:#c6f24e;}.t11 .sp{flex:1;}
.t11 .wrap{position:absolute;top:62px;left:22px;right:22px;bottom:20px;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto 1fr;gap:14px;}
.t11 .hero{grid-column:span 3;border:1px solid #23262a;border-radius:18px;background:#121417;display:flex;align-items:center;padding:0 28px;gap:24px;}
.t11 .hero .wm{font-family:"IBM Plex Sans";font-weight:800;font-size:60px;letter-spacing:-2px;}
.t11 .hero .tx{font-size:24px;color:#0a0a0a;background:#c6f24e;padding:1px 8px;}
.t11 .hero .sub{font-size:16px;color:#5f6157;letter-spacing:3px;margin-left:auto;}
.t11 .card{border:1px solid #23262a;border-radius:18px;background:#121417;padding:18px 20px;}
.t11 .card .k{color:#5f6157;font-size:15px;letter-spacing:1px;}
.t11 .card .v{font-family:"IBM Plex Sans";font-weight:700;font-size:40px;margin-top:6px;}
.t11 .ring{display:flex;align-items:center;gap:16px;}
.t11 .acts{grid-column:span 3;display:flex;gap:14px;}
.t11 .ab{flex:1;border:1px solid #2f2f2f;border-radius:14px;padding:16px 22px;font-weight:600;font-size:24px;display:flex;justify-content:space-between;align-items:center;}
.t11 .ab.on{border-color:#c6f24e;color:#c6f24e;background:rgba(198,242,78,.06);}
.t11 .ab .k{color:#5f6157;font-size:16px;}`,
body:`<div class="t11">
<div class="top">${dog('g')}<span class="lime">EVORA</span><span class="mut">/ home</span><span class="sp"></span><span class="ice">standby</span><span class="mut">14:32</span></div>
<div class="wrap">
 <div class="hero"><div class="wm">EVORA<span class="tx">TX</span></div><div class="sub">OPEN HELI OS</div></div>
 <div class="card"><div class="k">LINK</div><div class="v ice">idle</div></div>
 <div class="card ring"><svg width="74" height="74" viewBox="0 0 74 74"><circle cx="37" cy="37" r="30" fill="none" stroke="#23262a" stroke-width="8"/><circle cx="37" cy="37" r="30" fill="none" stroke="#5fd6e6" stroke-width="8" stroke-linecap="round" stroke-dasharray="160 188" transform="rotate(-90 37 37)"/></svg><div><div class="k">SIGNAL</div><div class="v ice" style="font-size:30px">85<span style="font-size:16px;color:#5f6157">%</span></div></div></div>
 <div class="card"><div class="k">HELIS</div><div class="v">04</div></div>
 <div class="acts"><div class="ab on">new_model<span class="k">[ ↵ ]</span></div><div class="ab">edit_model<span class="k">[ → ]</span></div></div></div></div>`});

// 12 WILDCARD — NIGHT FLIGHT --------------------------------------------
C.push({tag:'★ NIGHT FLIGHT', desc:'wildcard · cinematic · ghost dog', style:`
.t12{background:radial-gradient(120% 90% at 72% 50%, #14210a 0%, #0a0d07 38%, #060706 100%);font-family:"IBM Plex Mono";overflow:hidden;}
.t12 .glow{position:absolute;right:120px;top:90px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(198,242,78,.22),transparent 65%);}
.t12 .dogwrap{position:absolute;right:80px;top:48px;height:460px;}
.t12 .dogwrap svg{height:460px;fill:#0a0d07;stroke:#c6f24e;stroke-width:3;filter:drop-shadow(0 0 16px rgba(198,242,78,.4));}
.t12 .top{position:absolute;top:34px;left:46px;display:flex;align-items:center;gap:12px;font-weight:600;font-size:18px;letter-spacing:1px;}
.t12 .g{height:24px;fill:#c6f24e;filter:drop-shadow(0 0 8px rgba(198,242,78,.6));}
.t12 .wm{position:absolute;left:46px;top:200px;font-family:"IBM Plex Sans";font-weight:800;font-size:104px;letter-spacing:-4px;line-height:.85;text-shadow:0 0 30px rgba(0,0,0,.6);}
.t12 .st{position:absolute;left:50px;top:328px;font-size:21px;color:#aeb4a6;}
.t12 .st::before{content:"● ";color:#c6f24e;}
.t12 .acts{position:absolute;left:46px;bottom:50px;display:flex;gap:16px;}
.t12 .ab{border:1px solid #3a4a2c;background:rgba(10,13,7,.6);padding:15px 30px;font-size:23px;color:#cdd3c4;border-radius:8px;}
.t12 .ab.on{border-color:#c6f24e;color:#c6f24e;box-shadow:0 0 22px rgba(198,242,78,.18);}`,
body:`<div class="t12"><div class="glow"></div><div class="dogwrap">${dog('')}</div>
<div class="top">${dog('g')}<span class="lime">EVORA</span></div>
<div class="wm">EVORA</div>
<div class="st">standby — ready when you are</div>
<div class="acts"><div class="ab on">new model</div><div class="ab">edit model</div></div></div>`});

const allStyle = C.map(c=>c.style).join('\n');

// emit individual concept files (base style + that concept's style)
C.forEach((c,i)=>{
  const n = String(i+1).padStart(2,'0');
  const html = `${HEAD}<style>${c.style}</style></head><body>${DOGDEF}<div class="bezel"><div class="s ${'t'+n}">${c.body}</div></div></body></html>`;
  fs.writeFileSync(path.join(__dirname, `concept-${n}.html`), html);
});

// emit two contact sheets (1-6, 7-12), each a 2x3 grid of scaled live concepts
const SHEET_CSS = `
html,body{display:block;background:#050505;}
.sheet{display:grid;grid-template-columns:1fr 1fr;gap:26px;padding:30px;width:1010px;}
.cell{}
.lbl{font-family:"IBM Plex Mono";color:#e9e9e6;font-size:21px;font-weight:600;margin:0 0 9px 2px;}
.lbl .nn{display:inline-block;background:#c6f24e;color:#0a0a0a;font-weight:700;padding:1px 10px;border-radius:5px;margin-right:11px;}
.lbl .ds{color:#5f6157;font-weight:400;font-size:16px;margin-left:8px;}
.frame{width:456px;height:258px;overflow:hidden;border-radius:9px;border:1px solid #2a2a2c;}
.frame .s{transform:scale(.475);transform-origin:top left;border-radius:0;}`;
function sheet(slice, fname){
  const cells = slice.map((c,k)=>{
    const idx = C.indexOf(c)+1; const n = String(idx).padStart(2,'0');
    return `<div class="cell"><div class="lbl"><span class="nn">${n}</span>${c.tag}<span class="ds">${c.desc}</span></div><div class="frame"><div class="s t${n}">${c.body}</div></div></div>`;
  }).join('\n');
  const html = `${HEAD}<style>${allStyle}${SHEET_CSS}</style></head><body>${DOGDEF}<div class="sheet">${cells}</div></body></html>`;
  fs.writeFileSync(path.join(__dirname, fname), html);
}
sheet(C.slice(0,6), 'sheet-A.html');
sheet(C.slice(6,12), 'sheet-B.html');
console.log('wrote', C.length, 'concepts + 2 sheets:', C.map((c,i)=>`${i+1}.${c.tag}`).join('  '));
