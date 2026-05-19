
(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  const workspaces = {
    access:{title:"Acesso Online",subtitle:"Login, conta do aluno e liberação de acesso.",sections:["online-acesso"],public:true,icon:"fa-user-shield"},
    mentor:{title:"Área do Mentor",subtitle:"Painel profissional para aprovar alunos, importar planejamentos, definir metas e acompanhar estatísticas.",sections:["online-mentor"],mentorOnly:true,icon:"fa-user-tie"},
    command:{title:"Comando",subtitle:"Centro de comando, visão geral, cursos/plataformas e ranking sincronizado.",sections:["dashboard","cursos","online-ranking"],locked:true,icon:"fa-table-columns"},
    planning:{title:"Planejamento",subtitle:"Operação semanal do aluno. Mostra apenas a missão do dia.",sections:["online-planejamento"],locked:true,icon:"fa-clipboard-list"},
    focus:{title:"Foco Tático",subtitle:"Timer isolado para missão de estudo.",sections:["pomodoro"],locked:true,icon:"fa-stopwatch-20"},
    questions:{title:"Banco QX",subtitle:"Banco local e QX coletivo da mentoria.",sections:["questoes","online-qx"],locked:true,icon:"fa-scale-balanced"},
    summaries:{title:"Resumos",subtitle:"Resumos pessoais, organização, links, vídeos e revisão.",sections:["resumos"],locked:true,icon:"fa-book-open"},
    vade:{title:"Vade Mecum e Lei Seca",subtitle:"Lei seca por disciplina, leitura planejada, grifos, comentários e revisão.",sections:["vade-mecum","lei-seca-pro","biblioteca-grifos"],locked:true,icon:"fa-book-open-reader"},
    revisionsPro:{title:"Revisões",subtitle:"Revisões separadas de questões, resumos, planejamento, lei seca e grifos.",sections:["central-revisao-pro"],locked:true,icon:"fa-rotate"},
    statsPro:{title:"Estatísticas",subtitle:"Painel profissional de horas, questões, lei seca, resumos, disciplinas e evolução.",sections:["estatisticas-pro"],locked:true,icon:"fa-chart-line"},
    simulations:{title:"Simulados",subtitle:"Simulados, comparador de desempenho e diagnóstico de prova.",sections:["simulados"],locked:true,icon:"fa-file-circle-check"},
    performance:{title:"Performance",subtitle:"TAF, IMC, peso ideal, força relativa e evolução física.",sections:["taf"],locked:true,icon:"fa-person-running"},
    prompts:{title:"Prompts IA",subtitle:"Prompts profissionais para questões, redação, correção e revisão.",sections:["prompts-ia"],locked:true,icon:"fa-terminal"},
    patents:{title:"Patentes",subtitle:"Sistema de patentes, medalhas e evolução operacional.",sections:["patentes","licenca"],locked:true,icon:"fa-shield-halved"}
  };
  const order=["access","mentor","command","planning","focus","questions","summaries","vade","revisionsPro","statsPro","simulations","performance","prompts","patents"];

  function status(){
    if(window.SetorXMentorPro){
      const p=window.SetorXMentorPro.profile?.();
      return {active:window.SetorXMentorPro.canAccess?.(),mentor:window.SetorXMentorPro.isMentor?.(),profile:p};
    }
    if(window.SetorXOnlineAuth){
      const st=window.SetorXOnlineAuth.status();
      return {active:!!(st.active||st.mentor),mentor:!!st.mentor,profile:null};
    }
    return {active:false,mentor:false,profile:null};
  }
  function available(key){
    const ws=workspaces[key]; if(!ws) return false;
    if(ws.mentorOnly && !status().mentor) return false;
    return ws.sections.some(id=>document.getElementById(id));
  }
  function allowed(key){
    const ws=workspaces[key]; if(!ws) return false;
    if(ws.public) return true;
    if(ws.mentorOnly) return status().mentor;
    if(ws.locked) return !!status().active;
    return true;
  }
  function removeBackup(){
    document.querySelectorAll('a[href="#backup"],[data-workspace-nav="system"],[data-section="backup"],[data-view="backup"]').forEach(e=>e.remove());
    document.getElementById("backup")?.remove();
  }
  function ensureHeader(){
    const content=$(".content"); if(!content||$("#workspace-title-card")) return;
    content.insertAdjacentHTML("afterbegin",`<div id="workspace-title-card" class="workspace-title-card"><strong>Setor X Online</strong><span>Plataforma operacional de estudos.</span></div>`);
  }
  function installNav(){
    const nav=$(".sidebar-nav"); if(!nav) return;
    const st=status();
    nav.innerHTML=order.filter(available).map(key=>{
      const ws=workspaces[key];
      const lock=!allowed(key)?`<small class="sx-lock"><i class="fa-solid fa-lock"></i></small>`:"";
      return `<a href="#${ws.sections[0]}" class="nav-link" data-workspace-nav="${key}"><i class="fa-solid ${ws.icon}"></i><span>${ws.title}</span>${lock}</a>`;
    }).join("");
  }
  function keyFromHash(){
    const id=(location.hash||"#online-acesso").replace("#","");
    return order.find(k=>workspaces[k].sections.includes(id)) || "access";
  }
  function showLocked(key){
    ensureHeader();
    $$("main.content > section").forEach(sec=>sec.classList.add("workspace-hidden"));
    let box=$("#sx-locked-panel");
    if(!box){
      $(".content").insertAdjacentHTML("beforeend",`<section id="sx-locked-panel" class="glass-card section-block sx-locked-panel"><div class="sx-lock-icon"><i class="fa-solid fa-lock"></i></div><div><p class="eyebrow">Acesso protegido</p><h2>Faça login para acessar o Setor X</h2><span>O aluno precisa estar logado e liberado pelo mentor. Entre em Acesso Online e aguarde aprovação, se necessário.</span></div><a class="primary-btn" href="#online-acesso">Ir para Acesso Online</a></section>`);
      box=$("#sx-locked-panel");
    }
    box.classList.remove("workspace-hidden");
    const title=$("#workspace-title-card strong"), sub=$("#workspace-title-card span");
    if(title) title.textContent="Área protegida";
    if(sub) sub.textContent="Acesso restrito para alunos ativos e mentor.";
    $$(".sidebar-nav .nav-link").forEach(a=>a.classList.toggle("active",a.dataset.workspaceNav==="access"));
    history.replaceState(null,"","#online-acesso");
  }
  function apply(key=keyFromHash(), push=false){
    removeBackup(); installVadeLeiSecaBridge(); ensureHeader(); installNav();
    if(!allowed(key)) return showLocked(key);
    const ws=workspaces[key]||workspaces.access;
    $("#sx-locked-panel")?.classList.add("workspace-hidden");
    document.body.classList.add("workspace-active");
    $$("main.content > section").forEach(sec=>{
      const visible=ws.sections.includes(sec.id);
      sec.classList.toggle("workspace-visible",visible);
      sec.classList.toggle("workspace-hidden",!visible);
      sec.hidden=false;
    });
    const title=$("#workspace-title-card strong"), sub=$("#workspace-title-card span");
    if(title) title.textContent=ws.title;
    if(sub) sub.textContent=ws.subtitle;
    const h1=$(".topbar-title h1"), ey=$(".topbar-title .eyebrow");
    if(h1) h1.textContent=ws.title;
    if(ey) ey.innerHTML=`<i class="fa-solid ${ws.icon}"></i> Setor X Online`;
    $$(".sidebar-nav .nav-link").forEach(a=>a.classList.toggle("active",a.dataset.workspaceNav===key));
    if(push) history.replaceState(null,"","#"+ws.sections[0]);
  }
  
  function installVadeLeiSecaBridge(){
    const vadeHead=document.querySelector('#vade-mecum .vade-head-actions');
    if(vadeHead && !document.getElementById('vade-go-lei-seca')){
      vadeHead.insertAdjacentHTML('beforeend','<button id="vade-go-lei-seca" class="ghost-btn small" type="button"><i class="fa-solid fa-book-bookmark"></i> Abrir Lei Seca</button>');
    }
    const leiHead=document.querySelector('#lei-seca-pro .sx-head-actions');
    if(leiHead && !document.getElementById('lei-go-vade')){
      leiHead.insertAdjacentHTML('beforeend','<button id="lei-go-vade" class="ghost-btn small" type="button"><i class="fa-solid fa-book-open-reader"></i> Abrir Vade Mecum</button>');
    }
  }

  function bind(){
    document.addEventListener("click",e=>{
      if(e.target.closest("#vade-go-lei-seca")){e.preventDefault();apply("vade",true);setTimeout(()=>document.getElementById("lei-seca-pro")?.scrollIntoView({behavior:"smooth",block:"start"}),80);return;}
      if(e.target.closest("#lei-go-vade")||e.target.closest("#lsx-open-vade")){e.preventDefault();apply("vade",true);setTimeout(()=>{document.getElementById("vade-mecum")?.scrollIntoView({behavior:"smooth",block:"start"}); const id=document.getElementById("lsx-law-select")?.value; if(id&&window.SetorXVadeMecum?.open) window.SetorXVadeMecum.open(id);},120);return;}
      const nav=e.target.closest(".sidebar-nav .nav-link[data-workspace-nav]");
      if(!nav) return;
      e.preventDefault();
      apply(nav.dataset.workspaceNav,true);
    },true);
    window.addEventListener("hashchange",()=>apply(keyFromHash(),false));
    window.addEventListener("setorx:auth-changed",()=>setTimeout(()=>apply(keyFromHash(),false),120));
    new MutationObserver(()=>removeBackup()).observe(document.body,{childList:true,subtree:true});
  }
  function boot(){
    removeBackup(); installVadeLeiSecaBridge(); ensureHeader(); installNav(); bind();
    setTimeout(()=>apply(keyFromHash(),false),180);
    setTimeout(()=>apply(keyFromHash(),false),800);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
  window.SetorXWorkspace={apply:()=>apply(keyFromHash(),false),workspaces};
})();
