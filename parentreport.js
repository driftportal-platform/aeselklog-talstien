/* ÆselKlog v0.9.11 – forældreoversigt over lokale læringsprofiler.
   Præsentation af allerede lagrede, begrænsede resultater: ingen netværkskald. */
(function(root,factory){
 const api=factory(root?.AeselAdaptive||(typeof require==='function'?require('./adaptive.js'):null));
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselParentReport=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(P){
 'use strict';
 const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
 const ICONS={numbers:'🔢',plus:'➕',minus:'➖',tables:'✖️'};
 function formatDay(t){
  if(!Number.isFinite(t)||t<=0)return 'ukendt dato';
  return new Date(t).toLocaleDateString('da-DK',{day:'numeric',month:'short',year:'numeric'});
 }
 function summary(report,now=Date.now()){
  if(!report||!P)return null;
  const progress=P.cleanProgress(report.progress),hist=Array.isArray(report.history)?report.history:[];
  const areas=P.AREAS.map(id=>{
   const entry=progress.areas[id],events=hist.filter(x=>x?.area===id&&Number.isFinite(x.t)&&x.t<=now+86400000);
   const recent=events.slice(-12);
   const month=events.filter(x=>x.t>=now-30*86400000);
   const percentage=entry.attempted?Math.round(entry.correct/entry.attempted*100):null;
   return {id,title:P.TITLES[id],icon:ICONS[id],level:entry.step,label:P.label(entry.step),
    attempted:entry.attempted,correct:entry.correct,percentage,
    last30:month.length,helpedRecent:recent.filter(x=>x.helped).length,
    recent:recent.map(x=>({t:x.t,step:clamp(Math.round(Number(x.step)||0),-2,2),correct:Boolean(x.correct),helped:Boolean(x.helped)}))};
  });
  return {name:String(report.name||'').slice(0,24),updatedAt:report.updatedAt||0,
   historyCount:hist.length,areas,total:areas.reduce((n,a)=>n+a.attempted,0)};
 }
 function trendSVG(area){
  const events=area.recent;
  if(!events.length)return '<p class="parent-no-trend">Historik kommer, når barnet besvarer nye opgaver.</p>';
  const px=i=>events.length===1?128:29+i*203/(events.length-1);
  const py=step=>66-(clamp(step,-2,2)+2)*13;
  const points=events.map((e,i)=>`${px(i).toFixed(1)},${py(e.step).toFixed(1)}`).join(' ');
  const circles=events.map((e,i)=>`<circle cx="${px(i).toFixed(1)}" cy="${py(e.step).toFixed(1)}" r="${e.helped?4:5}" class="${e.correct?'parent-right':'parent-try'}"/>`).join('');
  const label=`Tilpasningsniveau fra ${area.label}, seneste ${events.length} øvelser`;
  return `<svg class="parent-trend" viewBox="0 0 250 82" role="img" aria-label="${escapeHtml(label)}"><line x1="27" y1="40" x2="240" y2="40" class="parent-midline"/><polyline points="${points}" class="parent-trendline"/>${circles}<text x="3" y="17" class="parent-axis">+2</text><text x="10" y="43" class="parent-axis">0</text><text x="3" y="68" class="parent-axis">−2</text><text x="29" y="80" class="parent-axis">Ældre</text><text x="199" y="80" class="parent-axis">Nyere</text></svg><p class="parent-trend-caption">${events.length} seneste opgaver · senest ${formatDay(events.at(-1).t)} · Grøn = rigtigt, orange = forkert</p>`;
 }
 function renderHtml(report,now=Date.now()){
  const model=summary(report,now);
  if(!model)return '<p class="parent-empty">Ingen lokal læringsprofil valgt endnu.</p>';
  const intro=model.total?`${model.total} besvarede opgaver registreret i alt.`:'Der er endnu ingen registrerede opgaver.';
  const cards=model.areas.map(area=>{
   const percent=area.percentage;
   const progress=percent===null?'<p class="parent-empty-small">Der er endnu ikke øvet dette område.</p>':
    `<div class="parent-meter" role="progressbar" aria-label="Rigtige svar i ${escapeHtml(area.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div><p class="parent-score">${area.correct} af ${area.attempted} rigtige (${percent} %)</p>`;
   return `<article class="parent-skill"><div class="parent-skill-head"><h3>${area.icon} ${escapeHtml(area.title)}</h3><span class="parent-level">${escapeHtml(area.label)}</span></div>${progress}<div class="parent-trend-title">Niveau gennem de seneste øvelser</div>${trendSVG(area)}<p class="parent-lastmonth">${area.last30} registrerede øvelser de seneste 30 dage</p></article>`;
  }).join('');
  return `<div class="parent-report-intro"><strong>${escapeHtml(model.name)}</strong><span>${escapeHtml(intro)}</span></div><div class="parent-skills">${cards}</div><p class="parent-disclaimer">Niveauet er spillets tilpasning (−2 til +2), ikke en karakter eller en faglig vurdering. Rigtige svar kan også være givet med hjælp. Gamle læringsprofiler viser tidligere tal, men kurverne samler først historik fra v0.9.11. Kun op til 96 nyere øvelser pr. barn vises i historikken.</p>`;
 }
 return {summary,renderHtml,formatDay};
});
