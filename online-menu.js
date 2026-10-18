/* ÆselKlog: Åbn voksenstyret onlinepilot fra Spil-menuen. */
(() => {
  'use strict';
  const online = document.getElementById('openOnlineGame');
  if (online) online.addEventListener('click', () => {
    window.location.href = './site/online.html';
  });
})();
