/* RegneKlog: visual arithmetic, explicit help, unlimited retries and per-task points. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),E=window.AeselMath,KEY='aeselklog-regneklog-settings-v1';
 let session=null,guideOpen=false;
 const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
 function carrot(crossed=false){const n=el('span','math-carrot'+(crossed?' math-removed':''));const image=el('img');image.src=window.AeselIcons.url('carrot');image.alt='';image.draggable=false;n.append(image);n.setAttribute('aria-hidden','true');return n}
 function tokens(total,removed=0){const n=el('div','math-tokens');let i=0;while(i<total){const count=Math.min(10,total-i),frame=el('span',count===10?'math-ten':'math-ones');if(count===10)frame.title='10 gulerødder';for(let j=0;j<count;j++,i++)frame.append(carrot(i>=total-removed));n.append(frame)}if(!total)n.append(el('span','math-empty','Ingen gulerødder'));return n}
 function tray(title,n,remove=0){const box=el('section','math-tray');box.append(el('h3','',title),tokens(n,remove));box.setAttribute('aria-label',`${title}: ${n} gulerødder${remove?`, ${remove} streget over`:''}`);return box}
 function renderVisual(){
  const s=session,p=s.tasks[s.index],container=$('mathVisual'),reveal=s.help>=2||s.resolved;container.replaceChildren();
  container.hidden=s.options.mode==='numbers'&&!guideOpen;
  if(container.hidden)return;
  container.append(el('p','math-legend','Én gulerod = 1 · en hel tieramme = 10'));
  const scene=el('div','math-scene');container.append(scene);
  if(p.op==='add')scene.append(tray('Du har',p.a),el('span','math-scene-sign','+'),tray('Du får',p.b));
  if(p.op==='subtract')scene.append(tray(reveal?`${p.b} spist – tæl resten`:'Du har',p.a,reveal?p.b:0));
  if(p.op==='multiply')for(let i=0;i<p.a;i++)scene.append(tray('Kurv '+(i+1),p.b));
  if(p.op==='divide'){
   if(!reveal)scene.append(tray('Til deling',p.a));
   const baskets=el('div','math-baskets');for(let i=0;i<p.b;i++)baskets.append(tray('Kurv '+(i+1),reveal?p.answer:0));scene.append(baskets);
   if(!reveal)container.append(el('p','tiny','Hvordan kan du dele dem lige? Hjælpen kan vise fordelingen.'));
  }
 }
 function renderGuide(){
  const s=session;$('mathGuide').hidden=!guideOpen;if(!guideOpen)return;
  $('mathGuideTitle').textContent=s.help>=3?'Løsningen':`Trin ${Math.min(2,s.help)} af 2`;
  $('mathGuideText').textContent=E.guide(s.tasks[s.index])[Math.max(0,s.help-1)];
  $('mathHintNext').hidden=s.help!==1||s.resolved;$('mathSolution').hidden=s.help<2||s.resolved;
 }
 function renderTask(){
  const s=session,p=s.tasks[s.index];guideOpen=false;
  $('mathSummary').hidden=true;$('mathTask').hidden=false;
  $('mathProgress').textContent=`Opgave ${s.index+1} af ${s.tasks.length}`;$('mathScore').textContent=s.points+' point';
  $('mathTaskLabel').textContent=E.OPS[p.op].name+' · '+{easy:'Let',medium:'Mellem',hard:'Svær'}[s.options.level];
  $('mathEquation').textContent=E.expression(p);$('mathStory').textContent=E.story(p);
  $('mathAnswer').value='';$('mathAnswer').disabled=false;$('mathCheck').disabled=false;$('mathFeedback').textContent='';$('mathFeedback').className='math-feedback';
  $('mathHelp').hidden=false;$('mathNext').hidden=true;$('mathNext').textContent=s.index+1===s.tasks.length?'Se dine point →':'Næste opgave →';
  renderGuide();renderVisual();$('mathEquation').focus({preventScroll:true});
 }
 function start(){try{session=E.start({operations:[...document.querySelectorAll('[name="mathOperation"]:checked')].map(n=>n.value),level:$('mathLevel').value,mode:$('mathMode').value,length:Number($('mathLength').value)});try{localStorage.setItem(KEY,JSON.stringify(session.options))}catch(_){}$('mathSetupError').textContent='';window.AeselShowView('mathGame');renderTask()}catch(e){$('mathSetupError').textContent=e.message}}
 function complete(){const s=session;$('mathScore').textContent=s.points+' point';$('mathAnswer').disabled=true;$('mathCheck').disabled=true;$('mathNext').hidden=false;$('mathHelp').hidden=true;renderGuide();renderVisual();$('mathNext').focus({preventScroll:true})}
 $('mathAnswerForm').onsubmit=event=>{event.preventDefault();if(!session||session.resolved||session.finished)return;const result=E.check(session,$('mathAnswer').value),feedback=$('mathFeedback');feedback.className='math-feedback';
  if(!result.valid){feedback.textContent='Skriv et helt tal fra 0 til 100.';$('mathAnswer').focus();return}
  if(!result.correct){feedback.textContent='Det passer ikke helt endnu. Prøv igen, eller få et lille tip fra Æslet.';$('mathAnswer').select();return}
  feedback.classList.add('math-success');feedback.textContent=`Rigtigt! +${result.points} point. ${E.expression(session.tasks[session.index],true)}`;complete();
 };
 $('mathHelp').onclick=()=>{if(!session||session.resolved)return;if(!session.help)E.hint(session);guideOpen=true;renderGuide();renderVisual()};
 $('mathHintNext').onclick=()=>{if(!session||session.resolved)return;E.hint(session);renderGuide();renderVisual()};
 $('mathSolution').onclick=()=>{if(!session||session.resolved)return;const text=E.solution(session);$('mathFeedback').textContent='Vi fandt løsningen sammen. Denne opgave giver 0 point.';$('mathEquation').textContent=E.expression(session.tasks[session.index],true);$('mathGuideText').textContent=text;complete()};
 $('mathHideHelp').onclick=()=>{guideOpen=false;renderGuide();renderVisual();if(!session.resolved)$('mathHelp').focus()};
 $('mathNext').onclick=()=>{if(!session?.resolved||session.finished)return;if(E.next(session)){renderTask();window.scrollTo({top:0,behavior:'instant'});return}
  $('mathTask').hidden=true;$('mathSummary').hidden=false;$('mathProgress').textContent='Forløbet er færdigt';
  const count=kind=>session.records.filter(r=>r.kind===kind).length;
  $('mathSummaryText').textContent=`Du fik ${session.points} af ${session.tasks.length*10} mulige point.`;
  $('mathSummaryDetail').textContent=`${count('own')} løst selv · ${count('helped')} løst med hjælp · ${count('shown')} løsninger gennemgået.`;
  $('mathAgain').focus({preventScroll:true});
 };
 const setup=()=>{$('mathSetupError').textContent='';window.AeselShowView('mathSetup')};
 $('openMathSetup').onclick=setup;$('mathStart').onclick=start;$('mathAgain').onclick=setup;
 $('mathSetupBack').onclick=()=>window.AeselShowView('menu');$('mathGameBack').onclick=()=>window.AeselShowView('menu');
 $('mathNew').onclick=()=>{if(session&&!session.finished&&!confirm('Afslut dette forløb og vælg nye opgaver?'))return;setup()};
 try{const options=JSON.parse(localStorage.getItem(KEY));if(options){if(E.LEVELS[options.level])$('mathLevel').value=options.level;if(['visual','numbers'].includes(options.mode))$('mathMode').value=options.mode;if([5,10,20].includes(options.length))$('mathLength').value=options.length;if(Array.isArray(options.operations)&&options.operations.some(op=>E.OPS[op]))document.querySelectorAll('[name="mathOperation"]').forEach(n=>{n.checked=options.operations.includes(n.value)})}}catch(_){}
})();
