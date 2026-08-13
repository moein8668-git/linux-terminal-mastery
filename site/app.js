(function(){
'use strict';
document.documentElement.classList.add('js');
var win=document.getElementById('win'), pane=document.getElementById('pane');
if(!win||!pane) return;
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var SITE=window.SITE||{};
var SITE_BASE=SITE.base||window.SITE_BASE||'./';
var CHAPTER=SITE.slug||window.CURRENT_CHAPTER||'home';
var catalog=null;
var heads=[], segs=[], tocLinks=[];

function rootUrl(path){
  var siteRoot=new URL('/', location.origin);
  return new URL(String(path||'').replace(/^\/+/,''), siteRoot).href;
}
function lessonUrl(slug){
  if(slug==='chat') return rootUrl('chat/');
  return slug==='home' ? rootUrl('') : rootUrl('chapters/'+slug+'/');
}

/* ---------- toast ---------- */
var toastEl=document.getElementById('toast'), toastT;
function toast(msg){
  if(!toastEl) return;
  toastEl.textContent=msg; toastEl.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(function(){ toastEl.classList.remove('show'); },2400);
}

/* ---------- bash highlight ---------- */
var RE=/(#[^\n]*)|("(?:[^"\n])*"|'(?:[^'\n])*')|(\$\{[^}\n]*\}|\$[A-Za-z_]\w*)|([\w./-]+\.(?:deb|rpm|tar|gz|tgz|sh|conf|service)\b)|(^|[ \t])(--?[A-Za-z][\w-]*)|\b(sudo|apt-get|apt|dpkg|dnf|yum|pacman|git|curl|wget|python3|python|tree|cat|man|bash|zsh|ls|cd|pwd|chmod|chown|chgrp|mkdir|rmdir|rm|cp|mv|touch|nano|vim|vi|ssh|scp|sftp|sshd|systemctl|journalctl|ps|top|htop|kill|killall|ip|ss|ping|traceroute|ufw|useradd|usermod|userdel|passwd|groupadd|crontab|find|grep|awk|sed|cut|sort|uniq|xargs|tar|gzip|df|du|mount|umount|fdisk|lsblk|free|uname|whoami|who|w|history|alias|tmux|echo|printf|head|tail|less|more|wc|tee|export|source|env|which|hostnamectl|rsync|dd|mkfs|blkid|nginx|openssl|chmod)\b|\b(install|remove|purge|update|upgrade|search|show|list|autoremove|clean|enable|disable|start|stop|restart|status|reload|edit)\b|\b(package-name|keyword|username|hostname|filename|ip-address)\b|\b(\d+(?:\.\d+)*)\b/gm;
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function hlLine(line){
  return esc(line).replace(RE,function(m,cmt,str,vari,deb,pre,flag,tool,sub,ph,num){
    if(cmt)return '<span class="tk-c">'+m+'</span>';
    if(str)return '<span class="tk-st">'+m+'</span>';
    if(vari)return '<span class="tk-v">'+m+'</span>';
    if(deb)return '<span class="tk-d">'+m+'</span>';
    if(flag)return (pre||'')+'<span class="tk-f">'+flag+'</span>';
    if(tool)return '<span class="tk-t">'+m+'</span>';
    if(sub)return '<span class="tk-s">'+m+'</span>';
    if(ph)return '<span class="tk-ph">'+m+'</span>';
    if(num)return '<span class="tk-n">'+m+'</span>';
    return m;
  });
}
function highlightCodes(){
  pane.querySelectorAll('code.cm').forEach(function(c){
    if(c.dataset.raw) return;
    var raw=c.textContent.replace(/\n$/,'');
    c.dataset.raw=raw;
    c.innerHTML=raw.split('\n').map(function(l){ return '<span class="tk-pr">$</span> '+hlLine(l); }).join('\n');
  });
}

/* ---------- copy ---------- */
function copyText(t){
  if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
  return new Promise(function(res){
    var ta=document.createElement('textarea'); ta.value=t;
    ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    ta.remove(); res();
  });
}
function bindCopy(){
  pane.querySelectorAll('.copy').forEach(function(btn){
    if(btn.dataset.bound) return;
    btn.dataset.bound='1';
    btn.addEventListener('click',function(){
      var code=btn.closest('.term-mini').querySelector('code.cm');
      copyText(code.dataset.raw||code.textContent).then(function(){
        btn.textContent='copied ✓'; btn.classList.add('ok');
        setTimeout(function(){ btn.textContent='copy'; btn.classList.remove('ok'); },1400);
      });
    });
  });
}

/* ---------- menubar ---------- */
var wraps=Array.prototype.slice.call(document.querySelectorAll('.mi-wrap'));
var mBtns=wraps.map(function(w){ return w.querySelector('.mi'); });
function popOf(b){ return b.parentElement.querySelector('.menu-pop'); }
function itemsOf(p){ return Array.prototype.slice.call(p.querySelectorAll('.pop-item')); }
function closeMenus(){ wraps.forEach(function(w){ var p=w.querySelector('.menu-pop');
  if(!p) return;
  p.hidden=true; w.querySelector('.mi').setAttribute('aria-expanded','false'); }); }
function focusItem(p,i){ var it=itemsOf(p); it.forEach(function(o,j){ o.tabIndex=(j===i)?0:-1; }); if(it[i]) it[i].focus(); }
function openMenu(btn){ var p=popOf(btn); closeMenus();
  if(btn.textContent.trim()==='Bookmarks') renderMarks();
  p.hidden=false; btn.setAttribute('aria-expanded','true'); focusItem(p,0); }
mBtns.forEach(function(btn,idx){
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    var p=popOf(btn); p.hidden?openMenu(btn):closeMenus();
  });
  btn.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){ e.preventDefault(); openMenu(btn); }
    else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
      e.preventDefault(); var wasOpen=!popOf(btn).hidden; closeMenus();
      var n=e.key==='ArrowRight'?(idx+1)%mBtns.length:(idx-1+mBtns.length)%mBtns.length;
      mBtns[n].focus(); if(wasOpen) openMenu(mBtns[n]);
    }
  });
});
wraps.forEach(function(w){
  var p=w.querySelector('.menu-pop');
  if(!p) return;
  p.addEventListener('keydown',function(e){
    var it=itemsOf(p), i=it.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){ e.preventDefault(); focusItem(p,Math.min(i+1,it.length-1)); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); focusItem(p,Math.max(i-1,0)); }
    else if(e.key==='Escape'){ e.preventDefault(); closeMenus(); w.querySelector('.mi').focus(); }
    else if(e.key==='Tab'){ closeMenus(); }
  });
});
document.addEventListener('click',function(e){
  if(!e.target.closest('.mi-wrap')) closeMenus();
  if(!e.target.closest('.findbar')){ findRes.hidden=true; }
});

