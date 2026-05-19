
(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=(v="")=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const uid=()=>crypto.randomUUID?crypto.randomUUID():"sx_"+Date.now()+"_"+Math.random().toString(16).slice(2);
  const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
  const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const fmtDate=k=>k&&String(k).includes("-")?String(k).slice(0,10).split("-").reverse().join("/"):"--/--/----";
  const ptWeek=["domingo","segunda","terca","quarta","quinta","sexta","sabado"];

  let sb=null, session=null, user=null, profile=null;
  const state={students:[],plans:[],progress:[],attempts:[],questions:[],goals:[],ranking:[],myPlan:null,myProgress:[],ready:false};

  function normalizeSupabaseUrl(raw){
    let url=String(raw||"").trim().replace(/^["']|["']$/g,"");
    if(!url||url.includes("COLE_AQUI")) return "";
    const dash=url.match(/supabase\.com\/dashboard\/project\/([^\/?#]+)/i);
    if(dash&&dash[1]) return `https://${dash[1]}.supabase.co`;
    return url.replace(/\/(auth|rest|storage)\/v1\/?.*$/i,"").replace(/\/+$/,"");
  }
  function configError(){
    if(!window.supabase) return "Biblioteca Supabase não carregou.";
    if(!window.SETORX_SUPABASE_URL||String(window.SETORX_SUPABASE_URL).includes("COLE_AQUI")) return "Configure a Project URL em assets/js/online-config.js.";
    if(!window.SETORX_SUPABASE_ANON_KEY||String(window.SETORX_SUPABASE_ANON_KEY).includes("COLE_AQUI")) return "Configure a chave pública em assets/js/online-config.js.";
    const url=normalizeSupabaseUrl(window.SETORX_SUPABASE_URL);
    if(!/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(url)) return "URL do Supabase inválida. Use apenas https://SEU-PROJECT-REF.supabase.co.";
    return "";
  }
  function connect(){
    const err=configError();
    if(err){ sb=null; return err; }
    sb=window.supabase.createClient(normalizeSupabaseUrl(window.SETORX_SUPABASE_URL), String(window.SETORX_SUPABASE_ANON_KEY||"").trim());
    return "";
  }
  function isMentor(){return profile?.role==="mentor"&&profile?.status==="active"}
  function canAccess(){return isMentor()||profile?.status==="active"}
  function toast(msg,type="info"){
    const t=$("#toast");
    if(t){t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600);}
    const box=$("#mentor-pro-message")||$("#online-auth-state");
    if(box){box.textContent=msg;box.className=`online-auth-state ${type}`;}
    console.log("[Setor X Mentor]",msg);
  }
  function dispatchAuth(){
    window.SetorXMentorPro={
      isMentor, canAccess, profile:()=>profile, state:()=>state, reload:loadAll, client:()=>sb, syncRanking
    };
    window.dispatchEvent(new CustomEvent("setorx:auth-changed",{detail:{mentor:isMentor(),active:canAccess(),profile}}));
  }

  async function loadAll(){
    const err=connect();
    if(err){ state.ready=false; renderAll(); dispatchAuth(); return; }
    const s=await sb.auth.getSession(); session=s.data.session; user=session?.user||null;
    if(!user){ profile=null; state.ready=false; renderAll(); dispatchAuth(); return; }
    let pr=await sb.from("profiles").select("*").eq("id",user.id).single();
    if(pr.error && pr.error.code==="PGRST116"){
      const payload={id:user.id,email:user.email,full_name:user.user_metadata?.full_name||user.email?.split("@")[0]||"Aluno",nickname:user.email?.split("@")[0]||"Aluno",role:"student",status:"pending",active:false,xp_total:0};
      await sb.from("profiles").insert(payload); profile=payload;
    }else profile=pr.data;
    state.ready=true;

    const common=[
      sb.from("profiles").select("id,email,full_name,nickname,role,status,active,contest_target,xp_total,created_at").eq("status","active").order("xp_total",{ascending:false}).limit(100),
      sb.from("collective_questions").select("*").eq("is_public",true),
    ];
    const [rankingRes,qRes]=await Promise.all(common);
    state.ranking=rankingRes.data||[];
    state.questions=qRes.data||[];

    if(isMentor()){
      const [st,pl,pg,at,go]=await Promise.all([
        sb.from("profiles").select("*").order("created_at",{ascending:false}),
        sb.from("individual_plans").select("*").order("created_at",{ascending:false}),
        sb.from("plan_progress").select("*"),
        sb.from("collective_attempts").select("*"),
        sb.from("student_goals").select("*").order("due_date",{ascending:true})
      ]);
      state.students=st.data||[]; state.plans=pl.data||[]; state.progress=pg.data||[]; state.attempts=at.data||[]; state.goals=go.data||[];
    }else if(profile?.status==="active"){
      const [pl,go,att]=await Promise.all([
        sb.from("individual_plans").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(1),
        sb.from("student_goals").select("*").eq("user_id",user.id).order("due_date",{ascending:true}),
        sb.from("collective_attempts").select("*").eq("user_id",user.id)
      ]);
      state.myPlan=pl.data?.[0]||null;
      state.goals=go.data||[]; state.attempts=att.data||[];
      if(state.myPlan){
        const pg=await sb.from("plan_progress").select("*").eq("plan_id",state.myPlan.id).eq("user_id",user.id);
        state.myProgress=pg.data||[];
      }else state.myProgress=[];
    }
    renderAll(); dispatchAuth();
  }

  async function syncRanking(){
    if(!sb||!user) return;
    try{
      await sb.rpc("setorx_recompute_xp_totals");
    }catch(e){}
    await loadAll();
  }

  function ensureMentorSection(){
    const content=$(".content")||$("main"); if(!content) return;
    if(!$("#online-mentor")){
      content.insertAdjacentHTML("beforeend", `
        <section id="online-mentor" class="glass-card section-block mentor-pro-section">
          <div class="section-head mentor-pro-head">
            <div>
              <p class="eyebrow"><i class="fa-solid fa-user-tie"></i> Área do mentor</p>
              <h2>Comando da Mentoria</h2>
              <span class="section-subtitle">Gestão dos alunos, estatísticas, metas, planejamento individual e ranking sincronizado.</span>
            </div>
            <button id="mentor-refresh" class="secondary-btn small" type="button"><i class="fa-solid fa-rotate"></i> Sincronizar</button>
          </div>
          <p id="mentor-pro-message" class="online-auth-state info">Carregando área do mentor...</p>
          <div id="mentor-kpis" class="mentor-kpis"></div>
          <div class="mentor-pro-tabs">
            <button class="active" type="button" data-mentor-tab="overview"><i class="fa-solid fa-chart-simple"></i> Visão geral</button>
            <button type="button" data-mentor-tab="students"><i class="fa-solid fa-user-check"></i> Alunos</button>
            <button type="button" data-mentor-tab="plans"><i class="fa-solid fa-file-import"></i> Importar planejamento</button>
            <button type="button" data-mentor-tab="goals"><i class="fa-solid fa-bullseye"></i> Metas por aluno</button>
          </div>
          <div class="mentor-tab-panel active" data-mentor-panel="overview"><div id="mentor-overview-list"></div></div>
          <div class="mentor-tab-panel" data-mentor-panel="students" hidden><div id="mentor-student-list"></div></div>
          <div class="mentor-tab-panel" data-mentor-panel="plans" hidden>
            <form id="mentor-plan-form" class="mentor-pro-form">
              <div class="online-grid">
                <label>Aluno<select id="mentor-plan-student"></select></label>
                <label>Concurso<input id="mentor-plan-contest" placeholder="Ex: PRF" /></label>
              </div>
              <div class="online-grid">
                <label>Semana<input id="mentor-plan-week" placeholder="Ex: 20/05 a 26/05" /></label>
                <label>Mensagem do mentor<input id="mentor-plan-message" placeholder="Missão da semana..." /></label>
              </div>
              <div class="mentor-plan-actions">
                <button id="mentor-plan-model-json" class="ghost-btn" type="button">Modelo JSON</button>
                <button id="mentor-plan-model-md" class="ghost-btn" type="button">Modelo Markdown</button>
              </div>
              <textarea id="mentor-plan-raw" rows="16" placeholder="Cole o planejamento JSON ou Markdown exportado pelo seu programa..."></textarea>
              <button class="primary-btn wide" type="submit"><i class="fa-solid fa-cloud-arrow-up"></i> Enviar planejamento individual</button>
            </form>
          </div>
          <div class="mentor-tab-panel" data-mentor-panel="goals" hidden>
            <form id="mentor-goal-form" class="mentor-pro-form">
              <div class="online-grid">
                <label>Aluno<select id="mentor-goal-student"></select></label>
                <label>Tipo<select id="mentor-goal-type"><option value="questions">Questões</option><option value="hours">Horas líquidas</option><option value="simulation">Simulado</option><option value="law">Lei seca</option></select></label>
              </div>
              <div class="online-grid">
                <label>Meta<input id="mentor-goal-target" type="number" min="1" placeholder="Ex: 1000" /></label>
                <label>Até a data<input id="mentor-goal-date" type="date" /></label>
              </div>
              <label>Descrição<input id="mentor-goal-title" placeholder="Ex: 1000 questões de CTB até domingo" /></label>
              <button class="primary-btn wide" type="submit"><i class="fa-solid fa-bullseye"></i> Definir meta para o aluno</button>
            </form>
            <div id="mentor-goal-list" class="mentor-goal-list"></div>
          </div>
        </section>`);
    }
  }

  function planProgressPct(plan,userId){
    if(!plan?.plan_json) return 0;
    const blocks=(plan.plan_json.days||[]).flatMap(d=>d.blocks||[]);
    if(!blocks.length) return 0;
    const done=state.progress.filter(p=>p.plan_id===plan.id&&p.user_id===userId&&p.completed).length;
    return Math.round(done/blocks.length*100);
  }
  function questionsDone(userId){
    return state.attempts.filter(a=>a.user_id===userId).length;
  }
  function goalsFor(userId){return state.goals.filter(g=>g.user_id===userId)}
  function latestPlan(userId){return state.plans.find(p=>p.user_id===userId)}
  function studentName(s){return s.nickname||s.full_name||s.email||"Aluno"}

  function renderMentor(){
    ensureMentorSection();
    const sec=$("#online-mentor"); if(!sec) return;
    sec.hidden=!isMentor();
    if(!isMentor()){ return; }
    const active=state.students.filter(s=>s.status==="active").length;
    const pending=state.students.filter(s=>s.status==="pending").length;
    const blocked=state.students.filter(s=>s.status==="blocked").length;
    const plans=state.plans.length;
    const attempts=state.attempts.length;
    const top=state.ranking[0];

    $("#mentor-kpis").innerHTML=`
      <article><span>Ativos</span><strong>${active}</strong><small>alunos liberados</small></article>
      <article><span>Pendentes</span><strong>${pending}</strong><small>aguardando aprovação</small></article>
      <article><span>Planejamentos</span><strong>${plans}</strong><small>individuais enviados</small></article>
      <article><span>Questões coletivas</span><strong>${attempts}</strong><small>respondidas</small></article>
      <article><span>Líder</span><strong>${esc(top?.nickname||top?.full_name||"--")}</strong><small>${n(top?.xp_total)} XP</small></article>
    `;

    const cards=state.students.filter(s=>s.role!=="mentor").map(s=>{
      const plan=latestPlan(s.id); const pct=planProgressPct(plan,s.id); const q=questionsDone(s.id); const gs=goalsFor(s.id);
      return `<article class="mentor-student-row ${s.status}">
        <div class="mentor-student-main">
          <strong>${esc(studentName(s))}</strong>
          <span>${esc(s.email)} • ${esc(s.contest_target||"sem concurso")} • ${esc(s.status)}</span>
          <div class="mentor-progress"><div style="width:${pct}%"></div></div>
          <small>Plano: ${plan?esc(plan.week_label||plan.contest||"enviado"):"sem plano"} • Execução: ${pct}% • QX coletivo: ${q} resposta(s) • Metas: ${gs.length}</small>
        </div>
        <div class="mentor-actions">
          <button class="secondary-btn small" data-mentor-activate="${s.id}">Ativar</button>
          <button class="ghost-btn small" data-mentor-pending="${s.id}">Pendente</button>
          <button class="online-danger ghost-btn small" data-mentor-block="${s.id}">Bloquear</button>
          <button class="ghost-btn small" data-mentor-fill-plan="${s.id}">Planejar</button>
        </div>
      </article>`;
    }).join("")||`<div class="sx-empty">Nenhum aluno cadastrado.</div>`;

    $("#mentor-overview-list").innerHTML=cards;
    $("#mentor-student-list").innerHTML=cards;
    const opts=state.students.filter(s=>s.role!=="mentor").map(s=>`<option value="${s.id}">${esc(studentName(s))} — ${esc(s.email)}</option>`).join("");
    $("#mentor-plan-student").innerHTML=opts||`<option value="">Nenhum aluno</option>`;
    $("#mentor-goal-student").innerHTML=opts||`<option value="">Nenhum aluno</option>`;
    $("#mentor-goal-list").innerHTML=state.goals.map(g=>`<article class="mentor-goal-item"><strong>${esc(g.title||g.goal_type)}</strong><span>${esc(studentName(state.students.find(s=>s.id===g.user_id)||{}))} • ${g.target_value||0} até ${fmtDate(g.due_date)} • ${esc(g.status||"active")}</span></article>`).join("")||`<div class="sx-empty">Nenhuma meta definida.</div>`;
  }

  function findTodayDay(plan){
    const days=plan?.days||[]; if(!days.length) return null;
    const today=todayKey();
    const dow=ptWeek[new Date().getDay()];
    return days.find(d=>String(d.date||"").slice(0,10)===today)
      || days.find(d=>norm(d.day).includes(dow))
      || days[0];
  }
  function renderStudentPlan(){
    const sec=$("#online-planejamento"); if(!sec) return;
    // Mentor uses the Mentor module. Student planning area must stay clean.
    const title=sec.querySelector(".section-head h2");
    const sub=sec.querySelector(".section-subtitle");
    if(title) title.textContent="Operação semanal — Planejamento Semanal";
    if(sub) sub.textContent="O aluno visualiza apenas a missão do dia, com aula, questões, revisão e metas do bloco.";
    if(isMentor()){
      const box=$("#online-my-plan");
      if(box) box.innerHTML=`<div class="online-comment"><strong>Mentor:</strong> use a aba <b>Área do Mentor</b> para importar planejamentos e acompanhar estatísticas dos alunos.</div>`;
      return;
    }
    const box=$("#online-my-plan"); if(!box) return;
    if(!profile||profile.status!=="active"){
      box.innerHTML=`<div class="online-comment"><strong>Acesso não liberado.</strong><br>Aguarde a aprovação do mentor.</div>`;
      return;
    }
    const plan=state.myPlan?.plan_json;
    if(!plan){
      box.innerHTML=`<div class="online-comment"><strong>Nenhum planejamento carregado.</strong><br>Assim que o mentor importar sua semana, a missão do dia aparecerá aqui.</div>`;
      return;
    }
    const day=findTodayDay(plan);
    if(!day){
      box.innerHTML=`<div class="online-comment"><strong>Planejamento vazio.</strong></div>`;
      return;
    }
    const blocks=day.blocks||[];
    box.innerHTML=`
      <div class="student-plan-hero">
        <p class="eyebrow"><i class="fa-solid fa-crosshairs"></i> Missão de hoje</p>
        <h3>${esc(day.day)} ${day.date?"• "+esc(fmtDate(day.date)):""}</h3>
        <span>${esc(day.disciplines||day.review||plan.mensagemMentor||"Operação do dia")}</span>
      </div>
      ${day.review?`<div class="online-comment"><strong>Revisão:</strong> ${esc(day.review)}</div>`:""}
      <div class="student-today-blocks">
        ${blocks.map(block=>{
          const pg=state.myProgress.find(p=>p.block_id===block.id);
          return `<article class="student-today-block ${pg?.completed?"done":""}">
            <button class="online-check" data-mp-block="${esc(block.id)}">${pg?.completed?"✓":"○"}</button>
            <div>
              <strong>Bloco ${esc(block.number)} — ${esc(block.discipline||"Disciplina")}</strong>
              <p>${esc(block.subject||"")}</p>
              <div class="online-mini-tools">
                <span class="online-chip">Meta: ${n(block.meta)} questões</span>
                ${block.materialLink?`<a class="online-chip link" target="_blank" href="${esc(block.materialLink)}">Aula/material</a>`:""}
                ${block.questionLink?`<a class="online-chip link" target="_blank" href="${esc(block.questionLink)}">Questões</a>`:""}
                ${pg?`<span class="online-chip">Feitas: ${n(pg.done_questions)}</span>`:""}
              </div>
            </div>
            <button class="secondary-btn small" data-mp-register="${esc(block.id)}">Registrar</button>
          </article>`;
        }).join("")||`<div class="sx-empty">Nenhum bloco para hoje.</div>`}
      </div>`;
  }

  async function savePlan(e){
    e.preventDefault(); if(!isMentor()) return toast("Apenas mentor.","error");
    const sid=$("#mentor-plan-student").value; if(!sid) return toast("Selecione um aluno.","error");
    let plan; try{ plan=parsePlan($("#mentor-plan-raw").value); }catch(err){ return toast(err.message,"error"); }
    const contest=$("#mentor-plan-contest").value.trim()||plan.concurso||plan.contest||"";
    const week=$("#mentor-plan-week").value.trim()||plan.semana||plan.week||"";
    const msg=$("#mentor-plan-message").value.trim()||plan.mensagemMentor||plan.mentorMessage||"";
    plan.concurso=contest; plan.semana=week; plan.mensagemMentor=msg;
    const payload={user_id:sid,mentor_id:user.id,contest,week_label:week,mentor_message:msg,plan_json:plan};
    const {error}=await sb.from("individual_plans").insert(payload);
    if(error) return toast(error.message,"error");
    $("#mentor-plan-raw").value=""; toast("Planejamento individual enviado.","success"); await loadAll();
  }
  async function saveGoal(e){
    e.preventDefault(); if(!isMentor()) return toast("Apenas mentor.","error");
    const payload={user_id:$("#mentor-goal-student").value,mentor_id:user.id,goal_type:$("#mentor-goal-type").value,title:$("#mentor-goal-title").value.trim(),target_value:parseInt($("#mentor-goal-target").value||"0",10),due_date:$("#mentor-goal-date").value,status:"active"};
    if(!payload.user_id||!payload.target_value||!payload.due_date) return toast("Preencha aluno, meta e data.","error");
    const {error}=await sb.from("student_goals").insert(payload);
    if(error) return toast(error.message,"error");
    toast("Meta definida para o aluno.","success"); e.target.reset(); await loadAll();
  }
  async function updateStudent(id,status){
    if(!isMentor()) return;
    const {error}=await sb.from("profiles").update({status,active:status==="active"}).eq("id",id);
    if(error) return toast(error.message,"error");
    toast("Status do aluno atualizado.","success"); await loadAll();
  }
  async function updateProgress(blockId, register=false){
    if(!state.myPlan||!profile||profile.status!=="active") return;
    const current=state.myProgress.find(p=>p.block_id===blockId);
    let done=n(current?.done_questions),correct=n(current?.correct),wrong=n(current?.wrong);
    if(register){
      done=parseInt(prompt("Questões feitas:",done)||done||0,10);
      correct=parseInt(prompt("Acertos:",correct)||correct||0,10);
      wrong=parseInt(prompt("Erros:",wrong)||wrong||0,10);
    }
    const payload={user_id:user.id,plan_id:state.myPlan.id,block_id:blockId,completed:register?true:!current?.completed,done_questions:done,correct,wrong,updated_at:new Date().toISOString()};
    const {error}=await sb.from("plan_progress").upsert(payload,{onConflict:"user_id,plan_id,block_id"});
    if(error) return toast(error.message,"error");
    if(payload.completed&&!current?.completed) await addXP(20,"Bloco do planejamento concluído");
    await loadAll();
  }
  async function addXP(amount,reason){
    if(!sb||!user||!amount) return;
    await sb.from("xp_events").insert({user_id:user.id,amount,reason});
    // Trigger syncs profiles.xp_total. Fallback update if trigger was not installed.
    const newXP=n(profile?.xp_total)+amount; profile.xp_total=newXP;
    await sb.from("profiles").update({xp_total:newXP}).eq("id",user.id);
  }
  function modelJSON(){
    return JSON.stringify({aluno:"Saldanha",concurso:"PRF",semana:"20/05 a 26/05",mentor:"Matheus G.",mensagemMentor:"Missão da semana carregada. Execute o dia de hoje e registre as questões.",days:[{day:"TERÇA-FEIRA",date:todayKey(),review:"Revisar erros do último bloco.",disciplines:"CTB + Constitucional",metaDay:80,blocks:[{number:1,discipline:"CTB",subject:"Normas gerais de circulação",material:"Aula/PDF",materialLink:"",questions:"QConcursos",questionLink:"",meta:40,type:"study"},{number:2,discipline:"Direito Constitucional",subject:"Art. 5º",material:"Lei seca",materialLink:"",questions:"Banco QX",questionLink:"",meta:40,type:"study"}]}]},null,2);
  }
  function modelMD(){
    return `## ✅ TERÇA-FEIRA – ${todayKey().split("-").reverse().join("/")}

**Revisão:** Revisar erros do último bloco.
**Disciplina do dia:** CTB + Constitucional
**Meta do dia:** 80 questões

### Bloco 1 – CTB

**Assunto:** Normas gerais de circulação
**Material de apoio:** 
**Questões:** 
**Meta:** 40 questões

### Bloco 2 – Direito Constitucional

**Assunto:** Art. 5º
**Material de apoio:** 
**Questões:** 
**Meta:** 40 questões`;
  }
  function parsePlan(raw){
    if(window.SetorXOnlineProParsePlan) return window.SetorXOnlineProParsePlan(raw);
    const t=String(raw||"").trim(); if(!t) throw new Error("Planejamento vazio.");
    if(t.startsWith("{")||t.startsWith("[")){
      const obj=JSON.parse(t); return Array.isArray(obj)?{days:obj}:obj;
    }
    const matches=[...t.matchAll(/^##\s*(?:✅\s*)?(.+?)(?:\s*[–-]\s*(.+))?$/gmi)];
    const plan={title:"Planejamento importado",days:[]};
    matches.forEach((m,i)=>{
      const start=m.index,end=matches[i+1]?.index??t.length,chunk=t.slice(start,end),blocks=[];
      const bms=[...chunk.matchAll(/^###\s*Bloco\s*(\d+)\s*[–-]\s*(.+)$/gmi)];
      bms.forEach((bm,j)=>{
        const bs=bm.index,be=bms[j+1]?.index??chunk.length,bc=chunk.slice(bs,be);
        const mat=(bc.match(/\*\*Material de apoio:\*\*\s*(.*)/i)?.[1]||"").trim(), q=(bc.match(/\*\*Questões:\*\*\s*(.*)/i)?.[1]||"").trim();
        const link=s=>{const md=s.match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/i); if(md)return md[1]; const u=s.match(/https?:\/\/[^\s)]+/i); return u?u[0]:"";};
        blocks.push({id:uid(),number:parseInt(bm[1]||j+1,10),discipline:bm[2].replace(/\*/g,"").trim(),subject:(bc.match(/\*\*Assunto\s*:?\*\*\s*(.*)/i)?.[1]||"").trim(),material:mat,materialLink:link(mat),questions:q,questionLink:link(q),meta:parseInt((bc.match(/\*\*Meta:\*\*\s*(.*)/i)?.[1]||"0").replace(/\D/g,""),10)||0,type:"study"});
      });
      plan.days.push({id:uid(),day:(m[1]||"Dia").trim(),date:(m[2]||"").trim(),review:(chunk.match(/\*\*Revisão:\*\*\s*(.+)/i)?.[1]||"").trim(),disciplines:(chunk.match(/\*\*Disciplina do dia:\*\*\s*(.+)/i)?.[1]||"").trim(),metaDay:parseInt((chunk.match(/\*\*Meta do dia:\*\*\s*(.+)/i)?.[1]||"0").replace(/\D/g,""),10)||0,blocks});
    });
    return plan;
  }

  function renderAll(){
    renderMentor();
    renderStudentPlan();
    renderRanking();
  }
  function renderRanking(){
    const box=$("#online-ranking-board")||$("#online-ranking-list")||$("#online-ranking");
    if(!box) return;
    const list=state.ranking||[];
    const html=list.map((s,i)=>`<article class="online-rank-row">
      <span class="rank-pos">${i+1}</span><div><strong>${esc(s.nickname||s.full_name||"Aluno")}</strong><small>${esc(s.contest_target||"")} • ${n(s.xp_total)} XP</small></div>
    </article>`).join("")||`<div class="sx-empty">Ranking vazio. Os alunos aparecem após ganharem XP.</div>`;
    if(box.id==="online-ranking") box.innerHTML=`<div class="section-head"><div><p class="eyebrow"><i class="fa-solid fa-trophy"></i> Ranking sincronizado</p><h2>Ranking geral</h2><span class="section-subtitle">XP sincronizado pelo Supabase com base nas ações registradas.</span></div><button id="online-rank-sync" class="secondary-btn small" type="button">Sincronizar</button></div><div id="online-ranking-board" class="online-ranking-board">${html}</div>`;
    else box.innerHTML=html;
  }

  function bind(){
    document.addEventListener("click",e=>{
      const tab=e.target.closest("[data-mentor-tab]");
      if(tab){
        $$(".mentor-pro-tabs button").forEach(b=>b.classList.toggle("active",b===tab));
        $$(".mentor-tab-panel").forEach(p=>{const active=p.dataset.mentorPanel===tab.dataset.mentorTab;p.hidden=!active;p.classList.toggle("active",active)});
      }
      const act=e.target.closest("[data-mentor-activate]"); if(act) updateStudent(act.dataset.mentorActivate,"active");
      const pen=e.target.closest("[data-mentor-pending]"); if(pen) updateStudent(pen.dataset.mentorPending,"pending");
      const blk=e.target.closest("[data-mentor-block]"); if(blk) updateStudent(blk.dataset.mentorBlock,"blocked");
      const fill=e.target.closest("[data-mentor-fill-plan]"); if(fill){const sel=$("#mentor-plan-student"); if(sel)sel.value=fill.dataset.mentorFillPlan; window.location.hash="#mentor"; setTimeout(()=>document.querySelector('[data-mentor-tab="plans"]')?.click(),80);}
      if(e.target.closest("#mentor-refresh")||e.target.closest("#online-rank-sync")) syncRanking();
      if(e.target.closest("#mentor-plan-model-json")){$("#mentor-plan-raw").value=modelJSON();}
      if(e.target.closest("#mentor-plan-model-md")){$("#mentor-plan-raw").value=modelMD();}
      const b=e.target.closest("[data-mp-block]"); if(b) updateProgress(b.dataset.mpBlock,false);
      const rb=e.target.closest("[data-mp-register]"); if(rb) updateProgress(rb.dataset.mpRegister,true);
    },true);
    document.addEventListener("submit",e=>{
      if(e.target?.id==="mentor-plan-form") savePlan(e);
      if(e.target?.id==="mentor-goal-form") saveGoal(e);
    },true);
    window.addEventListener("setorx:auth-changed",()=>setTimeout(loadAll,100));
  }

  function boot(){
    ensureMentorSection();
    bind();
    loadAll();
    setTimeout(loadAll,700);
    setInterval(()=>{ if(canAccess()) loadAll(); },30000);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
