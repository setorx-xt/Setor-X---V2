
(function(){
  "use strict";

  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = (v="")=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const uid = ()=>crypto.randomUUID?crypto.randomUUID():"sx_"+Date.now()+"_"+Math.random().toString(16).slice(2);
  const todayKey = ()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};

  function message(msg,type="info"){
    const box = $("#mentor-pro-message") || $("#online-auth-state");
    if(box){
      box.textContent = msg;
      box.className = `online-auth-state ${type}`;
      box.scrollIntoView({behavior:"smooth",block:"center"});
    }
    if(window.toast) window.toast(msg);
    console.log("[Setor X V7]", msg);
  }

  function mentorAPI(){
    return window.SetorXMentorPro || null;
  }

  async function getClient(){
    const api = mentorAPI();
    let sb = api?.client?.();
    if(sb) return sb;
    if(window.supabase && window.SETORX_SUPABASE_URL && window.SETORX_SUPABASE_ANON_KEY){
      let url = String(window.SETORX_SUPABASE_URL||"").trim().replace(/\/(auth|rest|storage)\/v1\/?.*$/i,"").replace(/\/+$/,"");
      const dash=url.match(/supabase\.com\/dashboard\/project\/([^\/?#]+)/i);
      if(dash && dash[1]) url=`https://${dash[1]}.supabase.co`;
      if(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(url)){
        sb = window.supabase.createClient(url, String(window.SETORX_SUPABASE_ANON_KEY||"").trim());
      }
    }
    return sb;
  }

  function parsePlan(raw){
    const t = String(raw||"").trim();
    if(!t) throw new Error("Cole o planejamento JSON ou Markdown antes de enviar.");

    if(t.startsWith("{") || t.startsWith("[")){
      const obj = JSON.parse(t);
      const plan = Array.isArray(obj) ? {days:obj} : obj;
      normalizePlanIds(plan);
      return plan;
    }

    const plan = {title:"Planejamento importado", days:[]};
    const dayMatches = [...t.matchAll(/^##\s*(?:✅\s*)?(.+?)(?:\s*[–-]\s*(.+))?$/gmi)];

    if(!dayMatches.length){
      throw new Error("Formato não reconhecido. Use JSON ou Markdown com títulos começando por ## DIA.");
    }

    dayMatches.forEach((m,i)=>{
      const start=m.index, end=dayMatches[i+1]?.index ?? t.length;
      const chunk=t.slice(start,end);
      const blocks=[];
      const bms=[...chunk.matchAll(/^###\s*Bloco\s*(\d+)?\s*[–-]?\s*(.+)?$/gmi)];

      bms.forEach((bm,j)=>{
        const bs=bm.index, be=bms[j+1]?.index ?? chunk.length, bc=chunk.slice(bs,be);
        const get = (label)=>{
          const r = new RegExp("\\*\\*"+label+"\\s*:?\\*\\*\\s*(.*)","i");
          return (bc.match(r)?.[1]||"").trim();
        };
        const link = (s)=>{
          const md=String(s||"").match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/i);
          if(md) return md[1];
          const u=String(s||"").match(/https?:\/\/[^\s)]+/i);
          return u?u[0]:"";
        };
        const material = get("Material de apoio") || get("Material") || "";
        const questions = get("Questões") || "";
        blocks.push({
          id: uid(),
          number: parseInt(bm[1]||j+1,10),
          discipline: String(bm[2]||get("Disciplina")||"Bloco").replace(/\*/g,"").trim(),
          subject: get("Assunto"),
          material,
          materialLink: link(material),
          questions,
          questionLink: link(questions),
          meta: parseInt(String(get("Meta")||"0").replace(/\D/g,""),10)||0,
          type:"study"
        });
      });

      const getDay = (label)=>{
        const r = new RegExp("\\*\\*"+label+"\\s*:?\\*\\*\\s*(.+)","i");
        return (chunk.match(r)?.[1]||"").trim();
      };

      plan.days.push({
        id: uid(),
        day: (m[1]||`Dia ${i+1}`).trim(),
        date: (m[2]||"").trim(),
        review: getDay("Revisão"),
        disciplines: getDay("Disciplina do dia") || getDay("Disciplinas"),
        metaDay: parseInt(String(getDay("Meta do dia")||"0").replace(/\D/g,""),10)||0,
        blocks
      });
    });

    normalizePlanIds(plan);
    return plan;
  }

  function normalizePlanIds(plan){
    plan.days = Array.isArray(plan.days) ? plan.days : [];
    plan.days.forEach((d,di)=>{
      d.id = d.id || uid();
      d.day = d.day || d.dia || `Dia ${di+1}`;
      d.blocks = Array.isArray(d.blocks) ? d.blocks : [];
      d.blocks.forEach((b,bi)=>{
        b.id = b.id || uid();
        b.number = b.number || b.numero || bi+1;
        b.discipline = b.discipline || b.disciplina || "Disciplina";
        b.subject = b.subject || b.assunto || "";
        b.meta = Number(b.meta || b.metaQuestoes || 0);
      });
    });
  }

  async function forceSendPlan(e){
    const form = e.target?.closest?.("#mentor-plan-form") || e.target?.closest?.("[data-v7-send-plan]")?.closest?.("#mentor-plan-form");
    if(!form) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const api = mentorAPI();
    if(!api?.isMentor?.()){
      return message("Sua conta atual não está como mentor ativo. Rode promover-mentor.sql e faça login novamente.", "error");
    }

    const sb = await getClient();
    if(!sb) return message("Supabase não conectado. Confira assets/js/online-config.js.", "error");

    const select = $("#mentor-plan-student");
    const sid = select?.value || "";
    if(!sid) return message("Selecione o aluno que receberá o planejamento.", "error");

    const raw = $("#mentor-plan-raw")?.value || "";
    let plan;
    try { plan = parsePlan(raw); }
    catch(err){ return message(err.message || "Erro ao ler o planejamento.", "error"); }

    const state = api.state?.() || {};
    const profile = api.profile?.() || {};
    const student = (state.students||[]).find(s=>s.id===sid);
    const contest = ($("#mentor-plan-contest")?.value.trim() || plan.concurso || plan.contest || student?.contest_target || "");
    const week = ($("#mentor-plan-week")?.value.trim() || plan.semana || plan.week || plan.week_label || "");
    const mentorMsg = ($("#mentor-plan-message")?.value.trim() || plan.mensagemMentor || plan.mentorMessage || "");

    plan.concurso = contest;
    plan.semana = week;
    plan.mensagemMentor = mentorMsg;
    plan.aluno = student?.full_name || student?.nickname || student?.email || "";

    const btn = form.querySelector("button[type='submit'], [data-v7-send-plan]");
    if(btn){ btn.disabled = true; btn.dataset.oldText = btn.innerHTML; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...'; }

    try{
      const payload = {
        user_id: sid,
        mentor_id: profile.id || null,
        contest,
        week_label: week,
        mentor_message: mentorMsg,
        plan_json: plan
      };

      let {error} = await sb.from("individual_plans").insert(payload);

      if(error && String(error.message||"").includes("mentor_id")){
        delete payload.mentor_id;
        const retry = await sb.from("individual_plans").insert(payload);
        error = retry.error;
      }

      if(error){
        return message("Erro ao enviar planejamento: " + (error.message || error.code || "erro desconhecido") + ". Verifique se rodou o schema/atualização no Supabase.", "error");
      }

      message(`Planejamento enviado para ${student?.nickname || student?.full_name || student?.email || "o aluno selecionado"}.`, "success");
      const rawEl = $("#mentor-plan-raw");
      if(rawEl) rawEl.value = "";
      if(api.reload) await api.reload();
      const restored = $("#mentor-plan-student");
      if(restored) restored.value = sid;
    }catch(err){
      message("Falha inesperada no envio: " + (err.message || "erro"), "error");
    }finally{
      if(btn){ btn.disabled = false; btn.innerHTML = btn.dataset.oldText || '<i class="fa-solid fa-cloud-arrow-up"></i> Enviar planejamento individual'; }
    }
  }

  function enhancePlanForm(){
    const form = $("#mentor-plan-form");
    if(!form || form.dataset.v7Enhanced) return;
    form.dataset.v7Enhanced = "1";

    const submit = form.querySelector("button[type='submit']");
    if(submit) submit.setAttribute("data-v7-send-plan","1");

    const select = $("#mentor-plan-student");
    if(select && !select.dataset.v7Pinned){
      select.dataset.v7Pinned="1";
      select.addEventListener("change",()=>{ window.__setorxSelectedPlanStudent = select.value; }, true);
    }
  }

  function lawDB(){
    const api = window.SetorXVadeMecum;
    const db = typeof api?.db === "function" ? api.db() : api?.db;
    return Array.isArray(db) ? db : [];
  }

  function findLaw(id){
    const db = lawDB();
    return db.find(l=>l.id===id) || db[0] || null;
  }

  const STORE_KEY = "setorx_vade_reader_v7";
  function getStore(){
    try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{"read":{},"review":{},"highlights":{},"comments":{}}');}
    catch{return {read:{},review:{},highlights:{},comments:{}};}
  }
  function saveStore(s){localStorage.setItem(STORE_KEY, JSON.stringify(s));}

  function openLawReader(lawId){
    const law = findLaw(lawId);
    if(!law) return message("Nenhuma lei encontrada no Vade Mecum.", "error");

    let root = $("#sx-vade-law-reader");
    if(!root){
      document.body.insertAdjacentHTML("beforeend", `
        <div id="sx-vade-law-reader" class="sx-vade-reader" hidden>
          <div class="sx-vade-reader-bg" data-v7-close-law></div>
          <section class="sx-vade-reader-box">
            <header class="sx-vade-reader-head">
              <div>
                <p class="eyebrow" id="sx-vade-reader-breadcrumb">Vade Mecum</p>
                <h2 id="sx-vade-reader-title">Lei</h2>
                <span id="sx-vade-reader-subtitle">Leitura, marcação, grifo e comentário</span>
              </div>
              <button class="danger-btn small" type="button" data-v7-close-law><i class="fa-solid fa-xmark"></i> Fechar lei</button>
            </header>
            <div class="sx-vade-reader-tools">
              <input id="sx-vade-reader-search" type="search" placeholder="Buscar artigo ou expressão..." />
              <select id="sx-vade-reader-filter">
                <option value="all">Todos</option>
                <option value="read">Lidos</option>
                <option value="review">Revisar</option>
                <option value="highlighted">Grifados</option>
              </select>
              <strong id="sx-vade-reader-count">0 artigo(s)</strong>
            </div>
            <div id="sx-vade-reader-articles" class="sx-vade-reader-articles"></div>
          </section>
        </div>
      `);
      root = $("#sx-vade-law-reader");
    }

    root.dataset.law = law.id;
    root.hidden = false;
    document.body.classList.add("sx-vade-reader-open");
    renderLawReader();
    setTimeout(()=>root.scrollIntoView({behavior:"smooth",block:"start"}),20);
  }

  function renderLawReader(){
    const root = $("#sx-vade-law-reader");
    if(!root || root.hidden) return;
    const law = findLaw(root.dataset.law);
    if(!law) return;

    const store = getStore();
    const q = String($("#sx-vade-reader-search")?.value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const filter = $("#sx-vade-reader-filter")?.value || "all";

    const norm = s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const arts = (law.articles||[]).filter(a=>{
      const key = `${law.id}:${a.id}`;
      const text = norm(`${a.n} ${a.text} ${a.heading||""}`);
      if(q && !text.includes(q)) return false;
      if(filter==="read" && !store.read[key]) return false;
      if(filter==="review" && !store.review[key]) return false;
      if(filter==="highlighted" && !(store.highlights[key]||[]).length) return false;
      return true;
    });

    $("#sx-vade-reader-breadcrumb").textContent = `${law.discipline || "Lei"} / ${law.short || law.title}`;
    $("#sx-vade-reader-title").textContent = law.title || law.short || "Lei";
    $("#sx-vade-reader-subtitle").textContent = `${law.discipline || "Disciplina"} • ${(law.articles||[]).length} item(ns)`;
    $("#sx-vade-reader-count").textContent = `${arts.length} item(ns)`;

    $("#sx-vade-reader-articles").innerHTML = arts.map(a=>{
      const key = `${law.id}:${a.id}`;
      const highlights = store.highlights[key] || [];
      let text = esc(a.text||"");
      highlights.forEach(h=>{
        const safe = esc(h);
        if(safe) text = text.replace(safe, `<mark>${safe}</mark>`);
      });
      return `
        <article class="sx-vade-reader-article ${store.read[key]?'read':''} ${store.review[key]?'review':''}" data-v7-art="${esc(a.id)}">
          ${a.heading?`<div class="vade-article-heading">${esc(a.heading)}</div>`:""}
          <div class="sx-vade-reader-article-head">
            <strong>${esc(a.n || "Item")}</strong>
            <div>
              <button class="ghost-btn small ${store.read[key]?'active':''}" type="button" data-v7-read="${esc(a.id)}">Lido</button>
              <button class="ghost-btn small ${store.review[key]?'active':''}" type="button" data-v7-review="${esc(a.id)}">Revisar</button>
              <button class="secondary-btn small" type="button" data-v7-highlight="${esc(a.id)}">Grifar seleção</button>
            </div>
          </div>
          <p class="sx-vade-reader-text">${text}</p>
          <textarea data-v7-comment="${esc(a.id)}" placeholder="Comentário do artigo...">${esc(store.comments[key]||"")}</textarea>
        </article>
      `;
    }).join("") || `<div class="sx-empty">Nenhum artigo encontrado.</div>`;
  }

  function closeLawReader(){
    const root=$("#sx-vade-law-reader");
    if(root) root.hidden = true;
    document.body.classList.remove("sx-vade-reader-open");
  }

  function bindGlobalFixes(){
    document.addEventListener("submit", e=>{
      if(e.target?.id === "mentor-plan-form") forceSendPlan(e);
    }, true);

    document.addEventListener("click", e=>{
      const planBtn = e.target.closest("[data-v7-send-plan], #mentor-plan-form button[type='submit']");
      if(planBtn) return forceSendPlan(e);

      const lawBtn = e.target.closest("[data-vade-law], .vade-law-item");
      if(lawBtn){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const id = lawBtn.dataset.vadeLaw || lawBtn.getAttribute("data-vade-law");
        return openLawReader(id);
      }

      if(e.target.closest("#sx-open-lei-seca-from-vade,#sx-open-vade-from-lei,#lsx-open-vade")){
        e.preventDefault();
        e.stopPropagation();
        return openLawReader(window.SetorXVadeMecum?.activeLaw?.());
      }

      if(e.target.closest("[data-v7-close-law]")) return closeLawReader();

      const root = $("#sx-vade-law-reader");
      if(root && !root.hidden){
        const art = e.target.closest("[data-v7-read],[data-v7-review],[data-v7-highlight]");
        if(art){
          const law = findLaw(root.dataset.law);
          const id = art.dataset.v7Read || art.dataset.v7Review || art.dataset.v7Highlight;
          const key = `${law.id}:${id}`;
          const store = getStore();

          if(art.dataset.v7Read){ store.read[key] = !store.read[key]; saveStore(store); return renderLawReader(); }
          if(art.dataset.v7Review){ store.review[key] = !store.review[key]; saveStore(store); return renderLawReader(); }
          if(art.dataset.v7Highlight){
            const selected = String(window.getSelection?.()||"").trim();
            const text = selected || prompt("Texto para grifar:","");
            if(text){
              store.highlights[key] = store.highlights[key] || [];
              if(!store.highlights[key].includes(text)) store.highlights[key].push(text);
              saveStore(store);
              renderLawReader();
              message("Grifo salvo no Vade Mecum.", "success");
            }
          }
        }
      }
    }, true);

    document.addEventListener("input", e=>{
      if(e.target?.id==="sx-vade-reader-search") renderLawReader();
      if(e.target?.matches?.("[data-v7-comment]")){
        const root=$("#sx-vade-law-reader");
        const law=findLaw(root?.dataset.law);
        if(!law) return;
        const key=`${law.id}:${e.target.dataset.v7Comment}`;
        const store=getStore();
        store.comments[key]=e.target.value;
        saveStore(store);
      }
    }, true);

    document.addEventListener("change", e=>{
      if(e.target?.id==="sx-vade-reader-filter") renderLawReader();
    }, true);

    setInterval(enhancePlanForm, 800);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", bindGlobalFixes, {once:true});
  else bindGlobalFixes();

  window.SetorXV7CriticalFix = {openLawReader, forceSendPlan, parsePlan};
})();
