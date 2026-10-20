const assert=require('node:assert/strict');
(async()=>{
 const {GameRoom}=await import('../worker/src.js');
 async function setup(gameType='cards',count=3,joined=count,variant='collect'){
 const db=new Map(),room=new GameRoom({storage:{get:async k=>structuredClone(db.get(k)),put:async(k,v)=>db.set(k,structuredClone(v)),delete:async k=>db.delete(k),setAlarm:async()=>{},deleteAlarm:async()=>{}}},{}),secrets=['a'.repeat(48)];
 const call=(route,data)=>room.fetch(new Request('https://room/'+route,{method:data?'POST':'GET',...(data?{body:JSON.stringify(data)}:{})}));
 await call('init',{code:'ABCDEFGH',secret:secrets[0],name:'Alma',range:'1-20',deckSets:3,playerCount:count,gameType,variant,donkeyCount:8});
 for(let i=1;i<joined;i++)secrets.push((await(await call('join',{name:'P'+i})).json()).secret);
 return {db,room,call,secrets,leave:i=>call('leave',{secret:secrets[i]})};
 }
 const cards=g=>[...g.players.flatMap(p=>[...p.closed,...p.open]),...g.centers.flat(),...(g.pending!=null?[g.pending]:[])].sort((a,b)=>a-b);
 for(const variant of ['collect','passing']){
 const x=await setup('cards',3,3,variant);let g=x.db.get('game');g.pending=g.players[0].closed.pop();g.players[0].donkeys=variant==='passing'?1:3;x.db.set('game',g);const before=cards(g),old=g.players.map(p=>p.closed.slice()),events=[];
 const departed={send:s=>events.push(JSON.parse(s)),close:()=>events.push('closed')},other={send:()=>{},close:()=>assert.fail('remaining socket closed')};x.room.clients.set(departed,0);x.room.clients.set(other,1);
 assert.equal((await x.call('leave',{secret:'bad'})).status,401);
 const res=await x.leave(0);assert.equal(res.status,200);const view=await res.json();assert.equal(view.youLeft,true);assert.equal(view.hostSeat,1);assert.equal(view.activeCount,2);
 g=x.db.get('game');assert.equal(g.phase,'playing');assert.equal(g.turn,1);assert.equal(g.pending,null);assert.equal(g.players[0].donkeys,0);assert.deepEqual(g.players[0].closed,[]);assert.deepEqual(cards(g),before);
 for(const i of [1,2])assert.deepEqual(g.players[i].closed.slice(-old[i].length),old[i]);assert(Math.abs(g.players[1].closed.length-g.players[2].closed.length)<=1);
 assert.equal(events.at(-1),'closed');assert.equal(x.room.clients.size,1);assert.equal(g.lastMove,null);
 const saved=structuredClone(g);assert.equal((await x.leave(0)).status,200);assert.deepEqual(x.db.get('game'),saved);
 assert.equal((await x.call('action',{secret:x.secrets[0],type:'flip'})).status,401);
 assert.equal((await(await x.call('state?secret='+x.secrets[0])).json()).youLeft,true);
 assert.equal(x.room.givePenalty(g,1).assigned,true);assert.equal(g.players[1].donkeys,1);
 assert.equal((await x.leave(2)).status,200);assert.equal(x.db.get('game').phase,'closed');
 }
 for(const gameType of ['cards','board']){
 const x=await setup(gameType);let g=x.db.get('game');const positions=g.board?.players.map(p=>p.pos);assert.equal((await x.leave(0)).status,200);g=x.db.get('game');assert.equal(g.phase,'playing');assert.equal(g.turn,1);assert.equal(g.hostSeat,1);
 if(gameType==='board'){assert(g.board.players[0].leftAt);assert.deepEqual(g.board.players.map(p=>p.pos),positions);assert.equal(g.board.turn,1)}
 assert.equal((await x.call('action',{secret:x.secrets[1],type:'end-game'})).status,200);
 const lobby=await setup(gameType,3,2);await lobby.leave(0);assert.equal(lobby.db.get('game').phase,'waiting');await lobby.call('join',{name:'New1'});await lobby.call('join',{name:'New2'});g=lobby.db.get('game');assert.equal(g.phase,'playing');assert.equal(g.turn,1);assert.equal(g.players.length,4);assert(g.players[0].leftAt);
 if(gameType==='cards'){assert.equal(g.players[0].closed.length,0);assert.equal(cards(g).length,60)}
 }

 {const x=await setup('board');let g=x.db.get('game');g.board.phase='question';g.board.question={deadline:Date.now()+60000,options:[1,2,3]};g.board.pending={roll:3};g.board.players[1].skipNextTurn=true;x.db.set('game',g);await x.leave(0);g=x.db.get('game');assert.equal(g.board.question,null);assert.equal(g.board.pending,null);assert.equal(g.board.phase,'skipped');assert.equal(g.board.players[1].skipNextTurn,false);}
 {const x=await setup('board');let g=x.db.get('game');g.board.phase='question';g.board.question={deadline:Date.now()+60000,options:[1,2,3]};g.board.pending={roll:3};x.db.set('game',g);await x.leave(2);assert.deepEqual(x.db.get('game').board.question,g.board.question);assert.equal(x.db.get('game').turn,0);}
 const x=await setup('cards',4);await Promise.all([x.leave(0),x.leave(1)]);assert.equal(x.db.get('game').phase,'playing');assert.equal(x.db.get('game').turn,2);assert.equal(cards(x.db.get('game')).length,60);
 console.log('PASS leave: both games, stable seats, host transfer, card conservation and pile order, donkey pool, authentication, socket broadcast, idempotence, lobby replacement, concurrent departures');
})().catch(e=>{console.error(e);process.exitCode=1});
