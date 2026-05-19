(function(){
  "use strict";
  const APP_KEY = "setorX.v4.refinado";
  const PRO_KEY = "setorx_lei_seca_pro_v23";
  const RANGE_KEY = "setorx_stats_range_v30";
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const n = (v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const int = v => Math.max(0, Math.round(n(String(v ?? "").replace(/[^\d.,-]/g,"").replace(/\./g,"").replace(",", "."), 0)));
  const esc = (v="") => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  function read(key,fallback={}){
    try{
      const raw = localStorage.getItem(key) || localStorage.getItem(key + ".backup");
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function write(key,value){
    try{
      const payload=JSON.stringify(value);
      localStorage.setItem(key,payload);
      localStorage.setItem(key+".backup",payload);
      localStorage.setItem(key+".lastSavedAt",new Date().toISOString());
    }catch(e){}
  }
  function todayKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function fmtInt(v){ return Math.max(0,Math.round(n(v,0))).toLocaleString("pt-BR"); }
  function fmtMin(min){
    const t=Math.max(0,Math.round(n(min,0)));
    return `${String(Math.floor(t/60)).padStart(2,"0")}h ${String(t%60).padStart(2,"0")}m`;
  }
  function normalizeDate(value){
    if(!value) return "";
    const s=String(value).trim();
    const iso=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const br=s.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if(br){
      const y=br[3] ? (br[3].length===2 ? `20${br[3]}` : br[3]) : String(new Date().getFullYear());
      return `${y}-${String(br[2]).padStart(2,"0")}-${String(br[1]).padStart(2,"0")}`;
    }
    const d=new Date(s);
    if(Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function addDays(key,days){
    const [y,m,d]=String(key||todayKey()).split("-").map(Number);
    const dt=new Date(y || new Date().getFullYear(), (m||1)-1, d||new Date().getDate(), 12,0,0);
    dt.setDate(dt.getDate()+Number(days||0));
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  }
  function startOfWeekKey(key=todayKey()){
    const [y,m,d]=key.split("-").map(Number);
    const dt=new Date(y,m-1,d,12,0,0);
    const diff=(dt.getDay()+6)%7;
    dt.setDate(dt.getDate()-diff);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  }
  function fmtDate(k){
    const d=normalizeDate(k);
    return d ? d.split("-").reverse().join("/") : "--/--/----";
  }
  function getRange(){
    const r=localStorage.getItem(RANGE_KEY) || read(PRO_KEY,{}).activeStatsRange || "day";
    return ["day","week","month","all"].includes(r) ? r : "day";
  }
  function setRange(r){
    const range=["day","week","month","all"].includes(r)?r:"day";
    localStorage.setItem(RANGE_KEY, range);
    const pro=read(PRO_KEY,{});
    pro.activeStatsRange=range;
    write(PRO_KEY,pro);
  }
  function inRange(date, range){
    const k=normalizeDate(date);
    if(!k) return range==="all";
    const today=todayKey();
    if(range==="day") return k===today;
    if(range==="week") return k>=startOfWeekKey(today) && k<=today;
    if(range==="month") return k.slice(0,7)===today.slice(0,7) && k<=today;
    return true;
  }
  function rangeLabel(range){
    const today=todayKey();
    if(range==="day") return `Hoje • ${fmtDate(today)}`;
    if(range==="week") return `Semana atual • ${fmtDate(startOfWeekKey(today))} a ${fmtDate(today)}`;
    if(range==="month") return `Mês atual • ${today.slice(5,7)}/${today.slice(0,4)}`;
    return "Todo o histórico registrado";
  }
  function qHistory(q){ return Array.isArray(q && q.history) ? q.history : []; }
  function qAttemptsTotal(q){
    return Math.max(
      n(q && q.attempts,0),
      qHistory(q).length,
      n(q && q.correctCount,0) + n(q && q.wrongCount,0),
      (q && (q.status==="correct" || q.status==="wrong")) ? 1 : 0
    );
  }
  function qAnswerDate(q){
    return normalizeDate(q?.lastResult?.answeredAt || q?.answeredAt || q?.lastReview || q?.updatedAt || q?.capturedAt || q?.date);
  }
  function bankAttempts(app, range){
    const questions=Array.isArray(app.questions) ? app.questions : [];
    let attempts=0, correct=0, wrong=0;
    for(const q of questions){
      const hist=qHistory(q);
      const histIn=hist.filter(h=>inRange(h.date || h.answeredAt || h.createdAt, range));
      const histCorrect=histIn.filter(h=>h.result==="correct").length;
      const histWrong=histIn.filter(h=>h.result==="wrong").length;
      if(range==="all"){
        attempts += qAttemptsTotal(q);
        correct += Math.max(n(q.correctCount,0), hist.filter(h=>h.result==="correct").length);
        wrong += Math.max(n(q.wrongCount,0), hist.filter(h=>h.result==="wrong").length);
        continue;
      }
      if(hist.length){
        attempts += histIn.length;
        correct += histCorrect;
        wrong += histWrong;
        const extra=Math.max(0, qAttemptsTotal(q)-hist.length);
        if(extra && inRange(qAnswerDate(q), range)){
          attempts += extra;
          if((q.status||q.lastResult?.status)==="correct") correct += extra;
          else if((q.status||q.lastResult?.status)==="wrong") wrong += extra;
        }
        continue;
      }
      if(qAttemptsTotal(q)>0 && inRange(qAnswerDate(q), range)){
        const count=qAttemptsTotal(q);
        attempts += count;
        if((q.status||q.lastResult?.status)==="correct") correct += count;
        else if((q.status||q.lastResult?.status)==="wrong") wrong += count;
      }
    }
    return {attempts, correct, wrong};
  }
  function sumMapByRange(map, range){
    return Object.entries(map && typeof map==="object" ? map : {}).reduce((sum,[k,v])=>inRange(k,range)?sum+int(v):sum,0);
  }
  function weeklyLoggedQuestions(app, range){
    const logs=app?.weeklyPlan?.blockLogs && typeof app.weeklyPlan.blockLogs==="object" ? app.weeklyPlan.blockLogs : {};
    return Object.values(logs).reduce((sum,l)=>inRange(l?.date || l?.updatedAt,range)?sum+int(l?.done):sum,0);
  }
  function manualAttempts(app, range){
    const qg=app.questionGoal || {};
    const byDate=qg.manualByDate && typeof qg.manualByDate==="object" ? qg.manualByDate : {};
    const dated=sumMapByRange(byDate, range);
    const weekly=weeklyLoggedQuestions(app,range);
    if(range==="all"){
      return Math.max(dated, weekly, int(qg.manualDone));
    }
    return Math.max(dated, weekly);
  }
  function questionDailyGoal(app,totalDone){
    const configured=int(app?.settings?.dailyQuestionGoal);
    if(configured>0) return configured;
    const target=int(app?.questionGoal?.target);
    if(!target) return 0;
    const date=normalizeDate(app?.edital?.date);
    let days=0;
    if(date){
      const now=new Date();
      const [y,m,d]=date.split("-").map(Number);
      const end=new Date(y,m-1,d,23,59,59);
      days=Math.ceil((end-now)/86400000);
    }
    const left=Math.max(0,target-totalDone);
    return days>0 ? Math.ceil(left/days) : 0;
  }
  function pendingRevisions(app, pro){
    const today=todayKey();
    const questions=(Array.isArray(app.questions)?app.questions:[]).filter(q=>qAttemptsTotal(q)>0 && normalizeDate(q.nextReview) && normalizeDate(q.nextReview)<=today).length;
    const summaries=(Array.isArray(app.summaries)?app.summaries:[]).filter(s=>normalizeDate(s.nextReview) && normalizeDate(s.nextReview)<=today).length;
    const lawMarks=app.lawMarks && typeof app.lawMarks==="object" ? Object.values(app.lawMarks).filter(x=>x && x.review).length : 0;
    const lawReviews=(Array.isArray(pro.reviews)?pro.reviews:[]).filter(r=>(!r.status || r.status!=="done") && normalizeDate(r.date)<=today).length;
    const lawSessions=(Array.isArray(pro.sessions)?pro.sessions:[]).filter(s=>(!s.status || s.status!=="done") && normalizeDate(s.date)<=today).length;
    return {total:questions+summaries+lawMarks+lawReviews+lawSessions, questions, summaries, lawMarks, lawReviews, lawSessions};
  }
  function lawMinutes(pro, range){
    const sessions=Array.isArray(pro.sessions)?pro.sessions:[];
    return sessions.reduce((sum,s)=>{
      if(s.status==="done" && inRange(s.completedAt || s.date, range)) return sum + n(s.minutes,0);
      return sum;
    },0);
  }
  function studyMinutes(app, pro, range){
    const stats=app.stats || {};
    const byDate=stats.focusByDate && typeof stats.focusByDate==="object" ? stats.focusByDate : {};
    const fromDate=range==="all" ? Object.values(byDate).reduce((a,b)=>a+n(b,0),0) : sumMapByRange(byDate,range);
    let fromLegacy=0;
    if(range==="day"){
      const last=normalizeDate(stats.lastFocusDate || stats.lastActiveDate);
      fromLegacy = (!last || last===todayKey()) ? n(stats.focusMinutesToday,0) : 0;
    }else if(range==="all"){
      fromLegacy = n(stats.focusMinutesToday,0);
    }
    let fromSubjects=0;
    const fbs=stats.focusBySubject && typeof stats.focusBySubject==="object" ? stats.focusBySubject : {};
    Object.values(fbs).forEach(e=>{
      if(e && e.byDate && typeof e.byDate==="object") fromSubjects += range==="all" ? Object.values(e.byDate).reduce((a,b)=>a+n(b,0),0) : sumMapByRange(e.byDate,range);
    });
    return Math.max(fromDate, fromLegacy, fromSubjects) + lawMinutes(pro,range);
  }
  function subjectMinutes(app, range){
    const stats=app.stats || {};
    const fbs=stats.focusBySubject && typeof stats.focusBySubject==="object" ? stats.focusBySubject : {};
    const out=[];
    Object.values(fbs).forEach(e=>{
      const name=e?.name || "Geral";
      const min=e?.byDate && typeof e.byDate==="object"
        ? (range==="all" ? Object.values(e.byDate).reduce((a,b)=>a+n(b,0),0) : sumMapByRange(e.byDate, range))
        : (range==="all" ? n(e?.total,0) : 0);
      if(min>0) out.push({name,min});
    });
    return out.sort((a,b)=>b.min-a.min).slice(0,8);
  }
  function updateBar(id,pct){
    const el=$(id);
    if(el) el.style.width=`${Math.max(0,Math.min(100,Math.round(n(pct,0))))}%`;
  }
  function renderSubjectBars(app,range){
    const box=$("#sx-subject-bars");
    if(!box) return;
    const arr=subjectMinutes(app,range);
    if(!arr.length){
      box.innerHTML = `<div class="sx-empty">Ainda não há tempo registrado por disciplina neste período.</div>`;
      return;
    }
    const max=Math.max(...arr.map(x=>x.min),1);
    box.innerHTML=arr.map(x=>`<div class="sx-bar-row"><div><strong>${esc(x.name)}</strong><span>${fmtMin(x.min)}</span></div><div class="sx-bar"><i style="width:${Math.min(100,Math.round(x.min/max*100))}%"></i></div></div>`).join("");
  }
  function patchDashboard(){
    const app=read(APP_KEY,{}), pro=read(PRO_KEY,{});
    const today="day";
    const bank=bankAttempts(app,today).attempts;
    const manual=manualAttempts(app,today);
    const total=bank+manual;
    const allBank=bankAttempts(app,"all").attempts;
    const allManual=manualAttempts(app,"all");
    const goal=questionDailyGoal(app,allBank+allManual);
    const pct=goal?Math.min(100,Math.round(total/goal*100)):0;
    const pending=pendingRevisions(app,pro);
    const min=studyMinutes(app,pro,"day");
    const dailyStudyGoal=Math.max(0,Math.round(n(app?.settings?.dailyHours,0)*60));
    const studyPct=dailyStudyGoal?Math.min(100,Math.round(min/dailyStudyGoal*100)):0;

    const qTotal=$("#kpi-questions-total"); if(qTotal) qTotal.textContent=fmtInt(total);
    const qTarget=$("#kpi-questions-target");
    if(qTarget) qTarget.textContent = goal ? `Meta diária: ${fmtInt(total)}/${fmtInt(goal)} • ${pct}%${total>=goal ? " • meta batida" : ` • faltam ${fmtInt(goal-total)}`}` : `Hoje: ${fmtInt(total)} questões registradas`;
    const qBreak=$("#kpi-questions-breakdown"); if(qBreak) qBreak.textContent=`Banco QX: ${fmtInt(bank)} • Manuais/externas: ${fmtInt(manual)} • Total: ${fmtInt(total)}`;
    updateBar("#kpi-questions-daily-progress", pct);

    const rev=$("#kpi-reviews-due"); if(rev) rev.textContent=fmtInt(pending.total);
    const revLab=$("#kpi-pending-reviews-label");
    if(revLab) revLab.textContent = pending.total ? `${fmtInt(pending.questions)} questões • ${fmtInt(pending.total-pending.questions)} outras revisões` : "Nada pendente agora";

    const study=$("#kpi-reviews-total"); if(study) study.textContent=fmtMin(min);
    const lab=$("#kpi-study-goal-label");
    if(lab) lab.textContent = dailyStudyGoal ? `Meta: ${fmtMin(min)}/${fmtMin(dailyStudyGoal)} • ${studyPct}%${min>=dailyStudyGoal ? " • meta batida" : ` • faltam ${fmtMin(dailyStudyGoal-min)}`}` : "Configure horas/dia";
    updateBar("#kpi-study-daily-progress", studyPct);

    const focusLeft=$("#questions-left-today");
    if(focusLeft) focusLeft.textContent=goal ? fmtInt(Math.max(0,goal-total)) : "0";
    const dailyGoal=$("#daily-question-goal");
    if(dailyGoal && goal) dailyGoal.value=goal;
  }
  function patchStats(){
    const app=read(APP_KEY,{}), pro=read(PRO_KEY,{});
    const range=getRange();
    const bank=bankAttempts(app,range);
    const manual=manualAttempts(app,range);
    const total=bank.attempts+manual;
    const accuracy=bank.attempts ? Math.round(bank.correct/bank.attempts*100) : 0;
    const minutes=studyMinutes(app,pro,range);
    const lawDone=(Array.isArray(pro.sessions)?pro.sessions:[]).filter(s=>s.status==="done").length;
    const lawTotal=(Array.isArray(pro.sessions)?pro.sessions:[]).length;
    const lawPct=lawTotal ? Math.round(lawDone/lawTotal*100) : 0;

    $$(".sx-stats-period button,[data-sx-stats-range]").forEach(btn=>{
      if(btn.tagName==="BUTTON") btn.classList.toggle("active", (btn.getAttribute("data-sx-stats-range")||"day")===range);
    });
    const label=$("#sx-stats-period-label");
    if(label) label.innerHTML=`<strong>Período:</strong><span>${esc(rangeLabel(range))} • sincronizado com Banco QX + registro manual de questões.</span>`;
    const h=$("#sx-stat-hours"); if(h) h.textContent=fmtMin(minutes);
    const hLabel=$("#sx-stat-hours-label"); if(hLabel) hLabel.textContent=range==="all"?"histórico total":"período selecionado";
    const q=$("#sx-stat-questions"); if(q) q.textContent=fmtInt(total);
    const acc=$("#sx-stat-accuracy"); if(acc) acc.textContent=`Banco QX: ${fmtInt(bank.attempts)} • Manuais/externas: ${fmtInt(manual)} • Aproveitamento BQX: ${bank.attempts?accuracy+"%":"--"}`;
    const law=$("#sx-stat-law"); if(law) law.textContent=`${lawPct}%`;
    const breakdown=$("#sx-stats-question-breakdown");
    if(breakdown){
      breakdown.innerHTML = `
        <span><strong>Banco QX:</strong> ${fmtInt(bank.attempts)}</span>
        <span><strong>Questões manuais/externas:</strong> ${fmtInt(manual)}</span>
        <span><strong>Total do período:</strong> ${fmtInt(total)}</span>
      `;
    }
    renderSubjectBars(app,range);
    patchQuestionStatsList(app, range, manual, bank);
  }
  function patchQuestionStatsList(app, range, manual, bank){
    const box=$("#sx-question-stats");
    if(!box) return;
    const questions=Array.isArray(app.questions)?app.questions:[];
    const map={};
    for(const q of questions){
      const subj=q.subject || "Geral";
      map[subj]=map[subj] || {attempts:0,correct:0,wrong:0,total:0};
      map[subj].total++;
    }
    for(const q of questions){
      const subj=q.subject || "Geral";
      const b=bankAttempts({questions:[q]},range);
      map[subj].attempts += b.attempts;
      map[subj].correct += b.correct;
      map[subj].wrong += b.wrong;
    }
    const arr=Object.entries(map).map(([name,v])=>({name,...v,acc:v.attempts?Math.round(v.correct/v.attempts*100):0})).sort((a,b)=>b.attempts-a.attempts||b.wrong-a.wrong).slice(0,8);
    if(!arr.length && !manual){
      box.innerHTML=`<div class="sx-empty">Nenhuma questão feita no período selecionado.</div>`;
      return;
    }
    const manualRow = manual ? `<div class="sx-rank-item sx-manual-row"><div><strong>Questões manuais/externas</strong><br><span>${fmtInt(manual)} registradas no período</span></div><span class="sx-neutral-text">manual</span></div>` : "";
    box.innerHTML = manualRow + arr.map(x=>`<div class="sx-rank-item"><div><strong>${esc(x.name)}</strong><br><span>${fmtInt(x.total)} cadastradas • ${fmtInt(x.attempts)} feitas • ${fmtInt(x.wrong)} erro(s)</span></div><span class="${x.acc>=70?"sx-success-text":x.acc<50?"sx-danger-text":"sx-warning"}">${x.attempts?x.acc+"%":"--"}</span></div>`).join("");
  }
  function patchAll(){
    try{ patchDashboard(); patchStats(); }catch(e){ console.warn("[Setor X V30] patch falhou",e); }
  }
  function bind(){
    document.addEventListener("click", e=>{
      const rbtn=e.target.closest("[data-sx-stats-range]");
      if(rbtn){
        e.preventDefault();
        e.stopPropagation();
        setRange(rbtn.getAttribute("data-sx-stats-range") || "day");
        setTimeout(patchAll,0);
        setTimeout(patchAll,250);
        return;
      }
      if(e.target.closest("#submit-answer,#manual-question-form button,[data-weekly-log],#weekly-log-save,#timer-complete,#complete-timer,#finish-focus,#sx-stats-refresh")){
        setTimeout(patchAll,120);
        setTimeout(patchAll,700);
      }
    }, true);
    document.addEventListener("submit", e=>{
      if(e.target && (e.target.id==="manual-question-form" || e.target.id==="question-form" || e.target.id==="weekly-log-form")){
        setTimeout(patchAll,120);
        setTimeout(patchAll,700);
      }
    }, true);
    window.addEventListener("storage", patchAll);
  }
  function boot(){
    bind();
    patchAll();
    setTimeout(patchAll,300);
    setTimeout(patchAll,1200);
    setInterval(patchAll,1500);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.SetorXV30StatsFix = {patchAll, bankAttempts, manualAttempts, studyMinutes, pendingRevisions};
})();
