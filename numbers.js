/* ÆselKlog v0.9.22 – talord og valgfri sprogtræning, ingen netværk. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.AeselNumbers=api;})(typeof globalThis!=='undefined'?globalThis:null,function(){'use strict';
const keys=['da','en','de','es','da-en','da-de','da-es'];
const locale={da:'da-DK',en:'en-GB',de:'de-DE',es:'es-ES'};
const da=['nul','en','to','tre','fire','fem','seks','syv','otte','ni','ti','elleve','tolv','tretten','fjorten','femten','seksten','sytten','atten','nitten'];
const en=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const de=['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn'];
const es=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve'];
const tens={da:['','','tyve','tredive','fyrre','halvtreds','tres','halvfjerds','firs','halvfems'],en:['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'],de:['','','zwanzig','dreißig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig'],es:['','','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa']};
function word(n,lang='da'){
 n=Number(n);if(!Number.isInteger(n)||n<0||n>100||!locale[lang])return null;
 if(n===100)return {da:'hundrede',en:'one hundred',de:'hundert',es:'cien'}[lang];
 const basics={da,en,de,es}[lang];if(n<20)return basics[n];
 const t=Math.floor(n/10),u=n%10;if(!u)return tens[lang][t];
 if(lang==='da')return (u===1?'en':da[u])+'og'+tens.da[t];
 if(lang==='en')return tens.en[t]+'-'+en[u];
 if(lang==='de')return (u===1?'ein':de[u])+'und'+tens.de[t];
 if(t===2)return ['','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'][u];
 return tens.es[t]+' y '+es[u];
}
function normalize(lang){return keys.includes(lang)?lang:'da'}
function parts(n,lang){return normalize(lang).split('-').map(l=>({lang:l,locale:locale[l],text:word(n,l)})).filter(x=>x.text)}
return Object.freeze({keys,locale,word,normalize,parts});
});
