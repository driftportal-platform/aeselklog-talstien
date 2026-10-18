const {GameRoom}=await import('./worker/src.js');
const records=new Map();const storage={get:async k=>records.get(k),put:async(k,v)=>records.set(k,v)};
const room=new GameRoom({storage},{});
const call=(route,data,method='POST',headers={})=>room.fetch(new Request('https://room/'+route,{method,headers:{'content-type':'application/json',...headers},...(method==='POST'?{body:JSON.stringify(data)}:{})}));
const a='a'.repeat(48),b='b'.repeat(48);
const j=await call('init',{name:'Barn',range:'1-20',secret:a,code:'ABCDEFGH'});if(j.status!==200)throw Error('init');
let r=await call('chat',{secret:a,kind:'quick',text:'👏 Godt spil!'});if(r.status!==409)throw Error('prejoin');
// The join route generates token. Use actual token.
r=await call('join',{name:'Voksen'});const two=await r.json();if(r.status!==200)throw Error('join');
r=await call('chat',{secret:a,kind:'text',text:'Hej'});if(r.status!==403)throw Error('free text default');
r=await call('chat-settings',{secret:a,enabled:true});if(r.status!==200)throw Error('consent1');
r=await call('chat',{secret:a,kind:'text',text:'Hej'});if(r.status!==403)throw Error('both consent');
r=await call('chat-settings',{secret:two.secret,enabled:true});if(r.status!==200)throw Error('consent2');
r=await call('chat',{secret:a,kind:'text',text:'Hej'});if(r.status!==200)throw Error('text');
r=await call('chat',null,'GET',{'x-player-secret':'invalid'});if(r.status!==401)throw Error('secret');
r=await call('chat',null,'GET',{'x-player-secret':two.secret});const data=await r.json();if(!data.messages.some(m=>m.text==='Hej'))throw Error('visibility');
console.log('Chat server: 8 checks OK');