/* ---------- themes ---------- */
var KEY='lt-theme', sbTheme=document.getElementById('sbTheme'),
    aboutTheme=document.getElementById('aboutTheme'),
    radios=Array.prototype.slice.call(document.querySelectorAll('[role="menuitemradio"]'));
function currentTheme(){ return document.documentElement.getAttribute('data-theme')||'dracula'; }
function applyTheme(t,persist){
  document.documentElement.setAttribute('data-theme',t);
  if(sbTheme) sbTheme.textContent=t;
  if(aboutTheme) aboutTheme.textContent=t;
  radios.forEach(function(r){ r.setAttribute('aria-checked', r.dataset.t===t?'true':'false'); });
  if(persist){ try{ localStorage.setItem(KEY,t); }catch(e){} }
}
radios.forEach(function(r){ r.addEventListener('click',function(){ applyTheme(r.dataset.t,true); closeMenus(); toast('✓ color scheme: '+r.dataset.t); }); });
applyTheme(currentTheme(),false);

/* ---------- sidebar toggle ---------- */
var miSidebar=document.querySelector('[data-act="sidebar"]'), sideToggle=document.getElementById('sideToggle');
function isMobile(){ return window.matchMedia('(max-width:960px)').matches; }
function sideVisible(){ return isMobile()?win.classList.contains('side-open'):!win.classList.contains('side-hidden'); }
function syncSide(){
  if(miSidebar){
    miSidebar.setAttribute('aria-checked',sideVisible()?'true':'false');
    miSidebar.textContent=sideVisible()?'Hide Sidebar':'Show Sidebar';
  }
  if(sideToggle) sideToggle.setAttribute('aria-expanded',win.classList.contains('side-open')?'true':'false');
}
function toggleSidebar(){ if(isMobile()) win.classList.toggle('side-open'); else win.classList.toggle('side-hidden'); syncSide(); }
if(miSidebar) miSidebar.addEventListener('click',function(){ toggleSidebar(); });
if(sideToggle) sideToggle.addEventListener('click',toggleSidebar);
syncSide();

/* ---------- zoom ---------- */
var zoom=1;
function setZoom(z){ zoom=Math.min(1.5,Math.max(.75,z)); pane.style.setProperty('--zoom',zoom); }

/* ---------- settings ---------- */
var miScan=document.querySelector('[data-act="scan"]');
function setScan(on){ document.documentElement.dataset.scan=on?'on':'off';
  if(miScan) miScan.setAttribute('aria-checked',on?'true':'false');
  try{ localStorage.setItem('lt-scan',on?'1':'0'); }catch(e){} }
