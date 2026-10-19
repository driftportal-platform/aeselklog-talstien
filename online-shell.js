(()=>{'use strict';const $=id=>document.getElementById(id);let active=false,unread=0,seen=new Set();
const chat=$('chatDialog'),settings=$('settingsDialog'),launch=$('chatLauncher');
function closeChat(){window.AeselChat?.stopRecording?.();if(chat.open)chat.close();launch.setAttribute('aria-expanded','false')}
function badge(){launch.classList.toggle('has-unread',unread>0);$('chatUnread').hidden=unread===0;$('chatUnread').textContent=String(unread);launch.setAttribute('aria-label',unread?`Åbn chat, ${unread} nye beskeder`:'Åbn chat')}
$('openSettings').onclick=()=>{if(!settings.open)settings.showModal();$('roomMenu').open=true;$('audioMenu').open=true};$('closeSettings').onclick=()=>settings.close();
launch.onclick=()=>{if(chat.open){closeChat();return}unread=0;badge();chat.showModal();launch.setAttribute('aria-expanded','true');$('chatText').focus()};$('closeChat').onclick=closeChat;chat.addEventListener('close',()=>{window.AeselChat?.stopRecording?.();launch.setAttribute('aria-expanded','false')});
for(const dialog of [settings,chat])dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
window.AeselOverlay={setActive(value){active=value;$('openSettings').hidden=!value;launch.hidden=!value;if(!value){closeChat();if(settings.open)settings.close();unread=0;seen=new Set();badge()}},notify(messages,seat){for(const m of messages){if(!seen.has(m.id)&&m.seat!==seat&&!chat.open)unread++;seen.add(m.id)}if(chat.open)unread=0;badge()},resetChat(){unread=0;seen=new Set();badge()},openSettings(){if(active)$('openSettings').click()}};
})();
