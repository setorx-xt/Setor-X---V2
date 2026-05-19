
(function(){
  "use strict";

  const VERSION = "20260519-v9-fast-login";
  const loaded = new Set();
  let loadingPromise = null;

  const scripts = [
    "assets/js/setorx-pro-v26-cleanup.js",
    "assets/js/app.js",
    "assets/js/qx-enhancements.js",
    "assets/js/vade-imported-laws.js",
    "assets/js/vade-mecum.js",
    "assets/js/workspace-pro.js",
    "assets/js/setorx-pro-v23.js",
    "assets/js/setorx-pro-v25-stability.js",
    "assets/js/setorx-pro-v27-hotfix.js",
    "assets/js/setorx-pro-v30-stats-comando-final.js"
  ];

  function setPerfMessage(text, done=false){
    let box = document.getElementById("setorx-loading-status");
    if(!box){
      box = document.createElement("div");
      box.id = "setorx-loading-status";
      box.className = "setorx-loading-status";
      box.innerHTML = `<span></span>`;
      document.body.appendChild(box);
    }
    box.querySelector("span").textContent = text;
    box.classList.toggle("done", !!done);
    if(done) setTimeout(()=>box.classList.add("hide"), 1400);
  }

  function loadScript(src){
    const clean = src.split("?")[0];
    if(loaded.has(clean) || document.querySelector(`script[src^="${clean}"]`)){
      loaded.add(clean);
      return Promise.resolve();
    }
    return new Promise((resolve,reject)=>{
      const s = document.createElement("script");
      s.src = `${clean}?v=${VERSION}`;
      s.defer = true;
      s.dataset.setorxLazy = "1";
      s.onload = ()=>{ loaded.add(clean); resolve(); };
      s.onerror = ()=>reject(new Error("Falha ao carregar "+clean));
      document.body.appendChild(s);
    });
  }

  async function loadPlatform(reason="idle"){
    if(loadingPromise) return loadingPromise;
    document.documentElement.classList.add("setorx-platform-loading");
    setPerfMessage("Carregando módulos da plataforma...");
    loadingPromise = (async()=>{
      for(const src of scripts){
        try{
          await loadScript(src);
        }catch(e){
          console.error("[Setor X Loader]", e);
          setPerfMessage("Alguns módulos não carregaram. Recarregue a página.", false);
        }
      }
      document.documentElement.classList.remove("setorx-platform-loading");
      document.documentElement.classList.add("setorx-platform-ready");
      setPerfMessage("Plataforma carregada.", true);
      window.dispatchEvent(new CustomEvent("setorx:platform-ready", {detail:{reason}}));
    })();
    return loadingPromise;
  }

  function scheduleLazyLoad(){
    const run = ()=>loadPlatform("scheduled");
    if("requestIdleCallback" in window){
      requestIdleCallback(run, {timeout: 2500});
    }else{
      setTimeout(run, 1400);
    }
  }

  // Login deve aparecer primeiro. Plataforma pesada carrega em segundo plano.
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", scheduleLazyLoad, {once:true});
  }else{
    scheduleLazyLoad();
  }

  // Se clicar em qualquer módulo fora do acesso, carrega imediatamente.
  document.addEventListener("click", e=>{
    const nav = e.target.closest("[data-workspace-nav], .sidebar-nav a, [href^='#']");
    if(!nav) return;
    const h = nav.getAttribute("href") || "";
    const key = nav.dataset.workspaceNav || "";
    if(key && key !== "access") loadPlatform("navigation");
    if(h && !h.includes("online-acesso")) loadPlatform("hash");
  }, true);

  window.SetorXLoadPlatform = loadPlatform;
})();