if(miScan) miScan.addEventListener('click',function(){ setScan(miScan.getAttribute('aria-checked')!=='true'); });
setScan((function(){ try{ return localStorage.getItem('lt-scan')==='1'; }catch(e){ return false; } })());

/* ---------- find ---------- */
var findbar=document.getElementById('findbar'), findInput=document.getElementById('findInput'),
    findRes=document.getElementById('findRes'), sbMode=document.getElementById('sbMode');
function offsetInPane(el){
  return el.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop;
}
function segText(h){ var t=h.textContent, n=h.nextElementSibling;
  while(n&&n.tagName!=='H2'){ t+=' '+n.textContent; n=n.nextElementSibling; } return t; }
function refreshHeads(){
  heads=Array.prototype.slice.call(pane.querySelectorAll('h2'));
  segs=heads.map(function(h){ var t=segText(h); return {h:h, raw:t, low:t.toLowerCase()}; });
}
function openFind(){ closeMenus(); findbar.hidden=false; findInput.focus(); if(sbMode) sbMode.textContent='FIND'; }
function hideFind(){ findbar.hidden=true; findRes.hidden=true; if(sbMode) sbMode.textContent='NORMAL'; }
function runFind(){
  var q=findInput.value.trim().toLowerCase(); findRes.innerHTML='';
  if(!q){ findRes.hidden=true; return; }
  var hits=segs.filter(function(s){ return s.low.indexOf(q)!==-1; }).slice(0,9);
  if(!hits.length){ findRes.innerHTML='<div class="pop-note">no matches — grep returned 1</div>'; findRes.hidden=false; return; }
  hits.forEach(function(s){
    var b=document.createElement('button'); b.className='fr-item'; b.type='button';
    var idx=s.low.indexOf(q), st=Math.max(0,idx-22);
    var snip=(st>0?'…':'')+s.raw.slice(st,st+70).replace(/\s+/g,' ').trim();
    b.innerHTML='<span class="fr-t">## '+s.h.textContent+'</span><span class="fr-s"></span>';
    b.querySelector('.fr-s').textContent=snip;
    b.addEventListener('click',function(){ jumpTo(s.h); findRes.hidden=true; });
    findRes.appendChild(b);
  });
  findRes.hidden=false;
}
function jumpTo(h){
  pane.scrollTo({top:Math.max(0,offsetInPane(h)-14), behavior:reduced?'auto':'smooth'});
  h.classList.remove('flash'); void h.offsetWidth; h.classList.add('flash');
  if(isMobile()){ win.classList.remove('side-open'); syncSide(); }
}
if(findInput){
  findInput.addEventListener('input',runFind);
  findInput.addEventListener('keydown',function(e){
    if(e.key==='Enter'){ var f=findRes.querySelector('.fr-item'); if(f) f.click(); }
    else if(e.key==='ArrowDown'){ e.preventDefault(); var f2=findRes.querySelector('.fr-item'); if(f2) f2.focus(); }
    else if(e.key==='Escape'){ if(!findRes.hidden){ findRes.hidden=true; } else { hideFind(); findInput.blur(); } }
  });
}
if(findRes){
  findRes.addEventListener('keydown',function(e){
    var items=Array.prototype.slice.call(findRes.querySelectorAll('.fr-item')), i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){ e.preventDefault(); (items[i+1]||items[0]).focus(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); if(i<=0) findInput.focus(); else items[i-1].focus(); }
    else if(e.key==='Escape'){ findRes.hidden=true; findInput.focus(); }
  });
}

/* ---------- bookmarks ---------- */
var bmList=document.getElementById('bmList');
function markKey(){ return 'lt-marks:'+CHAPTER; }
function getMarks(){ try{ return JSON.parse(localStorage.getItem(markKey())||'[]'); }catch(e){ return []; } }
function saveMarks(a){ try{ localStorage.setItem(markKey(),JSON.stringify(a)); }catch(e){} }
function renderMarks(){
  if(!bmList) return;
  var marks=getMarks(); bmList.innerHTML='';
  if(!marks.length){ bmList.innerHTML='<div class="pop-note">no bookmarks yet</div>'; return; }
  marks.forEach(function(m){
    var b=document.createElement('button'); b.className='pop-item'; b.type='button';
    b.setAttribute('role','menuitem'); b.textContent=m.t;
    b.addEventListener('click',function(){ closeMenus();
      var h=document.getElementById(m.id); if(h) jumpTo(h); else pane.scrollTop=m.y; });
    bmList.appendChild(b);
  });
}
var addMark=document.querySelector('[data-act="addmark"]');
if(addMark) addMark.addEventListener('click',function(){
  if(!heads.length){ toast('✗ no headings to bookmark'); closeMenus(); return; }
  var cur=heads[0], i, y=pane.scrollTop;
  for(i=0;i<heads.length;i++){ if(offsetInPane(heads[i])<=y+60) cur=heads[i]; }
  var marks=getMarks();
  if(marks.some(function(m){ return m.id===cur.id; })){ toast('= bookmark exists: '+cur.textContent); closeMenus(); return; }
  marks.unshift({id:cur.id, t:cur.textContent, y:offsetInPane(cur)});
  marks=marks.slice(0,8); saveMarks(marks); closeMenus();
  toast('✓ bookmark added: '+cur.textContent);
});

