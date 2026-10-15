/* v0.9.6: hjælpekode til den godkendte forside. Alle øvrige knapper styres fortsat af app.js. */
(()=>{'use strict';
 const open=document.getElementById('homeAbout');
 const close=document.getElementById('closeAbout');
 const dialog=document.getElementById('aboutDialog');
 if(open&&close&&dialog){
  open.addEventListener('click',()=>dialog.showModal());
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
 }
})();
