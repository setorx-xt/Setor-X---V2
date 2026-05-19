(function(){
  "use strict";
  const APP_KEY = "setorX.v4.refinado";
  const REMOVED_HASHES = new Set(["edital-verticalizado"]);
  function safeJson(raw){ try{return JSON.parse(raw||"null");}catch(e){return null;} }
  function cleanAppState(){
    try{
      const st = safeJson(localStorage.getItem(APP_KEY));
      if(st && typeof st === "object"){
        delete st.verticalized;
        delete st.verticalizedSelectedContest;
        delete st.verticalizedByContest;
        delete st.verticalizedDev;
        localStorage.setItem(APP_KEY, JSON.stringify(st));
      }
      localStorage.removeItem("setorx_editais_verticalizados_v1");
      localStorage.removeItem("setorx_verticalized_devpack");
    }catch(e){ console.warn("[Setor X V26] limpeza do verticalizado falhou", e); }
  }
  function redirectOldHash(){
    const hash = (location.hash||"").replace("#","");
    if(REMOVED_HASHES.has(hash)){
      history.replaceState(null,"", location.pathname + location.search + "#planejamento-semanal");
    }
  }
  function removeDeadDom(){
    document.querySelectorAll('[href="#edital-verticalizado"], [data-workspace-nav="verticalized"], #edital-verticalizado').forEach(el=>el.remove());
  }
  function patchWorkspaceFallback(){
    document.addEventListener("click", function(e){
      const dead = e.target.closest('[href="#edital-verticalizado"], [data-workspace-nav="verticalized"]');
      if(dead){
        e.preventDefault();
        location.hash = "planejamento-semanal";
      }
    }, true);
  }
  cleanAppState();
  redirectOldHash();
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ()=>{ removeDeadDom(); patchWorkspaceFallback(); });
  }else{
    removeDeadDom(); patchWorkspaceFallback();
  }
})();
