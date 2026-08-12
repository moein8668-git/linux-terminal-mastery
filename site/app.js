(function(){
'use strict';
document.documentElement.classList.add('js');
var win=document.getElementById('win'), pane=document.getElementById('pane');
if(!win||!pane) return;
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var SITE_BASE=window.SITE_BASE||'./';
var CHAPTER=window.CURRENT_CHAPTER||'home';

/* ---------- toast ---------- */
var toastEl=document.getElementById('toast'), toastT;
function toast(msg){
  if(!toastEl) return;
  toastEl.textContent=msg; toastEl.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(function(){ toastEl.classList.remove('show'); },2400);
}

/* ---------- bash highlight (adds $ prompt per line) ---------- */
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
document.querySelectorAll('code.cm').forEach(function(c){
  var raw=c.textContent.replace(/\n$/,'');
  c.dataset.raw=raw;
  c.innerHTML=raw.split('\n').map(function(l){
    return '<span class="tk-pr">$</span> '+hlLine(l);
  }).join('\n');
});

/* ---------- copy buttons ---------- */
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
document.querySelectorAll('.copy').forEach(function(btn){
  btn.addEventListener('click',function(){
    var code=btn.closest('.term-mini').querySelector('code.cm');
    copyText(code.dataset.raw||code.textContent).then(function(){
      btn.textContent='copied ✓'; btn.classList.add('ok');
      setTimeout(function(){ btn.textContent='copy'; btn.classList.remove('ok'); },1400);
    });
  });
});

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
    fetchTheme=document.getElementById('fetchTheme'), aboutTheme=document.getElementById('aboutTheme'),
    radios=Array.prototype.slice.call(document.querySelectorAll('[role="menuitemradio"]'));
function currentTheme(){ return document.documentElement.getAttribute('data-theme')||'dracula'; }
function applyTheme(t,persist){
  document.documentElement.setAttribute('data-theme',t);
  if(sbTheme) sbTheme.textContent=t;
  if(fetchTheme) fetchTheme.textContent=t;
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

/* ---------- settings toggles ---------- */
var miScan=document.querySelector('[data-act="scan"]'), miBlink=document.querySelector('[data-act="blinkc"]');
function setScan(on){ document.documentElement.dataset.scan=on?'on':'off';
  if(miScan) miScan.setAttribute('aria-checked',on?'true':'false');
  try{ localStorage.setItem('lt-scan',on?'1':'0'); }catch(e){} }
function setBlink(on){ document.documentElement.dataset.blink=on?'on':'off';
  if(miBlink) miBlink.setAttribute('aria-checked',on?'true':'false');
  try{ localStorage.setItem('lt-blink',on?'1':'0'); }catch(e){} }
if(miScan) miScan.addEventListener('click',function(){ setScan(miScan.getAttribute('aria-checked')!=='true'); });
if(miBlink) miBlink.addEventListener('click',function(){ setBlink(miBlink.getAttribute('aria-checked')!=='true'); });
setScan((function(){ try{ return localStorage.getItem('lt-scan')!=='0'; }catch(e){ return true; } })());
setBlink((function(){ try{ return localStorage.getItem('lt-blink')!=='0'; }catch(e){ return true; } })());

/* ---------- find ---------- */
var findbar=document.getElementById('findbar'), findInput=document.getElementById('findInput'),
    findRes=document.getElementById('findRes'), sbMode=document.getElementById('sbMode');
var heads=Array.prototype.slice.call(pane.querySelectorAll('h2'));
function offsetInPane(el){
  return el.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop;
}
function segText(h){ var t=h.textContent, n=h.nextElementSibling;
  while(n&&n.tagName!=='H2'){ t+=' '+n.textContent; n=n.nextElementSibling; } return t; }
var segs=heads.map(function(h){ var t=segText(h); return {h:h, raw:t, low:t.toLowerCase()}; });
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

/* ---------- menu actions ---------- */
document.querySelectorAll('[data-act]').forEach(function(el){
  var act=el.dataset.act;
  el.addEventListener('click',function(){
    if(act==='print'){ closeMenus(); window.print(); }
    else if(act==='newtab'){ closeMenus(); location.href=SITE_BASE||'/'; }
    else if(act==='exit'){ closeMenus(); toast('logout — nice try :)'); }
    else if(act==='copyall'){
      var raws=Array.prototype.map.call(document.querySelectorAll('code.cm'),function(c){ return c.dataset.raw||c.textContent; });
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
heads.forEach(function(h,i){
  if(!h.id) h.id='sec-'+(i+1);
  if(!tocList) return;
  var li=document.createElement('li'), a=document.createElement('a');
  a.className='toc-link'; a.href='#'+h.id; a.setAttribute('dir','rtl');
  var no=document.createElement('span'); no.className='toc-no'; no.textContent='['+(i<9?'0':'')+(i+1)+']';
  var tt=document.createElement('span'); tt.textContent=h.textContent;
  a.appendChild(no); a.appendChild(tt); li.appendChild(a); tocList.appendChild(li);
  a.addEventListener('click',function(e){ e.preventDefault(); jumpTo(h);
    if(isMobile()){ win.classList.remove('side-open'); syncSide(); } });
});
var tocLinks=tocList?Array.prototype.slice.call(tocList.querySelectorAll('.toc-link')):[];
var sbBar=document.getElementById('sbBar'), sbPct=document.getElementById('sbPct'), CELLS=12, ticking=false;
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
onScroll();

/* ---------- clock + uptime ---------- */
var sbTime=document.getElementById('sbTime'), fetchUp=document.getElementById('fetchUp'), t0=Date.now();
function tick(){
  var d=new Date();
  if(sbTime) sbTime.textContent=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
  var secs=Math.floor((Date.now()-t0)/1000), m=Math.floor(secs/60), s=secs%60;
  if(fetchUp) fetchUp.textContent=(m?m+' min ':'')+s+' secs';
}
tick(); setInterval(tick,1000);

/* ---------- typewriter opener ---------- */
var typedEl=document.getElementById('typed');
if(typedEl&&!reduced){
  var cmd=typedEl.textContent; typedEl.textContent='';
  var i=0, iv=setInterval(function(){ typedEl.textContent=cmd.slice(0,++i);
    if(i>=cmd.length) clearInterval(iv); },24);
}

/* ---------- reveal ---------- */
var blocks=document.querySelectorAll('.rv');
if(reduced||!('IntersectionObserver' in window)){
  blocks.forEach(function(b){ b.classList.add('in'); });
}else{
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  },{root:pane, rootMargin:'0px 0px -6% 0px', threshold:0.04});
  blocks.forEach(function(b){ io.observe(b); });
}

/* ---------- tag filter (header tags filter the chapter tree) ---------- */
document.querySelectorAll('.tag[data-tag]').forEach(function(tagEl){
  tagEl.style.cursor='pointer';
  tagEl.addEventListener('click',function(){
    var tag=tagEl.getAttribute('data-tag');
    var active=tagEl.classList.contains('on');
    document.querySelectorAll('.tag[data-tag]').forEach(function(el){ el.classList.remove('on'); });
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
})();
