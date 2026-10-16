/* v0.9.19: SW delivers 206 byte-range from offline cached MP3 (Safari/iOS media). */
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const mp3=fs.readFileSync(path.join(root,'music','gone-fishin.mp3'));
const url='https://example.org/aeselklog-talstien/music/gone-fishin.mp3';
const listeners={},caches={match:async req=>req.url===url?new Response(mp3,{status:200,headers:{'Content-Type':'audio/mpeg','Content-Length':String(mp3.length)}}):undefined};
const self={location:{origin:'https://example.org'},registration:{scope:'https://example.org/aeselklog-talstien/'},addEventListener:(n,cb)=>listeners[n]=cb};
let networkCalls=0;
vm.runInNewContext(sw,{self,caches,URL,Response,Headers,Promise,fetch:()=>{networkCalls++;throw Error('offline')}});
async function run(header){let pr;const ev={request:new Request(url,header?{headers:{Range:header}}:{}),waitUntil:()=>{},respondWith:p=>pr=Promise.resolve(p)};listeners.fetch(ev);return pr}
(async()=>{
 const part=await run('bytes=100-499');assert.equal(part.status,206);assert.equal(part.headers.get('Content-Range'),`bytes 100-499/${mp3.length}`);
 assert.equal(part.headers.get('Content-Type'),'audio/mpeg');assert.deepEqual(Buffer.from(await part.arrayBuffer()),mp3.subarray(100,500));
 const tail=await run('bytes=-25');assert.equal(tail.status,206);assert.deepEqual(Buffer.from(await tail.arrayBuffer()),mp3.subarray(-25));
 const whole=await run(null);assert.equal(whole.status,200);assert.deepEqual(Buffer.from(await whole.arrayBuffer()),mp3);
 const invalid=await run(`bytes=${mp3.length+5}-`);assert.equal(invalid.status,416);
 assert.equal(networkCalls,0,'offline MP3 must need no network requests');
 console.log('PASS: cached MP3 full-body, byte-range and suffix on offline iPhone');
})().catch(error=>{console.error(error);process.exit(1)})
