(function(){
  'use strict';
  window.addEventListener('error', function(ev){
    const box=document.getElementById('online-auth-state');
    if(box){
      box.textContent='Erro de script: '+(ev.message||'verifique console/configuração');
      box.className='online-auth-state error';
    }
  });
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const uid=()=>crypto.randomUUID?crypto.randomUUID():`id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const today=()=>new Date().toISOString().slice(0,10);
  const addDays=(days)=>{const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};
  const storage={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};
  function normalizeSupabaseUrl(raw){
    let url=String(raw||'').trim().replace(/^["']|["']$/g,'');
    if(!url || url.includes('COLE_AQUI')) return '';

    // If user pasted the dashboard URL, extract project ref:
    // https://supabase.com/dashboard/project/abc123/settings/api
    const dash=url.match(/supabase\.com\/dashboard\/project\/([^\/?#]+)/i);
    if(dash && dash[1]) return `https://${dash[1]}.supabase.co`;

    // If user pasted API subpaths, strip them.
    url=url.replace(/\/(auth|rest|storage)\/v1\/?.*$/i,'');
    url=url.replace(/\/settings\/api\/?.*$/i,'');
    url=url.replace(/\/+$/,'');

    return url;
  }
  function supabaseConfigError(){
    const rawUrl=String(window.SETORX_SUPABASE_URL||'').trim();
    const rawKey=String(window.SETORX_SUPABASE_ANON_KEY||'').trim();

    if(!window.supabase) return 'Biblioteca Supabase não carregou. Verifique internet/CDN ou bloqueador.';
    if(!rawUrl || rawUrl.includes('COLE_AQUI')) return 'Cole a Project URL do Supabase em assets/js/online-config.js.';
    if(!rawKey || rawKey.includes('COLE_AQUI')) return 'Cole a anon public key / publishable key em assets/js/online-config.js.';

    const url=normalizeSupabaseUrl(rawUrl);
    if(!/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(url)){
      return 'URL do Supabase inválida. Use apenas https://SEU-PROJECT-REF.supabase.co. Não use link do dashboard, /auth/v1 ou /rest/v1.';
    }
    if(rawKey.toLowerCase().includes('service_role')) return 'Nunca use service_role no front-end. Use apenas anon public key / publishable key.';
    return '';
  }
  const cfg=()=>!supabaseConfigError();
  let sb=null, session=null, user=null, profile=null;
  const ranks=[
    ['Recruta',0,'recruta'],['Soldado',800,'soldado'],['Taifeiro',1600,'taifeiro'],['Cabo',3000,'cabo'],['3º Sargento',5500,'3sargento'],['2º Sargento',9000,'2sargento'],['1º Sargento',14500,'1sargento'],['Subtenente',22000,'subtenente'],['Aspirante',33000,'aspirante'],['2º Tenente',48000,'2tenente'],['1º Tenente',68000,'1tenente'],['Capitão',93000,'capitao'],['Major',125000,'major'],['Tenente-Coronel',165000,'tenentecoronel'],['Coronel',215000,'coronel'],['General de Brigada',280000,'generalbrigada'],['General de Divisão',360000,'generaldivisao'],['General de Exército',460000,'generalexercito'],['Marechal',600000,'marechal'],['Caveira',760000,'caveira'],['Forças Especiais',950000,'forcasespeciais'],['Setor X',1200000,'setorx']
  ];
  let state={students:[],plans:[],myPlan:null,planProgress:[],ranking:[],questions:[],attempts:[],activeQ:null,answer:null};
  function authStatus(){
    if(!sb) return {configured:false, logged:false, active:false, mentor:false, label:'Supabase não configurado', hint:'Preencha assets/js/online-config.js para ativar login e dados online.'};
    if(!user) return {configured:true, logged:false, active:false, mentor:false, label:'Não autenticado', hint:'Entre ou crie acesso para liberar a plataforma.'};
    if(!profile) return {configured:true, logged:true, active:false, mentor:false, label:'Carregando perfil', hint:'Aguarde a sincronização da conta.'};
    if(profile.role==='mentor' && profile.status==='active') return {configured:true, logged:true, active:true, mentor:true, label:'Mentor ativo', hint:'Acesso completo liberado.'};
    if(profile.status==='active') return {configured:true, logged:true, active:true, mentor:false, label:'Aluno ativo', hint:'Módulos liberados para estudo.'};
    if(profile.status==='blocked') return {configured:true, logged:true, active:false, mentor:false, label:'Acesso bloqueado', hint:'Procure o mentor para regularizar.'};
    return {configured:true, logged:true, active:false, mentor:false, label:'Acesso pendente', hint:'Aguarde a liberação do mentor.'};
  }
  function notifyAuthChange(){
    window.SetorXOnlineAuth = {
      status: authStatus,
      canAccess: () => {
        const st = authStatus();
        return !!(st.active || st.mentor);
      },
      isMentor: () => !!(authStatus().mentor)
    };
    window.dispatchEvent(new CustomEvent('setorx:auth-changed', {detail: authStatus()}));
  }

  function rankForXP(xp){let r=ranks[0];for(const it of ranks){if(xp>=it[1])r=it}return {title:r[0],min:r[1],slug:r[2],img:`assets/images/patentes/${r[2]}.png`}}
  function toast(msg){
    const authState=document.getElementById('online-auth-state');
    if(authState){
      authState.textContent=msg;
      authState.className='online-auth-state info';
    }
    if(typeof window.toast === "function") window.toast(msg); else console.log('[Setor X Online]', msg);
  }
  function isMentor(){return profile && profile.role==='mentor' && profile.status==='active'}
  function isConfigured(){return !!sb}
  function supa(){return sb}
  async function initSupabase(){
    if(cfg()) sb=window.supabase.createClient(normalizeSupabaseUrl(window.SETORX_SUPABASE_URL),String(window.SETORX_SUPABASE_ANON_KEY||'').trim()); else sb=null;
    if(!sb){renderOnlineAll();notifyAuthChange();return;}
    const {data}=await sb.auth.getSession(); session=data.session; user=session?.user||null;
    if(user) await loadAll();
    sb.auth.onAuthStateChange(async()=>{const {data}=await sb.auth.getSession();session=data.session;user=session?.user||null;if(user)await loadAll();else {profile=null;state={students:[],plans:[],myPlan:null,planProgress:[],ranking:[],questions:[],attempts:[],activeQ:null,answer:null};renderOnlineAll();}});
  }
  async function loadAll(){
    if(!sb||!user) return;
    let {data:p}=await sb.from('profiles').select('*').eq('id',user.id).single();
    if(!p){
      const payload={id:user.id,email:user.email,full_name:user.user_metadata?.full_name||user.email?.split('@')[0]||'Aluno',role:'student',status:'pending',nickname:user.email?.split('@')[0]||'Aluno',xp_total:0};
      await sb.from('profiles').insert(payload); p=payload;
    }
    profile=p;
    if(profile.status==='blocked' || (profile.role!=='mentor'&&profile.status!=='active')) {renderOnlineAll();notifyAuthChange();return;}
    if(isMentor()){
      const {data:students=[]}=await sb.from('profiles').select('*').order('created_at',{ascending:false}); state.students=students||[];
      const {data:plans=[]}=await sb.from('individual_plans').select('*').order('created_at',{ascending:false}); state.plans=plans||[];
    }else{
      const {data:plan=[]}=await sb.from('individual_plans').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1); state.myPlan=plan?.[0]||null;
      if(state.myPlan){const {data:pg=[]}=await sb.from('plan_progress').select('*').eq('plan_id',state.myPlan.id).eq('user_id',user.id);state.planProgress=pg||[]}
    }
    const {data:ranking=[]}=await sb.from('profiles').select('id,full_name,nickname,xp_total,status').eq('status','active').order('xp_total',{ascending:false}).limit(100); state.ranking=ranking||[];
    const {data:q=[]}=await sb.from('collective_questions').select('*').eq('is_public',true).order('created_at',{ascending:false}); state.questions=q||[]; if(!state.activeQ&&state.questions[0])state.activeQ=state.questions[0].id;
    const {data:a=[]}=await sb.from('collective_attempts').select('*').eq('user_id',user.id); state.attempts=a||[];
    renderOnlineAll();
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
  function parsePtInt(v){const m=String(v??'').replace(/\./g,'').match(/\d+/);return m?parseInt(m[0],10):0}
  function extractLink(t=''){const md=String(t).match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/i);if(md)return md[1];const u=String(t).match(/https?:\/\/[^\s)]+/i);return u?u[0]:''}
  function cleanMd(t=''){return String(t).replace(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g,'$1').replace(/\*\*/g,'').trim()}
  function normalizePlan(input){
    const daysIn=Array.isArray(input.days)?input.days:Array.isArray(input.dias)?input.dias:[];
    return {title:input.title||input.titulo||'Planejamento individual',aluno:input.aluno||input.studentName||'',concurso:input.concurso||input.contest||'',semana:input.semana||input.week||'',mentor:input.mentor||'Matheus G.',mensagemMentor:input.mensagemMentor||input.mentorMessage||'',days:daysIn.map((d,di)=>{const blocksIn=Array.isArray(d.blocks)?d.blocks:Array.isArray(d.blocos)?d.blocos:[];return{id:d.id||uid(),day:String(d.day||d.dia||`DIA ${di+1}`),date:String(d.date||d.data||''),review:String(d.review||d.revisao||''),disciplines:String(d.disciplines||d.disciplinas||''),metaDay:parsePtInt(d.metaDay||d.metaDia),blocks:blocksIn.map((b,bi)=>{const material=String(b.material||b.aula||''),questions=String(b.questions||b.questoes||'');return{id:b.id||uid(),number:n(b.number||b.numero||bi+1),discipline:String(b.discipline||b.disciplina||''),subject:String(b.subject||b.assunto||''),material,materialLink:String(b.materialLink||b.aulaLink||extractLink(material)||''),questions,questionLink:String(b.questionLink||b.questoesLink||extractLink(questions)||''),meta:parsePtInt(b.meta||b.goal||b.questoesMeta),type:b.type||b.tipo||'study'}})}})};
  }
  function parseMarkdown(raw){
    const text=String(raw||''),plan={title:'Planejamento importado',days:[]};
    const matches=[...text.matchAll(/^##\s*(?:✅\s*)?(.+?)(?:\s*[–-]\s*(.+))?$/gmi)];
    matches.forEach((m,i)=>{const start=m.index,end=matches[i+1]?.index??text.length,chunk=text.slice(start,end);const head=cleanMd(m[1]||''),date=cleanMd(m[2]||'');const review=(chunk.match(/\*\*Revisão:\*\*\s*(.+)/i)?.[1]||'').trim();const disciplines=(chunk.match(/\*\*Disciplina do dia:\*\*\s*(.+)/i)?.[1]||'').trim();const metaDay=parsePtInt(chunk.match(/\*\*Meta do dia:\*\*\s*(.+)/i)?.[1]||'');const bms=[...chunk.matchAll(/^###\s*Bloco\s*(\d+)\s*[–-]\s*(.+)$/gmi)],blocks=[];bms.forEach((bm,j)=>{const bs=bm.index,be=bms[j+1]?.index??chunk.length,bc=chunk.slice(bs,be);const materialRaw=(bc.match(/\*\*Material de apoio:\*\*\s*(.*)/i)?.[1]||'').trim();const questionsRaw=(bc.match(/\*\*Questões:\*\*\s*(.*)/i)?.[1]||'').trim();blocks.push({id:uid(),number:parsePtInt(bm[1]),discipline:cleanMd(bm[2]),subject:cleanMd(bc.match(/\*\*Assunto\s*:?[-]?\*\*\s*(.*)/i)?.[1]||''),material:cleanMd(materialRaw),materialLink:extractLink(materialRaw),questions:cleanMd(questionsRaw),questionLink:extractLink(questionsRaw),meta:parsePtInt(bc.match(/\*\*Meta:\*\*\s*(.*)/i)?.[1]||''),type:'study'});});if(!blocks.length&&/SÁBADO|REVISAO|REVISÃO/i.test(head))blocks.push({id:uid(),number:1,discipline:'Revisão geral',subject:'Refazer erros e revisar anotações.',meta:0,type:'review'});if(!blocks.length&&/DOMINGO|SIMULADO/i.test(head))blocks.push({id:uid(),number:1,discipline:'Simulado / Correção',subject:'Realizar ou corrigir simulado.',meta:0,type:'simulado'});plan.days.push({id:uid(),day:head,date,review,disciplines,metaDay,blocks});});
    return plan;
  }
  function parsePlan(raw){const t=String(raw||'').trim();if(!t)throw new Error('Planejamento vazio.');if(t.startsWith('{')||t.startsWith('[')){return normalizePlan(Array.isArray(JSON.parse(t))?{days:JSON.parse(t)}:JSON.parse(t))}return parseMarkdown(t)}
  function modelJSON(){return JSON.stringify({aluno:'Saldanha',concurso:'PRF',semana:'11/05 a 17/05',mentor:'Matheus G.',mensagemMentor:'Saldanha, sua missão PRF da semana foi carregada. Execute os blocos, registre questões e não acumule revisão.',days:[{day:'SEGUNDA-FEIRA',date:'11/05/2026',review:'Revisão dos erros da semana anterior.',disciplines:'Direito Constitucional + CTB',metaDay:100,blocks:[{number:1,discipline:'Direito Constitucional',subject:'Direitos fundamentais',material:'Aula/PDF',materialLink:'https://link-da-aula.com',questions:'QConcursos',questionLink:'https://link-das-questoes.com',meta:50,type:'study'}]}]},null,2)}
  function answerFor(q){return state.attempts.find(a=>a.question_id===q.id)}
  function progressFor(blockId){return state.planProgress.find(p=>p.block_id===blockId)}
  function stripBackupArtifacts(){
    document.querySelectorAll('a[href="#backup"],[data-section="backup"],[data-view="backup"]').forEach(el=>el.remove());
    const b=document.getElementById('backup');
    if(b) b.remove();
  }
  function ensureSections(){
    stripBackupArtifacts();
    const content=$('.content')||$('main'); if(!content) return;
    if(!$('#online-acesso')) content.insertAdjacentHTML('beforeend', sectionsHTML());
    setTimeout(bindAuthButtonsDirect,0);
  }
  
  function setOnlineTab(group,target){
    $$(`[data-online-tab="${group}"]`).forEach(btn=>btn.classList.toggle('active',btn.dataset.onlineTarget===target));
    $$(`[data-online-panel^="${group}:"]`).forEach(panel=>{
      const active=panel.dataset.onlinePanel===`${group}:${target}`;
      panel.hidden=!active;
      panel.classList.toggle('active',active);
    });
  }
function sectionsHTML(){return `
<section id="online-acesso" class="glass-card section-block online-pro-section online-shell-section">
  <div class="section-head">
    <div>
      <p class="eyebrow"><i class="fa-solid fa-user-shield"></i> Setor X Online</p>
      <h2>Acesso Online — alunos e mentor</h2>
      <span class="section-subtitle">Camada online integrada à base V30. O Setor X local permanece intacto; aqui ficam login, aprovação de alunos e perfil de ranking.</span>
    </div>
    <span id="online-status" class="online-status-pill off">Offline/local</span>
  </div>
  <div id="online-warning" class="online-warning" hidden>Configure <strong>assets/js/online-config.js</strong> com a URL e a chave pública do Supabase para ativar login, ranking e sincronização real.</div>
  <div class="online-tabs" role="tablist" aria-label="Acesso online">
    <button class="online-tab active" type="button" data-online-tab="online-acesso" data-online-target="auth"><i class="fa-solid fa-right-to-bracket"></i> Login do aluno</button>
    <button class="online-tab" type="button" data-online-tab="online-acesso" data-online-target="profile"><i class="fa-solid fa-id-card"></i> Perfil / apelido</button>
    <button class="online-tab online-mentor-tab" type="button" data-online-tab="online-acesso" data-online-target="students"><i class="fa-solid fa-user-check"></i> Liberação mentor</button>
  </div>
  <div class="online-tab-panel active" data-online-panel="online-acesso:auth">
    <div class="online-auth-layout">
      <form id="online-auth-form" class="online-panel online-form online-auth-panel">
        <div class="online-panel-title"><span>01</span><div><strong>Entrar ou criar acesso</strong><small>Conta individual. O mentor libera o acesso antes de o aluno usar a plataforma.</small></div></div>
        <label>Nome completo<input id="online-name" autocomplete="name" placeholder="Nome do aluno" /></label>
        <label>E-mail<input id="online-email" type="email" autocomplete="email" placeholder="aluno@email.com" /></label>
        <label>Senha<input id="online-pass" type="password" autocomplete="current-password" placeholder="mínimo 6 caracteres" /></label>
        <div class="online-actions"><button class="primary-btn" id="online-login" type="button"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button><button class="secondary-btn" id="online-signup" type="button"><i class="fa-solid fa-user-plus"></i> Criar acesso</button><button class="ghost-btn" id="online-logout" type="button"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sair</button></div>
        <p id="online-auth-state" class="online-auth-state info">Aguardando conexão.</p>
      </form>
      <aside class="online-login-brief">
        <div class="online-login-emblem"><img src="assets/images/setorx-emblema.png" alt="Setor X"></div>
        <p class="eyebrow">Acesso protegido</p>
        <h3>Setor X Online</h3>
        <span>Login, planejamento individual, Banco QX coletivo, ranking e patentes em ambiente restrito para alunos ativos.</span>
        <ul>
          <li><i class="fa-solid fa-lock"></i> Aluno pendente não acessa os módulos.</li>
          <li><i class="fa-solid fa-user-shield"></i> Mentor aprova ou bloqueia o acesso.</li>
          <li><i class="fa-solid fa-ranking-star"></i> Ranking aparece no Comando.</li>
        </ul>
      </aside>
    </div>
  </div>
  <div class="online-tab-panel" data-online-panel="online-acesso:profile" hidden>
    <form id="online-profile-form" class="online-panel online-form">
      <div class="online-panel-title"><span>02</span><div><strong>Perfil do ranking</strong><small>O aluno escolhe apelido/codinome; você também pode ajustar depois.</small></div></div>
      <label>Apelido / codinome<input id="online-nickname" placeholder="Ex: Caveira 01" /></label>
      <label>Concurso-alvo<input id="online-contest-target" placeholder="Ex: PRF" /></label>
      <div class="online-actions"><button class="primary-btn" type="submit">Salvar perfil</button></div>
      <p class="muted">O apelido aparece no ranking geral. Se ficar vazio, aparece o nome do usuário.</p>
    </form>
  </div>
  <div class="online-tab-panel" data-online-panel="online-acesso:students" hidden>
    <div id="online-mentor-panel" class="online-panel" hidden>
      <div class="online-panel-title"><span>03</span><div><strong>Painel do mentor — liberação dos alunos</strong><small>Aprovar, deixar pendente ou bloquear aluno. Não há separação por turmas.</small></div></div>
      <div id="online-students" class="online-list online-students-list"></div>
    </div>
  </div>
</section>
<section id="online-planejamento" class="glass-card section-block online-pro-section online-shell-section">
  <div class="section-head">
    <div>
      <p class="eyebrow"><i class="fa-solid fa-clipboard-list"></i> Planejamentos individuais</p>
      <h2>Planejamento Online — individual por aluno</h2>
      <span class="section-subtitle">Separado da área local de Planejamento. O mentor importa o plano de cada aluno e cada aluno visualiza apenas o próprio plano.</span>
    </div>
  </div>
  <div class="online-tabs" role="tablist" aria-label="Planejamento online">
    <button class="online-tab active" type="button" data-online-tab="online-planejamento" data-online-target="myplan"><i class="fa-solid fa-list-check"></i> Plano do aluno</button>
    <button class="online-tab online-mentor-tab" type="button" data-online-tab="online-planejamento" data-online-target="import"><i class="fa-solid fa-file-import"></i> Importar para aluno</button>
  </div>
  <div class="online-tab-panel active" data-online-panel="online-planejamento:myplan">
    <div class="online-panel">
      <div class="online-panel-title"><span>01</span><div><strong>Planejamento do aluno logado</strong><small>Missão semanal importada pelo mentor.</small></div></div>
      <div id="online-my-plan" class="online-list online-plan-list"></div>
    </div>
  </div>
  <div class="online-tab-panel" data-online-panel="online-planejamento:import" hidden>
    <form id="online-plan-import" class="online-panel online-form">
      <div class="online-panel-title"><span>02</span><div><strong>Importação individual do mentor</strong><small>Selecione o aluno, cole JSON/Markdown e salve. O plano não aparece para outros alunos.</small></div></div>
      <label>Aluno<select id="online-plan-student"></select></label>
      <div class="online-actions"><button id="online-plan-model" class="ghost-btn" type="button">Modelo JSON</button><button id="online-plan-file-btn" class="secondary-btn" type="button">Importar arquivo</button><input id="online-plan-file" type="file" hidden accept=".json,.md,.markdown,.txt" /></div>
      <label>Planejamento JSON ou Markdown<textarea id="online-plan-raw" rows="14" placeholder="Cole aqui o planejamento exportado pelo seu programa..."></textarea></label>
      <button class="primary-btn" type="submit">Salvar para o aluno</button>
    </form>
  </div>
</section>
<section id="online-qx" class="glass-card section-block online-pro-section qx-section online-shell-section">
  <div class="section-head">
    <div>
      <p class="eyebrow"><i class="fa-solid fa-users-viewfinder"></i> Banco QX Coletivo</p>
      <h2>QX Coletivo — questões da mentoria</h2>
      <span class="section-subtitle">Separado do Banco QX local. Mantém o modelo de modo prova, gabarito bloqueado, comentário após resposta e revisão.</span>
    </div>
  </div>
  <div class="online-tabs" role="tablist" aria-label="Banco QX coletivo">
    <button class="online-tab active" type="button" data-online-tab="online-qx" data-online-target="resolve"><i class="fa-solid fa-circle-question"></i> Resolver</button>
    <button class="online-tab online-mentor-tab" type="button" data-online-tab="online-qx" data-online-target="create"><i class="fa-solid fa-plus"></i> Cadastrar questão</button>
  </div>
  <div class="online-tab-panel active" data-online-panel="online-qx:resolve">
    <div class="online-qx-layout"><div class="online-panel online-form"><label>Disciplina / assunto<input id="online-qx-filter" placeholder="Filtrar disciplina/assunto" /></label><div id="online-qx-list" class="online-list"></div></div><article id="online-qx-card" class="online-panel online-question-card"></article></div>
  </div>
  <div class="online-tab-panel" data-online-panel="online-qx:create" hidden>
    <form id="online-qx-create" class="online-panel online-form" hidden>
      <div class="online-panel-title"><span>01</span><div><strong>Cadastrar questão coletiva</strong><small>A questão fica disponível para todos os alunos ativos.</small></div></div>
      <div class="online-grid"><label>Disciplina<input id="online-q-discipline" /></label><label>Assunto<input id="online-q-subject" /></label></div>
      <div class="online-grid"><label>Tipo<select id="online-q-type"><option value="ce">Certo/Errado</option><option value="mc">Múltipla escolha</option></select></label><label>Gabarito<input id="online-q-answer" placeholder="Certo, Errado, A, B..." /></label></div>
      <label>Enunciado<textarea id="online-q-statement" rows="5"></textarea></label>
      <label>Alternativas<textarea id="online-q-options" rows="4" placeholder="A) ...\nB) ..."></textarea></label>
      <label>Comentário do professor<textarea id="online-q-comment" rows="4"></textarea></label>
      <button class="primary-btn" type="submit">Publicar questão coletiva</button>
    </form>
  </div>
</section>
<section id="online-ranking" class="glass-card section-block online-pro-section online-shell-section">
  <div class="section-head"><div><p class="eyebrow"><i class="fa-solid fa-trophy"></i> Ranking geral</p><h2>Ranking de patentes da mentoria</h2><span class="section-subtitle">Usa as imagens de patentes já criadas no Setor X. O ranking é geral, sem separar poucos alunos.</span></div></div>
  <div id="online-my-rank" class="online-rank-hero"></div><div id="online-ranking-list" class="online-list"></div>
</section>`}
  function renderOnlineAll(){notifyAuthChange();
    ensureSections();
    const configured=isConfigured();
    const configError=supabaseConfigError();
    $('#online-warning') && ($('#online-warning').hidden=configured); if($('#online-warning') && configError) $('#online-warning').innerHTML=configError;
    const st=$('#online-status'); if(st){st.classList.toggle('off',!configured); st.textContent=configured?(user?`Online: ${profile?.full_name||user.email}`:'Supabase conectado'):'Offline/local';}
    const auth=$('#online-auth-state'); if(auth) auth.textContent=!configured?configError:!user?'Entre ou crie acesso.': profile?.status==='pending'?'Acesso pendente: aguarde liberação do mentor.': profile?.status==='blocked'?'Acesso bloqueado.':`Logado como ${profile?.role==='mentor'?'mentor':'aluno'} — ${profile?.status||'ativo'}`;
    $('#online-mentor-panel') && ($('#online-mentor-panel').hidden=!isMentor());
    $('#online-qx-create') && ($('#online-qx-create').hidden=!isMentor());
    $$('.online-mentor-tab').forEach(btn=>btn.hidden=!isMentor());
    if(!isMentor()){
      const acc=document.querySelector('[data-online-panel="online-acesso:students"]'); if(acc && !acc.hidden) setOnlineTab('online-acesso','auth');
      const imp=document.querySelector('[data-online-panel="online-planejamento:import"]'); if(imp && !imp.hidden) setOnlineTab('online-planejamento','myplan');
      const cr=document.querySelector('[data-online-panel="online-qx:create"]'); if(cr && !cr.hidden) setOnlineTab('online-qx','resolve');
    }
    renderStudents(); renderPlanSelect(); renderMyPlan(); renderQX(); renderRanking(); fillProfileForm(); bindAuthButtonsDirect();
  }
  function fillProfileForm(){ if(!profile)return; const nn=$('#online-nickname'),ct=$('#online-contest-target'); if(nn&&!nn.dataset.dirty)nn.value=profile.nickname||''; if(ct&&!ct.dataset.dirty)ct.value=profile.contest_target||''; }
  function renderStudents(){const box=$('#online-students'); if(!box)return; box.innerHTML=(state.students||[]).map(s=>`<div class="online-student-card"><strong>${esc(s.full_name||s.email)}</strong><span>${esc(s.email)} • ${esc(s.status||'pending')} • ${esc(s.contest_target||'sem concurso')}</span><div class="online-actions" style="margin-top:8px"><button class="secondary-btn small" data-online-activate="${s.id}">Ativar</button><button class="ghost-btn small" data-online-pending="${s.id}">Pendente</button><button class="online-danger ghost-btn small" data-online-block="${s.id}">Bloquear</button></div></div>`).join('')||'<p class="muted">Nenhum aluno encontrado.</p>'}
  function renderPlanSelect(){const sel=$('#online-plan-student'); if(!sel)return; sel.innerHTML=(state.students||[]).filter(s=>s.role!=='mentor').map(s=>`<option value="${s.id}">${esc(s.full_name||s.email)} — ${esc(s.email)}</option>`).join('')||'<option value="">Nenhum aluno ativo</option>'}
  function renderMyPlan(){const box=$('#online-my-plan'); if(!box)return; const plan=state.myPlan?.plan_json; if(!plan){box.innerHTML='<p class="muted">Nenhum planejamento online carregado para este aluno.</p>';return} box.innerHTML=`<div class="online-plan-card"><strong>${esc(plan.concurso||state.myPlan.contest||'Planejamento')}</strong><span>${esc(plan.semana||state.myPlan.week_label||'')}<br>${esc(plan.mensagemMentor||state.myPlan.mentor_message||'')}</span></div>`+(plan.days||[]).map(day=>`<article class="online-plan-day"><div class="online-plan-day-head"><div><strong>${esc(day.day)} ${day.date?'• '+esc(day.date):''}</strong><span>${esc(day.disciplines||day.review||'Operação do dia')}</span></div><span class="online-chip">${(day.blocks||[]).reduce((a,b)=>a+n(b.meta),0)||n(day.metaDay)} questões</span></div><div class="online-plan-day-body">${day.review?`<div class="online-comment"><strong>Revisão:</strong> ${esc(day.review)}</div>`:''}${(day.blocks||[]).map(block=>{const pg=progressFor(block.id);return`<div class="online-plan-block ${pg?.completed?'done':''}"><button class="online-check" data-online-block="${esc(block.id)}">${pg?.completed?'✓':'○'}</button><div><strong>Bloco ${esc(block.number)} — ${esc(block.discipline||'Disciplina')}</strong><p class="muted">${esc(block.subject||'')}</p><div class="online-mini-tools"><span class="online-chip">Meta: ${n(block.meta)}</span>${block.materialLink?`<a class="online-chip link" target="_blank" href="${esc(block.materialLink)}">Aula/material</a>`:''}${block.questionLink?`<a class="online-chip link" target="_blank" href="${esc(block.questionLink)}">Questões</a>`:''}${pg?`<span class="online-chip">Feitas: ${n(pg.done_questions)}</span>`:''}</div></div><div class="online-actions"><button class="secondary-btn small" data-online-register-block="${esc(block.id)}">Registrar</button></div></div>`}).join('')}</div></article>`).join('')}
  function filteredQuestions(){const f=($('#online-qx-filter')?.value||'').toLowerCase();return (state.questions||[]).filter(q=>!f||`${q.discipline} ${q.subject} ${q.statement}`.toLowerCase().includes(f))}
  function renderQX(){const list=filteredQuestions();const box=$('#online-qx-list'),card=$('#online-qx-card'); if(!box||!card)return; if(!state.activeQ&&list[0])state.activeQ=list[0].id; box.innerHTML=list.map(q=>{const a=answerFor(q);return`<div class="online-qx-list-item ${q.id===state.activeQ?'active':''}" data-online-q="${q.id}"><strong>${esc(q.discipline)}</strong><span>${esc(q.subject||'')} • ${a?(a.is_correct?'Acertada':'Errada'):'Não respondida'}</span></div>`}).join('')||'<p class="muted">Nenhuma questão coletiva encontrada.</p>'; const q=(state.questions||[]).find(x=>x.id===state.activeQ)||list[0]; if(!q){card.innerHTML='<div class="online-locked">O mentor ainda não cadastrou questões coletivas.</div>';return} const a=answerFor(q), answered=!!a; const opts=q.type==='ce'?['Certo','Errado']:(String(q.options||'').split(/\n+/).filter(Boolean).length?String(q.options||'').split(/\n+/).filter(Boolean):['A','B','C','D','E']); card.innerHTML=`<p class="eyebrow">Banco QX Coletivo</p><h2>${esc(q.discipline)}</h2><p class="muted">${esc(q.subject||'')}</p><div class="online-comment"><strong>Enunciado</strong><br>${esc(q.statement)}</div><div class="online-answer-list">${opts.map(o=>`<button class="online-answer ${state.answer===o?'selected':''} ${answered&&String(o).trim().toLowerCase()===String(q.answer).trim().toLowerCase()?'correct':''} ${answered&&String(o).trim().toLowerCase()===String(a.answer).trim().toLowerCase()&&!a.is_correct?'wrong':''}" data-online-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div>${answered?`<div class="online-comment"><strong>${a.is_correct?'Você acertou.':'Você errou.'}</strong><br>Gabarito: ${esc(q.answer)}<br><br>${esc(q.comment||'Sem comentário do professor.')}<br><br>Próxima revisão: ${esc(a.next_review||'--')}</div>`:`<button id="online-answer-btn" class="primary-btn" type="button">Responder questão</button><div class="online-locked" style="margin-top:12px">Responda para liberar gabarito, comentário e revisão.</div>`}`}
  function renderRanking(){
    const currentXP=n(profile?.xp_total);
    const my=rankForXP(currentXP);
    const hero=$('#online-my-rank'),list=$('#online-ranking-list');
    if(hero) hero.innerHTML=`<img src="${my.img}" alt="${esc(my.title)}"><div><p class="eyebrow">Minha patente online</p><h3>${esc(my.title)}</h3><span>${currentXP} XP • ${esc(profile?.nickname||profile?.full_name||'Aluno')}</span>${state.lastError?`<small class="rank-sync-error">Diagnóstico: ${esc(state.lastError)}</small>`:""}</div>`;
    if(list){
      const ranked=(state.ranking||[]).slice().sort((a,b)=>n(b.xp_total)-n(a.xp_total));
      list.innerHTML=ranked.map((r,i)=>{const rk=rankForXP(n(r.xp_total));return`<div class="online-rank-row ${r.id===user?.id?'me':''}"><div class="online-rank-pos">${i+1}</div><img class="online-rank-img" src="${rk.img}" alt="${esc(rk.title)}"><div><strong>${esc(r.nickname||r.full_name||'Aluno')} — ${esc(rk.title)}</strong><span>${esc(r.contest_target||'Setor X')} ${r.id===user?.id?'• você':''}</span></div><div class="online-rank-xp">${n(r.xp_total)} XP</div></div>`}).join('')||'<p class="muted">Ranking vazio. Ganhe XP concluindo blocos ou respondendo questões.</p>';
    }
  }
  function setAuthMessage(msg,type='info'){
    const box=$('#online-auth-state');
    if(box){
      box.textContent=msg;
      box.className=`online-auth-state ${type}`;
    }
    console.log('[Setor X Online]',msg);
  }
  function setAuthBusy(isBusy){
    ['online-login','online-signup','online-logout'].forEach(id=>{
      const btn=document.getElementById(id);
      if(btn) btn.disabled=!!isBusy;
    });
  }
  function bindAuthButtonsDirect(){
    const loginBtn=document.getElementById('online-login');
    const signupBtn=document.getElementById('online-signup');
    const logoutBtn=document.getElementById('online-logout');
    if(loginBtn && !loginBtn.dataset.bound){
      loginBtn.dataset.bound='1';
      loginBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();login();});
    }
    if(signupBtn && !signupBtn.dataset.bound){
      signupBtn.dataset.bound='1';
      signupBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();signup();});
    }
    if(logoutBtn && !logoutBtn.dataset.bound){
      logoutBtn.dataset.bound='1';
      logoutBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();logout();});
    }
    const form=document.getElementById('online-auth-form');
    if(form && !form.dataset.bound){
      form.dataset.bound='1';
      form.addEventListener('submit',e=>{e.preventDefault();login();});
    }
  }
  async function signup(){
    setAuthMessage('Processando criação de acesso...','info');
    if(!sb){setAuthMessage(supabaseConfigError()||'Supabase não configurado.','error'); return;}
    const email=$('#online-email')?.value.trim()||'',password=$('#online-pass')?.value||'',name=$('#online-name')?.value.trim()||'';
    if(!email||!password){setAuthMessage('Informe e-mail e senha para criar acesso.','error');return;}
    if(password.length<6){setAuthMessage('A senha precisa ter pelo menos 6 caracteres.','error');return;}
    try{
      setAuthBusy(true);
      const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name}}});
      if(error){
        const msg=String(error.message||'');
        if(msg.toLowerCase().includes('invalid path')) setAuthMessage('URL do Supabase inválida. Abra assets/js/online-config.js e use somente https://SEU-PROJECT-REF.supabase.co. Não use URL do dashboard, /auth/v1 ou /rest/v1.','error');
        else setAuthMessage(msg,'error');
        return;
      }
      setAuthMessage('Acesso criado. Agora aguarde a liberação do mentor. Se o Supabase exigir confirmação, confirme o e-mail.','success');
      const {data:sessionData}=await sb.auth.getSession();
      session=sessionData.session; user=session?.user||data?.user||null;
      if(user) await loadAll(); else renderOnlineAll();
    }catch(err){
      setAuthMessage(err?.message||'Erro inesperado ao criar acesso.','error');
    }finally{
      setAuthBusy(false);
    }
  }
  async function login(){
    setAuthMessage('Entrando...','info');
    if(!sb){setAuthMessage(supabaseConfigError()||'Supabase não configurado.','error'); return;}
    const email=$('#online-email')?.value.trim()||'',password=$('#online-pass')?.value||'';
    if(!email||!password){setAuthMessage('Informe e-mail e senha para entrar.','error');return;}
    try{
      setAuthBusy(true);
      const {data,error}=await sb.auth.signInWithPassword({email,password});
      if(error){
        const msg=String(error.message||'');
        if(msg.toLowerCase().includes('invalid path')) setAuthMessage('URL do Supabase inválida. Abra assets/js/online-config.js e use somente https://SEU-PROJECT-REF.supabase.co. Não use URL do dashboard, /auth/v1 ou /rest/v1.','error');
        else setAuthMessage(msg,'error');
        return;
      }
      session=data.session; user=data.user;
      setAuthMessage('Login realizado. Carregando sua área...','success');
      await loadAll();
    }catch(err){
      setAuthMessage(err?.message||'Erro inesperado ao entrar.','error');
    }finally{
      setAuthBusy(false);
    }
  }
  async function logout(){
    try{
      setAuthBusy(true);
      if(sb) await sb.auth.signOut();
      session=null; user=null; profile=null;
      setAuthMessage('Você saiu da plataforma.','info');
      renderOnlineAll();
      notifyAuthChange();
    }catch(err){
      setAuthMessage(err?.message||'Erro ao sair.','error');
    }finally{
      setAuthBusy(false);
    }
  }
  async function saveProfile(e){e.preventDefault(); if(!sb||!user)return toast('Entre no acesso online.'); const payload={nickname:$('#online-nickname').value.trim(),contest_target:$('#online-contest-target').value.trim()}; const {error}=await sb.from('profiles').update(payload).eq('id',user.id); if(error)return toast(error.message); profile={...profile,...payload}; toast('Perfil salvo.'); await loadAll();}
  async function setStudent(id,status){if(!isMentor())return; const {error}=await sb.from('profiles').update({status,active:status==='active'}).eq('id',id); if(error)return toast(error.message); await loadAll();}
  async function savePlan(e){e.preventDefault(); if(!isMentor())return toast('Apenas mentor.'); const sid=$('#online-plan-student').value; if(!sid)return toast('Selecione um aluno.'); let plan; try{plan=parsePlan($('#online-plan-raw').value)}catch(err){return toast(err.message)} if(!(plan.days||[]).length)return toast('Não encontrei dias/blocos no planejamento.'); const payload={user_id:sid,mentor_id:user.id,contest:plan.concurso||'',week_label:plan.semana||'',mentor_message:plan.mensagemMentor||'',plan_json:plan}; const {error}=await sb.from('individual_plans').insert(payload); if(error)return toast(error.message); toast('Planejamento salvo para o aluno.'); $('#online-plan-raw').value=''; await loadAll();}
  async function markBlock(blockId){if(!sb||!user||!state.myPlan)return; const existing=progressFor(blockId); const payload={user_id:user.id,plan_id:state.myPlan.id,block_id:blockId,completed:!existing?.completed,done_questions:n(existing?.done_questions),correct:n(existing?.correct),wrong:n(existing?.wrong),updated_at:new Date().toISOString()}; const {error}=await sb.from('plan_progress').upsert(payload,{onConflict:'user_id,plan_id,block_id'}); if(error)return toast(error.message); if(payload.completed) await addXP(20,'Bloco do planejamento concluído'); await loadAll();}
  async function registerBlock(blockId){if(!sb||!user||!state.myPlan)return; const done=parseInt(prompt('Questões feitas neste bloco:', progressFor(blockId)?.done_questions||0)||'0',10); const correct=parseInt(prompt('Acertos:', progressFor(blockId)?.correct||0)||'0',10); const wrong=parseInt(prompt('Erros:', progressFor(blockId)?.wrong||0)||'0',10); const payload={user_id:user.id,plan_id:state.myPlan.id,block_id:blockId,completed:true,done_questions:done,correct,wrong,updated_at:new Date().toISOString()}; const {error}=await sb.from('plan_progress').upsert(payload,{onConflict:'user_id,plan_id,block_id'}); if(error)return toast(error.message); await addXP(Math.min(40,Math.max(10,done)), 'Questões registradas no planejamento'); await loadAll();}
  async function saveQuestion(e){e.preventDefault(); if(!isMentor())return toast('Apenas mentor.'); const payload={owner_id:user.id,is_public:true,discipline:$('#online-q-discipline').value.trim(),subject:$('#online-q-subject').value.trim(),type:$('#online-q-type').value,statement:$('#online-q-statement').value.trim(),options:$('#online-q-options').value.trim(),answer:$('#online-q-answer').value.trim(),comment:$('#online-q-comment').value.trim()}; if(!payload.discipline||!payload.statement||!payload.answer)return toast('Preencha disciplina, enunciado e gabarito.'); const {error}=await sb.from('collective_questions').insert(payload); if(error)return toast(error.message); toast('Questão coletiva publicada.'); e.target.reset(); await loadAll();}
  async function answerQ(){const q=(state.questions||[]).find(x=>x.id===state.activeQ); if(!q||!state.answer)return toast('Selecione a resposta.'); const ok=String(state.answer).trim().toLowerCase()===String(q.answer).trim().toLowerCase(); const payload={user_id:user.id,question_id:q.id,answer:state.answer,is_correct:ok,next_review:addDays(ok?3:1),attempts:(answerFor(q)?.attempts||0)+1,updated_at:new Date().toISOString()}; const {error}=await sb.from('collective_attempts').upsert(payload,{onConflict:'user_id,question_id'}); if(error)return toast(error.message); await addXP(ok?12:5, ok?'Questão coletiva acertada':'Questão coletiva respondida'); state.answer=null; await loadAll();}
  function bindOnline(){
    document.addEventListener('click',e=>{
      const t=e.target;
      const tab=t.closest('[data-online-tab][data-online-target]'); if(tab){setOnlineTab(tab.dataset.onlineTab,tab.dataset.onlineTarget);return;}
      if(t.closest('#online-login')) login();
      if(t.closest('#online-signup')) signup();
      if(t.closest('#online-logout')) logout();
      const act=t.closest('[data-online-activate]'); if(act)setStudent(act.dataset.onlineActivate,'active');
      const pend=t.closest('[data-online-pending]'); if(pend)setStudent(pend.dataset.onlinePending,'pending');
      const blk=t.closest('[data-online-block]'); if(blk)setStudent(blk.dataset.onlineBlock,'blocked');
      if(t.closest('#online-plan-model')){$('#online-plan-raw').value=modelJSON();}
      if(t.closest('#online-plan-file-btn')){$('#online-plan-file').click();}
      const b=t.closest('[data-online-block]'); if(b)markBlock(b.dataset.onlineBlock);
      const rb=t.closest('[data-online-register-block]'); if(rb)registerBlock(rb.dataset.onlineRegisterBlock);
      const qi=t.closest('[data-online-q]'); if(qi){state.activeQ=qi.dataset.onlineQ;state.answer=null;renderQX();}
      const ans=t.closest('[data-online-answer]'); if(ans){state.answer=ans.dataset.onlineAnswer;renderQX();}
      if(t.closest('#online-answer-btn'))answerQ();
    });
    document.addEventListener('input',e=>{ if(e.target.id==='online-qx-filter')renderQX(); if(e.target.id==='online-nickname'||e.target.id==='online-contest-target')e.target.dataset.dirty='1'; });
    document.addEventListener('change',async e=>{ if(e.target.id==='online-plan-file'){const f=e.target.files?.[0]; if(f)$('#online-plan-raw').value=await f.text(); e.target.value='';} });
    document.addEventListener('submit',e=>{ if(e.target.id==='online-profile-form')saveProfile(e); if(e.target.id==='online-plan-import')savePlan(e); if(e.target.id==='online-qx-create')saveQuestion(e); });
  }
  function bootOnlinePro(){
    ensureSections();
    bindOnline();
    bindAuthButtonsDirect();
    initSupabase();
    renderOnlineAll();
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', bootOnlinePro, {once:true});
  }else{
    bootOnlinePro();
  }
})();
