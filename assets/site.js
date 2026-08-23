const themeKey='mofa-theme';
const root=document.documentElement;
const saved=localStorage.getItem(themeKey);
if(saved) root.dataset.theme=saved;
const themeBtn=document.querySelector('[data-theme-toggle]');
themeBtn?.addEventListener('click',()=>{const next=root.dataset.theme==='light'?'dark':'light';root.dataset.theme=next;localStorage.setItem(themeKey,next);});
const menu=document.querySelector('[data-mobile-menu]');
const menuBtn=document.querySelector('[data-menu-toggle]');
menuBtn?.addEventListener('click',()=>{const open=menu?.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(!!open));});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));
const stats=window.MOFA_YOUTUBE_STATS;
if(stats?.channel){
  document.querySelectorAll('[data-yt-subs]').forEach(e=>e.textContent=Intl.NumberFormat('fr-FR',{notation:'compact',maximumFractionDigits:1}).format(Number(stats.channel.subscriberCount||0)));
  document.querySelectorAll('[data-yt-views]').forEach(e=>e.textContent=Intl.NumberFormat('fr-FR',{notation:'compact',maximumFractionDigits:1}).format(Number(stats.channel.viewCount||0)));
}
