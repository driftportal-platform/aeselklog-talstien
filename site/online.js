(()=>{'use strict';
const $=id=>document.getElementById(id);
const api=String(window.AESEL_ONLINE_URL||'').replace(/\/$/,'');
let code='',secret='',s=null,ws=null;
const endpoint=route=>`${api}/api/room/${code}/${route}`;
function say(id,v){$(id).textContent=v}
function error(e){say('actionError',e?.message||String(e))}
async function post(path,body){
  const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json();if(!r.ok)throw Error(j.error||`Fejl ${r.status}`);return j;
}
function card(n){const e=document.createElement('div');e.className='card'+(n==null?' back':'');e.textContent=n==null?'🫏':n;return e}
function render(data){
  if(!data)return;s=data;
  $('setup').classList.add('hidden');$('game').classList.remove('hidden');
  say('code',code);say('message',data.message||'');
  const yourTurn=data.phase==='playing'&&data.you===data.turn;
  const p=$('players');p.replaceChildren();
  data.players.forEach((pl,i)=>{
    const wrap=document.createElement('div');wrap.className='player'+(i===data.turn?' turn':'');
    wrap.innerHTML=`<strong>${pl.name}${i===data.you?' (dig)':''}</strong><p>Lukkede: ${pl.closed} · Åbne: ${pl.openCount} · Æsel: ${pl.donkeys}</p>`;
    wrap.append(card(pl.open));p.append(wrap);
  });
  const centers=$('centers');centers.replaceChildren();
  data.centers.forEach((c,i)=>{const w=document.createElement('div');w.append(`Række ${i+1}`,card(c.top));centers.append(w)});
  const cur=$('current'),actions=$('actions');cur.replaceChildren();actions.replaceChildren();
  const ch=$('challenge');ch.classList.toggle('hidden',!data.canChallenge);
  if(data.phase==='waiting'){cur.textContent='Venter på spiller 2…';return}
  if(data.phase==='finished'){cur.textContent=data.winner===data.you?'Du vandt! 🏆':`${data.players[data.winner]?.name||'Modstander'} vandt!`;return}
  cur.textContent=yourTurn?'Det er din tur.':'Vent på din modstander.';
  if(!yourTurn)return;
  if(data.pending!==null){
    cur.append(card(data.pending));
    actions.append(btn('Læg i min åbne bunke',()=>act('discard')));
    actions.append(btn('Læg på midten',()=>act('place',{source:'pending',kind:'new-center',index:data.centers.length})));
  }else{
    actions.append(btn('Vend kort',()=>act('flip')));
  }
}
function btn(text,fn){const b=document.createElement('button');b.textContent=text;b.onclick=fn;return b}
async function act(type,extra={}){
  try{say('actionError','');const result=await post(endpoint('action'),{secret,type,...extra});render(result)}catch(e){error(e)}
}

function guarded(fn){
  return ()=> window.AeselParentGate.requireParent(fn);
}

$('create').onclick = guarded(async()=>{
  try{const r=await post(`${api}/api/create`,{name:$('name').value,range:$('range').value});code=r.code;secret=r.secret;connect();render({phase:'waiting',players:[{name:$('name').value}],centers:[],message:'Rum oprettet. Del koden.'})}catch(e){say('setupError',e.message)}
});
$('join').onclick = guarded(async()=>{
  try{code=$('joinCode').value.toUpperCase();const r=await post(endpoint('join'),{name:$('name').value});secret=r.secret;connect();const st=await fetch(endpoint('state')+'?secret='+secret).then(r=>r.json());render(st)}catch(e){say('setupError',e.message)}
});
$('challenge').onclick=()=>act('challenge');
function connect(){
  if(ws)ws.close();
  const u=api.replace(/^http/,'ws')+`/api/room/${code}/ws?secret=${secret}`;
  ws=new WebSocket(u);
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='state')render(m.state)};
}
})();
