
(function(){
  "use strict";

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=(v="")=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
  const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const ptWeek=["domingo","segunda","terca","quarta","quinta","sexta","sabado"];

  let stableTimer=null;
  let lastPlanSignature="";
  let lastRankingSignature="";
  let isRenderingPlan=false;
  let isRankingLoading=false;

  function log(...args){ console.log("[Setor X V10]", ...args); }

  function getSupabase(){
    if(window.SetorXMentorPro?.client?.()) return window.SetorXMentorPro.client();
    if(window.supabase && window.SETORX_SUPABASE_URL && window.SETORX_SUPABASE_ANON_KEY){
      let url=String(window.SETORX_SUPABASE_URL||"").trim().replace(/\/(auth|rest|storage)\/v1\/?.*$/i,"").replace(/\/+$/,"");
      const dash=url.match(/supabase\.com\/dashboard\/project\/([^\/?#]+)/i);
      if(dash && dash[1]) url=`https://${dash[1]}.supabase.co`;
      if(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(url)){
        return window.supabase.createClient(url, String(window.SETORX_SUPABASE_ANON_KEY||"").trim());
      }
    }
    return null;
  }

  async function getUserAndProfile(sb){
    const s=await sb.auth.getSession();
    const user=s.data.session?.user||null;
    if(!user) return {user:null,profile:null};
    const pr=await sb.from("profiles").select("*").eq("id",user.id).single();
    return {user,profile:pr.data||null,error:pr.error};
  }

  function readState(){
    return window.SetorXMentorPro?.state?.() || {};
  }

  function isMentor(){
    try{return !!window.SetorXMentorPro?.isMentor?.();}catch{return false;}
  }

  function canAccess(){
    try{return !!window.SetorXMentorPro?.canAccess?.();}catch{return false;}
  }

  function statusBox(msg,type="info"){
    const box=$("#mentor-pro-message")||$("#online-auth-state");
    if(box){
      box.textContent=msg;
      box.className=`online-auth-state ${type}`;
    }
  }

  function blockFlash(){
    // Alguns scripts antigos ficam redesenhando a área do aluno. Esta classe suaviza e evita sensação de piscada.
    const sec=$("#online-planejamento");
    if(sec) sec.classList.add("sx-v10-stable-plan");
  }

  function planDays(planJson){
    const p=planJson||{};
    if(Array.isArray(p.days)) return p.days;
    if(Array.isArray(p.dias)) return p.dias;
    if(Array.isArray(p)) return p;
    return [];
  }

  function getTodayPlanDay(planJson){
    const days=planDays(planJson);
    if(!days.length) return null;
    const today=todayKey();
    const dow=ptWeek[new Date().getDay()];
    return days.find(d=>String(d.date||d.data||"").slice(0,10)===today)
      || days.find(d=>norm(d.day||d.dia||"").includes(dow))
      || days[0];
  }

  function blockId(block,index){
    return String(block.id||block.block_id||block.codigo||`b-${index+1}`);
  }

  async function fetchLatestPlan(sb,userId){
    const {data,error}=await sb.from("individual_plans")
      .select("*")
      .eq("user_id",userId)
      .order("created_at",{ascending:false})
      .limit(1);
    if(error) throw error;
    return data?.[0]||null;
  }

  async function fetchProgress(sb,userId,planId){
    if(!planId) return [];
    const {data,error}=await sb.from("plan_progress")
      .select("*")
      .eq("user_id",userId)
      .eq("plan_id",planId);
    if(error) return [];
    return data||[];
  }

  async function stableRenderStudentPlan(force=false){
    if(isRenderingPlan) return;
    const sec=$("#online-planejamento");
    const box=$("#online-my-plan");
    if(!sec || !box) return;
    if(isMentor()) return; // mentor usa painel próprio

    const sb=getSupabase();
    if(!sb){
      box.innerHTML=`<div class="online-comment"><strong>Supabase não conectado.</strong><br>Confira online-config.js.</div>`;
      return;
    }

    isRenderingPlan=true;
    try{
      const {user,profile,error}=await getUserAndProfile(sb);
      if(!user){
        box.innerHTML=`<div class="online-comment"><strong>Entre na plataforma.</strong><br>O planejamento aparece após login e liberação.</div>`;
        return;
      }
      if(error){
        box.innerHTML=`<div class="online-comment"><strong>Erro ao carregar perfil.</strong><br>${esc(error.message||error.code||"erro")}</div>`;
        return;
      }
      if(profile?.status!=="active" && profile?.role!=="mentor"){
        box.innerHTML=`<div class="online-comment"><strong>Acesso pendente.</strong><br>Aguarde o mentor liberar sua conta.</div>`;
        return;
      }

      const plan=await fetchLatestPlan(sb,user.id);
      if(!plan){
        const sig=`no-plan-${user.id}`;
        if(force || sig!==lastPlanSignature){
          box.innerHTML=`<div class="online-comment"><strong>Planejamento vazio.</strong><br>Seu mentor ainda não importou sua operação semanal.</div>`;
          lastPlanSignature=sig;
        }
        return;
      }

      const progress=await fetchProgress(sb,user.id,plan.id);
      const planJson=plan.plan_json || {};
      const day=getTodayPlanDay(planJson);
      const blocks=Array.isArray(day?.blocks)?day.blocks:[];
      const sig=JSON.stringify({
        id:plan.id,
        day:day?.day||day?.dia||"",
        blocks:blocks.map((b,i)=>[blockId(b,i),progress.find(p=>p.block_id===blockId(b,i))?.completed,progress.find(p=>p.block_id===blockId(b,i))?.done_questions])
      });

      if(!force && sig===lastPlanSignature) return;
      lastPlanSignature=sig;

      const title=sec.querySelector(".section-head h2");
      const sub=sec.querySelector(".section-subtitle");
      if(title) title.textContent="Operação semanal — Planejamento Semanal";
      if(sub) sub.textContent="Missão do dia atual. Sem piscar, sem redesenhar fora de hora.";

      if(!day){
        box.innerHTML=`<div class="online-comment"><strong>Planejamento sem dias cadastrados.</strong><br>Peça ao mentor para revisar o JSON/Markdown importado.</div>`;
        return;
      }

      const metaTotal=blocks.reduce((acc,b)=>acc+n(b.meta||b.metaQuestoes||0),0);
      box.innerHTML=`
        <div class="student-plan-hero sx-v10-plan-hero">
          <p class="eyebrow"><i class="fa-solid fa-crosshairs"></i> Missão de hoje</p>
          <h3>${esc(day.day||day.dia||"Operação do dia")} ${day.date||day.data?`• ${esc(day.date||day.data)}`:""}</h3>
          <span>${esc(day.disciplines||day.disciplinas||day.review||day.revisao||plan.mentor_message||"Execute os blocos de hoje.")}</span>
          <div class="sx-v10-plan-meta">
            <b>${blocks.length}</b> bloco(s)
            <b>${metaTotal}</b> questão(ões) planejada(s)
            <b>${esc(plan.week_label||plan.contest||"Semana atual")}</b>
          </div>
        </div>
        ${day.review||day.revisao?`<div class="online-comment"><strong>Revisão:</strong> ${esc(day.review||day.revisao)}</div>`:""}
        <div class="student-today-blocks">
          ${blocks.map((block,i)=>{
            const id=blockId(block,i);
            const pg=progress.find(p=>p.block_id===id);
            const done=!!pg?.completed;
            const materialLink=block.materialLink||block.material_link||"";
            const questionLink=block.questionLink||block.question_link||"";
            return `<article class="student-today-block ${done?"done":""}" data-v10-block="${esc(id)}">
              <button class="online-check" type="button" data-v10-toggle-block="${esc(id)}">${done?"✓":"○"}</button>
              <div>
                <strong>Bloco ${esc(block.number||block.numero||i+1)} — ${esc(block.discipline||block.disciplina||"Disciplina")}</strong>
                <p>${esc(block.subject||block.assunto||"")}</p>
                <div class="online-mini-tools">
                  <span class="online-chip">Meta: ${n(block.meta||block.metaQuestoes||0)} questões</span>
                  ${materialLink?`<a class="online-chip link" target="_blank" href="${esc(materialLink)}">Aula/material</a>`:""}
                  ${questionLink?`<a class="online-chip link" target="_blank" href="${esc(questionLink)}">Questões</a>`:""}
                  ${pg?`<span class="online-chip">Feitas: ${n(pg.done_questions)}</span>`:""}
                </div>
              </div>
              <button class="secondary-btn small" type="button" data-v10-register-block="${esc(id)}">Registrar</button>
            </article>`;
          }).join("")||`<div class="sx-empty">Nenhum bloco para hoje.</div>`}
        </div>
      `;
    }catch(err){
      box.innerHTML=`<div class="online-comment"><strong>Erro no planejamento.</strong><br>${esc(err.message||"erro inesperado")}</div>`;
      console.error("[Setor X V10] planejamento",err);
    }finally{
      isRenderingPlan=false;
      blockFlash();
    }
  }

  async function awardXP(amount,reason){
    const sb=getSupabase();
    if(!sb||!amount) return false;
    try{
      const rpc=await sb.rpc("setorx_add_xp",{p_amount:amount,p_reason:reason});
      if(!rpc.error) return true;
      console.warn("[V10 XP rpc]",rpc.error);
    }catch(e){console.warn("[V10 XP rpc unavailable]",e);}
    return false;
  }

  async function updateBlock(blockId,register=false){
    const sb=getSupabase();
    if(!sb) return statusBox("Supabase não conectado.","error");
    try{
      const {user}=await getUserAndProfile(sb);
      if(!user) return statusBox("Faça login novamente.","error");
      const plan=await fetchLatestPlan(sb,user.id);
      if(!plan) return statusBox("Nenhum planejamento encontrado.","error");
      const progress=await fetchProgress(sb,user.id,plan.id);
      const current=progress.find(p=>p.block_id===blockId);
      let done=n(current?.done_questions),correct=n(current?.correct),wrong=n(current?.wrong);
      if(register){
        done=parseInt(prompt("Questões feitas:",done)||done||0,10);
        correct=parseInt(prompt("Acertos:",correct)||correct||0,10);
        wrong=parseInt(prompt("Erros:",wrong)||wrong||0,10);
      }
      const payload={
        user_id:user.id,
        plan_id:plan.id,
        block_id:blockId,
        completed: register ? true : !current?.completed,
        done_questions:done,
        correct,
        wrong,
        updated_at:new Date().toISOString()
      };
      const {error}=await sb.from("plan_progress").upsert(payload,{onConflict:"user_id,plan_id,block_id"});
      if(error) throw error;
      if(payload.completed && !current?.completed) await awardXP(20,"Bloco do planejamento concluído");
      await stableRenderStudentPlan(true);
      await stableRenderRanking(true);
    }catch(err){
      statusBox("Erro ao atualizar bloco: "+(err.message||"erro"),"error");
    }
  }

  async function fetchRanking(sb){
    // Primeiro tenta usar xp_total em profiles.
    const res=await sb.from("profiles")
      .select("id,email,full_name,nickname,role,status,active,contest_target,xp_total,created_at")
      .eq("status","active")
      .order("xp_total",{ascending:false})
      .order("created_at",{ascending:true})
      .limit(100);

    if(res.error) throw res.error;
    let ranking=res.data||[];

    // Fallback: se todos vierem zerados, soma xp_events manualmente.
    const allZero=ranking.length && ranking.every(r=>n(r.xp_total)===0);
    if(allZero){
      const xp=await sb.from("xp_events").select("user_id,amount");
      if(!xp.error && Array.isArray(xp.data)){
        const totals={};
        xp.data.forEach(e=>{totals[e.user_id]=(totals[e.user_id]||0)+n(e.amount);});
        ranking=ranking.map(r=>({...r,xp_total:totals[r.id]||0})).sort((a,b)=>n(b.xp_total)-n(a.xp_total));
      }
    }

    return ranking;
  }

  async function stableRenderRanking(force=false){
    if(isRankingLoading) return;
    const box=$("#online-ranking-board")||$("#online-ranking-list")||$("#online-ranking");
    if(!box) return;
    const sb=getSupabase();
    if(!sb) return;

    isRankingLoading=true;
    try{
      // Tenta recomputar no banco, mas não depende disso.
      try{ await sb.rpc("setorx_recompute_xp_totals"); }catch(e){}

      const {user,profile}=await getUserAndProfile(sb);
      const ranking=await fetchRanking(sb);
      const sig=JSON.stringify(ranking.map(r=>[r.id,n(r.xp_total)]));
      if(!force && sig===lastRankingSignature) return;
      lastRankingSignature=sig;

      const html=ranking.map((r,i)=>`
        <article class="online-rank-row ${r.id===user?.id?"me":""}">
          <span class="rank-pos">${i+1}</span>
          <div>
            <strong>${esc(r.nickname||r.full_name||"Aluno")}</strong>
            <small>${esc(r.contest_target||"Setor X")} • ${n(r.xp_total)} XP ${r.id===user?.id?"• você":""}</small>
          </div>
        </article>
      `).join("") || `<div class="sx-empty">Ranking vazio. Conclua blocos ou responda questões para gerar XP.</div>`;

      if(box.id==="online-ranking"){
        box.innerHTML=`
          <div class="section-head">
            <div>
              <p class="eyebrow"><i class="fa-solid fa-trophy"></i> Ranking sincronizado</p>
              <h2>Ranking geral</h2>
              <span class="section-subtitle">Ranking com fallback em xp_events. ${profile?`Seu XP: ${n(ranking.find(r=>r.id===user?.id)?.xp_total || profile.xp_total)}.`:""}</span>
            </div>
            <button id="online-rank-sync" class="secondary-btn small" type="button">Sincronizar ranking</button>
          </div>
          <div id="online-ranking-board" class="online-ranking-board">${html}</div>
        `;
      }else{
        box.innerHTML=html;
      }
    }catch(err){
      console.error("[Setor X V10] ranking",err);
      if(box.id==="online-ranking"){
        box.innerHTML=`<div class="online-comment"><strong>Erro no ranking.</strong><br>${esc(err.message||"erro inesperado")}</div>`;
      }
    }finally{
      isRankingLoading=false;
    }
  }

  function stopOldFlicker(){
    // Evita múltiplos renders simultâneos causados por eventos antigos.
    if(stableTimer) clearTimeout(stableTimer);
    stableTimer=setTimeout(()=>{
      stableRenderStudentPlan(false);
      stableRenderRanking(false);
    },180);
  }

  function bind(){
    document.addEventListener("click",e=>{
      const toggle=e.target.closest("[data-v10-toggle-block]");
      if(toggle){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        return updateBlock(toggle.dataset.v10ToggleBlock,false);
      }
      const reg=e.target.closest("[data-v10-register-block]");
      if(reg){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        return updateBlock(reg.dataset.v10RegisterBlock,true);
      }
      if(e.target.closest("#online-rank-sync")){
        e.preventDefault();
        stableRenderRanking(true);
      }
    },true);

    window.addEventListener("setorx:auth-changed",stopOldFlicker);
    window.addEventListener("setorx:platform-ready",stopOldFlicker);
    window.addEventListener("setorx:ranking-updated",()=>stableRenderRanking(true));

    // Render controlado. Não fica redesenhando a cada poucos ms.
    setTimeout(()=>{stableRenderStudentPlan(true);stableRenderRanking(true);},900);
    setInterval(()=>{stableRenderRanking(false);},15000);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();

  window.SetorXV10={renderPlan:()=>stableRenderStudentPlan(true),renderRanking:()=>stableRenderRanking(true)};
})();
