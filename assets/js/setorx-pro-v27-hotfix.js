(function(){
  "use strict";
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  function clearHidden(){ $$('main.content > section[hidden]').forEach(s=>s.removeAttribute('hidden')); }
  function repairCurrent(){
    clearHidden();
    if(window.SetorXWorkspace && typeof window.SetorXWorkspace.apply === 'function') window.SetorXWorkspace.apply();
  }
  window.addEventListener('load',()=>{ repairCurrent(); setTimeout(repairCurrent,350); });
  window.addEventListener('hashchange',()=>setTimeout(repairCurrent,0));
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) repairCurrent(); });
  document.addEventListener('click',e=>{
    const nav=e.target.closest('.sidebar-nav .nav-link');
    if(nav) setTimeout(repairCurrent,25);
  },true);
})();