/* ---------- modal ---------- */
var modal=document.getElementById('aboutModal'), lastFocus=null;
function openAbout(){ closeMenus(); modal.hidden=false; lastFocus=document.activeElement;
  modal.querySelector('.m-x').focus(); }
function closeAbout(){ if(modal.hidden) return; modal.hidden=true; if(lastFocus) lastFocus.focus(); }
if(modal) modal.querySelectorAll('[data-close]').forEach(function(el){ el.addEventListener('click',closeAbout); });

function downloadLesson(){
  var href=(document.getElementById('downloadLink')||{}).href||SITE.download;
  if(!href){ toast('✗ no lesson file'); return; }
  var link=document.createElement('a');
  link.href=href;
  link.download=SITE.file||'lesson.md';
  document.body.appendChild(link); link.click(); link.remove();
  toast('✓ '+link.download);
}

/* ---------- menu actions ---------- */
document.querySelectorAll('[data-act]').forEach(function(el){
  var act=el.dataset.act;
  el.addEventListener('click',function(){
    if(act==='download'){ downloadLesson(); closeMenus(); }
    else if(act==='newtab'){ closeMenus(); openLesson('home', true); }
    else if(act==='exit'){ closeMenus(); toast('logout — nice try :)'); }
    else if(act==='copyall'){
      var raws=Array.prototype.map.call(pane.querySelectorAll('code.cm'),function(c){ return c.dataset.raw||c.textContent; });
      copyText(raws.join('\n')).then(function(){ toast('✓ '+raws.length+' commands copied to clipboard'); });
      closeMenus();
    }
    else if(act==='find'){ openFind(); }
    else if(act==='zoomin'){ setZoom(zoom+.1); toast('zoom: '+Math.round(zoom*100)+'%'); }
    else if(act==='zoomout'){ setZoom(zoom-.1); toast('zoom: '+Math.round(zoom*100)+'%'); }
    else if(act==='zoomreset'){ setZoom(1); toast('zoom: 100%'); }
    else if(act==='about'||act==='about2'){ openAbout(); }
  });
});

/* ---------- global keys ---------- */
function isTyping(t){ return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable); }
document.addEventListener('keydown',function(e){
  if(e.key==='/'&&!isTyping(e.target)&&modal.hidden){ e.preventDefault(); openFind(); }
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); openFind(); }
  else if(e.key==='?'&&!isTyping(e.target)&&modal.hidden){ openAbout(); }
  else if(e.key==='Escape'){ if(!modal.hidden){ closeAbout(); } else { closeMenus(); if(findRes) findRes.hidden=true; } }
});

/* ---------- TOC + scrollspy ---------- */
var tocList=document.getElementById('tocList');
var sbBar=document.getElementById('sbBar'), sbPct=document.getElementById('sbPct'), CELLS=12, ticking=false;
function rebuildToc(){
  refreshHeads();
  if(!tocList) return;
  tocList.innerHTML='';
  heads.forEach(function(h,i){
    if(!h.id) h.id='sec-'+(i+1);
    var li=document.createElement('li'), a=document.createElement('a');
    a.className='toc-link'; a.href='#'+h.id; a.setAttribute('dir','rtl');
    var no=document.createElement('span'); no.className='toc-no'; no.textContent='['+(i<9?'0':'')+(i+1)+']';
    var tt=document.createElement('span'); tt.textContent=h.textContent;
    a.appendChild(no); a.appendChild(tt); li.appendChild(a); tocList.appendChild(li);
    a.addEventListener('click',function(e){ e.preventDefault(); jumpTo(h);
      if(isMobile()){ win.classList.remove('side-open'); syncSide(); } });
  });
  tocLinks=Array.prototype.slice.call(tocList.querySelectorAll('.toc-link'));
}
function onScroll(){
  var max=pane.scrollHeight-pane.clientHeight;
  var p=max>0?Math.min(1,Math.max(0,pane.scrollTop/max)):0;
  var n=Math.round(p*CELLS);
  if(sbBar) sbBar.textContent='▓'.repeat(n)+'░'.repeat(CELLS-n);
  if(sbPct) sbPct.textContent=Math.round(p*100)+'%';
  var cur=-1, paneTop=pane.getBoundingClientRect().top;
  for(var i=0;i<heads.length;i++){ if(heads[i].getBoundingClientRect().top-paneTop<=90) cur=i; }
  tocLinks.forEach(function(l,j){ l.classList.toggle('on',j===cur); });
  ticking=false;
}
pane.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(onScroll); } },{passive:true});

