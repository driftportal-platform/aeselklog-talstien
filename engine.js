/* ÆselKlog v0.9.10 — spørgemotor med individuelle trin pr. regneart og alderssikker progression. Ingen netværk, profiler eller tredjeparts-API. */
(function(root,factory){
  const api=factory();
  if(typeof module !== 'undefined' && module.exports) module.exports=api;
  if(root) root.AeselEngine=api;
})(typeof globalThis !== 'undefined'?globalThis:null,function(){
'use strict';
const TIME_LIMITS={let:60,mellem:30,svaer:10};
const TASKS=[
  {name:'Før / efter',icon:'🔢',short:'1 2 3'},
  {name:'Lige / ulige',icon:'🔴🔵',short:'L / U'},
  {name:'Tiere / enere',icon:'🧊',short:'10 + 1'},
  {name:'Primtal',icon:'👑',short:'👑'},
  {name:'Størst / mindst',icon:'↔️',short:'> <'},
  {name:'Regn',icon:'➕➖',short:'+ −'},
];
const ri=(a,b,rng=Math.random)=>a+Math.floor(rng()*(b-a+1));
const pick=(xs,rng=Math.random)=>xs[ri(0,xs.length-1,rng)];
const shuf=(xs,rng=Math.random)=>{const a=[...xs];for(let i=a.length-1;i>0;i--){let j=ri(0,i,rng);[a[i],a[j]]=[a[j],a[i]];}return a};
function prime(n){if(n<2)return false;for(let j=2;j*j<=n;j++)if(n%j===0)return false;return true;}
function numericOptions(correct,rng=Math.random,count=3,min=0){
 const out=[correct];const choices=shuf([-10,-7,-5,-4,-3,-2,-1,1,2,3,4,5,7,10,11,15,20,30],rng);
 for(const d of choices){const x=correct+d;if(x>=min&&!out.includes(x))out.push(x);if(out.length>=count)break;}
 for(let d=1;out.length<count;d++){const x=correct+d;if(x>=min&&!out.includes(x))out.push(x);}
 return shuf(out,rng).map(String);
}
function pack(type,question,correct,options,help,tier,extra={}){
 const a=options.map(String), corr=String(correct);
 if(!a.includes(corr)||new Set(a).size!==a.length) throw new Error('Ugyldigt svarforslag: '+question);
 return {type,question,correct:corr,options:a,help,tier,...extra};
}
function ageTier(p){if(p.kind==='adult')return 'voksen';const age=Number(p.age);if(age<=4)return '3–4 år';if(age<=6)return '5–6 år';if(age<=8)return '7–8 år';if(age<=12)return '9–12 år';return '13–17 år';}
function toddler(type,age,rng){
 const max=age<=3?3:5,asked=ri(1,max,rng);
 const easyOptions=ans=>shuf([ans,...shuf(Array.from({length:max},(_,i)=>i+1).filter(x=>x!==ans),rng).slice(0,2)],rng).map(String);
 if(type===1&&age>=4){let x=ri(1,max-1,rng);let ans=x+1;return pack(type,`Hvilket tal kommer efter ${x}?`,ans,easyOptions(ans),'Tæl et trin frem på fingrene.',ageTier({age}));}
 if(type===3||type===6){const ct=ri(1,Math.min(max,4),rng);return pack(type,`Tæl gulerødderne: ${'🥕 '.repeat(ct).trim()}  Hvor mange er der?`,ct,easyOptions(ct),'Peg på hver gulerod, når du tæller.',ageTier({age}));}
 if(type===5&&age>=4){const small=ri(1,3,rng),big=small+ri(1,2,rng);return pack(type,`Hvilket tal er størst? ${small} eller ${big}?`,big,shuf([small,big],rng),'Det store tal kommer senere, når du tæller.',ageTier({age}));}
 return pack(type,`Tryk på tallet ${asked}.`,asked,easyOptions(asked),'Find det samme tal på skærmen, og tryk på det.',ageTier({age}));
}
function young(type,age,field,roll,rng,skill=0,skillFor=null){
 const level=type===4&&skillFor?skillFor('plus'):skill;
 const max=Math.max(6,(age===5?10:20)+level*(age===5?2:4));
 if(type===1){const n=ri(2,max-1,rng),after=rng()>.5,ans=n+(after?1:-1);return pack(type,`Hvilket tal kommer ${after?'efter':'før'} ${n}?`,ans,numericOptions(ans,rng,3,0),'Tæl ét trin '+(after?'frem':'tilbage')+'.',ageTier({age}));}
 if(type===2){if(age===5)return toddler(type,4,rng);const n=ri(1,20,rng);return pack(type,`Er ${n} lige eller ulige?`,n%2===0?'Lige':'Ulige',['Lige','Ulige'],'Lige tal slutter på 0, 2, 4, 6 eller 8.',ageTier({age}));}
 if(type===3){if(age===5)return toddler(type,4,rng);const n=ri(10,39,rng),t=Math.floor(n/10),o=n%10;return pack(type,`Hvor mange tiere er der i ${n}?`,t,numericOptions(t,rng,3,0),'Se på det første ciffer i tallet.',ageTier({age}));}
 if(type===4){const k=skillFor?skillFor('plus'):skill;const a=ri(1,Math.max(2,(age===5?4:9)+k),rng),b=ri(0,Math.max(1,(age===5?3:6)+k),rng),ans=a+b;return pack(type,`Hvor meget er ${a} + ${b}?`,ans,numericOptions(ans,rng,3,0),'Brug fingrene til at lægge tallene sammen.',ageTier({age}),{adapted:true,skillArea:'plus',adaptiveStep:k});}
 if(type===5){const a=ri(1,max-3,rng),b=a+ri(1,3,rng);return pack(type,`Hvilket tal er størst, ${a} eller ${b}?`,b,shuf([a,b],rng),'Tallet længst fremme i talrækken er størst.',ageTier({age}));}
 const addition=rng()>.47;
 const area=addition?'plus':'minus',k=skillFor?skillFor(area):skill;
 const arithmeticMax=Math.max(6,(age===5?10:20)+k*(age===5?2:4));
 if(addition){const a=ri(1,Math.max(2,(age===5?5:9)+k),rng),b=ri(0,Math.max(0,arithmeticMax-a),rng),ans=a+b;return pack(type,`Hvad er ${a} + ${b}?`,ans,numericOptions(ans,rng,3,0),'Tæl videre fra '+a+'.',ageTier({age}),{skillArea:area,adaptiveStep:k});}
 const a=ri(3,arithmeticMax,rng),b=ri(1,Math.min(a,Math.max(2,(age===5?3:9)+k)),rng),ans=a-b;
 return pack(type,`Hvad er ${a} − ${b}?`,ans,numericOptions(ans,rng,3,0),'Tæl '+b+' baglæns fra '+a+'.',ageTier({age}),{skillArea:area,adaptiveStep:k});
}
function child(type,age,field,roll,rng,skill=0,skillFor=null){
 if(age<=4)return toddler(type,age,rng);
 if(age<=6)return young(type,age,field,roll,rng,skill);
 const tier=ageTier({age});const older=age>=9,teen=age>=13;
 const scaled=n=>Math.max(5,Math.round(n*(1+Math.max(-2,Math.min(2,skill))*.20)));
 if(type===1){const n=ri(3,scaled(teen?350:(older?150:90)),rng);const step=teen?pick([5,10,25],rng):(older?pick([2,5,10],rng):1);const after=rng()>.5,ans=n+(after?step:-step);return pack(type,`Hvad kommer ${step} ${after?'efter':'før'} ${n}?`,ans,numericOptions(ans,rng,4,0),'Tæl '+step+' '+(after?'frem':'tilbage')+' fra '+n+'.',tier);}
 if(type===2){if(teen||older){const a=ri(4,teen?125:50,rng),b=ri(3,15,rng),val=a+b,correct=val%2===0?'Lige':'Ulige';return pack(type,`Er resultatet af ${a} + ${b} lige eller ulige?`,correct,['Lige','Ulige'],'Regn først, og kig så på sidste ciffer.',tier);}const n=ri(20,scaled(70),rng);return pack(type,`Er ${n} lige eller ulige?`,n%2===0?'Lige':'Ulige',['Lige','Ulige'],'Se på sidste ciffer: 0, 2, 4, 6 og 8 er lige.',tier);}
 if(type===3){if(teen){const n=ri(150,2999,rng),t=Math.floor(n/10)%10,h=Math.floor(n/100)%10,o=n%10;const correct=`${h} hundreder, ${t} tiere og ${o} enere`;const opts=[correct,`${h+1} hundreder, ${t} tiere og ${o} enere`,`${h} hundreder, ${t+1} tiere og ${o} enere`];return pack(type,`Hvor mange hundreder, tiere og enere har ${n} i de sidste tre cifre?`,correct,shuf(opts,rng),`Kig på de sidste tre cifres placering.`,tier);}const n=ri(10,scaled(Math.min(200,older?199:99)),rng),t=Math.floor(n/10),o=n%10,correct=`${t} tiere og ${o} enere`;let candidates=[correct,`${t+1} tiere og ${o} enere`,`${t} tiere og ${(o+1)%10} enere`];return pack(type,`Hvordan er tallet ${n} bygget?`,correct,shuf(candidates,rng),`Der er ${t} hele tiere og ${o} enere.`,tier);}
 if(type===4){if(!older){const n=ri(10,scaled(60),rng);return pack(type,`Er ${n} deleligt med 2 uden rest?`,n%2===0?'Ja':'Nej',['Ja','Nej'],'Alle lige tal kan deles med 2 uden rest.',tier,{adapted:true});}const n=ri(13,scaled(teen?150:90),rng);return pack(type,`Er ${n} et primtal?`,prime(n)?'Ja':'Nej',['Ja','Nej'],'Et primtal har kun 1 og sig selv som positive divisorer.',tier);}
 if(type===5){const n=ri(10,scaled(teen?150:85),rng),delta=ri(2,teen?25:10,rng),x=n+(rng()>.5?delta:-delta);return pack(type,`Er ${x} større eller mindre end ${n}?`,x>n?'Større':'Mindre',['Større','Mindre'],'Sammenlign på talrækken: det længst fremme er størst.',tier);}
 // mixed arithmetic progression with multiplication or division from age 9+
 const tableLevel=skillFor?skillFor('tables'):skill;
 const ops=age<=8?(age===8&&tableLevel>=2?['+','−','×']:['+','−']):teen?(tableLevel<=-2?['+','−','×','÷']:['+','−','×','÷','mix']):(tableLevel<=-1?['+','−','×']:['+','−','×','÷']);const op=pick(ops,rng);
 const area=op==='+'?'plus':op==='−'?'minus':'tables',k=skillFor?skillFor(area):skill;
 const scaledMath=n=>Math.max(5,Math.round(n*(1+Math.max(-2,Math.min(2,k))*.20)));
 let a,b,ans,q;
 if(op==='+'){a=ri(10,scaledMath(teen?180:older?85:45),rng);b=ri(2,scaledMath(teen?85:older?40:20),rng);ans=a+b;q=`Hvad er ${a} + ${b}?`;}
 else if(op==='−'){a=ri(18,scaledMath(teen?250:older?120:70),rng);b=ri(2,a-1,rng);ans=a-b;q=`Hvad er ${a} − ${b}?`;}
 else if(op==='×'){a=ri(2,scaledMath(teen?19:12),rng);b=ri(2,scaledMath(teen?15:10),rng);ans=a*b;q=`Hvad er ${a} × ${b}?`;}
 else if(op==='÷'){b=ri(2,Math.max(2,scaledMath(teen?12:9)),rng);ans=ri(2,Math.max(2,scaledMath(teen?15:10)),rng);a=b*ans;q=`Hvad er ${a} ÷ ${b}?`;}
 else {a=ri(3,Math.max(3,scaledMath(15)),rng);b=ri(3,Math.max(3,scaledMath(12)),rng);let extra=ri(2,Math.max(2,scaledMath(28)),rng);ans=a*b+extra;q=`Hvad er (${a} × ${b}) + ${extra}?`;}
 return pack(type,q,ans,numericOptions(ans,rng,4,0),'Regn ét skridt ad gangen. Brug papir, hvis du vil.',tier,{skillArea:area,adaptiveStep:k});
}
function adult(type,difficulty,field,roll,rng){
 const tier='Voksen · '+(difficulty==='let'?'let':difficulty==='svaer'?'svær':'mellem');
 const hard=difficulty==='svaer',med=difficulty==='mellem';
 let a,b,n,ans,q,options,help='Regn et skridt ad gangen. Du må gerne bruge papir.';
 if(type===1){a=ri(20,hard?400:med?180:85,rng);b=pick(hard?[7,12,25,50]:med?[5,10,20]:[2,5,10],rng);let dir=rng()>.5?1:-1;ans=a+dir*b;q=`Hvad er ${b} ${dir>0?'mere':'mindre'} end ${a}?`;options=numericOptions(ans,rng,4,0);}
 else if(type===2){a=ri(11,hard?399:med?160:49,rng);b=ri(5,hard?145:med?55:18,rng);ans=(a*b+(hard?ri(3,19,rng):0))%2===0?'Lige':'Ulige';q=hard?`Er (${a} × ${b}) + et ulige tal lige eller ulige?`:`Er resultatet af ${a} × ${b} lige eller ulige?`;if(hard){const extra=pick([3,5,7,9,11],rng);q=`Er (${a} × ${b}) + ${extra} lige eller ulige?`;ans=(a*b+extra)%2===0?'Lige':'Ulige';}options=['Lige','Ulige'];help='Kun sidste ciffer er nødvendigt for at afgøre lige og ulige.';}
 else if(type===3){n=ri(hard?1000:med?300:100,hard?9999:med?2599:799,rng);let h=Math.floor(n/100)%10,t=Math.floor(n/10)%10,o=n%10;ans=`${h} hundr., ${t} tiere, ${o} enere`;const alts=[ans,`${h} hundr., ${o} tiere, ${t} enere`,`${Math.floor(n/100)} hundr., ${o} tiere, ${t} enere`,`${h} hundr., ${t} tiere, ${(o+1)%10} enere`];options=shuf([...new Set(alts)],rng);while(options.length<3){const v=`${h+1} hundr., ${t} tiere, ${o} enere`;if(!options.includes(v))options.push(v);else break;}q=`Se på de sidste tre cifre i ${n}. Hvor mange hundreder, tiere og enere er der?`;help='Kig på hundredepladsen, tierpladsen og enerpladsen.';}
 else if(type===4){n=ri(hard?67:med?31:11,hard?249:med?149:79,rng);ans=prime(n)?'Ja':'Nej';q=`Er ${n} et primtal?`;options=['Ja','Nej'];help='Et primtal er større end 1 og har præcis to positive divisorer.';}
 else if(type===5){a=ri(5,hard?31:med?21:12,rng);b=ri(4,hard?20:med?12:9,rng);const c=ri(10,hard?175:med?80:40,rng);let d=ri(2,hard?65:med?40:15,rng);const val1=a*b;let val2=c+d;if(val1===val2){d+=1;val2=c+d;}const desc1=`${a} × ${b}`,desc2=`${c} + ${d}`;q=`Hvilket regnestykke giver det største tal: ${desc1} eller ${desc2}?`;ans=val1>val2?desc1:desc2;options=[desc1,desc2];help='Regn begge udtryk ud, og vælg det største resultat.';}
 else {const op=pick(hard?['mix1','mix2','×','÷','+','−']:med?['+','−','×','÷','mix1']:['+','−','×','÷'],rng);
   if(op==='+'){a=ri(20,hard?900:med?250:100,rng);b=ri(5,hard?500:med?145:75,rng);ans=a+b;q=`Hvad er ${a} + ${b}?`;}
   else if(op==='−'){a=ri(40,hard?950:med?350:150,rng);b=ri(5,a-3,rng);ans=a-b;q=`Hvad er ${a} − ${b}?`;}
   else if(op==='×'){a=ri(3,hard?39:med?25:12,rng);b=ri(3,hard?29:med?17:12,rng);ans=a*b;q=`Hvad er ${a} × ${b}?`;}
   else if(op==='÷'){b=ri(2,hard?23:med?16:12,rng);ans=ri(3,hard?35:med?20:12,rng);a=ans*b;q=`Hvad er ${a} ÷ ${b}?`;}
   else if(op==='mix1'){a=ri(4,hard?29:17,rng);b=ri(3,hard?21:12,rng);const k=ri(8,hard?70:40,rng);ans=a*b+k;q=`Hvad er (${a} × ${b}) + ${k}?`;}
   else {a=ri(9,29,rng);b=ri(4,21,rng);const k=ri(3,8,rng);ans=(a+b)*k;q=`Hvad er (${a} + ${b}) × ${k}?`;}
   options=numericOptions(ans,rng,4,0);
 }
 if(options.length<2)options=String(ans)==='Ja'?['Ja','Nej']:numericOptions(Number(ans),rng,3,0);
 return pack(type,q,ans,options,help,tier,{timeLimit:TIME_LIMITS[difficulty]||30});
}
/** Gangeopgaver knyttet til valgt tabel. 3–6-årige får stadig normale begynderopgaver. */
function tableChallenge(player,tables='auto',rng=Math.random,skill=0){
 const age=player.kind==='adult'?18:Math.max(3,Math.min(17,Number(player.age)||7));
 if(age<7)return null;
 const selected=Number(tables);
 const available=age<=8?[2,5,10]:Array.from({length:11},(_,i)=>i+2);
 const fixed=Number.isInteger(selected)&&selected>=2&&selected<=12?selected:pick(available,rng);
 let high;
 if(player.kind==='adult')high=player.difficulty==='svaer'?20:player.difficulty==='mellem'?15:10;
 else high=Math.max(3,(age<=7?5:age<=8?10:12)+Math.max(-2,Math.min(2,skill))*2);
 const multiplier=ri(age<=8?1:2,high,rng);
 const answer=fixed*multiplier;
 let question=`Hvad er ${fixed} × ${multiplier}?`;
 let correct=answer;
 if(player.kind==='adult'&&player.difficulty==='svaer'&&rng()<.45){
   const extra=ri(2,45,rng);correct=answer+extra;
   question=`Hvad er (${fixed} × ${multiplier}) + ${extra}?`;
 }
 const label=tables==='mix'?'Blandede tabeller':`${fixed}-tabellen`;
 return pack(6,question,correct,numericOptions(correct,rng,4,0),`Tænk på ${fixed}-tabellen. Regn ét skridt ad gangen.`,ageTier(player),{
   table:fixed,tableLabel:label,timeLimit:player.kind==='adult'?TIME_LIMITS[player.difficulty]||30:undefined
 });
}
function makeChallenge({player,type,field=1,roll=1,tables='auto',forceTable=false,skillStep=0,skillSteps=null,rng=Math.random}){
 if(!player||!Number.isInteger(type)||type<1||type>6)throw new Error('Ukendt spørgsmålstype');
 const clampStep=value=>Math.max(-2,Math.min(2,Math.round(Number(value)||0)));
 const legacy=player.kind==='child'?clampStep(skillStep):0;
 // v0.9.10: Engine's public interface accepts independent values per subject.
 // Old integrations passing just skillStep continue to behave as before.
 const forArea=area=>player.kind==='child'?clampStep(skillSteps&&Object.prototype.hasOwnProperty.call(skillSteps,area)?skillSteps[area]:legacy):0;
 const numberStep=forArea('numbers');
 if(type===6&&(forceTable||tables!=='off')){
  const age=player.kind==='adult'?18:Number(player.age)||7;
  if(age>=7){
   const forced=forceTable||/^(?:[2-9]|1[0-2])$/.test(String(tables));
   const ratio=forced?1:tables==='mix'?.72:(age<=8?.32:.48);
   if(rng()<ratio){
    const table=tableChallenge(player,tables,rng,forArea('tables'));
    return player.kind==='child'?{...table,skillArea:'tables',adaptiveStep:forArea('tables')}:table;
   }
  }
 }
 if(player.kind==='adult')return adult(type,player.difficulty||'mellem',field,roll,rng);
 const age=Math.max(3,Math.min(17,Number(player.age)||7));
 let task,area='numbers';
 if(age<=4){const effort=numberStep>0?4:age;task={...toddler(type,effort,rng),tier:ageTier(player)};}
 else if(age<=6){
  area=type===4?'plus':'numbers';
  task={...young(type,age,field,roll,rng,numberStep,forArea),tier:ageTier(player)};
 }else task={...child(type,age,field,roll,rng,numberStep,forArea),tier:ageTier(player)};
 area=task.skillArea||area;
 return {...task,skillArea:area,adaptiveStep:task.adaptiveStep??forArea(area)};
}
return {TASKS,TIME_LIMITS,makeChallenge,tableChallenge,prime,numericOptions,ageTier};
});
