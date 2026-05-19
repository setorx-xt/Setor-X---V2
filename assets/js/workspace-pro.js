(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  const workspaces = {
    command: { title:"Comando", subtitle:"Centro de comando, visão geral da operação, indicadores e cursos/plataformas.", sections:["dashboard","cursos"] },
    planning: { title:"Planejamento", subtitle:"Planejamento semanal separado, calendário, matriz do edital e meta operacional do aluno.", sections:["planejamento-semanal","calendario","edital","meta-questoes"] },
    focus: { title:"Foco Tático", subtitle:"Timer isolado para missão de estudo. Fora daqui, ele continua ativo no topo da plataforma.", sections:["pomodoro"] },
    questions: { title:"Banco QX", subtitle:"Questões, caderno de erros, gabarito, comentários, revisão e capturas da extensão.", sections:["questoes"] },
    summaries: { title:"Resumos", subtitle:"Resumos pessoais, organização, sumário, links, vídeos e revisão de material.", sections:["resumos"] },
    vade: { title:"Vade Mecum", subtitle:"Lei seca por disciplina, busca, grifos inline, comentários por artigo e revisão.", sections:["vade-mecum"] },
    lawdry: { title:"Lei Seca PRO", subtitle:"Planos de leitura por lei, dificuldade, calendário, revisões e progresso real.", sections:["lei-seca-pro"] },
    highlights: { title:"Biblioteca de Grifos", subtitle:"Todos os grifos do Vade Mecum organizados por disciplina, lei, artigo, cor e revisão.", sections:["biblioteca-grifos"] },
    revisionsPro: { title:"Central de Revisão", subtitle:"Revisões separadas de questões, resumos, planejamento, lei seca e grifos.", sections:["central-revisao-pro"] },
    statsPro: { title:"Estatísticas", subtitle:"Painel profissional de horas, questões, lei seca, resumos, disciplinas e evolução.", sections:["estatisticas-pro"] },
    simulations: { title:"Simulados", subtitle:"Simulados, comparador de desempenho e diagnóstico de prova.", sections:["simulados"] },
    performance: { title:"Performance", subtitle:"TAF, IMC, peso ideal, força relativa e evolução física.", sections:["taf"] },
    prompts: { title:"Prompts IA", subtitle:"Prompts profissionais para questões, redação, comentários, lei seca e revisão.", sections:["prompts-ia"] },
    system: { title:"Sistema", subtitle:"Patentes, licença, backup e manutenção da plataforma.", sections:["patentes","licenca","backup"] }
  };

  const sectionToWorkspace = {};
  Object.entries(workspaces).forEach(([key,w])=>w.sections.forEach(id=>sectionToWorkspace[id]=key));

  function currentId(){return (location.hash||"#dashboard").replace("#","");}
  function currentWorkspace(){return sectionToWorkspace[currentId()] || "command";}

  function ensureTitleCard(key){
    if(!workspaces[key]) key="command";
    let card=$(".workspace-title-card");
    if(!card){
      card=document.createElement("div");
      card.className="workspace-title-card";
      const main=$("main.content");
      main?.insertBefore(card, main.firstElementChild);
    }
    card.innerHTML=`<strong>${workspaces[key].title}</strong><span>${workspaces[key].subtitle}</span>`;
  }

  function applyWorkspace(forceKey){
    const key=forceKey && workspaces[forceKey] ? forceKey : currentWorkspace();
    document.body.classList.add("workspace-active");
    document.body.classList.toggle("workspace-focus",key==="focus");
    // V27: remove hidden attributes left by older hotfixes. Visibility is controlled only by classes.
    $$("main.content > section").forEach(sec=>{
      sec.hidden=false;
      sec.removeAttribute("hidden");
      const visible=workspaces[key].sections.includes(sec.id);
      sec.classList.toggle("workspace-visible",visible);
      sec.classList.toggle("workspace-hidden",!visible);
    });
    ["leis","alertas","revisoes"].forEach(id=>{
      const sec=$("#"+id);
      if(sec){sec.hidden=false;sec.removeAttribute("hidden");sec.classList.add("workspace-hidden");sec.classList.remove("workspace-visible");}
    });
    $$(".sidebar-nav .nav-link").forEach(a=>{
      const linkId=(a.getAttribute("href")||"").replace("#","");
      const aKey=a.dataset.workspaceNav || sectionToWorkspace[linkId] || "command";
      a.classList.toggle("active",aKey===key);
    });
    ensureTitleCard(key);
  }

  function openWorkspace(key, scroll){
    const targetId = workspaces[key]?.sections?.[0] || "dashboard";
    if(location.hash !== "#"+targetId){ history.pushState(null,"","#"+targetId); }
    applyWorkspace(key);
    if(scroll!==false){ window.scrollTo({top:0,behavior:"smooth"}); }
  }

  function updateTopTimer(){
    const pill=$("#global-focus-pill"), time=$("#global-focus-time"), mode=$("#global-focus-mode");
    if(!pill||!time||!mode) return;
    const srcTime=$("#timer-display")?.textContent?.trim() || "50:00";
    const srcMode=$("#timer-mode")?.textContent?.trim() || "Foco tático";
    time.textContent=srcTime;
    mode.textContent=srcMode;
    const idle = srcTime==="50:00" && !document.body.classList.contains("timer-running");
    pill.classList.toggle("idle",idle);
  }

  document.addEventListener("click",e=>{
    const nav=e.target.closest(".sidebar-nav .nav-link");
    if(nav){
      const id=(nav.getAttribute("href")||"#dashboard").replace("#","");
      const key=nav.dataset.workspaceNav || sectionToWorkspace[id] || "command";
      const targetId=workspaces[key]?.sections?.[0] || id;
      e.preventDefault();
      openWorkspace(key, true);
    }
  });

  window.SetorXWorkspace = { open: openWorkspace, apply: applyWorkspace, workspaces, sectionToWorkspace };
  window.addEventListener("hashchange",()=>applyWorkspace());
  window.addEventListener("popstate",()=>applyWorkspace());
  setInterval(()=>{ updateTopTimer(); $$("main.content > section[hidden]").forEach(s=>s.removeAttribute("hidden")); },1000);
  document.addEventListener("DOMContentLoaded",()=>{applyWorkspace();updateTopTimer();});
  applyWorkspace();
  updateTopTimer();
})();