/* ---------- clock ---------- */
var sbTime=document.getElementById('sbTime');
function tick(){
  var d=new Date();
  if(sbTime) sbTime.textContent=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
}
tick(); setInterval(tick,1000);

function bindLessonLinks(){
  var links=Array.prototype.slice.call(document.querySelectorAll('.tree a[data-chapter], .pager-link'));
  pane.querySelectorAll('a[href]').forEach(function(link){ links.push(link); });
  links.forEach(function(link){
    if(link.classList.contains('dl-link') || link.classList.contains('toc-link')) return;
    var href=link.getAttribute('href')||'';
    if(href.charAt(0)==='#') return;
    var slug=link.getAttribute('data-chapter');
    if(!slug){
      var m=href.match(/chapters\/([^/]+)\/?/);
      if(m) slug=m[1];
      else if(/index\.html\/?$/.test(href) || href==='./' || href===SITE_BASE) slug='home';
    }
    if(!slug) return;
    if(link.dataset.tabBound) return;
    link.dataset.tabBound='1';
    link.addEventListener('click',function(e){
      if(link.getAttribute('aria-disabled')==='true') return;
      if(e.button!==0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      openLesson(slug, false);
    });
    link.addEventListener('auxclick',function(e){
      if(link.getAttribute('aria-disabled')==='true') return;
      if(e.button!==1) return;
      e.preventDefault();
      openLesson(slug, true);
    });
    link.addEventListener('mousedown',function(e){
      if(e.button===1) e.preventDefault();
    });
  });
  document.querySelectorAll('.tag[data-tag]').forEach(function(tagEl){
    tagEl.style.cursor='pointer';
    if(tagEl.dataset.bound) return;
    tagEl.dataset.bound='1';
    tagEl.addEventListener('click',function(){
      var tag=tagEl.getAttribute('data-tag');
      var active=tagEl.classList.contains('on');
      pane.querySelectorAll('.tag[data-tag]').forEach(function(el){ el.classList.remove('on'); });
      document.querySelectorAll('.tree li').forEach(function(li){ li.hidden=false; });
      if(active) return;
      tagEl.classList.add('on');
      document.querySelectorAll('.tree li').forEach(function(li){
        var a=li.querySelector('a');
        var tags=(a&&a.getAttribute('data-tags')||'').split(',');
        li.hidden=tags.indexOf(tag)===-1;
      });
    });
  });
}

function applyChrome(meta){
  CHAPTER=meta.slug;
  SITE.slug=meta.slug; SITE.file=meta.file; SITE.tab=meta.tab; SITE.title=meta.title; SITE.path=meta.path;
  SITE.download=rootUrl(meta.download);
  document.title=meta.title+' · linux-tutorials';
  var titlebar=document.querySelector('.ttitle');
  if(titlebar) titlebar.innerHTML='<b>user@linux-tutorials</b>: '+meta.path+' — linux-tutorials';
  var sbFile=document.querySelector('.sb-file');
  if(sbFile) sbFile.textContent=meta.file;
  var dl=document.getElementById('downloadLink');
  if(dl){ dl.href=SITE.download; dl.setAttribute('download', meta.file); dl.textContent='⬇ download '+meta.file; }
  var fileBtn=document.querySelector('[data-act="download"]');
  if(fileBtn) fileBtn.dataset.downloadUrl=SITE.download;
  document.querySelectorAll('.tree a[data-chapter]').forEach(function(a){
    a.classList.toggle('cur', a.getAttribute('data-chapter')===meta.slug);
    if(a.getAttribute('data-chapter')===meta.slug) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
}

/* ---------- AI chat ---------- */
var CHAT_KEY='lt-chat-settings', chatMessages={};
function chatSettings(){
  try{
    return Object.assign({provider:'google', model:'gemini-3.6-flash', baseUrl:'https://generativelanguage.googleapis.com/v1beta/openai', apiKey:'', language:'fa'}, JSON.parse(sessionStorage.getItem(CHAT_KEY)||'{}'));
  }catch(e){ return {provider:'google', model:'gemini-3.6-flash', baseUrl:'https://generativelanguage.googleapis.com/v1beta/openai', apiKey:'', language:'fa'}; }
}
function saveChatSettings(value){
  try{ sessionStorage.setItem(CHAT_KEY, JSON.stringify(value)); }catch(e){}
}
function promptForSelection(text, language){
  if(language==='en') return `Explain this selected part of the Linux tutorial clearly. Define unfamiliar terms, explain what each command or concept does, and include a small practical example. Do not assume prior knowledge.\n\nSelected part:\n${text}`;
  return `این بخش انتخاب‌شده از آموزش لینوکس را به زبان فارسی ساده و دقیق توضیح بده. اصطلاحات ناآشنا، کاربرد دستورها یا مفهوم اصلی را توضیح بده و یک مثال عملی کوتاه هم اضافه کن. فرض نکن کاربر دانش قبلی دارد.\n\nبخش انتخاب‌شده:\n${text}`;
}
function renderChat(tabId, prefill){
  if(!chatMessages[tabId]) chatMessages[tabId]=[];
  pane.innerHTML='<div class="chat-shell" dir="rtl"><header class="chat-head"><p class="filepath-line">terminal / chat</p><h1>Ask AI</h1><p class="chat-context">Ask about this tutorial. Your prompt is editable and is never sent automatically.</p></header><div class="chat-messages" id="chatMessages"></div><form class="chat-form" id="chatForm"><textarea class="chat-input" id="chatInput" placeholder="سؤال خود را بنویسید…"></textarea><button class="chat-send" type="submit">Send ↵</button></form></div>';
  var input=document.getElementById('chatInput');
  input.value=prefill||'';
  var list=document.getElementById('chatMessages');
  chatMessages[tabId].forEach(function(message){
    var item=document.createElement('div'); item.className='chat-message '+message.role; item.textContent=message.content; list.appendChild(item);
  });
  document.getElementById('chatForm').addEventListener('submit',function(e){
    e.preventDefault();
    sendChat(tabId, input.value.trim());
  });
  if(prefill) input.focus();
}
function appendChat(tabId, role, content){
  chatMessages[tabId]=chatMessages[tabId]||[];
  chatMessages[tabId].push({role:role, content:content});
  renderChat(tabId);
  var list=document.getElementById('chatMessages');
  if(list) list.lastElementChild?.scrollIntoView({block:'nearest'});
}
async function sendChat(tabId, text){
  if(!text) return;
  var settings=chatSettings();
  if(!settings.apiKey){ openChatSettings(); toast('Add your personal API key first'); return; }
  if(!settings.baseUrl){ openChatSettings(); toast('Add the provider API base URL first'); return; }
  appendChat(tabId,'user',text);
  var input=document.getElementById('chatInput'), send=document.querySelector('.chat-send');
  if(send) send.disabled=true;
  try{
    var endpoint=settings.baseUrl.replace(/\/+$/,'')+'/chat/completions';
    var response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+settings.apiKey},body:JSON.stringify({
      model:settings.model, messages:chatMessages[tabId], stream:false
    })});
    var data=await response.json();
    if(!response.ok) throw new Error(data.error||'Provider request failed');
    var answer=data.choices?.[0]?.message?.content||data.candidates?.[0]?.content?.parts?.[0]?.text;
    if(!answer) throw new Error('The provider returned no text');
    appendChat(tabId,'assistant',answer);
  }catch(error){ appendChat(tabId,'assistant','Error: '+error.message); }
  finally{ var button=document.querySelector('.chat-send'); if(button) button.disabled=false; }
}
function openChatSettings(){
  var modal=document.getElementById('chatSettingsModal'), settings=chatSettings();
  if(!modal) return;
  modal.hidden=false;
  document.getElementById('chatProvider').value=settings.provider;
  document.getElementById('chatModel').value=settings.model;
  document.getElementById('chatCustomModel').value=settings.model;
  document.getElementById('chatBaseUrl').value=settings.baseUrl;
  document.getElementById('chatApiKey').value=settings.apiKey;
  document.getElementById('chatLanguage').value=settings.language;
  document.getElementById('customModelRow').hidden=settings.provider!=='openai-compatible';
}
var chatModal=document.getElementById('chatSettingsModal');
document.querySelectorAll('[data-close-chat-settings]').forEach(function(el){ el.addEventListener('click',function(){ chatModal.hidden=true; }); });
var chatProvider=document.getElementById('chatProvider');
if(chatProvider) chatProvider.addEventListener('change',function(){
  document.getElementById('customModelRow').hidden=chatProvider.value!=='openai-compatible';
});
var chatSettingsForm=document.getElementById('chatSettingsForm');
if(chatSettingsForm) chatSettingsForm.addEventListener('submit',function(e){
  e.preventDefault();
  saveChatSettings({provider:chatProvider.value, model:chatProvider.value==='openai-compatible'?document.getElementById('chatCustomModel').value.trim():document.getElementById('chatModel').value, baseUrl:document.getElementById('chatBaseUrl').value.trim(), apiKey:document.getElementById('chatApiKey').value, language:document.getElementById('chatLanguage').value});
  chatModal.hidden=true; toast('✓ chatbot settings saved for this tab');
});
var settingsChat=document.querySelector('[data-act="chatbot-settings"]');
if(settingsChat) settingsChat.addEventListener('click',function(){ closeMenus(); openChatSettings(); });
var askAi=document.getElementById('askAi'), selectedPrompt='';
document.addEventListener('selectionchange',function(){
  var selection=window.getSelection(), text=selection?.toString().trim();
  if(!askAi||CHAPTER==='chat'||!text||!pane.contains(selection.anchorNode)){ if(askAi) askAi.hidden=true; return; }
  selectedPrompt=text;
  var rect=selection.getRangeAt(0).getBoundingClientRect();
  askAi.style.left=Math.max(10,Math.min(window.innerWidth-150,rect.left))+'px';
  askAi.style.top=Math.max(10,rect.top-42)+'px';
  askAi.hidden=false;
});
if(askAi) askAi.addEventListener('mousedown',function(e){ e.preventDefault(); });
if(askAi) askAi.addEventListener('click',function(){
  var settings=chatSettings();
  askAi.hidden=true;
  openLesson('chat',true,promptForSelection(selectedPrompt,settings.language));
});

