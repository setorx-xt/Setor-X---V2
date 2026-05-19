
(function(){
  "use strict";

  const APP_KEY = "setorX.v4.refinado";
  const PRO_KEY = "setorx_lei_seca_pro_v23";
  const CUSTOM_LAWS_KEY = "setorx_vade_custom_laws_v1";
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = (v="") => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  const n = (v,f=0) => Number.isFinite(Number(v)) ? Number(v) : f;
  const norm = (s="") => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "sx_"+Date.now()+"_"+Math.random().toString(16).slice(2));

  function todayKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function addDays(dateKey, days){
    const [y,m,dn] = String(dateKey || todayKey()).split("-").map(Number);
    const d = new Date(y || new Date().getFullYear(), (m || 1)-1, dn || new Date().getDate(), 12, 0, 0);
    d.setDate(d.getDate() + Number(days || 0));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function fmtDate(k){ return k && String(k).includes("-") ? String(k).split("-").reverse().join("/") : "--/--/----"; }
  function fmtMin(min){
    const t = Math.max(0, Math.round(n(min,0)));
    return `${String(Math.floor(t/60)).padStart(2,"0")}h ${String(t%60).padStart(2,"0")}m`;
  }
  function dayKeyFromDate(d){
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function parseDateKey(k){
    const raw=String(k||"").slice(0,10);
    const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return null;
    return new Date(Number(m[1]), Number(m[2])-1, Number(m[3]), 12, 0, 0);
  }
  function startOfWeekKey(key=todayKey()){
    const d=parseDateKey(key) || new Date();
    const diff=(d.getDay()+6)%7; // segunda-feira
    d.setDate(d.getDate()-diff);
    return dayKeyFromDate(d);
  }
  function rangeLabel(range){
    const today=todayKey();
    if(range==="day") return `Hoje • ${fmtDate(today)}`;
    if(range==="week") return `Semana atual • ${fmtDate(startOfWeekKey(today))} a ${fmtDate(today)}`;
    if(range==="month") return `Mês atual • ${today.slice(5,7)}/${today.slice(0,4)}`;
    return "Todo o histórico registrado";
  }
  function dateInRange(key, range){
    const k=String(key||"").slice(0,10);
    if(!k || !/^\d{4}-\d{2}-\d{2}$/.test(k)) return range==="all";
    const today=todayKey();
    if(range==="day") return k===today;
    if(range==="week") return k>=startOfWeekKey(today) && k<=today;
    if(range==="month") return k.slice(0,7)===today.slice(0,7) && k<=today;
    return true;
  }
  function sumDateMap(map, range){
    return Object.entries(map||{}).reduce((sum,[k,v])=>dateInRange(k,range)?sum+n(v,0):sum,0);
  }
  function normalizeQDate(value){
    const s=String(value||"").trim();
    if(!s) return "";
    const m=s.match(/^(\d{4}-\d{2}-\d{2})/);
    if(m) return m[1];
    const d=new Date(s);
    if(Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function questionAttemptDate(q){
    return normalizeQDate(q?.lastReview || q?.lastResult?.answeredAt || q?.answeredAt || q?.updatedAt || q?.date || q?.capturedAt || todayKey());
  }
  function qHist(q){ return Array.isArray(q?.history) ? q.history : []; }
  function qAttemptsTotal(q){ return Math.max(n(q?.attempts,0), qHist(q).length, n(q?.correctCount,0)+n(q?.wrongCount,0)); }
  function histDate(h){ return normalizeQDate(h?.date || h?.answeredAt || h?.createdAt); }
  function questionAttemptsInRange(q, range){
    const hist=qHist(q);
    const count=hist.filter(h=>dateInRange(histDate(h),range)).length;
    if(count>0) return count;
    const fallback=qAttemptsTotal(q);
    return dateInRange(questionAttemptDate(q),range) ? fallback : 0;
  }
  function questionCorrectInRange(q, range){
    const hist=qHist(q);
    const count=hist.filter(h=>dateInRange(histDate(h),range) && h.result==="correct").length;
    if(count>0) return count;
    const fallback=n(q.correctCount, q.status==="correct"?qAttemptsTotal(q):0);
    return dateInRange(questionAttemptDate(q),range) ? fallback : 0;
  }
  function questionWrongInRange(q, range){
    const hist=qHist(q);
    const count=hist.filter(h=>dateInRange(histDate(h),range) && h.result==="wrong").length;
    if(count>0) return count;
    const fallback=n(q.wrongCount, q.status==="wrong"?qAttemptsTotal(q):0);
    return dateInRange(questionAttemptDate(q),range) ? fallback : 0;
  }
  function manualQuestionsInRange(app, range){
    const qg=app.questionGoal||{};
    const byDate=qg.manualByDate && typeof qg.manualByDate==="object" ? qg.manualByDate : {};
    const datedTotal=sumDateMap(byDate, range);
    if(range==="all") return Math.max(datedTotal, n(qg.manualDone,0));
    return datedTotal;
  }
  function statsRange(){
    const r=proState().activeStatsRange || "day";
    return ["day","week","month","all"].includes(r) ? r : "day";
  }
  function downloadJSON(filename,payload){
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=filename; document.body.appendChild(a); a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},600);
  }
  function toast(msg){
    const t=$("#toast");
    if(t){t.textContent=msg;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2600);}
    else console.log("[Setor X V23]", msg);
  }
  function readJSON(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)||localStorage.getItem(key + ".backup")||"null") ?? fallback; }catch{ return fallback; }
  }
  function writeJSON(key, value){
    const payload = JSON.stringify(value);
    localStorage.setItem(key, payload);
    localStorage.setItem(key + ".backup", payload);
    localStorage.setItem(key + ".lastSavedAt", new Date().toISOString());
  }
  function appState(){ return readJSON(APP_KEY, {}); }
  function proState(){
    const base = {
      version:"23.0",
      plan:null,
      sessions:[],
      reviews:[],
      revisionLog:{},
      generatedAt:"",
      activeRevisionTab:"all",
      activeStatsRange:"day"
    };
    return {...base, ...readJSON(PRO_KEY,{})};
  }
  function savePro(st){ writeJSON(PRO_KEY, st); }

  function vadeApi(){ return window.SetorXVadeMecum || {}; }
  function allLaws(){
    const api = vadeApi();
    const native = Array.isArray(api.db) ? api.db : [];
    const custom = readJSON(CUSTOM_LAWS_KEY, []);
    const map = new Map();
    [...native,...custom].forEach(law=>{
      if(!law || !law.title) return;
      const id = law.id || norm(law.title).replace(/\W+/g,"-");
      map.set(id, {...law, id});
    });
    return Array.from(map.values()).sort((a,b)=>
      String(a.discipline||"").localeCompare(String(b.discipline||""),"pt-BR") ||
      String(a.title||"").localeCompare(String(b.title||""),"pt-BR")
    );
  }
  function lawById(id){ return allLaws().find(l=>l.id===id) || allLaws()[0] || null; }
  function cleanArticles(law, includeRevoked=false){
    return (law?.articles || [])
      .filter(a => a && (a.n || a.text))
      .filter(a => includeRevoked || !a.revoked)
      .map((a,i)=>({
        id:a.id || `art-${i+1}`,
        n:a.n || `Item ${i+1}`,
        heading:a.heading || "",
        text:a.text || "",
        revoked:!!a.revoked,
        intro:!!a.intro
      }));
  }
  function highlightMap(){
    const st = vadeApi().state ? vadeApi().state() : readJSON("setorx_vade_mecum_v1",{});
    const h = Array.isArray(st.highlights) ? st.highlights : [];
    const marks = st.marks && typeof st.marks==="object" ? st.marks : {};
    return {highlights:h, marks};
  }
  function populateLawSelect(){
    const laws = allLaws();
    const select = $("#lsx-law-select");
    if(!select) return;
    const current = select.value || proState().plan?.lawId || laws[0]?.id || "";
    const grouped = {};
    laws.forEach(l => {
      const g = l.discipline || "Outras";
      grouped[g] = grouped[g] || [];
      grouped[g].push(l);
    });
    select.innerHTML = Object.entries(grouped).map(([disc,items])=>
      `<optgroup label="${esc(disc)}">${items.map(l=>`<option value="${esc(l.id)}">${esc(l.short || l.title)} — ${esc(l.title)}</option>`).join("")}</optgroup>`
    ).join("");
    if(current && laws.some(l=>l.id===current)) select.value = current;
  }
  function modeMinutes(){
    const mode=$("#lsx-mode")?.value || "medium";
    if(mode==="easy") return 10;
    if(mode==="medium") return 20;
    if(mode==="hard") return 30;
    return Math.max(5, n($("#lsx-minutes")?.value,20));
  }
  function nextReadingDate(start, index, daysWeek){
    // 5 dias = seg-sex; 6 dias = seg-sab; 7 dias = todos.
    let d = start;
    let count = 0;
    while(true){
      const obj = new Date(`${d}T12:00:00`);
      const day = obj.getDay();
      const allowed = daysWeek>=7 || (daysWeek===6 && day!==0) || (daysWeek===5 && day>=1 && day<=5);
      if(allowed){
        if(count===index) return d;
        count++;
      }
      d = addDays(d,1);
    }
  }
  function generatePlan(){
    const laws = allLaws();
    if(!laws.length) return toast("Nenhuma lei encontrada. Abra o Vade Mecum ou importe uma lei.");
    const law = lawById($("#lsx-law-select")?.value);
    if(!law) return toast("Escolha uma lei válida.");
    const includeRevoked = !!$("#lsx-include-revoked")?.checked;
    let articles = cleanArticles(law, includeRevoked);
    if(!articles.length) return toast("Essa lei não possui artigos disponíveis para leitura.");

    const {highlights, marks} = highlightMap();
    const strategy = $("#lsx-strategy")?.value || "linear";
    if(strategy !== "linear"){
      const score = (a) => {
        const key = `${law.id}::${a.id}`;
        const marked = marks[key]?.review ? 4 : marks[key]?.read ? 1 : 0;
        const h = highlights.filter(x => x.lawId===law.id && x.articleId===a.id).length;
        const titleBoost = a.heading ? 1 : 0;
        return strategy==="highlighted" ? marked + h*3 : marked + h*2 + titleBoost;
      };
      articles = articles.map((a,i)=>({...a,_order:i,_score:score(a)}))
        .sort((a,b)=>(b._score-a._score)||(a._order-b._order));
    }

    const minutes = modeMinutes();
    const daysWeek = Math.max(1, n($("#lsx-days-week")?.value,7));
    const start = $("#lsx-start-date")?.value || todayKey();
    const density = minutes <= 10 ? 3 : minutes <= 20 ? 6 : 10;
    const perSession = Math.max(1, Math.min(18, Math.round(density)));
    const sessions = [];
    for(let i=0, chunk=0; i<articles.length; i+=perSession, chunk++){
      const slice = articles.slice(i,i+perSession);
      const date = nextReadingDate(start, chunk, daysWeek);
      sessions.push({
        id:uid(), date, lawId:law.id, lawTitle:law.title, discipline:law.discipline||"Geral",
        minutes, articles:slice.map(a=>({id:a.id,n:a.n,heading:a.heading,revoked:a.revoked})),
        status:"pending", completedAt:""
      });
    }

    const state = proState();
    state.plan = {
      id:uid(), lawId:law.id, lawTitle:law.title, discipline:law.discipline||"Geral",
      short:law.short||law.title, mode:$("#lsx-mode")?.value || "medium", minutes, daysWeek,
      includeRevoked, strategy, start, generatedAt:new Date().toISOString(),
      articleCount:articles.length, sessionCount:sessions.length
    };
    state.sessions = sessions;
    state.reviews = [];
    state.generatedAt = new Date().toISOString();
    savePro(state);
    renderAll();
    toast(`Plano gerado: ${sessions.length} sessão(ões), ${articles.length} artigo(s).`);
  }
  function clearPlan(){
    if(!confirm("Limpar plano de lei seca atual?")) return;
    const st = proState();
    st.plan = null; st.sessions = []; st.reviews = [];
    savePro(st); renderAll(); toast("Plano de lei seca limpo.");
  }
  function completeSession(id){
    const st = proState();
    const s = st.sessions.find(x=>x.id===id);
    if(!s) return;
    const done = s.status !== "done";
    s.status = done ? "done" : "pending";
    s.completedAt = done ? new Date().toISOString() : "";
    if(done && $("#lsx-auto-review")?.checked !== false){
      const gaps = [1,3,7,15,30];
      gaps.forEach(g=>{
        const reviewId = `${s.id}:d${g}`;
        if(!st.reviews.some(r=>r.id===reviewId)){
          st.reviews.push({
            id:reviewId, type:"law", source:"lei-seca", date:addDays(todayKey(),g),
            title:`${s.lawTitle} — revisão D+${g}`,
            subtitle:s.articles.map(a=>a.n).join(", "),
            lawId:s.lawId, sessionId:s.id, status:"pending", createdAt:new Date().toISOString()
          });
        }
      });
    }
    savePro(st); renderAll(); toast(done ? "Leitura concluída e revisões agendadas." : "Leitura reaberta.");
  }
  function renderLawPlanner(){
    populateLawSelect();
    const st = proState();
    const law = lawById($("#lsx-law-select")?.value || st.plan?.lawId);
    const articles = cleanArticles(law, !!$("#lsx-include-revoked")?.checked);
    const done = st.sessions.filter(s=>s.status==="done").length;
    const progress = st.sessions.length ? Math.round(done/st.sessions.length*100) : 0;

    const activeLaw = $("#lsx-active-law");
    if(activeLaw) activeLaw.textContent = st.plan?.lawTitle || law?.title || "--";
    const sub = $("#lsx-active-law-sub");
    if(sub) sub.textContent = law ? `${law.discipline || "Geral"} • ${articles.length} artigo(s) disponíveis` : "Nenhuma lei carregada";
    $("#lsx-plan-articles") && ($("#lsx-plan-articles").textContent = String(st.plan?.articleCount || articles.length || 0));
    $("#lsx-plan-sessions") && ($("#lsx-plan-sessions").textContent = String(st.sessions.length || 0));
    $("#lsx-plan-progress") && ($("#lsx-plan-progress").textContent = `${progress}%`);

    renderTodayMission(st);
    renderPlanList(st);
  }
  function renderTodayMission(st){
    const box=$("#lsx-today-mission"); if(!box) return;
    const today=todayKey();
    const sessions=st.sessions.filter(s=>s.date===today && s.status!=="done");
    const late=st.sessions.filter(s=>s.date<today && s.status!=="done").length;
    if(!st.plan){
      box.innerHTML = `<div class="sx-empty">Gere um plano para aparecer a missão de leitura do dia.</div>`;
      return;
    }
    if(!sessions.length){
      box.innerHTML = `<div class="mission-card"><strong>Sem leitura pendente hoje</strong><span>${late?`${late} sessão(ões) atrasada(s) aguardando execução.`:"Plano em dia. Aproveite para revisar grifos ou resolver questões."}</span><small>Data local: ${fmtDate(today)}</small></div>`;
      return;
    }
    box.innerHTML = sessions.map(s=>`
      <div class="mission-card">
        <strong>${esc(s.lawTitle)}</strong>
        <span>${esc(s.articles.map(a=>a.n).join(", "))}</span>
        <small>${s.minutes} min • ${s.articles.length} artigo(s)</small>
        <div class="sx-action-row" style="margin-top:10px">
          <button class="primary-btn small" type="button" data-lsx-complete="${esc(s.id)}"><i class="fa-solid fa-check"></i> Concluir leitura</button>
          <button class="ghost-btn small" type="button" data-lsx-open-law="${esc(s.lawId)}"><i class="fa-solid fa-book-open-reader"></i> Abrir lei</button>
        </div>
      </div>`).join("");
  }
  function renderPlanList(st){
    const list=$("#lsx-plan-list"); if(!list) return;
    const q=norm($("#lsx-plan-search")?.value||"");
    const f=$("#lsx-plan-filter")?.value||"all";
    const today=todayKey();
    let arr=st.sessions.slice();
    arr=arr.filter(s=>{
      const txt=norm([s.date,s.lawTitle,s.discipline,s.articles.map(a=>`${a.n} ${a.heading}`).join(" ")].join(" "));
      const okQ=!q||txt.includes(q);
      const isToday=s.date===today, late=s.date<today&&s.status!=="done", done=s.status==="done";
      const okF=f==="all"||(f==="today"&&isToday)||(f==="late"&&late)||(f==="done"&&done)||(f==="pending"&&!done);
      return okQ&&okF;
    });
    if(!st.plan){ list.innerHTML=`<div class="sx-empty">Nenhum plano ativo. Escolha a lei e clique em “Gerar plano”.</div>`; return; }
    if(!arr.length){ list.innerHTML=`<div class="sx-empty">Nenhuma sessão encontrada para o filtro atual.</div>`; return; }

    list.innerHTML = arr.map(s=>{
      const late=s.date<today&&s.status!=="done", isToday=s.date===today, done=s.status==="done";
      const cls=done?"done":late?"late":isToday?"today":"";
      const arts=s.articles.map(a=>`${a.n}${a.heading?` — ${a.heading}`:""}`).join(" • ");
      return `<article class="sx-plan-item ${cls}">
        <div>
          <div class="sx-plan-title">${esc(s.lawTitle)}</div>
          <div class="sx-plan-meta">
            <span class="sx-chip gold">${fmtDate(s.date)}</span>
            <span class="sx-chip">${esc(s.discipline)}</span>
            <span class="sx-chip">${s.minutes} min</span>
            <span class="sx-chip ${done?"green":late?"red":""}">${done?"Concluído":late?"Atrasado":isToday?"Hoje":"Pendente"}</span>
          </div>
          <p class="muted">${esc(arts)}</p>
        </div>
        <div class="sx-item-actions">
          <button type="button" data-lsx-complete="${esc(s.id)}">${done?"Reabrir":"Concluir"}</button>
          <button type="button" data-lsx-open-law="${esc(s.lawId)}">Abrir lei</button>
        </div>
      </article>`;
    }).join("");
  }

  function renderHighlights(){
    const laws=allLaws();
    const byId=Object.fromEntries(laws.map(l=>[l.id,l]));
    const {highlights}=highlightMap();
    const search=norm($("#sx-hl-search")?.value||"");
    const discipline=$("#sx-hl-discipline")?.value||"all";
    const lawFilter=$("#sx-hl-law")?.value||"all";
    const colorFilter=$("#sx-hl-color-filter")?.value||"all";

    const discs=[...new Set(highlights.map(h=>byId[h.lawId]?.discipline||"Geral"))].sort();
    const lawIds=[...new Set(highlights.map(h=>h.lawId))];
    const colors=[...new Set(highlights.map(h=>h.color).filter(Boolean))];

    fillSelect("#sx-hl-discipline", "Todas as disciplinas", discs, discipline);
    fillSelect("#sx-hl-law", "Todas as leis", lawIds.map(id=>({value:id,label:byId[id]?.title||id})), lawFilter);
    fillSelect("#sx-hl-color-filter", "Todas as cores", colors.map(c=>({value:c,label:c})), colorFilter);

    let arr=highlights.filter(h=>{
      const law=byId[h.lawId]||{};
      const article=(law.articles||[]).find(a=>a.id===h.articleId)||{};
      const text=norm([law.title,law.discipline,article.n,article.heading,h.text,h.note].join(" "));
      return (!search||text.includes(search))
        && (discipline==="all" || (law.discipline||"Geral")===discipline)
        && (lawFilter==="all" || h.lawId===lawFilter)
        && (colorFilter==="all" || h.color===colorFilter);
    });
    const lawsCount=new Set(highlights.map(h=>h.lawId)).size;
    const artCount=new Set(highlights.map(h=>`${h.lawId}:${h.articleId}`)).size;
    const topColor = topBy(highlights.map(h=>h.color).filter(Boolean)) || "--";
    $("#sx-hl-total") && ($("#sx-hl-total").textContent=String(highlights.length));
    $("#sx-hl-laws") && ($("#sx-hl-laws").textContent=String(lawsCount));
    $("#sx-hl-articles") && ($("#sx-hl-articles").textContent=String(artCount));
    $("#sx-hl-color") && ($("#sx-hl-color").textContent=topColor==="--"?"--":"cor usada");

    const list=$("#sx-highlights-list"); if(!list) return;
    if(!arr.length){ list.innerHTML=`<div class="sx-empty">Nenhum grifo encontrado. Faça marcações no Vade Mecum para alimentar esta biblioteca.</div>`; return; }
    list.innerHTML=arr.map(h=>{
      const law=byId[h.lawId]||{};
      const article=(law.articles||[]).find(a=>a.id===h.articleId)||{};
      return `<article class="sx-highlight-item">
        <div>
          <div class="sx-highlight-title">${esc(law.title||h.lawId)} • ${esc(article.n||h.articleId)}</div>
          <div class="sx-highlight-meta">
            <span class="sx-chip">${esc(law.discipline||"Geral")}</span>
            <span class="sx-chip gold">${esc(article.heading||"Artigo")}</span>
            <span class="sx-chip" style="border-color:${esc(h.color||"#dcae4f")};color:#fff">Cor</span>
          </div>
          <div class="sx-highlight-text" style="border-left-color:${esc(h.color||"#dcae4f")}">${esc(h.text||"Grifo sem texto")}</div>
          ${h.note?`<p class="muted"><b>Anotação:</b> ${esc(h.note)}</p>`:""}
        </div>
        <div class="sx-item-actions">
          <button type="button" data-sx-open-highlight="${esc(h.lawId)}">Abrir lei</button>
          <button type="button" data-sx-review-highlight="${esc(h.id)}">Revisar</button>
        </div>
      </article>`;
    }).join("");
  }

  function fillSelect(sel, firstLabel, values, current){
    const el=$(sel); if(!el) return;
    const opts = values.map(v => typeof v==="string" ? {value:v,label:v} : v);
    el.innerHTML = `<option value="all">${esc(firstLabel)}</option>` + opts.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("");
    el.value = current && (current==="all" || opts.some(o=>o.value===current)) ? current : "all";
  }
  function topBy(arr){
    const m={}; arr.forEach(x=>m[x]=(m[x]||0)+1);
    return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0] || "";
  }

  function collectRevisions(){
    const app=appState(), pro=proState(), today=todayKey();
    const items=[];
    (app.questions||[]).forEach(q=>{
      const due = q.nextReview || q.date || today;
      if(due<=today && (q.attempts>0 || q.status==="wrong" || q.status==="correct")){
        items.push({id:`q:${q.id}`, group:"questions", date:due, title:q.externalId||q.statement?.slice(0,80)||"Questão", subtitle:`${q.subject||"Geral"} • ${q.topic||"Sem assunto"}`, danger:q.status==="wrong", sourceId:q.id});
      }
    });
    (app.summaries||[]).forEach(s=>{
      const due=s.nextReview||s.updatedAt?.slice(0,10)||today;
      if(due<=today) items.push({id:`s:${s.id}`, group:"summaries", date:due, title:s.title||"Resumo", subtitle:s.subject||"Geral", sourceId:s.id});
    });
    const wp=app.weeklyPlan||{};
    const yesterday = addDays(today,-1);
    const planDays = Array.isArray(wp.days) ? wp.days : [];
    let foundYesterday = false;
    planDays.forEach((d,di)=>{
      const dayDate = d.date || inferDateFromDay(wp.semana, di) || "";
      if(dayDate === yesterday) foundYesterday = true;
    });
    const fallbackIndex = (()=>{
      if(foundYesterday) return -1;
      const todayName = new Date().toLocaleDateString("pt-BR",{weekday:"long"}).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
      const idx = planDays.findIndex(x=>String(x.day||x.dia||x.name||"").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(todayName.split("-")[0]));
      return idx > 0 ? idx-1 : -1;
    })();
    planDays.forEach((d,di)=>{
      const dayDate = d.date || inferDateFromDay(wp.semana, di) || "";
      const isYesterdayPlan = dayDate === yesterday || di === fallbackIndex;
      if(!isYesterdayPlan) return;
      const blocks = d.blocks||d.itens||d.items||[];
      blocks.forEach((b,bi)=>{
        const key=`${di}:${bi}:d1:${yesterday}`;
        const title = b.discipline || b.disciplina || b.subject || b.title || `Bloco ${bi+1}`;
        const subject = b.subject || b.assunto || b.title || "Revisão D+1";
        const doneKey = `${di}:${bi}`;
        const completed = !!(wp.completions && wp.completions[doneKey]);
        items.push({
          id:`p:${key}`,
          group:"planning",
          date:yesterday,
          title:`Revisar: ${title}`,
          subtitle:`Planejamento de ontem • ${subject}${completed?" • bloco concluído":" • bloco pendente"}`,
          danger:!completed,
          sourceId:key
        });
      });
    });
    (pro.sessions||[]).forEach(s=>{
      const rid=`law-session:${s.id}`;
      if(s.date<=today && s.status!=="done" && !pro.revisionLog?.[rid]){
        items.push({id:rid, group:"law", date:s.date, title:`Leitura: ${s.lawTitle}`, subtitle:s.articles.map(a=>a.n).join(", "), danger:s.date<today, sourceId:s.id});
      }
    });
    (pro.reviews||[]).forEach(r=>{
      if((r.date||today)<=today && r.status!=="done"){
        items.push({id:`law-review:${r.id}`, group:"law", date:r.date||today, title:r.title, subtitle:r.subtitle||"Revisão de lei seca", sourceId:r.id});
      }
    });
    const {highlights}=highlightMap();
    highlights.slice(-30).forEach(h=>{
      const created=(h.createdAt||today).slice(0,10);
      const due=addDays(created,7);
      if(due<=today && !pro.revisionLog[`hl:${h.id}`]){
        const law=lawById(h.lawId)||{};
        items.push({id:`hl:${h.id}`, group:"highlights", date:due, title:`Grifo: ${law.short||law.title||"Lei"}`, subtitle:(h.text||"").slice(0,120), sourceId:h.id});
      }
    });
    return items.sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  }
  function inferDateFromDay(week, index){
    const m=String(week||"").match(/(\d{4}-\d{2}-\d{2})/);
    return m ? addDays(m[1],index) : "";
  }
  function markRevision(id){
    const st=proState();
    st.revisionLog[id]={doneAt:new Date().toISOString()};
    if(id.startsWith("law-review:")){
      const rid=id.replace("law-review:","");
      const r=st.reviews.find(x=>x.id===rid);
      if(r) r.status="done";
    }
    if(id.startsWith("law-session:")){
      completeSession(id.replace("law-session:",""));
      return;
    }
    savePro(st); renderAll(); toast("Revisão marcada como feita.");
  }
  function renderRevisions(){
    const st=proState();
    const items=collectRevisions().filter(i=>!st.revisionLog[i.id]);
    const tab=st.activeRevisionTab||"all";
    const filtered=tab==="all"?items:items.filter(i=>i.group===tab);
    $("#sx-rev-q") && ($("#sx-rev-q").textContent=String(items.filter(i=>i.group==="questions").length));
    $("#sx-rev-s") && ($("#sx-rev-s").textContent=String(items.filter(i=>i.group==="summaries").length));
    $("#sx-rev-p") && ($("#sx-rev-p").textContent=String(items.filter(i=>i.group==="planning").length));
    $("#sx-rev-l") && ($("#sx-rev-l").textContent=String(items.filter(i=>i.group==="law"||i.group==="highlights").length));

    $$(".sx-revision-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.sxRevTab===tab));
    const guidance=$("#sx-revision-guidance");
    if(guidance){
      const load=items.length>=20?"Carga pesada":items.length>=8?"Carga moderada":items.length?"Carga leve":"Nada vencido";
      const planCount = items.filter(i=>i.group==="planning").length;
      guidance.innerHTML=`<strong>${load}</strong><span>${items.length?`Você tem ${items.length} item(ns) de revisão.${planCount?` Planejamento: revise somente as disciplinas do dia anterior (D+1).`:""} Priorize erros do Banco QX, depois planejamento, lei seca e resumos.`:"Tudo em dia. A revisão do planejamento aparece no dia seguinte com as disciplinas estudadas no dia anterior."}</span>`;
    }
    const list=$("#sx-revision-list"); if(!list) return;
    if(!filtered.length){ list.innerHTML=`<div class="sx-empty">Nenhum item nesta categoria.</div>`; return; }
    const label={questions:"Questão",summaries:"Resumo",planning:"Planejamento",law:"Lei seca",highlights:"Grifo"};
    list.innerHTML=filtered.map(i=>{
      const late=i.date<todayKey();
      return `<article class="sx-revision-item ${late?"late":"today"}">
        <div>
          <div class="sx-rev-title">${esc(i.title)}</div>
          <div class="sx-rev-meta">
            <span class="sx-chip gold">${esc(label[i.group]||i.group)}</span>
            <span class="sx-chip ${late?"red":""}">${fmtDate(i.date)}</span>
            ${i.danger?`<span class="sx-chip red">Prioridade</span>`:""}
          </div>
          <p class="muted">${esc(i.subtitle||"")}</p>
        </div>
        <div class="sx-item-actions">
          <button type="button" data-sx-mark-revision="${esc(i.id)}">Concluir</button>
        </div>
      </article>`;
    }).join("");
  }

  function renderStats(){
    const app=appState(), pro=proState(), range=statsRange();
    const stats=app.stats||{};
    const focusBySubject=stats.focusBySubject||{};
    const sessions=pro.sessions||[];
    const lawDoneMinutes=sessions.filter(s=>s.status==="done" && dateInRange(s.completedAt?.slice(0,10)||s.date,range)).reduce((sum,s)=>sum+n(s.minutes,0),0);
    const totalBySubject=Object.values(focusBySubject).reduce((sum,e)=>sum+n(e.total,0),0);
    const totalByDateAll=Object.values(stats.focusByDate||{}).reduce((sum,v)=>sum+n(v,0),0);
    const focusRange=range==="all" ? Math.max(totalBySubject,totalByDateAll,n(stats.focusMinutesToday,0)) : sumDateMap(stats.focusByDate||{}, range);
    const totalMinutes=focusRange + lawDoneMinutes;
    const questions=app.questions||[];
    const bankAttempts=questions.reduce((s,q)=>s+questionAttemptsInRange(q,range),0);
    const bankCorrect=questions.reduce((s,q)=>s+questionCorrectInRange(q,range),0);
    const bankWrong=questions.reduce((s,q)=>s+questionWrongInRange(q,range),0);
    const manualAttempts=manualQuestionsInRange(app,range);
    const attempts=bankAttempts + manualAttempts;
    const acc=bankAttempts?Math.round(bankCorrect/bankAttempts*100):0;
    const lawSessionsInRange=sessions.filter(s=>dateInRange(s.date,range));
    const lawProgress=lawSessionsInRange.length ? Math.round(lawSessionsInRange.filter(s=>s.status==="done").length/lawSessionsInRange.length*100) : (pro.sessions?.length ? Math.round(pro.sessions.filter(s=>s.status==="done").length/pro.sessions.length*100) : 0);

    $$(".sx-stats-period button").forEach(b=>b.classList.toggle("active",(b.getAttribute("data-sx-stats-range")||"day")===range));
    const rangeInfo=$("#sx-stats-period-label");
    if(rangeInfo) rangeInfo.innerHTML=`<strong>Período:</strong><span>${esc(rangeLabel(range))} • Total = Banco QX (${bankAttempts}) + questões manuais/externas (${manualAttempts}).</span>`;

    $("#sx-stat-hours") && ($("#sx-stat-hours").textContent=fmtMin(totalMinutes));
    $("#sx-stat-hours-label") && ($("#sx-stat-hours-label").textContent=range==="all"?"histórico total":"período selecionado");
    $("#sx-stat-questions") && ($("#sx-stat-questions").textContent=String(attempts));
    $("#sx-stat-accuracy") && ($("#sx-stat-accuracy").textContent=`Banco QX: ${bankAttempts} • Manuais: ${manualAttempts} • Aproveitamento BQX: ${bankAttempts?acc+"%":"--"}`);
    const breakdown=$("#sx-stats-question-breakdown");
    if(breakdown) breakdown.innerHTML=`<span><strong>Banco QX:</strong> ${bankAttempts}</span><span><strong>Questões manuais/externas:</strong> ${manualAttempts}</span><span><strong>Total do período:</strong> ${attempts}</span>`;
    $("#sx-stat-law") && ($("#sx-stat-law").textContent=`${lawProgress}%`);
    $("#sx-stat-streak") && ($("#sx-stat-streak").textContent=`${n(stats.streak,0)} dias`);

    const subjectRange=subjectMinutesForRange(focusBySubject, range);
    renderSubjectBars(mergeLawMinutesIntoSubjects(subjectRange, sessions.filter(s=>dateInRange(s.completedAt?.slice(0,10)||s.date,range))));
    renderHeatmap(stats.focusByDate||{});
    renderQuestionStats(questions, range, manualAttempts);
    renderDiagnosis({totalMinutes,attempts,bankAttempts,manualAttempts,acc,lawProgress,questions,range});
  }
  function subjectMinutesForRange(focusBySubject, range){
    const out={};
    Object.entries(focusBySubject||{}).forEach(([key,e])=>{
      const name=e.name||"Geral";
      const total=range==="all" ? n(e.total,0) : sumDateMap(e.byDate||{},range);
      if(total>0) out[key]={name,total,byDate:e.byDate||{}};
    });
    return out;
  }
  function mergeLawMinutesIntoSubjects(focusBySubject, sessions){
    const merged = JSON.parse(JSON.stringify(focusBySubject || {}));
    (sessions || []).filter(s=>s.status==="done").forEach(s=>{
      const name = s.discipline || "Lei Seca";
      const key = norm(name) || "lei-seca";
      merged[key] = merged[key] || {name, total:0, byDate:{}};
      merged[key].name = merged[key].name || name;
      merged[key].total = n(merged[key].total,0) + n(s.minutes,0);
      if(s.date){ merged[key].byDate = merged[key].byDate || {}; merged[key].byDate[s.date] = n(merged[key].byDate[s.date],0) + n(s.minutes,0); }
    });
    return merged;
  }

  function renderSubjectBars(focusBySubject){
    const box=$("#sx-subject-bars"); if(!box) return;
    const arr=Object.values(focusBySubject||{}).map(e=>({name:e.name||"Geral", total:n(e.total,0)})).filter(e=>e.total>0).sort((a,b)=>b.total-a.total).slice(0,12);
    if(!arr.length){ box.innerHTML=`<div class="sx-empty">Quando você concluir blocos no Foco Tático selecionando disciplina, as horas aparecem aqui.</div>`; return; }
    const max=Math.max(...arr.map(e=>e.total),1);
    box.innerHTML=arr.map(e=>`<div class="sx-bar-row">
      <span title="${esc(e.name)}">${esc(e.name)}</span>
      <div class="sx-bar-track"><div class="sx-bar-fill" style="width:${Math.max(4,Math.round(e.total/max*100))}%"></div></div>
      <small>${fmtMin(e.total)}</small>
    </div>`).join("");
  }
  function renderHeatmap(byDate){
    const box=$("#sx-heatmap"); if(!box) return;
    const days=[]; for(let i=13;i>=0;i--) days.push(addDays(todayKey(),-i));
    box.innerHTML=days.map(d=>{
      const m=n(byDate[d],0);
      const level=m>=240?4:m>=120?3:m>=60?2:m>0?1:0;
      return `<div class="sx-heat-day" data-level="${level}"><strong>${d.slice(8,10)}/${d.slice(5,7)}</strong><span>${fmtMin(m)}</span></div>`;
    }).join("");
  }
  function renderQuestionStats(questions, range=statsRange(), manualAttempts=0){
    const box=$("#sx-question-stats"); if(!box) return;
    if(!questions.length && !manualAttempts){ box.innerHTML=`<div class="sx-empty">O Banco QX ainda não tem questões cadastradas.</div>`; return; }
    const map={};
    (questions||[]).forEach(q=>{
      const k=q.subject||"Geral"; map[k]=map[k]||{total:0,attempts:0,wrong:0,correct:0};
      map[k].total++;
      map[k].attempts+=questionAttemptsInRange(q,range);
      map[k].wrong+=questionWrongInRange(q,range);
      map[k].correct+=questionCorrectInRange(q,range);
    });
    const arr=Object.entries(map).map(([name,v])=>({name,...v,acc:v.attempts?Math.round(v.correct/v.attempts*100):0})).sort((a,b)=>b.wrong-a.wrong||b.attempts-a.attempts||b.total-a.total).slice(0,10);
    if(manualAttempts){
      arr.unshift({name:"Questões manuais/externas", total:manualAttempts, attempts:manualAttempts, wrong:0, correct:0, acc:null, manual:true});
    }
    box.innerHTML=arr.map(x=>`<div class="sx-rank-item ${x.manual?"sx-manual-row":""}">
      <div><strong>${esc(x.name)}</strong><br><span>${x.manual?`${x.attempts} feitas no registro manual`:`${x.total} cadastradas • ${x.attempts} feitas no período • ${x.wrong} erro(s)`}</span></div>
      <span class="${x.manual?"sx-neutral-text":x.acc>=70?"sx-success-text":x.acc<50?"sx-danger-text":"sx-warning"}">${x.manual?"manual":`${x.acc}%`}</span>
    </div>`).join("") || `<div class="sx-empty">Nenhuma questão feita no período selecionado.</div>`;
  }
  function renderDiagnosis(data){
    const box=$("#sx-mentor-diagnosis"); if(!box) return;
    const rec=[];
    if(data.totalMinutes<60 && data.range==="day") rec.push("Hoje ainda está fraco: abrir Foco Tático e registrar pelo menos um bloco líquido.");
    else if(data.totalMinutes<600 && data.range==="all") rec.push("Aumentar volume líquido: ainda há pouca amostra de horas registradas.");
    if(data.attempts<20 && data.range==="day") rec.push("Meta operacional: buscar volume mínimo de questões hoje. As manuais/externas já entram na estatística.");
    else if(data.attempts<300 && data.range==="all") rec.push("Banco QX precisa de mais tração: meta inicial de 300 questões para diagnóstico confiável.");
    if(data.bankAttempts && data.acc<60) rec.push("Aproveitamento abaixo do ideal: priorizar caderno de erros e revisão de comentários.");
    if(data.manualAttempts && !data.bankAttempts) rec.push("Você registrou questões manuais/externas; para medir aproveitamento, resolva/cadastre também no Banco QX.");
    if(data.lawProgress<30) rec.push("Lei seca ainda baixa: monte plano de leitura com 20 a 30 min por dia.");
    if(!rec.length) rec.push("Operação equilibrada: manter ritmo e aumentar dificuldade na reta final.");
    box.innerHTML=`<strong>Leitura operacional</strong>${rec.map(r=>`<span>• ${esc(r)}</span>`).join("<br>")}`;
  }

  function bind(){
    $("#lsx-refresh-laws")?.addEventListener("click",()=>{populateLawSelect();renderLawPlanner();toast("Lista de leis atualizada.");});
    $("#lsx-open-vade")?.addEventListener("click",()=>{ const id=$("#lsx-law-select")?.value; if(window.SetorXVadeMecum?.open) window.SetorXVadeMecum.open(id);});
    $("#lsx-mode")?.addEventListener("change",e=>{
      const min=modeMinutes(); const input=$("#lsx-minutes"); if(input && e.target.value!=="custom") input.value=min;
    });
    $("#lsx-generate-plan")?.addEventListener("click",generatePlan);
    $("#lsx-clear-plan")?.addEventListener("click",clearPlan);
    ["#lsx-law-select","#lsx-include-revoked","#lsx-plan-search","#lsx-plan-filter"].forEach(sel=>{
      const el=$(sel); if(!el) return;
      el.addEventListener("input",renderLawPlanner);
      el.addEventListener("change",renderLawPlanner);
    });
    document.addEventListener("click",e=>{
      const c=e.target.closest("[data-lsx-complete]"); if(c){completeSession(c.dataset.lsxComplete); return;}
      const open=e.target.closest("[data-lsx-open-law]"); if(open && window.SetorXVadeMecum?.open){window.SetorXVadeMecum.open(open.dataset.lsxOpenLaw); return;}
      const oh=e.target.closest("[data-sx-open-highlight]"); if(oh && window.SetorXVadeMecum?.open){window.SetorXVadeMecum.open(oh.dataset.sxOpenHighlight); return;}
      const rh=e.target.closest("[data-sx-review-highlight]"); if(rh){ const st=proState(); st.revisionLog[`hl:${rh.dataset.sxReviewHighlight}`]={doneAt:new Date().toISOString()}; savePro(st); renderAll(); toast("Grifo marcado como revisado."); return;}
      const mr=e.target.closest("[data-sx-mark-revision]"); if(mr){markRevision(mr.dataset.sxMarkRevision); return;}
      const tab=e.target.closest("[data-sx-rev-tab]"); if(tab){ const st=proState(); st.activeRevisionTab=tab.dataset.sxRevTab; savePro(st); renderRevisions(); return;}
    });
    ["#sx-hl-search","#sx-hl-discipline","#sx-hl-law","#sx-hl-color-filter"].forEach(sel=>{
      const el=$(sel); if(!el) return;
      el.addEventListener("input",renderHighlights);
      el.addEventListener("change",renderHighlights);
    });
    $("#sx-highlights-refresh")?.addEventListener("click",()=>{renderHighlights();toast("Biblioteca de grifos atualizada.");});
    $("#sx-highlights-export")?.addEventListener("click",()=>downloadJSON(`setorx-grifos-${todayKey()}.json`, highlightMap().highlights));
    $("#sx-rev-refresh")?.addEventListener("click",()=>{renderRevisions();toast("Central de revisão atualizada.");});
    $("#sx-rev-mark-visible")?.addEventListener("click",()=>{
      if(!confirm("Marcar todos os itens visíveis como revisados?")) return;
      const st=proState();
      $$("#sx-revision-list [data-sx-mark-revision]").forEach(btn=>{
        const id = btn.dataset.sxMarkRevision;
        st.revisionLog[id]={doneAt:new Date().toISOString()};
        if(id.startsWith("law-session:")){
          const sid=id.replace("law-session:","");
          const sess=st.sessions.find(x=>x.id===sid);
          if(sess){ sess.status="done"; sess.completedAt=sess.completedAt || new Date().toISOString(); }
        }
        if(id.startsWith("law-review:")){
          const rid=id.replace("law-review:","");
          const rev=st.reviews.find(x=>x.id===rid);
          if(rev){ rev.status="done"; rev.completedAt=rev.completedAt || new Date().toISOString(); }
        }
      });
      savePro(st); renderAll(); toast("Itens visíveis marcados como revisados.");
    });
    const changeStatsRange=(range)=>{
      const st=proState();
      st.activeStatsRange=["day","week","month","all"].includes(range)?range:"day";
      savePro(st);
      renderStats();
    };
    $$(".sx-stats-period button").forEach(btn=>btn.addEventListener("click",()=>changeStatsRange(btn.getAttribute("data-sx-stats-range") || "day")));
    document.addEventListener("click",e=>{
      const btn=e.target.closest("[data-sx-stats-range]");
      if(!btn) return;
      e.preventDefault();
      changeStatsRange(btn.getAttribute("data-sx-stats-range") || "day");
    },true);
    $("#sx-stats-refresh")?.addEventListener("click",()=>{renderStats();toast("Estatísticas atualizadas.");});
    $("#sx-stats-export")?.addEventListener("click",()=>downloadJSON(`setorx-relatorio-estatisticas-${todayKey()}.json`, {
      periodo: statsRange(),
      periodoLabel: rangeLabel(statsRange()),
      generatedAt:new Date().toISOString(),
      app: appState(),
      leiSeca: proState(),
      vade: highlightMap()
    }));
  }

  function renderAll(){
    populateLawSelect();
    const start=$("#lsx-start-date"); if(start && !start.value) start.value=todayKey();
    renderLawPlanner();
    renderHighlights();
    renderRevisions();
    renderStats();
    try{ setTimeout(()=>window.SetorXV30StatsFix?.patchAll?.(), 100); }catch(e){}
  }

  function boot(){
    try{ bind(); renderAll(); setTimeout(renderAll,600); }catch(e){ console.error("[Setor X V23] Falha ao iniciar módulos PRO",e); toast("Módulos PRO carregaram com aviso. Reabra a página se algo não aparecer."); }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();

  window.SetorXProV23 = {renderAll, renderStats, generatePlan, proState, allLaws, collectRevisions};
})();
