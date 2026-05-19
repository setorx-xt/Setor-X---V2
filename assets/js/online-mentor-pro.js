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
  const state={students:[],plans:[],progress:[],attempts:[],questions:[],goals:[],ranking:[],myPlan:null,myProgress:[],ready:false,lastError:""};

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
    if(err){sb=null;state.lastError=err;return err;}
    sb=window.supabase.createClient(normalizeSupabaseUrl(window.SETORX_SUPABASE_URL), String(window.SETORX_SUPABASE_ANON_KEY||"").trim());
    state.lastError="";return "";
  }
  function isMentor(){return profile?.role==="mentor"&&profile?.status==="active"}
  function canAccess(){return isMentor()||profile?.status==="active"}
  function toast(msg,type="info"){
    const box=$("#mentor-pro-message")||$("#online-auth-state");
    if(box){box.textContent=msg;box.className=`online-auth-state ${type}`;}
    if(window.toast) window.toast(msg); else console.log("[Setor X Mentor]",msg);
  }
  function userName(s){return s?.nickname||s?.full_name||s?.email||"Aluno"}
  function dispatchAuth(){
    window.SetorXMentorPro={isMentor,canAccess,profile:()=>profile,state:()=>state,reload:loadAll,client:()=>sb,syncRanking};
    window.dispatchEvent(new CustomEvent("setorx:auth-changed",{detail:{mentor:isMentor(),active:canAccess(),profile}}));
  }
  async function safeQuery(label,promise,fallback=[]){
    try{const res=await promise;if(res.error){console.error(label,res.error);state.lastError=`${label}: ${res.error.message||res.error.code||"erro"}`;return fallback;}return res.data??fallback;}catch(e){console.error(label,e);state.lastError=`${label}: ${e.message||"erro inesperado"}`;return fallback;}
  }
  async function loadAll(){
    const err=connect();
    if(err){state.ready=false;renderAll();dispatchAuth();return;}
    const s=await sb.auth.getSession();session=s.data.session;user=session?.user||null;
    if(!user){profile=null;state.ready=false;renderAll();dispatchAuth();return;}
    let pr=await sb.from("profiles").select("*").eq("id",user.id).single();
    if(pr.error && pr.error.code==="PGRST116"){
      const payload={id:user.id,email:user.email,full_name:user.user_metadata?.full_name||user.email?.split("@")[0]||"Aluno",nickname:user.email?.split("@")[0]||"Aluno",role:"student",status:"pending",active:false,xp_total:0};
      await sb.from("profiles").insert(payload); profile=payload;
    }else if(pr.error){state.lastError=pr.error.message;}
    else profile=pr.data;
    state.ready=true;
    state.lastError="";
    state.ranking=await safeQuery("ranking",sb.from("profiles").select("id,email,full_name,nickname,role,status,active,contest_target,xp_total,created_at").eq("status","active").order("xp_total",{ascending:false}).limit(100));
    state.questions=await safeQuery("questions",sb.from("collective_questions").select("*").order("created_at",{ascending:false}));
    if(isMentor()){
      const [students,plans,progress,attempts,goals]=await Promise.all([
        safeQuery("students",sb.from("profiles").select("*").order("created_at",{ascending:false})),
        safeQuery("plans",sb.from("individual_plans").select("*").order("created_at",{ascending:false})),
        safeQuery("progress",sb.from("plan_progress").select("*")),
        safeQuery("attempts",sb.from("collective_attempts").select("*")),
        safeQuery("goals",sb.from("student_goals").select("*").order("due_date",{ascending:true}))
      ]);
      Object.assign(state,{students,plans,progress,attempts,goals});
    }else if(profile?.status==="active"){
      const [plans,goals,attempts]=await Promise.all([
        safeQuery("my plans",sb.from("individual_plans").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(1)),
        safeQuery("my goals",sb.from("student_goals").select("*").eq("user_id",user.id).order("due_date",{ascending:true})),
        safeQuery("my attempts",sb.from("collective_attempts").select("*").eq("user_id",user.id))
      ]);
      state.myPlan=plans?.[0]||null;state.goals=goals||[];state.attempts=attempts||[];
      state.myProgress=state.myPlan?await safeQuery("my progress",sb.from("plan_progress").select("*").eq("plan_id",state.myPlan.id).eq("user_id",user.id)):[];
    }
    renderAll();dispatchAuth();
  }
  async function syncRanking(){
    if(!sb) return;
    try{
      const r=await sb.rpc("setorx_recompute_xp_totals");
      if(r.error){
        state.lastError='Ranking RPC: '+(r.error.message||r.error.code||'erro');
        toast('Ranking não sincronizou: '+state.lastError,'error');
      }else{
        state.lastError='';
        toast('Ranking sincronizado.','success');
      }
    }catch(e){
      state.lastError='Ranking RPC: '+(e.message||'indisponível');
      toast('Ranking não sincronizou. Rode supabase/atualizacao-ranking-sync-v6.sql.','error');
    }
    await loadAll();
    await refreshRankingOnly();
  }
  
  async function refreshRankingOnly(){
    if(!sb) return;
    try{
      const {data,error}=await sb.from('profiles')
        .select('id,email,full_name,nickname,role,status,active,contest_target,xp_total,created_at')
        .eq('status','active')
        .order('xp_total',{ascending:false})
        .order('created_at',{ascending:true})
        .limit(100);
      if(error){
        console.error('ranking refresh', error);
        state.lastError = 'ranking: ' + (error.message||error.code||'erro');
        return;
      }
      state.ranking=data||[];
      renderRanking?.();
      window.dispatchEvent(new CustomEvent('setorx:ranking-updated',{detail:{ranking:state.ranking}}));
    }catch(e){
      console.error('ranking refresh', e);
      state.lastError = 'ranking: ' + (e.message||'erro inesperado');
    }
  }
  async function awardXP(amount,reason){
    if(!sb||!user||!amount) return false;
    let total=null;
    try{
      const rpc=await sb.rpc('setorx_add_xp',{p_amount:amount,p_reason:reason});
      if(!rpc.error){
        total=Number(rpc.data||0);
        if(profile) profile.xp_total=total;
        await refreshRankingOnly();
        return true;
      }
      console.warn('setorx_add_xp RPC falhou, usando fallback:', rpc.error);
      state.lastError='XP RPC: '+(rpc.error.message||rpc.error.code||'erro');
    }catch(e){
      console.warn('setorx_add_xp indisponível, usando fallback:', e);
      state.lastError='XP RPC: '+(e.message||'indisponível');
    }
    try{
      const ins=await sb.from('xp_events').insert({user_id:user.id,amount,reason});
      if(ins.error){
        console.error('xp_events insert', ins.error);
        state.lastError='XP insert: '+(ins.error.message||ins.error.code||'erro');
        return false;
      }
      const current=Number(profile?.xp_total||0);
      total=current+Number(amount||0);
      if(profile) profile.xp_total=total;
      const upd=await sb.from('profiles').update({xp_total:total}).eq('id',user.id);
      if(upd.error){
        console.warn('profiles xp_total update falhou; trigger pode sincronizar depois:', upd.error);
        state.lastError='XP perfil: '+(upd.error.message||upd.error.code||'erro');
      }
      await refreshRankingOnly();
      return true;
    }catch(e){
      console.error('XP fallback error',e);
      state.lastError='XP: '+(e.message||'erro inesperado');
      return false;
    }
  }

  async function addXP(amount,reason){
    const ok=await awardXP(amount,reason);
    if(!ok) toast?.('XP não foi sincronizado. Rode supabase/atualizacao-ranking-sync-v6.sql e tente novamente.','error');
    return ok;
  }

  function ensureMentorSection(){
    const content=$(".content")||$("main"); if(!content) return;
    if(!$("#online-mentor")){
      content.insertAdjacentHTML("beforeend", `
        <section id="online-mentor" class="glass-card section-block mentor-pro-section">
          <div class="section-head mentor-pro-head">
            <div><p class="eyebrow"><i class="fa-solid fa-user-tie"></i> Área do mentor</p><h2>Comando da Mentoria</h2><span class="section-subtitle">Aprovação de alunos, estatísticas, planejamentos individuais, QX coletivo e metas.</span></div>
            <button id="mentor-refresh" class="secondary-btn small" type="button"><i class="fa-solid fa-rotate"></i> Sincronizar</button>
          </div>
          <p id="mentor-pro-message" class="online-auth-state info">Carregando área do mentor...</p>
          <div id="mentor-kpis" class="mentor-kpis"></div>
          <div class="mentor-pro-tabs">
            <button class="active" type="button" data-mentor-tab="overview"><i class="fa-solid fa-chart-simple"></i> Visão geral</button>
            <button type="button" data-mentor-tab="students"><i class="fa-solid fa-user-check"></i> Alunos</button>
            <button type="button" data-mentor-tab="plans"><i class="fa-solid fa-file-import"></i> Planejamentos</button>
            <button type="button" data-mentor-tab="qx"><i class="fa-solid fa-scale-balanced"></i> QX coletivo</button>
            <button type="button" data-mentor-tab="goals"><i class="fa-solid fa-bullseye"></i> Metas</button>
          </div>
          <div class="mentor-tab-panel active" data-mentor-panel="overview"><div id="mentor-overview-list"></div></div>
          <div class="mentor-tab-panel" data-mentor-panel="students" hidden><div id="mentor-student-list"></div></div>
          <div class="mentor-tab-panel" data-mentor-panel="plans" hidden>
            <div class="mentor-split">
              <form id="mentor-plan-form" class="mentor-pro-form">
                <div class="online-grid"><label>Aluno<select id="mentor-plan-student"></select></label><label>Concurso<input id="mentor-plan-contest" placeholder="Ex: PRF" /></label></div>
                <div class="online-grid"><label>Semana<input id="mentor-plan-week" placeholder="Ex: 20/05 a 26/05" /></label><label>Mensagem do mentor<input id="mentor-plan-message" placeholder="Missão da semana..." /></label></div>
                <div class="mentor-plan-actions"><button id="mentor-plan-model-json" class="ghost-btn" type="button">Modelo JSON</button><button id="mentor-plan-model-md" class="ghost-btn" type="button">Modelo Markdown</button></div>
                <textarea id="mentor-plan-raw" rows="14" placeholder="Cole o planejamento JSON ou Markdown exportado pelo seu programa..."></textarea>
                <button class="primary-btn wide" type="submit"><i class="fa-solid fa-cloud-arrow-up"></i> Enviar planejamento individual</button>
              </form>
              <div class="mentor-pro-form"><h3>Planejamentos enviados</h3><div id="mentor-plan-list"></div></div>
            </div>
          </div>
          <div class="mentor-tab-panel" data-mentor-panel="qx" hidden>
            <div class="mentor-split">
              <form id="mentor-qx-form" class="mentor-pro-form">
                <div class="online-grid"><label>Disciplina<input id="mentor-qx-discipline" placeholder="Direito Constitucional" /></label><label>Assunto<input id="mentor-qx-subject" placeholder="Art. 5º" /></label></div>
                <div class="online-grid"><label>Tipo<select id="mentor-qx-type"><option value="ce">Certo/Errado</option><option value="mc">Múltipla escolha</option></select></label><label>Gabarito<input id="mentor-qx-answer" placeholder="Certo, Errado, A, B..." /></label></div>
                <label>Enunciado<textarea id="mentor-qx-statement" rows="5"></textarea></label>
                <label>Alternativas<textarea id="mentor-qx-options" rows="4" placeholder="A) ...\nB) ..."></textarea></label>
                <label>Comentário do professor<textarea id="mentor-qx-comment" rows="4"></textarea></label>
                <button class="primary-btn wide" type="submit"><i class="fa-solid fa-paper-plane"></i> Publicar questão coletiva</button>
              </form>
              <div class="mentor-pro-form"><h3>Questões publicadas</h3><div id="mentor-qx-list"></div></div>
            </div>
          </div>
          <div class="mentor-tab-panel" data-mentor-panel="goals" hidden>
            <form id="mentor-goal-form" class="mentor-pro-form">
              <div class="online-grid"><label>Aluno<select id="mentor-goal-student"></select></label><label>Tipo<select id="mentor-goal-type"><option value="questions">Questões</option><option value="hours">Horas líquidas</option><option value="simulation">Simulado</option><option value="law">Lei seca</option></select></label></div>
              <div class="online-grid"><label>Meta<input id="mentor-goal-target" type="number" min="1" placeholder="Ex: 1000" /></label><label>Até a data<input id="mentor-goal-date" type="date" /></label></div>
              <label>Descrição<input id="mentor-goal-title" placeholder="Ex: 1000 questões de CTB até domingo" /></label>
              <button class="primary-btn wide" type="submit"><i class="fa-solid fa-bullseye"></i> Definir meta para o aluno</button>
            </form><div id="mentor-goal-list" class="mentor-goal-list"></div>
          </div>
        </section>`);
    }
  }

  function latestPlan(userId){return state.plans.find(p=>p.user_id===userId)}
  function goalsFor(userId){return state.goals.filter(g=>g.user_id===userId)}
  function questionsDone(userId){return state.attempts.filter(a=>a.user_id===userId).length}
  function planBlocks(plan){return (plan?.plan_json?.days||[]).flatMap(d=>d.blocks||[])}
  function planProgressPct(plan,userId){const blocks=planBlocks(plan);if(!blocks.length)return 0;const done=state.progress.filter(p=>p.plan_id===plan.id&&p.user_id===userId&&p.completed).length;return Math.round(done/blocks.length*100)}
  function renderStudentCards(){
    return state.students.filter(s=>s.role!=="mentor").map(s=>{const plan=latestPlan(s.id),pct=planProgressPct(plan,s.id),q=questionsDone(s.id),gs=goalsFor(s.id);return `<article class="mentor-student-row ${esc(s.status)}"><div class="mentor-student-main"><strong>${esc(userName(s))}</strong><span>${esc(s.email)} • ${esc(s.contest_target||"sem concurso")} • ${esc(s.status)}</span><div class="mentor-progress"><div style="width:${pct}%"></div></div><small>Plano: ${plan?esc(plan.week_label||plan.contest||"enviado"):"sem plano"} • Execução: ${pct}% • QX: ${q} • Metas: ${gs.length}</small></div><div class="mentor-actions"><button class="secondary-btn small" data-mentor-activate="${s.id}">Ativar</button><button class="ghost-btn small" data-mentor-pending="${s.id}">Pendente</button><button class="online-danger ghost-btn small" data-mentor-block="${s.id}">Bloquear</button><button class="ghost-btn small" data-mentor-fill-plan="${s.id}">Planejar</button></div></article>`}).join("")||`<div class="sx-empty">Nenhum aluno cadastrado.</div>`;
  }
  function renderMentor(){
    ensureMentorSection();
    const sec=$("#online-mentor");
    const msg=$("#mentor-pro-message");
    if(!sec) return;
    sec.hidden=false;

    if(state.lastError){
      if(msg){msg.textContent="Diagnóstico: "+state.lastError; msg.className="online-auth-state error";}
    }else if(!sb){
      if(msg){msg.textContent="Supabase não conectado. Confira assets/js/online-config.js."; msg.className="online-auth-state error";}
    }else if(!user){
      if(msg){msg.textContent="Faça login para carregar a área do mentor."; msg.className="online-auth-state info";}
    }else if(!profile){
      if(msg){msg.textContent="Perfil ainda não carregado. Clique em Sincronizar."; msg.className="online-auth-state info";}
    }else if(!isMentor()){
      if(msg){msg.textContent=`Conta atual: ${profile.email||"usuário"} • role=${profile.role||"--"} • status=${profile.status||"--"}. Para usar a área do mentor, rode supabase/promover-mentor.sql e faça login novamente.`; msg.className="online-auth-state error";}
      return;
    }else{
      if(msg){msg.textContent="Área do mentor carregada. Você pode aprovar alunos, importar planejamentos e acompanhar estatísticas."; msg.className="online-auth-state success";}
    }

    const active=state.students.filter(s=>s.status==="active").length;
    const pending=state.students.filter(s=>s.status==="pending").length;
    const blocked=state.students.filter(s=>s.status==="blocked").length;
    const top=state.ranking[0];
    $("#mentor-kpis").innerHTML=`<article><span>Ativos</span><strong>${active}</strong><small>alunos liberados</small></article><article><span>Pendentes</span><strong>${pending}</strong><small>aguardando</small></article><article><span>Bloqueados</span><strong>${blocked}</strong><small>controle de acesso</small></article><article><span>Planos</span><strong>${state.plans.length}</strong><small>enviados</small></article><article><span>Líder</span><strong>${esc(userName(top))}</strong><small>${n(top?.xp_total)} XP</small></article>`;

    const cards=renderStudentCards();
    $("#mentor-overview-list").innerHTML=cards;
    $("#mentor-student-list").innerHTML=cards;

    const planSel=$("#mentor-plan-student"), goalSel=$("#mentor-goal-student");
    const currentPlan = state.selectedPlanStudent || planSel?.value || "";
    const currentGoal = state.selectedGoalStudent || goalSel?.value || "";
    const studentsOpts = state.students.filter(s=>s.role!=="mentor");
    const opts=studentsOpts.map(s=>`<option value="${s.id}">${esc(userName(s))} — ${esc(s.email)}</option>`).join("");
    if(planSel){
      planSel.innerHTML=opts||`<option value="">Nenhum aluno encontrado</option>`;
      if(currentPlan && [...planSel.options].some(o=>o.value===currentPlan)) planSel.value=currentPlan;
      state.selectedPlanStudent=planSel.value||"";
    }
    if(goalSel){
      goalSel.innerHTML=opts||`<option value="">Nenhum aluno encontrado</option>`;
      if(currentGoal && [...goalSel.options].some(o=>o.value===currentGoal)) goalSel.value=currentGoal;
      state.selectedGoalStudent=goalSel.value||"";
    }
    renderPlanList(); renderQXList(); renderGoalList();
  }
  function renderPlanList(){const box=$("#mentor-plan-list");if(!box)return;box.innerHTML=state.plans.map(p=>{const s=state.students.find(x=>x.id===p.user_id),pct=planProgressPct(p,p.user_id),blocks=planBlocks(p).length;return `<article class="mentor-item-row"><div><strong>${esc(p.week_label||p.contest||"Planejamento")}</strong><span>${esc(userName(s))} • ${esc(p.contest||"")} • ${blocks} bloco(s) • ${pct}% concluído</span></div><div class="mentor-actions"><button class="ghost-btn small" data-plan-copy="${p.id}">Copiar JSON</button><button class="online-danger ghost-btn small" data-plan-delete="${p.id}">Excluir</button></div></article>`}).join("")||`<div class="sx-empty">Nenhum planejamento enviado.</div>`}
  function renderQXList(){const box=$("#mentor-qx-list");if(!box)return;box.innerHTML=state.questions.map(q=>`<article class="mentor-item-row"><div><strong>${esc(q.discipline)}</strong><span>${esc(q.subject||"")} • ${esc(q.type)} • gabarito: ${esc(q.answer)}</span></div><div class="mentor-actions"><button class="online-danger ghost-btn small" data-qx-delete="${q.id}">Excluir</button></div></article>`).join("")||`<div class="sx-empty">Nenhuma questão coletiva publicada.</div>`}
  function renderGoalList(){const box=$("#mentor-goal-list");if(!box)return;box.innerHTML=state.goals.map(g=>`<article class="mentor-goal-item"><strong>${esc(g.title||g.goal_type)}</strong><span>${esc(userName(state.students.find(s=>s.id===g.user_id)))} • ${g.target_value||0} até ${fmtDate(g.due_date)} • ${esc(g.status||"active")}</span></article>`).join("")||`<div class="sx-empty">Nenhuma meta definida.</div>`}

  function findTodayDay(plan){const days=plan?.days||[];if(!days.length)return null;const today=todayKey(),dow=ptWeek[new Date().getDay()];return days.find(d=>String(d.date||"").slice(0,10)===today)||days.find(d=>norm(d.day).includes(dow))||days[0]}
  function renderStudentPlan(){const sec=$("#online-planejamento");if(!sec)return;const title=sec.querySelector(".section-head h2"),sub=sec.querySelector(".section-subtitle");if(title)title.textContent="Operação semanal — Planejamento Semanal";if(sub)sub.textContent="O aluno visualiza apenas a missão do dia.";const box=$("#online-my-plan");if(!box)return;if(isMentor()){box.innerHTML=`<div class="online-comment"><strong>Mentor:</strong> use a aba <b>Área do Mentor</b> para importar planejamentos e acompanhar estatísticas.</div>`;return}if(!profile||profile.status!=="active"){box.innerHTML=`<div class="online-comment"><strong>Acesso não liberado.</strong><br>Aguarde a aprovação do mentor.</div>`;return}const plan=state.myPlan?.plan_json;if(!plan){box.innerHTML=`<div class="online-comment"><strong>Nenhum planejamento carregado.</strong><br>Assim que o mentor importar sua semana, a missão do dia aparecerá aqui.</div>`;return}const day=findTodayDay(plan);const blocks=day?.blocks||[];box.innerHTML=`<div class="student-plan-hero"><p class="eyebrow"><i class="fa-solid fa-crosshairs"></i> Missão de hoje</p><h3>${esc(day?.day||"Hoje")} ${day?.date?"• "+esc(fmtDate(day.date)):""}</h3><span>${esc(day?.disciplines||day?.review||plan.mensagemMentor||"Operação do dia")}</span></div>${day?.review?`<div class="online-comment"><strong>Revisão:</strong> ${esc(day.review)}</div>`:""}<div class="student-today-blocks">${blocks.map(block=>{const pg=state.myProgress.find(p=>p.block_id===block.id);return `<article class="student-today-block ${pg?.completed?"done":""}"><button class="online-check" data-mp-block="${esc(block.id)}">${pg?.completed?"✓":"○"}</button><div><strong>Bloco ${esc(block.number)} — ${esc(block.discipline||"Disciplina")}</strong><p>${esc(block.subject||"")}</p><div class="online-mini-tools"><span class="online-chip">Meta: ${n(block.meta)} questões</span>${block.materialLink?`<a class="online-chip link" target="_blank" href="${esc(block.materialLink)}">Aula/material</a>`:""}${block.questionLink?`<a class="online-chip link" target="_blank" href="${esc(block.questionLink)}">Questões</a>`:""}${pg?`<span class="online-chip">Feitas: ${n(pg.done_questions)}</span>`:""}</div></div><button class="secondary-btn small" data-mp-register="${esc(block.id)}">Registrar</button></article>`}).join("")||`<div class="sx-empty">Nenhum bloco para hoje.</div>`}</div>`}

  function parsePlan(raw){const t=String(raw||"").trim();if(!t)throw new Error("Planejamento vazio.");if(t.startsWith("{")||t.startsWith("[")){const obj=JSON.parse(t);return Array.isArray(obj)?{days:obj}:obj}const matches=[...t.matchAll(/^##\s*(?:✅\s*)?(.+?)(?:\s*[–-]\s*(.+))?$/gmi)];const plan={title:"Planejamento importado",days:[]};matches.forEach((m,i)=>{const start=m.index,end=matches[i+1]?.index??t.length,chunk=t.slice(start,end),blocks=[];const bms=[...chunk.matchAll(/^###\s*Bloco\s*(\d+)\s*[–-]\s*(.+)$/gmi)];bms.forEach((bm,j)=>{const bs=bm.index,be=bms[j+1]?.index??chunk.length,bc=chunk.slice(bs,be);const mat=(bc.match(/\*\*Material de apoio:\*\*\s*(.*)/i)?.[1]||"").trim(),q=(bc.match(/\*\*Questões:\*\*\s*(.*)/i)?.[1]||"").trim();const link=s=>{const md=s.match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/i);if(md)return md[1];const u=s.match(/https?:\/\/[^\s)]+/i);return u?u[0]:""};blocks.push({id:uid(),number:parseInt(bm[1]||j+1,10),discipline:bm[2].replace(/\*/g,"").trim(),subject:(bc.match(/\*\*Assunto\s*:?\*\*\s*(.*)/i)?.[1]||"").trim(),material:mat,materialLink:link(mat),questions:q,questionLink:link(q),meta:parseInt((bc.match(/\*\*Meta:\*\*\s*(.*)/i)?.[1]||"0").replace(/\D/g,""),10)||0,type:"study"})});plan.days.push({id:uid(),day:(m[1]||"Dia").trim(),date:(m[2]||"").trim(),review:(chunk.match(/\*\*Revisão:\*\*\s*(.+)/i)?.[1]||"").trim(),disciplines:(chunk.match(/\*\*Disciplina do dia:\*\*\s*(.+)/i)?.[1]||"").trim(),metaDay:parseInt((chunk.match(/\*\*Meta do dia:\*\*\s*(.+)/i)?.[1]||"0").replace(/\D/g,""),10)||0,blocks})});return plan}
  function modelJSON(){return JSON.stringify({aluno:"Saldanha",concurso:"PRF",semana:"20/05 a 26/05",mentor:"Matheus G.",mensagemMentor:"Missão da semana carregada. Execute o dia de hoje e registre as questões.",days:[{day:"TERÇA-FEIRA",date:todayKey(),review:"Revisar erros do último bloco.",disciplines:"CTB + Constitucional",metaDay:80,blocks:[{number:1,discipline:"CTB",subject:"Normas gerais de circulação",material:"Aula/PDF",materialLink:"",questions:"QConcursos",questionLink:"",meta:40,type:"study"}]}]},null,2)}
  function modelMD(){return `## ✅ TERÇA-FEIRA – ${todayKey().split("-").reverse().join("/")}\n\n**Revisão:** Revisar erros do último bloco.\n**Disciplina do dia:** CTB + Constitucional\n**Meta do dia:** 80 questões\n\n### Bloco 1 – CTB\n\n**Assunto:** Normas gerais de circulação\n**Material de apoio:** \n**Questões:** \n**Meta:** 40 questões`}

  async function savePlan(e){
    e.preventDefault();
    if(!isMentor()) return toast("Apenas mentor.","error");
    const select=$("#mentor-plan-student");
    const sid=select?.value || state.selectedPlanStudent || "";
    state.selectedPlanStudent=sid;
    if(!sid) return toast("Selecione um aluno.","error");
    let plan;
    try{ if(!$("#mentor-plan-raw").value.trim()) return toast("Cole o planejamento JSON ou Markdown antes de enviar.","error"); plan=parsePlan($("#mentor-plan-raw").value); }catch(err){ return toast(err.message,"error"); }
    const student=state.students.find(s=>s.id===sid);
    const contest=$("#mentor-plan-contest").value.trim()||plan.concurso||plan.contest||student?.contest_target||"";
    const week=$("#mentor-plan-week").value.trim()||plan.semana||plan.week||"";
    const msg=$("#mentor-plan-message").value.trim()||plan.mensagemMentor||plan.mentorMessage||"";
    plan.concurso=contest; plan.semana=week; plan.mensagemMentor=msg; plan.aluno=student?.full_name||student?.nickname||student?.email||"";
    const {error}=await sb.from("individual_plans").insert({user_id:sid,mentor_id:user.id,contest,week_label:week,mentor_message:msg,plan_json:plan});
    if(error) return toast("Erro ao enviar plano: "+error.message,"error");
    toast(`Planejamento enviado para ${student?userName(student):"aluno selecionado"}.`,"success");
    $("#mentor-plan-raw").value="";
    await loadAll();
    const restored=$("#mentor-plan-student");
    if(restored) restored.value=sid;
  }
  async function deletePlan(id){if(!confirm("Excluir este planejamento?"))return;const {error}=await sb.from("individual_plans").delete().eq("id",id);if(error)return toast("Erro ao excluir: "+error.message,"error");toast("Planejamento excluído.","success");await loadAll()}
  async function saveGoal(e){e.preventDefault();if(!isMentor())return;const payload={user_id:$("#mentor-goal-student").value,mentor_id:user.id,goal_type:$("#mentor-goal-type").value,title:$("#mentor-goal-title").value.trim(),target_value:parseInt($("#mentor-goal-target").value||"0",10),due_date:$("#mentor-goal-date").value,status:"active"};if(!payload.user_id||!payload.target_value||!payload.due_date)return toast("Preencha aluno, meta e data.","error");const {error}=await sb.from("student_goals").insert(payload);if(error)return toast("Erro ao salvar meta: "+error.message,"error");toast("Meta definida.","success");e.target.reset();await loadAll()}
  async function saveQX(e){e.preventDefault();if(!isMentor())return toast("Apenas mentor.","error");const payload={owner_id:user.id,is_public:true,discipline:$("#mentor-qx-discipline").value.trim(),subject:$("#mentor-qx-subject").value.trim(),type:$("#mentor-qx-type").value,statement:$("#mentor-qx-statement").value.trim(),options:$("#mentor-qx-options").value.trim(),answer:$("#mentor-qx-answer").value.trim(),comment:$("#mentor-qx-comment").value.trim()};if(!payload.discipline||!payload.statement||!payload.answer)return toast("Preencha disciplina, enunciado e gabarito.","error");const {error}=await sb.from("collective_questions").insert(payload);if(error)return toast("Erro ao publicar questão: "+error.message+". Rode supabase/atualizacao-final-mentor-planejamentos-qx.sql se necessário.","error");toast("Questão coletiva publicada.","success");e.target.reset();await loadAll()}
  async function deleteQX(id){if(!confirm("Excluir esta questão coletiva?"))return;const {error}=await sb.from("collective_questions").delete().eq("id",id);if(error)return toast("Erro ao excluir questão: "+error.message,"error");toast("Questão excluída.","success");await loadAll()}
  async function updateStudent(id,status){const {error}=await sb.from("profiles").update({status,active:status==="active"}).eq("id",id);if(error)return toast(error.message,"error");toast("Aluno atualizado.","success");await loadAll()}
  async function updateProgress(blockId,register=false){if(!state.myPlan||!profile||profile.status!=="active")return;const current=state.myProgress.find(p=>p.block_id===blockId);let done=n(current?.done_questions),correct=n(current?.correct),wrong=n(current?.wrong);if(register){done=parseInt(prompt("Questões feitas:",done)||done||0,10);correct=parseInt(prompt("Acertos:",correct)||correct||0,10);wrong=parseInt(prompt("Erros:",wrong)||wrong||0,10)}const payload={user_id:user.id,plan_id:state.myPlan.id,block_id:blockId,completed:register?true:!current?.completed,done_questions:done,correct,wrong,updated_at:new Date().toISOString()};const {error}=await sb.from("plan_progress").upsert(payload,{onConflict:"user_id,plan_id,block_id"});if(error)return toast(error.message,"error");if(payload.completed&&!current?.completed)await addXP(20,"Bloco do planejamento concluído");await loadAll()}
  function renderAll(){renderMentor();renderStudentPlan();renderRanking()}
  function renderRanking(){
    const box=$("#online-ranking-board")||$("#online-ranking-list")||$("#online-ranking");
    if(!box) return;
    const list=(state.ranking||[]).slice().sort((a,b)=>n(b.xp_total)-n(a.xp_total));
    const me=list.find(s=>s.id===user?.id);
    const html=list.map((s,i)=>`<article class="online-rank-row ${s.id===user?.id?"me":""}"><span class="rank-pos">${i+1}</span><div><strong>${esc(userName(s))}</strong><small>${esc(s.contest_target||"")} • ${n(s.xp_total)} XP ${s.id===user?.id?"• você":""}</small></div></article>`).join("")||`<div class="sx-empty">Ranking vazio. Ganhe XP concluindo blocos ou respondendo questões.</div>`;
    const header=`<div class="section-head"><div><p class="eyebrow"><i class="fa-solid fa-trophy"></i> Ranking sincronizado</p><h2>Ranking geral</h2><span class="section-subtitle">XP total do Supabase. ${me?`Seu XP: ${n(me.xp_total)}.`:""}</span>${state.lastError?`<small class="rank-sync-error">Diagnóstico: ${esc(state.lastError)}</small>`:""}</div><button id="online-rank-sync" class="secondary-btn small" type="button">Sincronizar ranking</button></div>`;
    if(box.id==="online-ranking") box.innerHTML=header+`<div id="online-ranking-board" class="online-ranking-board">${html}</div>`;
    else box.innerHTML=html;
  }
  function bind(){document.addEventListener("click",e=>{const tab=e.target.closest("[data-mentor-tab]");if(tab){$$('.mentor-pro-tabs button').forEach(b=>b.classList.toggle('active',b===tab));$$('.mentor-tab-panel').forEach(p=>{const active=p.dataset.mentorPanel===tab.dataset.mentorTab;p.hidden=!active;p.classList.toggle('active',active)});}const act=e.target.closest("[data-mentor-activate]");if(act)updateStudent(act.dataset.mentorActivate,"active");const pen=e.target.closest("[data-mentor-pending]");if(pen)updateStudent(pen.dataset.mentorPending,"pending");const blk=e.target.closest("[data-mentor-block]");if(blk)updateStudent(blk.dataset.mentorBlock,"blocked");const fill=e.target.closest("[data-mentor-fill-plan]");if(fill){state.selectedPlanStudent=fill.dataset.mentorFillPlan;const sel=$("#mentor-plan-student");if(sel)sel.value=state.selectedPlanStudent;document.querySelector('[data-mentor-tab="plans"]')?.click();setTimeout(()=>{const restored=$("#mentor-plan-student");if(restored)restored.value=state.selectedPlanStudent;},80)}const cp=e.target.closest("[data-plan-copy]");if(cp){const p=state.plans.find(x=>x.id===cp.dataset.planCopy);navigator.clipboard?.writeText(JSON.stringify(p?.plan_json||{},null,2));toast("JSON do planejamento copiado.","success")}const dp=e.target.closest("[data-plan-delete]");if(dp)deletePlan(dp.dataset.planDelete);const dq=e.target.closest("[data-qx-delete]");if(dq)deleteQX(dq.dataset.qxDelete);if(e.target.closest("#mentor-refresh")||e.target.closest("#online-rank-sync"))syncRanking();if(e.target.closest("#mentor-plan-model-json")){$("#mentor-plan-raw").value=modelJSON()}if(e.target.closest("#mentor-plan-model-md")){$("#mentor-plan-raw").value=modelMD()}const b=e.target.closest("[data-mp-block]");if(b)updateProgress(b.dataset.mpBlock,false);const rb=e.target.closest("[data-mp-register]");if(rb)updateProgress(rb.dataset.mpRegister,true)},true);
    setTimeout(()=>{
      $("#mentor-plan-student")?.addEventListener("change",e=>{state.selectedPlanStudent=e.target.value;});
      $("#mentor-goal-student")?.addEventListener("change",e=>{state.selectedGoalStudent=e.target.value;});
    },0);
    
    document.addEventListener("change",e=>{if(e.target?.id==="mentor-plan-student")state.selectedPlanStudent=e.target.value;if(e.target?.id==="mentor-goal-student")state.selectedGoalStudent=e.target.value;},true);/*data-mentor-select-delegate*/
    document.addEventListener("submit",e=>{if(e.target?.id==="mentor-plan-form")savePlan(e);if(e.target?.id==="mentor-goal-form")saveGoal(e);if(e.target?.id==="mentor-qx-form")saveQX(e)},true);window.addEventListener("setorx:auth-changed",()=>setTimeout(loadAll,180))}
  function boot(){ensureMentorSection();bind();loadAll();setTimeout(loadAll,800);setInterval(()=>{if(canAccess())loadAll()},45000)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