function bindPane(first){
  highlightCodes();
  bindCopy();
  rebuildToc();
  bindLessonLinks();
  onScroll();
  var typedEl=document.getElementById('typed');
  if(first&&typedEl&&!reduced){
    var cmd=typedEl.textContent; typedEl.textContent='';
    var i=0, iv=setInterval(function(){ typedEl.textContent=cmd.slice(0,++i);
      if(i>=cmd.length) clearInterval(iv); },24);
  }
  var blocks=pane.querySelectorAll('.rv');
  if(reduced||!('IntersectionObserver' in window)){
    blocks.forEach(function(b){ b.classList.add('in'); });
  }else{
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    },{root:pane, rootMargin:'0px 0px -6% 0px', threshold:0.04});
    blocks.forEach(function(b){ io.observe(b); });
  }
}

/* ---------- in-page tabs ---------- */
var tabstrip=document.getElementById('tabstrip');
var TAB_KEY='lt-open-tabs-v2';
var tabCache={};
var activeTabId=null;
function lessonMeta(slug){
  if(!catalog) return null;
  if(slug==='chat') return {slug:'chat', tab:'chat', file:'chat', title:'Ask AI', path:'~/chat', download:''};
  if(slug==='home') return catalog.home;
  return (catalog.chapters||[]).filter(function(c){ return c.slug===slug; })[0]||null;
}
function newTabId(){ return 'tab-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function readTabs(){
  try{ return JSON.parse(sessionStorage.getItem(TAB_KEY)||'null'); }catch(e){ return null; }
}
function writeTabs(state){
  try{ sessionStorage.setItem(TAB_KEY, JSON.stringify({tabs:state.tabs, active:state.active})); }catch(e){}
}
function tabState(){
  var saved=readTabs();
  if(saved&&saved.tabs&&saved.tabs.length){
    return {tabs:saved.tabs.slice(), active:saved.active||saved.tabs[0].id};
  }
  var id=newTabId();
  return {tabs:[{id:id, slug:CHAPTER}], active:id};
}
function currentTab(state){
  return state.tabs.filter(function(t){ return t.id===state.active; })[0]||state.tabs[0];
}
function snapshotTab(id){
  if(!id) return;
  tabCache[id]={html:pane.innerHTML, scroll:pane.scrollTop, slug:CHAPTER};
}
function renderTabs(state){
  if(!tabstrip) return;
  tabstrip.innerHTML='';
  state.tabs.forEach(function(tab){
    var meta=lessonMeta(tab.slug)||{slug:tab.slug, tab:tab.slug};
    var btn=document.createElement('button');
    btn.type='button'; btn.className='tab'+(tab.id===state.active?' active':'');
    btn.dataset.tabId=tab.id;
    btn.innerHTML='<span class="dot" aria-hidden="true"></span><span class="tx">user@linux-tutorials: '+meta.tab+'</span><span class="tclose" data-close-tab="'+tab.id+'">✕</span>';
    btn.addEventListener('click',function(e){
      if(e.target.getAttribute('data-close-tab')) return;
      activateTab(tab.id);
    });
    btn.addEventListener('auxclick',function(e){
      if(e.button!==1) return;
      e.preventDefault();
      closeTab(tab.id);
    });
    btn.addEventListener('mousedown',function(e){
      if(e.button===1) e.preventDefault();
    });
    tabstrip.appendChild(btn);
  });
  tabstrip.querySelectorAll('[data-close-tab]').forEach(function(x){
    x.addEventListener('click',function(e){
      e.stopPropagation();
      closeTab(x.getAttribute('data-close-tab'));
    });
  });
  writeTabs(state);
  activeTabId=state.active;
}
async function showLesson(meta, tabId, push){
  if(meta.slug==='chat'){
    renderChat(tabId, null);
    if(push!==false) history.pushState({slug:'chat', tab:tabId}, meta.title, rootUrl('chat/'));
    return;
  }
  var cached=tabCache[tabId];
  if(cached&&cached.slug===meta.slug){
    pane.innerHTML=cached.html;
    applyChrome(meta);
    bindPane(false);
    pane.scrollTop=cached.scroll||0;
  }else{
    var res=await fetch(lessonUrl(meta.slug));
    var html=await res.text();
    var doc=new DOMParser().parseFromString(html, 'text/html');
    var next=doc.getElementById('pane');
    if(!next) return;
    pane.innerHTML=next.innerHTML;
    applyChrome(meta);
    bindPane(false);
    pane.scrollTop=0;
  }
  if(push!==false){
    var address=new URL(lessonUrl(meta.slug), location.href);
    history.pushState({slug:meta.slug, tab:tabId}, meta.title, address.pathname+address.search+address.hash);
  }
}
async function openLesson(slug, forceNew, prefill){
  var meta=lessonMeta(slug);
  if(!meta){ location.href=lessonUrl(slug); return; }
  var state=tabState();
  var cur=currentTab(state);
  if(!forceNew && cur && cur.slug===slug && state.active===cur.id) return;
  snapshotTab(state.active);
  if(forceNew){
    var tab={id:newTabId(), slug:slug};
    state.tabs.push(tab);
    state.active=tab.id;
  }else{
    var cur=currentTab(state);
    if(cur){
      if(cur.slug!==slug) delete tabCache[cur.id];
      cur.slug=slug;
    }else{
      cur={id:newTabId(), slug:slug};
      state.tabs.push(cur);
      state.active=cur.id;
    }
  }
  renderTabs(state);
  if(prefill) chatMessages[state.active]=[];
  await showLesson(meta, state.active, true);
  if(prefill) renderChat(state.active, prefill);
}
async function activateTab(id){
  var state=tabState();
  var tab=state.tabs.filter(function(t){ return t.id===id; })[0];
  if(!tab) return;
  if(state.active===id && CHAPTER===tab.slug) return;
  snapshotTab(state.active);
  state.active=id;
  renderTabs(state);
  var meta=lessonMeta(tab.slug);
  if(meta) await showLesson(meta, id, true);
}
function closeTab(id){
  var state=tabState();
  if(state.tabs.length<2){ toast('✗ last tab stays open'); return; }
  snapshotTab(state.active);
  state.tabs=state.tabs.filter(function(t){ return t.id!==id; });
  delete tabCache[id];
  if(state.active===id) state.active=state.tabs[state.tabs.length-1].id;
  renderTabs(state);
  var tab=currentTab(state);
  var meta=tab&&lessonMeta(tab.slug);
  if(meta) showLesson(meta, state.active, true);
}

