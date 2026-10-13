/* ÆselKlog Talstien v0.8-C: programmatisk SVG-spilleplade.
   Samtlige 100 felter og koordinater afledes her – ingen AI-genererede tal.
   Dette modul ændrer ikke spillets terninge- eller opgaveregler. */
(function(root, factory){
  const api = factory();
  if(typeof module !== 'undefined' && module.exports)module.exports=api;
  if(root)root.AeselBoard=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
'use strict';
const WIDTH=1700, HEIGHT=1210;
const LEVELS=[
 {name:'1–20',color:'#d9edff',deep:'#24699b'},
 {name:'21–40',color:'#ffe1dd',deep:'#ac4f48'},
 {name:'41–60',color:'#fff0b9',deep:'#9a711b'},
 {name:'61–80',color:'#dff1d6',deep:'#377a51'},
 {name:'81–100',color:'#ecdafa',deep:'#7c4aa3'}
];
const ACTIONS={bonus:{icon:'★',label:'Bonus'},hov:{icon:'🫏',label:'Hov hov'},byt:{icon:'⇄',label:'Byt'},mester:{icon:'🏆',label:'Talmester'},gulerod:{icon:'🥕',label:'Gulerod'},vandpyt:{icon:'💧',label:'Vandpyt'},overraskelse:{icon:'🎁',label:'Overraskelse'},bro:{icon:'🌉',label:'Bro'},super:{icon:'🎯',label:'Superopgave'}};
function pos(n){
 if(n===0)return{x:69,y:1067};
 if(!Number.isInteger(n)||n<1||n>100)throw Error('Ukendt talfelt: '+n);
 const lane=Math.floor((n-1)/20),step=(n-1)%20;
 const index=lane%2===0?step:19-step;
 const x=142+index*74.1+6*Math.sin(step*.68+lane*.9);
 const y=1011-lane*187 + 21*Math.sin(step*.42+lane*.47)+7*Math.sin(step*.86+lane*.3);
 return{x:Math.round(x*10)/10,y:Math.round(y*10)/10};
}
const POS=Array.from({length:101},(_,i)=>pos(i));
const r=(v)=>Number(v.toFixed(1));
function escapeXml(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));}
function catmull(points){
 let d=`M ${points[0].x} ${points[0].y}`;
 for(let i=0;i<points.length-1;i++){
  const a=points[Math.max(0,i-1)], b=points[i], c=points[i+1], e=points[Math.min(points.length-1,i+2)];
  const c1x=r(b.x+(c.x-a.x)/6),c1y=r(b.y+(c.y-a.y)/6);
  const c2x=r(c.x-(e.x-b.x)/6),c2y=r(c.y-(e.y-b.y)/6);
  d+=` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${c.x} ${c.y}`;
 }
 return d;
}
function cloud(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})" opacity=".95"><ellipse cx="0" cy="0" rx="66" ry="18" fill="#f9fdff"/><circle cx="-30" cy="-12" r="24" fill="#fff"/><circle cx="2" cy="-26" r="34" fill="#fff"/><circle cx="35" cy="-12" r="22" fill="#fff"/></g>`;}
function tree(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})" class="board-scenery"><ellipse cx="0" cy="8" rx="31" ry="9" fill="#448a5860"/><path d="M-7 0 L-5 -42 L5 -42 L8 0Z" fill="#926643" stroke="#694b38" stroke-width="2"/><circle cy="-65" cx="0" r="34" fill="#3a8f61" stroke="#2c754d" stroke-width="3"/><circle cy="-70" cx="-25" r="24" fill="#54a66b"/><circle cy="-75" cx="19" r="24" fill="#66b976"/><circle cy="-93" cx="-4" r="22" fill="#82ca7f"/><circle cx="-14" cy="-90" r="5" fill="#f8d99a" opacity=".8"/></g>`;}
function fence(x,y,w=180){let a=`<g class="board-scenery" opacity=".85" stroke="#bc8450" stroke-width="5" stroke-linecap="round"><path d="M${x} ${y} H${x+w} M${x} ${y-18} H${x+w}"/>`;for(let xx=x;xx<=x+w+1;xx+=38)a+=`<path d="M${xx} ${y+11} v-42"/>`;return a+'</g>';}
function barn(){return `<g transform="translate(14 1036)" class="board-scenery"><ellipse cx="88" cy="135" rx="100" ry="20" fill="#5b9f6555"/><rect x="25" y="32" width="120" height="101" rx="8" fill="#db6655" stroke="#aa4b40" stroke-width="4"/><path d="M 8 43 L 84 -6 L 162 43Z" fill="#955c50" stroke="#72473e" stroke-width="5"/><path d="M 24 52 L 144 52" stroke="#fbb0a0" stroke-width="4"/><rect x="61" y="62" width="53" height="70" rx="4" fill="#6d4a42" stroke="#f8ddc1" stroke-width="4"/><path d="M 66 67 L109 126 M109 67 L66 126" stroke="#f4cfb4" stroke-width="4"/><rect x="36" y="68" width="19" height="25" rx="3" fill="#cce7eb" stroke="#fff" stroke-width="3"/><path d="M 84 17 v-32" stroke="#684736" stroke-width="4"/><path d="M84 -15 h31 l-11 10 -20 -2" fill="#f6b34f"/><text x="85" y="159" font-size="17" font-weight="900" text-anchor="middle" fill="#653d33" stroke="#fff7d7" stroke-width="4" paint-order="stroke">ÆSELSTALD</text></g>`;}
function pond(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})" class="board-scenery"><ellipse cx="0" cy="0" rx="88" ry="35" fill="#69c5da" stroke="#e7f5d2" stroke-width="8"/><ellipse cx="0" cy="0" rx="68" ry="22" fill="#91dce8"/><path d="M-42 -6 Q-14 -14 14 -8 M-6 11 Q25 2 50 6" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/><path d="M-67 3 l-9 -50 M-64 3 l13 -40 M71 7 l7 -42" stroke="#42865d" stroke-width="5" stroke-linecap="round"/><ellipse cx="-52" cy="-36" rx="7" ry="19" fill="#bc8c4a"/><ellipse cx="77" cy="-40" rx="7" ry="19" fill="#bc8c4a"/></g>`;}
function carrots(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})" class="board-scenery">${[0,36,72].map(dx=>`<g transform="translate(${dx} 0)"><path d="M-5 -22 L5 -22 L1 13Z" fill="#f08a38" stroke="#da6831" stroke-width="2"/><path d="M0 -21 q-19 -16 -12 -21 q10 0 12 16 q2 -24 14 -21 q6 8 -14 26" fill="#469854"/></g>`).join('')}</g>`;}
function chicken(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})" class="board-scenery"><ellipse cx="0" cy="0" rx="25" ry="21" fill="#fff8df" stroke="#b98e5f" stroke-width="3"/><circle cx="17" cy="-15" r="14" fill="#fff8df" stroke="#b98e5f" stroke-width="2"/><path d="M 21 -30 q-7 -17 -12 -3 q-5 -14 -9 -1" fill="#e46b59"/><path d="M30 -14 l18 7 -18 7Z" fill="#f7a433"/><circle cx="21" cy="-17" r="2.8" fill="#202a36"/><path d="M-5 23 v14 M10 21 v16" stroke="#c77a43" stroke-width="3"/><path d="M-23 -2 q-20 -12 -18 -27 q23 9 18 27" fill="#fff1cd" stroke="#b98e5f" stroke-width="2"/></g>`;}
function flowers(){
 // Deterministisk pseudo-tilfældig spredning mellem stierne, uden overliggende felter.
 let seed=27182;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const bits=[];
 for(let i=0;i<230;i++){
  const x=40+rand()*(WIDTH-80),y=100+rand()*(HEIGHT-150),near=POS.slice(1).some(p=>(x-p.x)**2+(y-p.y)**2 < 74**2);
  if(near)continue;
  const sz=3+rand()*4;
  if(rand()<.55){bits.push(`<path d="M${r(x)} ${r(y)} l-3 -7 m3 7 l4 -9" fill="none" stroke="#70aa6f" stroke-width="${r(sz/2)}" stroke-linecap="round" opacity=".7"/>`)}
  else{const c=['#fffaf1','#f5cc57','#f0a7be','#acd3eb'][Math.floor(rand()*4)];bits.push(`<g opacity=".85" transform="translate(${r(x)} ${r(y)})"><circle cx="-${r(sz)}" r="${r(sz*.6)}" fill="${c}"/><circle cx="${r(sz)}" r="${r(sz*.6)}" fill="${c}"/><circle cy="-${r(sz)}" r="${r(sz*.6)}" fill="${c}"/><circle cy="${r(sz)}" r="${r(sz*.6)}" fill="${c}"/><circle r="${r(sz*.55)}" fill="#e8ad55"/></g>`)}
 }
 return bits.join('');
}
function decorations(){
 return `<g aria-hidden="true" class="board-decor">
 <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#farmGradient)"/>
 <path d="M0 95 Q340 20 680 115 T1400 78 T1700 90 L1700 235 Q1330 199 980 245 T0 220Z" fill="#dfeebf" opacity=".46"/>
 <path d="M0 295 Q470 254 830 296 T1700 283 L1700 420 Q1240 462 880 412 T0 424Z" fill="#d9e8c4" opacity=".45"/>
 <path d="M0 503 Q440 466 920 518 T1700 498 L1700 641 Q1220 602 920 666 T0 634Z" fill="#ffebc0" opacity=".23"/>
 <path d="M0 693 Q290 656 790 720 T1700 695 L1700 825 Q1300 865 810 835 T0 842Z" fill="#def1da" opacity=".35"/>
 <path d="M0 880 Q380 842 880 903 T1700 888 L1700 1030 Q1220 1055 840 1024 T0 1030Z" fill="#ffe3de" opacity=".24"/>
 ${cloud(310,51,.66)} ${cloud(1150,64,.8)}
 <g transform="translate(1595 66)"><circle r="43" fill="#ffe59b"/><g stroke="#f0c86c" stroke-width="5" stroke-linecap="round">${Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9;return `<path d="M${r(53*Math.cos(a))} ${r(53*Math.sin(a))} L${r(66*Math.cos(a))} ${r(66*Math.sin(a))}"/>`}).join('')}</g></g>
 ${tree(130,136,.75)} ${tree(527,138,.6)} ${tree(993,142,.65)}
 ${fence(384,357,160)} ${fence(1160,357,200)}
 ${pond(815,359,.74)} ${tree(1506,363,.69)} ${tree(84,390,.6)}
 ${fence(225,543,115)} ${chicken(1051,555,.85)} ${tree(1314,547,.58)}
 ${pond(553,728,.75)} ${tree(141,741,.6)} ${carrots(1220,733,.8)}
 ${fence(744,916,140)} ${tree(1572,948,.64)} ${chicken(355,933,.65)}
 ${carrots(571,1125,1.1)} ${tree(940,1148,.7)} ${fence(1210,1140,172)}
 ${flowers()}
 ${barn()}
 <g transform="translate(1532 98)" class="board-scenery"><path d="M2 117 V-6" stroke="#6d5946" stroke-width="7" stroke-linecap="round"/><path d="M5 -5 H112 L95 23 H5Z" fill="#f8a849" stroke="#fff7d9" stroke-width="4"/><text x="54" y="15" text-anchor="middle" font-weight="900" font-size="22" fill="#764515">MÅL!</text><path d="M-12 115 h30" stroke="#745b42" stroke-width="7"/></g>
 </g>`;
}
function startTag(){return `<g class="board-sign" transform="translate(58 1005)"><path d="M12 26 L78 7 L78 45Z" fill="#ffffff" stroke="#de934a" stroke-width="4"/><text x="34" y="31" font-size="14" fill="#8d4a27" font-weight="900">START</text></g>`;}
function pathLayer(){
 const path=catmull(POS.slice(1));
 let chevs='';
 // Små pile ved vendingerne, så retningen bliver intuitiv.
 for(const n of [20,40,60,80]){
  const p=POS[n], q=POS[n+1],x=p.x+(n===20||n===60?48:-48),y=(p.y+q.y)/2;
  chevs+=`<g transform="translate(${r(x)} ${r(y)})"><circle r="24" fill="#fffef0" fill-opacity=".95" stroke="#b78a54" stroke-width="3"/><path d="M-7 -9 L4 0 L-7 9" fill="none" stroke="#9c7549" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" transform="rotate(-90)"/></g>`;
 }
 return `<g class="board-road" aria-hidden="true"><path d="${path}" fill="none" stroke="#74955e" stroke-opacity=".22" stroke-width="91" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="#b78457" stroke-width="79" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="#efc48e" stroke-width="68" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="#fff7dc" stroke-opacity=".65" stroke-width="3" stroke-dasharray="6 26" stroke-linecap="round"/>${chevs}</g>`;
}
function levelsDecor(){let a='';for(let k=0;k<5;k++){
 const p=POS[k*20+1];
 a+=`<g class="board-level-ribbon" transform="translate(18 ${r(p.y-91)})"><rect width="105" height="34" rx="13" fill="${LEVELS[k].color}" stroke="${LEVELS[k].deep}" stroke-width="1.6"/><text x="52" y="23" text-anchor="middle" font-size="18" font-weight="850" fill="${LEVELS[k].deep}">${LEVELS[k].name}</text></g>`;
 }return a;
}
function field(n,specials){
 const p=POS[n],level=Math.floor((n-1)/20),isSpecial=Boolean(specials[n]);const action=isSpecial?ACTIONS[specials[n]]:null;
 const label=`Felt ${n}${action?', '+action.label:''}`;
 const font=n===100?21:n<10?29:25;
 const bg=LEVELS[level].color;
 const texty=isSpecial?3:10;
 return `<g id="tile-${n}" data-n="${n}" class="board-tile r${level+1}${isSpecial?' has-action':''}" transform="translate(${p.x} ${p.y})" role="img" aria-label="${escapeXml(label)}">
 <title>${escapeXml(label)}</title>
 <rect class="board-tile-frame" x="-34" y="-33" width="68" height="66" rx="20" fill="${bg}" stroke="#ffffff" stroke-width="4"/>
 <rect class="board-tile-edge" x="-29" y="-28" width="58" height="56" rx="16" fill="none" stroke="${LEVELS[level].deep}" stroke-opacity=".25" stroke-width="1.4"/>
 <text class="board-tile-number" x="0" y="${texty}" text-anchor="middle" font-family="system-ui, -apple-system, Arial, sans-serif" font-size="${font}" font-weight="900" fill="#ae2a35">${n}</text>
 ${action?`<g class="board-action-symbol"><circle cx="23" cy="24" r="14.5" fill="#fff9ed" stroke="#c49459" stroke-width="2.5"/><text x="23" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-size="${specials[n]==='bonus'?21:17}" font-weight="bold" fill="#bd7a2b">${action.icon}</text></g>`:''}
 </g>`;
}
function svg(specials){
 if(!specials||typeof specials!=='object')specials={};
 const spots=Array.from({length:100},(_,i)=>field(i+1,specials)).join('');
 return `<svg id="boardSvg" class="board-svg" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="ÆselKlog Talstien: En snoet talbane med felterne 1 til 100, start ved æselstalden og mål ved hundrede">
 <defs><linearGradient id="farmGradient" x1="0" y1="0" x2=".22" y2="1"><stop stop-color="#f4fbe5"/><stop offset=".44" stop-color="#cbe9be"/><stop offset="1" stop-color="#b2d99f"/></linearGradient><filter id="tileDrop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#507a4b" flood-opacity=".26"/></filter></defs>
 ${decorations()} ${pathLayer()} ${levelsDecor()} ${startTag()}
 <g id="boardTiles" filter="url(#tileDrop)">${spots}</g>
 <g id="boardPlayers" aria-hidden="true"></g>
 </svg>`;
}
function verify(){
 const fields=POS.slice(1);const unique=new Set(fields.map(p=>`${p.x},${p.y}`));
 if(fields.length!==100||unique.size!==100)return false;
 for(let k=0;k<5;k++){
  let prev=null;
  for(let n=k*20+1;n<=(k+1)*20;n++){
   const x=POS[n].x;
   if(prev!==null&&(k%2===0?x<=prev:x>=prev))return false;
   prev=x;
  }
 }
 return true;
}
return {WIDTH,HEIGHT,LEVELS,POSITIONS:POS,position:pos,render:svg,validate:verify,ACTIONS};
});
