// VBar-style sectioned right-side menu, in the INSTRUMENT theme. Mockup for design sign-off.
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','concept-mono.html'),'utf8');
const dogD=src.match(/id="dogpath" d="([^"]*)"/)[1];

// instrument palette
const HEAD=`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Barlow+Semi+Condensed:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{height:100%;background:#05070b;display:flex;align-items:center;justify-content:center;font-family:"Barlow Semi Condensed",sans-serif;}
.bezel{padding:15px;background:#0e1622;border:1px solid #233246;border-radius:16px;}
.s{position:relative;width:960px;height:544px;border-radius:9px;overflow:hidden;
   background:linear-gradient(160deg,#121c28,#05080d);color:#f4f7fb;}
.amber{color:#ff9242;}.amber2{color:#ffb274;}.teal{color:#3fe0a0;}.mut{color:#6f7c89;}.dim{color:#aeb8c4;}
/* dimmed home behind */
.home{position:absolute;inset:0;}
.home .top{display:flex;align-items:center;gap:12px;padding:16px 22px;font-family:"Rajdhani";font-weight:600;font-size:18px;letter-spacing:1px;}
.home .dg{height:22px;fill:#ff9242;}
.home .wm{position:absolute;left:40px;top:120px;font-family:"Rajdhani";font-weight:700;font-size:96px;letter-spacing:1px;}
.home .tx{font-family:"Rajdhani";font-size:24px;color:#121c28;background:#ff9242;padding:0 9px;border-radius:5px;vertical-align:26px;margin-left:10px;}
.home .sub{position:absolute;left:44px;top:228px;letter-spacing:6px;color:#6f7c89;font-size:16px;}
.home .wmark{position:absolute;left:120px;top:150px;height:360px;opacity:.06;fill:#ff9242;}
.scrim{position:absolute;inset:0;background:rgba(5,8,13,.5);}
/* menu panel */
.menu{position:absolute;top:0;right:0;bottom:0;width:430px;background:#0c141e;border-left:3px solid #ff9242;
      box-shadow:-18px 0 40px rgba(0,0,0,.5);overflow:hidden;}
.menu .mh{display:flex;align-items:center;gap:10px;padding:15px 20px;border-bottom:1px solid #20303f;font-family:"Rajdhani";font-weight:700;font-size:20px;letter-spacing:1px;}
.menu .mh .dg{height:20px;fill:#ff9242;}.menu .mh .sp{flex:1;}.menu .mh .x{color:#6f7c89;font-size:22px;}
.sec{padding:13px 20px 4px;font-family:"Rajdhani";font-weight:700;font-size:14px;letter-spacing:3px;color:#ff9242;display:flex;align-items:center;gap:8px;}
.sec::after{content:"";flex:1;height:1px;background:#20303f;}
.row{display:flex;align-items:center;gap:13px;padding:9px 20px;cursor:default;}
.row .ic{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.row .ic svg{width:17px;height:17px;}
.row .tx2{flex:1;}
.row .lab{font-family:"Rajdhani";font-weight:600;font-size:20px;line-height:1.05;}
.row .desc{font-size:12.5px;color:#6f7c89;letter-spacing:.3px;}
.row .chev{color:#46586b;font-size:18px;}
.row .tri{color:#3fe0a0;font-size:11px;}
.row.prim .lab{color:#ffb274;}
.ic.am{background:rgba(255,146,66,.16);color:#ff9242;}
.ic.te{background:rgba(63,224,160,.16);color:#3fe0a0;}
.ic.gy{background:rgba(120,140,160,.14);color:#9fb0c2;}
.fade{position:absolute;left:430px;}
</style></head><body>`;

const dog=(cls,extra='')=>`<svg class="${cls}" viewBox="585 290 1090 1390" ${extra}><path d="${dogD}"/></svg>`;
// tiny line icons
const I={
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
 grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
 swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>',
 signal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12a9 9 0 0 1 14 0M8 15a5 5 0 0 1 8 0"/><circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none"/></svg>',
 rotor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="2.2"/><path d="M12 10V3M12 14v7M10 12H3M14 12h7"/></svg>',
 tail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12h11"/><circle cx="18" cy="12" r="3"/><path d="M18 9v6"/></svg>',
 esc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
 gov:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 18a7 7 0 1 1 14 0"/><line x1="12" y1="18" x2="16" y2="10"/></svg>',
 gauge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 17a8 8 0 1 1 16 0"/><line x1="12" y1="17" x2="8" y2="11"/></svg>',
 batt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="7" width="16" height="10" rx="1.5"/><line x1="21" y1="10" x2="21" y2="14"/><line x1="7" y1="12" x2="13" y2="12"/></svg>',
 motor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>',
 wrench:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 4a5 5 0 0 0-6 6L4 15l5 5 5-5a5 5 0 0 0 6-6l-3 3-3-1-1-3z"/></svg>',
};
const row=(ic,col,lab,desc,right)=>`<div class="row ${lab=='New model'?'prim':''}"><div class="ic ${col}">${I[ic]}</div><div class="tx2"><div class="lab">${lab}</div><div class="desc">${desc}</div></div>${right||'<span class="chev">›</span>'}</div>`;

const body=`<div class="bezel"><div class="s">
 <div class="home">
  <div class="top"><svg class="dg" viewBox="585 290 1090 1390"><path d="${dogD}"/></svg><span class="amber" style="font-family:Rajdhani;font-weight:700;">EVORA</span><span class="mut">/ HOME</span></div>
  ${dog('wmark')}
  <div class="wm">EVORA<span class="tx">TX</span></div>
  <div class="sub">OPEN HELI OS</div>
 </div>
 <div class="scrim"></div>
 <div class="menu">
  <div class="mh"><svg class="dg" viewBox="585 290 1090 1390"><path d="${dogD}"/></svg><span class="amber" style="font-family:Rajdhani;">EVORA</span><span class="mut" style="font-family:Rajdhani;font-weight:600;font-size:16px;">MENU</span><span class="sp"></span><span class="x">✕</span></div>

  <div class="sec">MODEL</div>
  ${row('plus','am','New model','guided wizard · or erase &amp; start fresh','<span class="chev">›</span>')}
  ${row('grid','am','Edit model','main rotor · tail · esc — setup','<span class="chev">›</span>')}
  ${row('swap','gy','Switch model','4 helis saved')}
  ${row('signal','te','Bind a heli','pair a receiver')}

  <div class="sec">TUNING</div>
  ${row('rotor','am','Main rotor','PID + stick feel','<span class="tri">▲ expert</span>')}
  ${row('tail','am','Tail rotor','PID + stick feel')}
  ${row('esc','am','ESC','ESC PID control')}
  ${row('gov','am','Governor','headspeed · gain · ramp')}

  <div class="sec">MONITOR</div>
  ${row('gauge','te','Flight dashboard','headspeed · pack · temps')}
  ${row('batt','te','Battery','pack voltage + low-V alarm')}
  <div style="padding:8px 20px;color:#46586b;font-size:13px;font-family:Rajdhani;letter-spacing:2px;">▾ RADIO · TOOLS  (scroll)</div>
 </div>
</div></div>`;

fs.writeFileSync(path.join(__dirname,'menu-vbar.html'), HEAD+body+'</body></html>');
console.log('wrote menu-vbar.html');