var tabAdd=document.getElementById('tabAdd');
if(tabAdd) tabAdd.addEventListener('click',function(){ openLesson('home', true); });
window.addEventListener('popstate',function(){
  var slug=(history.state&&history.state.slug)||CHAPTER;
  var id=history.state&&history.state.tab;
  var state=tabState();
  if(id&&state.tabs.some(function(t){ return t.id===id; })){
    state.active=id;
  }else{
    var tab={id:newTabId(), slug:slug};
    state.tabs.push(tab);
    state.active=tab.id;
  }
  renderTabs(state);
  var meta=lessonMeta(slug);
  if(meta) showLesson(meta, state.active, false);
});

fetch(rootUrl('chapters.json')).then(function(r){ return r.json(); }).then(function(data){
  catalog=data;
  var state=tabState();
  if(!state.tabs.some(function(t){ return t.id===state.active && t.slug===CHAPTER; })){
    var existing=state.tabs.filter(function(t){ return t.slug===CHAPTER; })[0];
    if(existing) state.active=existing.id;
    else{
      var tab={id:newTabId(), slug:CHAPTER};
      state.tabs.push(tab);
      state.active=tab.id;
    }
  }
  renderTabs(state);
}).catch(function(){
  var id=newTabId();
  renderTabs({tabs:[{id:id, slug:CHAPTER}], active:id});
});

bindPane(true);
})();
