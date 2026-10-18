/* ÆselKlog Online – simpel forældrelås før invitation/oprettelse.
   Kode gemmes kun lokalt på enheden. Standardkode: 1234 (skal ændres). */
(function(root){
  'use strict';
  const KEY = 'aeselklog-parent-pin-v1';
  const DEFAULT = '1234';

  function getPin(){
    try{ return localStorage.getItem(KEY) || DEFAULT; }catch{ return DEFAULT; }
  }
  function setPin(pin){
    if(!/^\d{4}$/.test(pin)) throw Error('PIN skal være 4 cifre');
    localStorage.setItem(KEY, pin);
  }
  function check(pin){ return pin === getPin(); }

  function requireParent(onSuccess){
    const existing = document.getElementById('parentGate');
    if(existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'parentGate';
    overlay.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:1000;display:grid;place-items:center;padding:16px';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:24px;max-width:360px;text-align:center;box-shadow:0 10px 40px #0003">
        <h2>👨‍👩‍👧 Forældrelås</h2>
        <p>Online-spil kræver en voksen. Indtast forældrekoden for at oprette eller deltage.</p>
        <input id="parentPin" type="password" inputmode="numeric" maxlength="4" placeholder="4-cifret kode" style="font-size:1.4rem;text-align:center;width:140px;padding:10px;margin:8px">
        <div style="margin-top:12px">
          <button id="parentOk" class="btn main">Lås op</button>
          <button id="parentCancel" class="btn soft">Annuller</button>
        </div>
        <p class="tiny" style="margin-top:12px;color:#62758a">Standardkode er 1234. Skift den under Indstillinger senere.</p>
        <p id="parentError" style="color:#c0392b;min-height:1.2em"></p>
      </div>`;
    document.body.appendChild(overlay);
    const pinEl = overlay.querySelector('#parentPin');
    const err = overlay.querySelector('#parentError');
    overlay.querySelector('#parentOk').onclick = () => {
      if(check(pinEl.value)){ overlay.remove(); onSuccess(); }
      else err.textContent = 'Forkert kode. Prøv igen.';
    };
    overlay.querySelector('#parentCancel').onclick = () => overlay.remove();
    pinEl.focus();
  }

  root.AeselParentGate = { requireParent, setPin, getPin };
})(window);
