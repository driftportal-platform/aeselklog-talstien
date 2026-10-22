/* RegneKlog: visual arithmetic, explicit help, unlimited retries and per-task points. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),E=window.AeselMath,KEY='aeselklog-regneklog-settings-v1';
 let session=null,guideOpen=false,objects=null,countSerial=0,counting=false,countAbort=null,countSound=true;
 const M=window.AeselMathObjects,N=window.AeselMathSpeech,feedbackLine=N.createAnswers();
 let speechPrefs={name:'',voice:'current',autoRead:true,feedback:true};
 try{const saved=JSON.parse(localStorage.getItem(KEY))?.speech;if(saved){speechPrefs.name=N.name(saved.name);if(typeof saved.voice==='string'&&/^[a-zA-Z0-9_-]{1,50}$/.test(saved.voice))speechPrefs.voice=saved.voice;speechPrefs.autoRead=saved.autoRead!==false;speechPrefs.feedback=saved.feedback!==false}}catch(_){}
 function saveSpeech(){try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{};saved.speech={...speechPrefs};localStorage.setItem(KEY,JSON.stringify(saved))}catch(_){} }
 const speaker=N.create({isActive:()=>!document.hidden&&($('mathSetup').classList.contains('active')||$('mathGame').classList.contains('active')),isEnabled:()=>window.AeselVoice?.enabled?.()!==false,getVoice:()=>speechPrefs.voice,listVoices:()=>window.AeselVoice?.listVoices?.()||[],loadVoices:()=>window.AeselVoice?.loadVoices?.(),say:(text,options)=>window.AeselVoice.sayWithVoice(text,options),stop:()=>window.AeselVoice?.stop?.(),status(text,busy=false){if(text!==null)$('mathSpeechStatus').textContent=text;$('mathStopRead').hidden=!busy;document.querySelectorAll('.math-preview-stop').forEach(n=>{n.hidden=!busy});if($('mathSetup').classList.contains('active')&&text!==null)document.querySelectorAll('.math-voice-info').forEach(n=>{n.textContent=text});}});
 function readLine(text){window.AeselVoice?.unlock?.();stopCount();if(objects&&session&&!session.finished&&$('mathGame').classList.contains('active'))renderVisual();void speaker.read(text)}
 function voiceOptions(){
  const voices=window.AeselVoice?.listVoices?.()||[];
  document.querySelectorAll('.math-speech-voice').forEach(select=>{
   select.replaceChildren();for(const v of [{id:'current',name:'Spillelederens valgte stemme'},{id:'device',name:'Enhedens danske stemme'},...voices]){const option=document.createElement('option');option.value=v.id;option.textContent=v.name;select.append(option)}
   if(![...select.options].some(v=>v.value===speechPrefs.voice)){const option=document.createElement('option');option.value=speechPrefs.voice;option.textContent='Tidligere valgt stemme · hent stemmer';select.append(option)}select.value=speechPrefs.voice;
  });
 }
 function syncSpeech(){
  document.querySelectorAll('.math-player-name').forEach(n=>{n.value=speechPrefs.name});document.querySelectorAll('.math-auto-read').forEach(n=>{n.checked=speechPrefs.autoRead});document.querySelectorAll('.math-read-feedback').forEach(n=>{n.checked=speechPrefs.feedback});voiceOptions();
 }
 document.querySelectorAll('.math-player-name').forEach(n=>n.addEventListener('input',()=>{speaker.stop();speechPrefs.name=N.name(n.value);document.querySelectorAll('.math-player-name').forEach(other=>{if(other!==n)other.value=speechPrefs.name});saveSpeech()}));
 document.querySelectorAll('.math-speech-voice').forEach(n=>n.addEventListener('change',()=>{speaker.stop();speechPrefs.voice=n.value;syncSpeech();saveSpeech()}));
 for(const [selector,key] of [['.math-auto-read','autoRead'],['.math-read-feedback','feedback']])document.querySelectorAll(selector).forEach(n=>n.addEventListener('change',()=>{speaker.stop();speechPrefs[key]=n.checked;syncSpeech();saveSpeech()}));
 document.querySelectorAll('.math-load-voices').forEach(n=>n.addEventListener('click',async()=>{n.disabled=true;try{await window.AeselVoice.loadVoices();voiceOptions();const count=window.AeselVoice.listVoices().length;document.querySelectorAll('.math-voice-info').forEach(p=>{p.textContent=count+' spillelederstemme(r) tilgængelig. Vælg i listen.'})}catch(_){document.querySelectorAll('.math-voice-info').forEach(p=>{p.textContent='Stemmerne kunne ikke hentes lige nu. Dit valg er bevaret.'})}finally{n.disabled=false}}));
 document.querySelectorAll('.math-preview-voice').forEach(n=>{n.onclick=()=>readLine(`Hej${speechPrefs.name?' '+speechPrefs.name:''}. Jeg er klar til at regne sammen med dig.`)});document.querySelectorAll('.math-preview-stop').forEach(n=>{n.onclick=()=>speaker.stop()});
 $('mathRead').onclick=()=>{if(session&&!session.finished)readLine(N.question(session.tasks[session.index],speechPrefs.name))};$('mathStopRead').onclick=()=>speaker.stop();$('voiceToggle').addEventListener('click',()=>speaker.stop());syncSpeech();

 function stopCount(){countSerial++;countAbort?.abort();countAbort=null;if(counting)window.AeselOfflineNumbers?.stop();counting=false;}
 window.AeselMathPause=()=>{stopCount();speaker.stop()};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){speaker.stop();stopCount();if(objects&&session&&!session.finished&&$('mathGame').classList.contains('active'))renderVisual()}});
 const wait=(ms,signal)=>new Promise(resolve=>{const done=()=>{clearTimeout(timer);signal.removeEventListener('abort',done);resolve()};const timer=setTimeout(done,ms);signal.addEventListener('abort',done,{once:true});if(signal.aborted)done()});
 async function countObjects(){
  if(!objects||!M.ready(objects)||session.resolved||counting)return;
  speaker.stop();if(!session.help)E.hint(session);
  stopCount();const serial=countSerial,controller=new AbortController();countAbort=controller;counting=true;
  renderGuide();renderVisual(true);
  const ids=M.items(objects),status=$('mathCountStatus');let playSound=countSound&&window.AeselVoice?.enabled?.()!==false,audioFailed=false;
  if(!ids.length)status.textContent='0 – der er ingen gulerødder tilbage. Skriv dit svar.';
  for(let i=0;i<ids.length;i++){
   if(serial!==countSerial) return;
   const node=$('mathVisual').querySelector(`[data-object="${ids[i]}"]`);if(node){node.classList.add('math-counted');node.append(el('span','math-count-label',String(i+1)));if(!matchMedia('(prefers-reduced-motion: reduce)').matches)node.scrollIntoView({block:'nearest',behavior:'smooth'})}
   status.textContent=String(i+1);
   if(playSound&&window.AeselVoice?.enabled?.()!==false){
    const result=await Promise.race([Promise.resolve(window.AeselOfflineNumbers?.play(i+1,'da','narrator')).catch(()=>false),wait(5000,controller.signal).then(()=>false)]);
    if(serial!==countSerial)return;
    if(!result){playSound=false;audioFailed=true;window.AeselOfflineNumbers?.stop();status.textContent=`${i+1} · lyden er ikke tilgængelig; vi tæller videre på skærmen.`;}
   }
   await wait(650,controller.signal);
  }
  if(serial!==countSerial)return;
  counting=false;countAbort=null;controller.abort();
  status.textContent=ids.length?`${ids.length}${objects.op==='divide'?' i hver kurv':objects.op==='subtract'?' tilbage':' i alt'}. Skriv dit svar.`:status.textContent;
  if(audioFailed)status.textContent+=' Lyden var ikke tilgængelig; tallene er vist på skærmen.';
  $('mathCount').disabled=false;$('mathCount').textContent='Tæl igen';$('mathCountStop').hidden=true;$('mathObjectReset').disabled=false;
  $('mathVisual').querySelector('.math-count-sound input').disabled=false;
  if(objects.op==='subtract')$('mathVisual').querySelectorAll('button.math-removed').forEach(n=>{n.disabled=false});
 }

 const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
 function renderVisual(keepCounting=false){
  if(!keepCounting)stopCount();
  const s=session,p=s.tasks[s.index],container=$('mathVisual');container.replaceChildren();
  container.hidden=E.isAdult(s.options.level)||s.options.mode==='numbers'&&!guideOpen;
  if(container.hidden)return;
  container.classList.add('math-interactive');
  container.append(el('p','math-legend','Tryk på gulerødder eller kurve · én gulerod = 1'));
  const scene=el('div','math-scene');container.append(scene);
  function object(id,index,action=false,removed=false){
   const n=el(action?'button':'span','math-carrot'+(removed?' math-removed':''));
   if(action){n.type='button';n.setAttribute('aria-label',removed?'Læg gulerod tilbage':p.op==='add'?'Flyt gulerod til samlingen':'Fjern gulerod');n.disabled=counting||s.resolved||(!removed&&p.op==='subtract'&&M.ready(objects));n.onclick=()=>manipulate(index)}
   const image=el('img');image.src=window.AeselIcons.url('carrot');image.alt='';image.draggable=false;n.append(image);n.dataset.object=id;if(!action)n.setAttribute('aria-hidden','true');return n;
  }
  function box(title){const n=el('section','math-tray');n.append(el('h3','',title));const list=el('div','math-tokens');n.append(list);scene.append(n);return {n,list}}
  if(p.op==='subtract'){
   const t=box('Tag '+p.b+' væk');for(let i=0;i<p.a;i++)t.list.append(object('start-'+i,i,true,objects.moved.includes(i)));
  }
  if(p.op==='add'){
   const t=box('Din samling');for(let i=0;i<p.a;i++)t.list.append(object('start-'+i,i));for(const i of objects.moved)t.list.append(object('new-'+i,i));
   const supply=box('Flyt '+p.b+' nye hertil');for(let i=0;i<p.b;i++)if(!objects.moved.includes(i))supply.list.append(object('supply-'+i,i,true));
   if(objects.moved.length===p.b)supply.list.append(el('p','tiny','Alle er flyttet.'));
  }
  if(p.op==='multiply'||p.op==='divide'){
   if(p.op==='divide'){const supply=box('Til deling');for(let i=objects.groups.reduce((a,b)=>a+b,0);i<p.a;i++)supply.list.append(object('pool-'+i,i));}
   for(let g=0;g<objects.groups.length;g++){
    const t=box('Kurv '+(g+1));for(let i=0;i<objects.groups[g];i++)t.list.append(object(`group-${g}-${i}`,i));
    const button=el('button','btn soft small','Læg én i kurven');button.type='button';button.disabled=counting||s.resolved||M.ready(objects)||(p.op==='multiply'&&objects.groups[g]===p.b);button.onclick=()=>manipulate(g);t.n.append(button);
   }
  }
  const ready=M.ready(objects),status=el('p','math-object-status');status.id='mathCountStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  status.textContent=ready?'Klar! Tæl selv, eller tryk Tæl med (hjælp).':p.op==='subtract'?`${objects.moved.length} af ${p.b} fjernet.`:p.op==='multiply'?`Læg ${p.b} i hver af de ${p.a} kurve.`:p.op==='add'?`${objects.moved.length} af ${p.b} flyttet.`:'Læg én i hver kurv, og fortsæt med at dele lige.';
  container.append(status);
  const controls=el('div','math-actions'),count=el('button','btn soft','Tæl med · hjælp');count.id='mathCount';count.type='button';count.disabled=!ready||counting||s.resolved;count.onclick=countObjects;
  const stop=el('button','btn soft','Stop tælling');stop.id='mathCountStop';stop.type='button';stop.hidden=!counting;stop.onclick=()=>{stopCount();renderVisual()};
  const reset=el('button','btn soft small','Start billederne forfra');reset.id='mathObjectReset';reset.type='button';reset.disabled=counting||s.resolved;reset.onclick=()=>{stopCount();objects=M.create(p);renderVisual()};controls.append(count,stop,reset);container.append(controls);
  const label=el('label','math-count-sound'),check=el('input');check.type='checkbox';check.checked=countSound;check.disabled=counting;check.onchange=()=>{countSound=check.checked};label.append(check,document.createTextNode('Læs tallene højt, mens vi tæller'));container.append(label);
 }
 function manipulate(index){
  if(counting||session.resolved)return;
  try{const id=document.activeElement?.dataset.object;M.act(objects,index);renderVisual();const focus=id?$('mathVisual').querySelector(`[data-object="${id}"]`):null;const target=focus&&!focus.disabled?focus:M.ready(objects)?$('mathCount'):$('mathVisual').querySelector('button:not(:disabled)');target?.focus({preventScroll:true})}catch(e){$('mathCountStatus').textContent=e.message}
 }
 function renderGuide(){
  const s=session;$('mathGuide').hidden=!guideOpen;if(!guideOpen)return;
  $('mathGuideTitle').textContent=s.help>=3?'Løsningen':`Trin ${Math.min(2,s.help)} af 2`;
  $('mathGuideText').textContent=E.guide(s.tasks[s.index])[Math.max(0,s.help-1)];
  $('mathHintNext').hidden=s.help!==1||s.resolved;$('mathSolution').hidden=s.help<2||s.resolved;
 }
 function renderTask(){
  speaker.stop();stopCount();const s=session,p=s.tasks[s.index];guideOpen=false;objects=E.isAdult(s.options.level)?null:M.create(p);
  $('mathSummary').hidden=true;$('mathTask').hidden=false;
  $('mathProgress').textContent=`Opgave ${s.index+1} af ${s.tasks.length}`;$('mathScore').textContent=s.points+' point';
  $('mathTaskLabel').textContent=E.OPS[p.op].name+' · '+{easy:'Let',medium:'Mellem',hard:'Svær',adult:'Voksen · svær',expert:'Voksen · ekstra svær'}[s.options.level];
  $('mathEquation').textContent=E.expression(p);$('mathStory').textContent=E.story(p);
  $('mathGame').classList.toggle('math-adult',E.isAdult(s.options.level));$('mathAnswer').maxLength=E.isAdult(s.options.level)?10:3;$('mathAnswer').pattern=E.isAdult(s.options.level)?'-?[0-9]*':'[0-9]*';$('mathSign').hidden=!E.isAdult(s.options.level);$('mathSign').disabled=false;
  $('mathAnswer').value='';$('mathAnswer').disabled=false;$('mathCheck').disabled=false;$('mathFeedback').textContent='';$('mathFeedback').className='math-feedback';
  $('mathHelp').hidden=false;$('mathNext').hidden=true;$('mathNext').textContent=s.index+1===s.tasks.length?'Se dine point →':'Næste opgave →';
  renderGuide();renderVisual();$('mathEquation').focus({preventScroll:true});if(speechPrefs.autoRead)readLine(N.question(p,speechPrefs.name));
 }
 function start(){try{session=E.start({operations:[...document.querySelectorAll('[name="mathOperation"]:checked')].map(n=>n.value),level:$('mathLevel').value,mode:$('mathMode').value,length:Number($('mathLength').value)});try{localStorage.setItem(KEY,JSON.stringify({...session.options,speech:{...speechPrefs}}))}catch(_){}$('mathSetupError').textContent='';window.AeselShowView('mathGame');renderTask()}catch(e){$('mathSetupError').textContent=e.message}}
 function complete(){stopCount();const s=session;$('mathScore').textContent=s.points+' point';$('mathAnswer').disabled=true;$('mathCheck').disabled=true;$('mathSign').disabled=true;$('mathNext').hidden=false;$('mathHelp').hidden=true;renderGuide();renderVisual();$('mathNext').focus({preventScroll:true})}
 $('mathSign').onclick=()=>{if(!session||session.resolved||session.finished)return;const input=$('mathAnswer');input.value=input.value.startsWith('-')?input.value.slice(1):'-'+input.value;input.focus()};
 $('mathAnswerForm').onsubmit=event=>{event.preventDefault();if(!session||session.resolved||session.finished)return;speaker.stop();if(counting){stopCount();renderVisual()}const result=E.check(session,$('mathAnswer').value),feedback=$('mathFeedback');feedback.className='math-feedback';
  if(!result.valid){speaker.stop();stopCount();feedback.textContent=E.isAdult(session.options.level)?'Skriv et helt tal uden punktum eller komma. Brug ± til et negativt svar.':'Skriv et helt tal fra 0 til 100.';$('mathAnswer').focus();return}
  if(!result.correct){const line=feedbackLine($('mathAnswer').value,false,speechPrefs.name);feedback.textContent=line;$('mathAnswer').select();if(speechPrefs.feedback)readLine(line);return}
  const line=feedbackLine($('mathAnswer').value,true,speechPrefs.name);feedback.classList.add('math-success');feedback.textContent=`${line} +${result.points} point. ${E.expression(session.tasks[session.index],true)}`;complete();if(speechPrefs.feedback)readLine(line);
 };
 $('mathReadHelp').onclick=()=>{if(session&&guideOpen&&!session.finished)readLine($('mathGuideText').textContent)};
 $('mathHelp').onclick=()=>{speaker.stop();if(!session||session.resolved)return;if(!session.help)E.hint(session);guideOpen=true;renderGuide();renderVisual()};
 $('mathHintNext').onclick=()=>{speaker.stop();if(!session||session.resolved)return;E.hint(session);renderGuide();renderVisual()};
 $('mathSolution').onclick=()=>{speaker.stop();if(!session||session.resolved)return;const text=E.solution(session);$('mathFeedback').textContent='Vi fandt løsningen sammen. Denne opgave giver 0 point.';$('mathEquation').textContent=E.expression(session.tasks[session.index],true);$('mathGuideText').textContent=text;complete()};
 $('mathHideHelp').onclick=()=>{speaker.stop();guideOpen=false;renderGuide();renderVisual();if(!session.resolved)$('mathHelp').focus()};
 $('mathNext').onclick=()=>{if(!session?.resolved||session.finished)return;if(E.next(session)){renderTask();window.scrollTo({top:0,behavior:'instant'});return}
  speaker.stop();$('mathTask').hidden=true;$('mathSummary').hidden=false;$('mathProgress').textContent='Forløbet er færdigt';
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
let childMode=E.isAdult($('mathLevel').value)?'visual':$('mathMode').value;
 function syncLevel(){const adult=E.isAdult($('mathLevel').value);if(adult){if(!$('mathMode').disabled)childMode=$('mathMode').value;$('mathMode').value='numbers'}else if($('mathMode').disabled)$('mathMode').value=childMode;$('mathMode').disabled=adult;$('mathLevelNote').textContent=adult?'Voksenopgaver med større heltal. Minus kan give negative svar; division går op uden rest. Ingen billeder, men Hjælp mig forklarer metoden. Brug ± ved et negativt svar.':'Minus går aldrig under 0. Division går op uden rest. Gange og division bruger tabeller op til 10, og tallene holder sig inden for den valgte sværhedsgrad.'}
 $('mathLevel').onchange=syncLevel;syncLevel();
})();
