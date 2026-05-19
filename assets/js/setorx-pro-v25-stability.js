(function(){
  "use strict";
  const APP_KEY = "setorX.v4.refinado";
  const PRO_KEY = "setorx_lei_seca_pro_v23";
  const BACKUP_KEY = "setorx_backup_v27_latest";
  const REPORT_KEY = "setorx_bug_report_v27";
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  function todayKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function read(key){ try{return JSON.parse(localStorage.getItem(key)||"null")}catch(e){return null} }
  function saveBackup(reason){
    try{
      const payload = { version:"27.0", reason, savedAt:new Date().toISOString(), app:read(APP_KEY), leiSeca:read(PRO_KEY), vade:read("setorx_vade_mecum_v1"), baseMae:read("setorx_base_mae_v1") };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(payload));
      localStorage.setItem(`setorx_backup_v27_${todayKey()}`, JSON.stringify(payload));
    }catch(e){ console.warn("[Setor X V27] backup local falhou", e); }
  }
  function collectError(type, detail){
    try{
      const log = read(REPORT_KEY) || [];
      log.push({type, detail:String(detail||""), at:new Date().toISOString(), url:location.href});
      localStorage.setItem(REPORT_KEY, JSON.stringify(log.slice(-100)));
    }catch(e){}
  }
  window.addEventListener("error", e=>collectError("error", e.message || e.error));
  window.addEventListener("unhandledrejection", e=>collectError("promise", e.reason && (e.reason.stack || e.reason.message || e.reason)));
  window.addEventListener("beforeunload", ()=>saveBackup("beforeunload"));
  setInterval(()=>saveBackup("interval"), 60000);
  setTimeout(()=>saveBackup("boot"), 1800);

  function ensureWorkspaceNav(){
    const navMap = {command:"dashboard",dashboard:"dashboard",planning:"planejamento-semanal",focus:"pomodoro",questions:"questoes",summaries:"resumos",vade:"vade-mecum",lawdry:"lei-seca-pro",highlights:"biblioteca-grifos",revisionsPro:"central-revisao-pro",statsPro:"estatisticas-pro",simulations:"simulados",performance:"taf",prompts:"prompts-ia",system:"patentes"};
    document.addEventListener("click", function(e){
      const a = e.target.closest("[data-workspace-nav]");
      if(!a) return;
      const key = a.getAttribute("data-workspace-nav");
      const id = navMap[key];
      if(!id) return;
      setTimeout(()=>{
        try{
          $$("main.content > section[hidden]").forEach(sec=>sec.removeAttribute("hidden"));
          if(window.SetorXWorkspace && typeof window.SetorXWorkspace.open === "function") window.SetorXWorkspace.open(key, false);
        }catch(err){ collectError("workspace-nav", err); }
      }, 0);
    }, true);
  }
  function verifyPlatform(){
    const required = ["dashboard","vade-mecum","lei-seca-pro","biblioteca-grifos","central-revisao-pro","estatisticas-pro","questoes","resumos","planejamento-semanal","simulados","pomodoro"];
    const missing = required.filter(id=>!document.getElementById(id));
    if(missing.length) collectError("missing-sections", missing.join(", "));
    const duplicateIds = {};
    $$("[id]").forEach(el=>{ duplicateIds[el.id]=(duplicateIds[el.id]||0)+1; });
    const dups = Object.entries(duplicateIds).filter(([,v])=>v>1).map(([k])=>k);
    if(dups.length) collectError("duplicate-ids", dups.join(", "));
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", ()=>{ensureWorkspaceNav(); verifyPlatform();});
  else { ensureWorkspaceNav(); verifyPlatform(); }
  window.SetorXV27 = {saveBackup, verifyPlatform};
})();
