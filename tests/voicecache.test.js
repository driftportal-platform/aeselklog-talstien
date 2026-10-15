/* v0.9.8: whitelist, privacy, voice isolation and storage limits. */
const assert=require('node:assert/strict');
const V=require('../voicecache.js');
const endpoint='https://aeselklog-mia-stemme-test.driftportal-platform.workers.dev/tts';
const sample='Hov, hov! I byttede pladser.';
assert.equal(V.isSafePhrase(sample),true);
assert.equal(V.isSafePhrase('En gulerodsmagi sender dig tre felter frem!'),true);
assert.equal(V.isSafePhrase('Høhø! Jeg er Æslet. Fem gange tre? Jeg gætter på femten!'),true);
assert.equal(V.isSafePhrase('Æslet! Bonus. Ryk 2 felter frem.'),true);
assert.equal(V.isSafePhrase('Æslet! Hov, hov!. Ryk 2 felter tilbage.'),true);
assert.equal(V.isSafePhrase('Amalie! Bonus. Ryk 2 felter frem.'),false);
assert.equal(V.isSafePhrase('Nu er det Livs tur.'),false);
assert.equal(V.isSafePhrase('Hvad er fire plus fem?'),false);
assert.equal(V.isSafePhrase('Hej Anna, du slog 3'),false);
const first=V.makeKey({endpoint,voiceId:'mia',text:sample});
const second=V.makeKey({endpoint,voiceId:'Mads1',text:sample});
const cpu=V.makeKey({endpoint,voiceId:'aeselId',text:sample});
assert.notEqual(first,second);
assert.notEqual(first,cpu);
assert.notEqual(first,V.makeKey({endpoint:'https://another-worker.example.com/tts',voiceId:'mia',text:sample}));
assert.equal(V.makeKey({endpoint,voiceId:'mia',text:'Anna har vundet'}),null);
assert.equal(V.makeKey({endpoint,voiceId:'not/valid',text:sample}),null);
assert.equal(V.MAX_BYTES,15*1024*1024);
(async()=>{
 assert.equal(await V.get({endpoint,voiceId:'mia',text:sample}),null,'No IndexedDB on Node returns graceful miss');
 assert.equal((await V.stats()).available,false);
 console.log('PASS: voice-specific cache keys; safe phrase whitelist; graceful unavailable storage');
})().catch(e=>{console.error(e);process.exit(1)});
