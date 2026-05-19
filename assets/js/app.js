(() => {
  "use strict";
  const STORAGE_KEY = "setorX.v4.refinado";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const todayKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  };
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const n = (v, f = 0) => Number.isFinite(Number(String(v).replace(",", "."))) ? Number(String(v).replace(",", ".")) : f;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  const parsePtInt = (v) => Math.max(0, parseInt(String(v || "").replace(/\D/g, ""), 10) || 0);
  const fmtInt = (v) => Math.round(n(v)).toLocaleString("pt-BR");
  const fmtDate = (d) => d && d.includes("-") ? d.split("-").reverse().join("/") : "--/--/----";
  const addDays = (dateKey, days) => {
    const [y,m,dn] = String(dateKey || todayKey()).split("-").map(Number);
    const d = new Date(y || new Date().getFullYear(), (m || 1)-1, dn || new Date().getDate(), 12, 0, 0);
    d.setDate(d.getDate() + Number(days || 0));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
  const daysUntil = (dateKey) => dateKey ? Math.max(0, Math.ceil((new Date(`${dateKey}T00:00:00`) - new Date(`${todayKey()}T00:00:00`)) / 86400000)) : 0;
  const fmtMinutes = (m) => { const t = Math.max(0, Math.floor(n(m))); return `${String(Math.floor(t / 60)).padStart(2, "0")}h ${String(t % 60).padStart(2, "0")}m`; };
  const setText = (sel, val) => { const el = $(sel); if (el) el.textContent = val; };

  const defaultSubjects = [
    { id: uid(), name: "Português", weight: 3, topics: "Interpretação, gramática, coesão, coerência" },
    { id: uid(), name: "Direito Constitucional", weight: 3, topics: "Art. 5º, administração pública, segurança pública" },
    { id: uid(), name: "Direito Administrativo", weight: 3, topics: "Atos, poderes, responsabilidade, licitações" },
    { id: uid(), name: "Direito Penal", weight: 2, topics: "Parte geral, crimes contra pessoa, patrimônio, fé pública" },
    { id: uid(), name: "Processo Penal", weight: 2, topics: "Inquérito, prisão, provas e ação penal" },
    { id: uid(), name: "Legislação Especial", weight: 2, topics: "Drogas, Maria da Penha, ECA, Desarmamento" },
    { id: uid(), name: "Informática", weight: 2, topics: "Segurança, redes, nuvem e sistemas" },
    { id: uid(), name: "CTB", weight: 2, topics: "Normas gerais, infrações, penalidades" }
  ];


  const contestPresets = {
    custom: { label:"Personalizado / manual", board:"", type:"Misto", subjects:null },
    prf: {
      label:"PRF — Policial Rodoviário Federal", board:"CEBRASPE", type:"Certo/Errado",
      subjects:[
        ["Língua Portuguesa",4,"Compreensão e interpretação de textos, gêneros, ortografia, coesão, morfossintaxe, pontuação, concordância, regência, crase, colocação pronominal, reescrita e correspondência oficial"],
        ["Raciocínio Lógico-Matemático",3,"Modelagem de situações-problema, proposições, conectivos, equivalências, lógica de argumentação, conjuntos, porcentagem, sequências, análise combinatória e probabilidade"],
        ["Informática",3,"Internet, intranet, segurança da informação, aplicativos, sistemas operacionais, redes, computação em nuvem e ferramentas de produtividade"],
        ["Física",2,"Cinemática, dinâmica, trabalho e energia, potência, impulso, quantidade de movimento, gravitação, ondas, óptica, eletricidade e magnetismo"],
        ["Ética e Cidadania",2,"Ética no serviço público, cidadania, direitos e deveres, moralidade administrativa e conduta funcional"],
        ["Geopolítica Brasileira",2,"Formação territorial, dinâmica populacional, urbanização, industrialização, agricultura, transportes, energia, meio ambiente e integração nacional"],
        ["Língua Estrangeira",1,"Inglês ou Espanhol: compreensão de textos, vocabulário, estruturas gramaticais e interpretação"],
        ["Legislação de Trânsito",5,"Código de Trânsito Brasileiro, normas gerais, sinalização, infrações, penalidades, medidas administrativas, processo administrativo, crimes de trânsito e resoluções"],
        ["Direito Administrativo",3,"Administração pública, atos administrativos, poderes, responsabilidade civil do Estado, agentes públicos, controle, licitações e contratos"],
        ["Direito Constitucional",3,"Direitos e garantias fundamentais, organização do Estado, administração pública, segurança pública e ordem social"],
        ["Direito Penal",3,"Parte geral, crimes contra a pessoa, patrimônio, fé pública, administração pública e crimes em espécie relevantes"],
        ["Direito Processual Penal",3,"Inquérito policial, ação penal, competência, provas, prisões, liberdade provisória e procedimentos"],
        ["Legislação Especial",3,"Abuso de autoridade, drogas, desarmamento, crimes hediondos, tortura, organizações criminosas, lavagem de dinheiro, interceptação telefônica e temas correlatos"],
        ["Direitos Humanos e Cidadania",2,"Teoria geral dos direitos humanos, tratados, sistema global e interamericano, direitos fundamentais, cidadania e atuação policial"]
      ]
    },
    "pf-agente-2025": {
      label:"PF 2025 — Agente", board:"CEBRASPE", type:"Certo/Errado",
      subjects:[
        ["Língua Portuguesa",4,"Compreensão e interpretação de textos, tipologia e gêneros textuais, ortografia, semântica, morfossintaxe, pontuação, concordância, regência, crase, coesão, reescrita e redação oficial"],
        ["Noções de Direito Administrativo",3,"Administração pública, atos administrativos, poderes administrativos, agentes públicos, responsabilidade civil do Estado, controle da Administração e licitações"],
        ["Noções de Direito Constitucional",3,"Direitos e garantias fundamentais, organização do Estado, administração pública, defesa do Estado e segurança pública"],
        ["Noções de Direito Penal e Processo Penal",3,"Parte geral, crimes em espécie, inquérito policial, ação penal, competência, provas, prisões e procedimentos"],
        ["Direitos Humanos e Cidadania",2,"Teoria geral dos direitos humanos, tratados internacionais, sistema global e interamericano, cidadania e atuação policial"],
        ["Legislação Especial",3,"Drogas, armas, lavagem de dinheiro, organizações criminosas, abuso de autoridade, tortura, interceptação telefônica, identificação criminal e temas correlatos"],
        ["Estatística",3,"Estatística descritiva, probabilidade, distribuições, amostragem, inferência, testes de hipóteses e análise de dados"],
        ["Raciocínio Lógico",3,"Estruturas lógicas, proposições, conectivos, equivalências, lógica de argumentação, conjuntos, problemas e raciocínio matemático"],
        ["Informática",5,"Redes, segurança da informação, sistemas operacionais, banco de dados, Python, Linux, cloud, APIs, mineração de dados e inteligência artificial/aprendizado de máquina"],
        ["Contabilidade Geral",3,"Patrimônio, contas, lançamentos, demonstrações contábeis, balanço patrimonial, DRE e escrituração"]
      ]
    },
    "pf-escrivao-2025": {
      label:"PF 2025 — Escrivão", board:"CEBRASPE", type:"Certo/Errado",
      subjects:[
        ["Língua Portuguesa",4,"Compreensão e interpretação de textos, tipologia e gêneros textuais, ortografia, semântica, morfossintaxe, pontuação, concordância, regência, crase, coesão, reescrita e redação oficial"],
        ["Noções de Direito Administrativo",3,"Administração pública, atos administrativos, poderes administrativos, agentes públicos, responsabilidade civil do Estado, controle da Administração e licitações"],
        ["Noções de Direito Constitucional",3,"Direitos e garantias fundamentais, organização do Estado, administração pública, defesa do Estado e segurança pública"],
        ["Noções de Direito Penal e Processo Penal",3,"Parte geral, crimes em espécie, inquérito policial, ação penal, competência, provas, prisões e procedimentos"],
        ["Direitos Humanos e Cidadania",2,"Teoria geral dos direitos humanos, tratados internacionais, sistema global e interamericano, cidadania e atuação policial"],
        ["Legislação Especial",3,"Drogas, armas, lavagem de dinheiro, organizações criminosas, abuso de autoridade, tortura, interceptação telefônica, identificação criminal e temas correlatos"],
        ["Estatística",3,"Estatística descritiva, probabilidade, distribuições, amostragem, inferência, testes de hipóteses e análise de dados"],
        ["Raciocínio Lógico",3,"Estruturas lógicas, proposições, conectivos, equivalências, lógica de argumentação, conjuntos, problemas e raciocínio matemático"],
        ["Informática",5,"Redes, segurança da informação, sistemas operacionais, banco de dados, Python, Linux, cloud, APIs, mineração de dados e inteligência artificial/aprendizado de máquina"],
        ["Contabilidade Geral",3,"Patrimônio, contas, lançamentos, demonstrações contábeis, balanço patrimonial, DRE e escrituração"],
        ["Arquivologia",3,"Gestão de documentos, protocolo, classificação, tabela de temporalidade, arquivo corrente, intermediário e permanente, preservação e legislação arquivística"]
      ]
    },
    "pf-agente": {
      label:"PF — Agente / Escrivão / Papiloscopista", board:"CEBRASPE", type:"Certo/Errado",
      subjects:[
        ["Português",3,"Compreensão, reescrita, gramática e coesão"],
        ["Informática",3,"Redes, segurança, banco de dados, sistemas"],
        ["Raciocínio Lógico/Estatística",2,"Lógica, probabilidade, estatística básica"],
        ["Direito Constitucional",3,"Direitos fundamentais, segurança pública, administração"],
        ["Direito Administrativo",3,"Atos, poderes, licitações, responsabilidade"],
        ["Direito Penal",3,"Parte geral, crimes contra administração e pessoa"],
        ["Processo Penal",3,"Inquérito, prova, prisão, competência"],
        ["Legislação Especial",3,"Drogas, armas, lavagem, organizações criminosas, abuso"],
        ["Contabilidade/Arquivologia",1,"Tópicos específicos conforme cargo e edital"]
      ]
    },
    "pc-delegado": {
      label:"Polícia Civil — Delegado", board:"Banca variável", type:"Múltipla escolha",
      subjects:[
        ["Direito Constitucional",3,"Controle, direitos fundamentais, segurança pública"],
        ["Direito Administrativo",3,"Atos, poderes, agentes, improbidade, licitações"],
        ["Direito Penal",4,"Parte geral e especial, crimes em espécie"],
        ["Processo Penal",4,"Inquérito, ação, provas, prisões, procedimentos"],
        ["Direito Civil",2,"LINDB, pessoas, bens, responsabilidade civil"],
        ["Processo Civil",1,"Princípios, jurisdição, tutela, recursos básicos"],
        ["Criminologia",2,"Teorias, vitimologia, controle social"],
        ["Medicina Legal",2,"Traumatologia, sexologia, tanatologia, perícias"],
        ["Legislação Especial",3,"Drogas, armas, tortura, organizações, lavagem"],
        ["Direitos Humanos",2,"Tratados, sistema internacional, segurança pública"]
      ]
    },
    "pc-investigador": {
      label:"Polícia Civil — Investigador / Agente", board:"Banca variável", type:"Múltipla escolha",
      subjects:[
        ["Português",3,"Interpretação, gramática, redação oficial"],
        ["Raciocínio Lógico",2,"Lógica, problemas, porcentagem"],
        ["Informática",2,"Sistemas, segurança, redes"],
        ["Direito Constitucional",3,"Direitos fundamentais, segurança pública"],
        ["Direito Administrativo",2,"Administração pública, atos, poderes"],
        ["Direito Penal",3,"Parte geral e crimes em espécie"],
        ["Processo Penal",3,"Inquérito, prisão, provas"],
        ["Legislação Especial",3,"Drogas, armas, abuso, hediondos"],
        ["Criminologia/Medicina Legal",1,"Tópicos básicos conforme edital"]
      ]
    },
    "pm-soldado": {
      label:"PM — Soldado", board:"Banca variável", type:"Múltipla escolha",
      subjects:[
        ["Português",3,"Interpretação, gramática, reescrita"],
        ["Matemática/RLM",2,"Matemática básica, porcentagem, lógica"],
        ["Informática",1,"Noções de informática e segurança"],
        ["Direito Constitucional",3,"Direitos fundamentais, administração, segurança pública"],
        ["Direito Administrativo",2,"Atos, poderes, agentes públicos"],
        ["Direito Penal",2,"Parte geral e crimes mais cobrados"],
        ["Processo Penal",2,"Inquérito, prisão, prova"],
        ["Legislação Especial",2,"Drogas, Maria da Penha, ECA, abuso"],
        ["Direitos Humanos",2,"Noções e legislação aplicada"],
        ["Legislação Institucional",2,"Estatuto, regulamentos e normas estaduais"]
      ]
    },
    "policial-penal": {
      label:"Polícia Penal", board:"Banca variável", type:"Múltipla escolha",
      subjects:[
        ["Português",3,"Interpretação, gramática, redação oficial"],
        ["Raciocínio Lógico",2,"Lógica e matemática básica"],
        ["Informática",1,"Noções, segurança e sistemas"],
        ["Direito Constitucional",3,"Direitos fundamentais e segurança pública"],
        ["Direito Administrativo",2,"Administração, atos e poderes"],
        ["Direito Penal",3,"Parte geral, crimes contra administração e pessoa"],
        ["Processo Penal",2,"Prisões, provas, inquérito"],
        ["Lei de Execução Penal",4,"Execução da pena, direitos/deveres, faltas"],
        ["Legislação Especial",2,"Drogas, armas, tortura, abuso"],
        ["Direitos Humanos",3,"Sistema prisional, tratados, dignidade humana"]
      ]
    },
    gcm: {
      label:"GCM — Guarda Municipal", board:"Banca variável", type:"Múltipla escolha",
      subjects:[
        ["Português",3,"Interpretação, gramática, coesão"],
        ["Matemática/RLM",2,"Lógica, porcentagem, problemas"],
        ["Informática",1,"Noções de informática"],
        ["Direito Constitucional",2,"Direitos fundamentais, segurança pública"],
        ["Direito Administrativo",2,"Administração pública, atos e agentes"],
        ["Direito Penal",2,"Crimes mais cobrados"],
        ["Processo Penal",1,"Prisão, flagrante, noções de investigação"],
        ["Legislação de Trânsito",2,"CTB básico, fiscalização e infrações"],
        ["Legislação Municipal/Guarda",3,"Estatuto, lei orgânica, normas locais"],
        ["Direitos Humanos",2,"Cidadania, uso progressivo da força, minorias"]
      ]
    }
  };
  function presetSubjects(key){
    const p=contestPresets[key]; if(!p?.subjects) return null;
    return p.subjects.map(([name,weight,topics])=>({id:uid(),name,weight,topics}));
  }


  const defaultState = {
    ui: { sidebarCollapsed: false, calendarOffset: 0 },
    settings: { focusMinutes: 50, breakMinutes: 10, dailyHours: 6, dailyQuestionGoal: 120, focusSubject: "" },
    edital: { targetContest: "custom", name: "PMAL 2026", board: "CEBRASPE", date: "2026-07-19", type: "Certo/Errado", objectiveWeight: 120, notes: "", subjects: defaultSubjects },
    questionGoal: { target: 20000, manualDone: 0, manualByDate: {} },
    stats: { xp: 0, streak: 0, lastActiveDate: null, focusMinutesToday: 0, focusByDate: {}, focusBySubject: {}, completedSessions: 0 },
    studyLogs: [],
    summaries: [],
    lawMarks: {},
    calendarEvents: {},
    weeklyPlan: { title: "", aluno: "", concurso: "", banca: "", mentor: "Matheus G.", semana: "", mensagemMentor: "", metaSemanal: 0, days: [], completions: {}, blockLogs: {}, importedAt: null },
    verticalized: { title: "", autoSync: true, showDone: true, filter: "all", collapsed: {}, completions: {}, notes: {}, subjects: [], createdAt: null, updatedAt: null, lastSourceSignature: "", selectedContest: "" },
    verticalizedSelectedContest: "",
    verticalizedByContest: {},
    verticalizedDev: { enabled: false, activeTemplateId: "", templates: [] },
    contestProfiles: {},
    questions: [],
    simulations: [],
    taf: [],
    tafExercises: [
      { id: uid(), name: "Corrida 12 min", target: 2400, unit: "m", mode: "higher" },
      { id: uid(), name: "Barra fixa", target: 5, unit: "rep", mode: "higher" },
      { id: uid(), name: "Flexões", target: 35, unit: "rep", mode: "higher" },
      { id: uid(), name: "Abdominais", target: 42, unit: "rep", mode: "higher" }
    ],
    tafExerciseLogs: [],
    customGuides: [],
    activeQuestionId: null
  };

  const ranks = [
    ["Recruta",0,"chevron",0,"Entrada no Setor X."],
    ["Soldado",3000,"chevron",1,"Execução inicial consistente."],
    ["Taifeiro",8000,"chevron",1,"Organização básica sob controle."],
    ["Cabo",15000,"chevron",2,"Rotina, volume e correção ativa."],
    ["3º Sargento",28000,"chevron",3,"Controle real de questões e revisão."],
    ["2º Sargento",47000,"chevron",4,"Base técnica consolidada."],
    ["1º Sargento",76000,"chevron",5,"Ritmo forte de reta final."],
    ["Subtenente",118000,"bar",1,"Disciplina madura e domínio de rotina."],
    ["Aspirante",175000,"bar",2,"Transição para liderança operacional."],
    ["2º Tenente",250000,"star",1,"Organização e precisão."],
    ["1º Tenente",350000,"star",2,"Domínio tático de estudo."],
    ["Capitão",485000,"star",3,"Comando de ciclos longos."],
    ["Major",665000,"star",4,"Elite de consistência."],
    ["Tenente-Coronel",900000,"star",5,"Operação avançada."],
    ["Coronel",1200000,"star",6,"Alto comando da preparação."],
    ["General-de-Brigada",1580000,"general",1,"Nível estratégico."],
    ["General-de-Divisão",2050000,"general",2,"Controle total do plano."],
    ["General-de-Exército",2650000,"general",3,"Patamar máximo militar."],
    ["Marechal",3400000,"general",4,"Excelência operacional."],
    ["Caveira",4300000,"special",1,"Batalhão especial: resistência e precisão."],
    ["Forças Especiais",5400000,"special",2,"Execução silenciosa e brutal consistência."],
    ["Setor X",7000000,"special",3,"Patente lendária do sistema."]
  ].map(([title,xp,type,level,desc]) => ({ title,xp,type,level,desc }));

  const briefingBases = [
      "A disciplina transforma intenção em território conquistado.",
      "A força nasce quando a vontade encontra uma rotina que não negocia.",
      "O homem que vence a si mesmo não teme a pressão externa.",
      "Cada dia executado em silêncio constrói uma vitória que ainda não apareceu.",
      "A mente fraca procura alívio; a mente treinada procura direção.",
      "Quem domina o próprio tempo domina metade da batalha.",
      "O desconforto é o professor que mais reprova os indisciplinados.",
      "A constância é a forma mais discreta de superioridade.",
      "Não espere clareza para agir; a clareza nasce da ação correta.",
      "O erro só derrota quem se recusa a estudá-lo.",
      "A força real é fazer o necessário sem plateia.",
      "Todo avanço começa quando a desculpa perde autoridade.",
      "Quem vive refém do humor nunca comanda a própria história.",
      "A coragem não grita; ela permanece quando o medo aparece.",
      "Uma mente ordenada vale mais que um dia cheio de esforço confuso.",
      "O fraco busca motivação; o forte constrói ambiente.",
      "A rotina é a muralha que protege o objetivo da instabilidade.",
      "Cada renúncia inteligente compra liberdade futura.",
      "A pressão revela o que a rotina construiu em segredo.",
      "Quem foge da dificuldade entrega o comando ao acaso.",
      "A vitória pertence a quem suporta repetir o simples com excelência.",
      "A disciplina é liberdade antes que o mundo perceba.",
      "O corpo cansa, mas a missão precisa de alguém no comando.",
      "A preguiça fala suave; o arrependimento fala alto.",
      "Quem treina a atenção treina a própria sorte.",
      "O futuro cobra juros de cada dia desperdiçado.",
      "A mente que aceita qualquer distração não merece qualquer conquista.",
      "A excelência é a repetição de escolhas corretas quando ninguém fiscaliza.",
      "O medo perde força quando encontra preparo.",
      "A dor do treino é temporária; a dor da negligência se prolonga.",
      "Quem controla o impulso controla a rota.",
      "A grandeza começa no instante em que o conforto deixa de mandar.",
      "O guerreiro mais perigoso é aquele que aprendeu a esperar trabalhando.",
      "Não há destino forte em hábitos fracos.",
      "A pressa sem método é apenas ansiedade com uniforme.",
      "A humildade de revisar salva pontos que o orgulho perderia.",
      "Quem não registra o progresso negocia com a ilusão.",
      "O cansaço testa o compromisso que a empolgação prometeu.",
      "Uma mente disciplinada transforma dias comuns em vantagem estratégica.",
      "Não busque parecer forte; busque não quebrar quando for exigido.",
      "A repetição inteligente é o martelo que molda a competência.",
      "Quem adia o essencial promove o secundário.",
      "A força não é ausência de queda; é retorno imediato ao eixo.",
      "O silêncio do preparo incomoda menos que o barulho do fracasso.",
      "A mente superior reduz escolhas para proteger energia.",
      "Cada bloco cumprido é uma prova vencida antes da prova.",
      "A vida favorece quem se prepara sem exigir aplauso.",
      "O autocontrole é a primeira patente do homem livre.",
      "Quem vence a manhã enfraquece o caos do dia.",
      "A dúvida diminui quando a execução aumenta.",
      "Não existe atalho para quem precisa de base.",
      "A constância vence o talento que dorme tarde demais.",
      "Quem treina com método chega frio onde os outros chegam nervosos.",
      "O impossível diminui quando dividido em ciclos executados.",
      "A mente que aprende a sofrer com propósito ganha vantagem sobre a dor sem sentido.",
      "O estudo sem revisão é colheita abandonada no campo.",
      "A aprovação é uma construção moral antes de ser um resultado.",
      "Quem honra o plano quando não quer descobre sua verdadeira força.",
      "A disciplina é a arte de obedecer ao futuro.",
      "A ambição sem sacrifício é apenas fantasia bem vestida.",
      "Quem não aguenta o tédio do processo não merece o brilho do resultado.",
      "A vontade começa; o sistema sustenta.",
      "A resistência nasce na decisão de não abandonar o próximo passo.",
      "Quem se compara demais abandona a própria trincheira.",
      "O homem firme não depende do clima para cumprir dever.",
      "A vitória ama detalhes que os apressados desprezam.",
      "Não há força maior que continuar sem negociar com a fraqueza.",
      "A mente preparada transforma pressão em procedimento.",
      "O sucesso não visita quem deixa a porta da rotina aberta ao acaso.",
      "Cada distração aceita é um voto contra o próprio objetivo.",
      "Quem domina o básico controla o campo.",
      "A ansiedade é reduzida por tarefas concluídas, não por pensamentos repetidos.",
      "O caráter aparece quando a meta encontra desconforto.",
      "O estudo sério começa quando termina a vontade.",
      "Quem protege o foco protege o futuro.",
      "A excelência exige que a vaidade aceite correção.",
      "O plano não precisa de emoção; precisa de execução.",
      "Quem cumpre o pequeno se credencia ao grande.",
      "Uma decisão firme vale mais que mil promessas inflamadas.",
      "A força de hoje é construída nos dias em que desistir parecia lógico.",
      "O tempo não perdoa quem o trata como sobra.",
      "A mente que revisa cresce onde antes sangrou.",
      "A concentração é um ato de guerra contra a dispersão.",
      "Quem não suporta correção repete queda.",
      "A disciplina não pergunta se o dia foi fácil.",
      "O alvo fica mais próximo quando o ego fica menor.",
      "Todo resultado extraordinário exige uma rotina que pareça comum.",
      "Quem obedece ao método derrota a instabilidade.",
      "A mente treinada não procura desculpa; procura ajuste.",
      "O esforço sem direção desperdiça coragem.",
      "Quem abandona o plano por cansaço entrega o prêmio ao concorrente constante.",
      "A grande virada começa no ponto em que a maioria para.",
      "O domínio nasce da convivência honesta com o erro.",
      "Não confunda descanso estratégico com fuga confortável.",
      "A força cresce quando a promessa vira compromisso diário.",
      "Quem estuda apenas quando quer será vencido por quem estuda quando deve.",
      "A prova não se impressiona com intenção; ela exige resposta.",
      "O homem disciplinado transforma pressão em rotina conhecida.",
      "Cada página vencida é uma muralha contra a insegurança.",
      "A mente fraca busca permissão para parar; a mente forte busca razão para continuar.",
      "Quem controla a primeira hora controla o tom do dia.",
      "O futuro respeita quem o prepara no presente.",
      "Não existe glória sólida construída com hábitos improvisados.",
      "A paciência ativa é uma arma de longo alcance.",
      "Quem revisa hoje evita a dor de reconhecer tarde demais.",
      "A força está em permanecer exato quando a emoção quer bagunçar.",
      "Todo progresso real parece lento para quem ainda sonha com atalhos.",
      "A disciplina é a coragem repetida em doses pequenas.",
      "O orgulho protege o erro; a humildade protege a aprovação.",
      "Quem foge do básico perde para o simples bem feito.",
      "A mente que escolhe o difícil hoje economiza sofrimento amanhã.",
      "Não permita que o cansaço decida por você.",
      "A ordem externa começa na obediência interna.",
      "Quem não sabe dizer não não sabe proteger o sim.",
      "A repetição não é prisão quando serve à liberdade.",
      "O desconforto de agora é o preço da tranquilidade futura.",
      "A vitória não pertence ao mais animado, mas ao mais constante.",
      "Quem mantém o padrão em dia ruim se torna perigoso.",
      "A mente forte não romantiza o processo; ela executa.",
      "Cada minuto recuperado é uma fronteira retomada.",
      "O medo respeita quem se apresenta preparado.",
      "Não espere inspiração para cumprir obrigação.",
      "Quem transforma falha em dado transforma derrota em mapa.",
      "A excelência nasce quando a correção deixa de ferir o ego.",
      "A disciplina é o idioma que a aprovação entende.",
      "Quem aceita qualquer prioridade perde a principal.",
      "O corpo segue melhor quando a mente comanda sem hesitar.",
      "A preparação verdadeira é invisível até o dia em que se torna inevitável.",
      "Quem treina o foco treina a própria liberdade.",
      "A fraqueza cresce onde a justificativa é alimentada.",
      "O bom plano reduz drama e aumenta execução.",
      "Cada questão corrigida é uma conversa séria com a banca.",
      "Não negocie com a versão de você que quer fugir.",
      "A força de vontade precisa ser substituída por padrão.",
      "Quem honra o compromisso no anonimato vence em público.",
      "A mente dispersa transforma oportunidade em ruído.",
      "O avanço pequeno, repetido, humilha a pressa vazia.",
      "Quem aprende com o erro deixa de pagá-lo duas vezes.",
      "A aprovação exige menos genialidade e mais obediência ao processo.",
      "O guerreiro sereno é aquele que já treinou o caos.",
      "Não há estabilidade sem renúncia.",
      "Quem confunde movimento com progresso se perde cansado.",
      "A rotina é o voto diário em favor do destino escolhido.",
      "A disciplina começa quando o conforto perde o direito de voto.",
      "Quem deseja muito e faz pouco vive em conflito consigo mesmo.",
      "A pressão não cria caráter; apenas revela o treino.",
      "Todo ponto fraco ignorado vira cobrança no dia decisivo.",
      "A mente preparada não precisa de sorte como plano principal.",
      "Quem respeita o tempo respeita a própria missão.",
      "O fracasso começa pequeno, no detalhe permitido.",
      "A constância é uma forma de coragem sem espetáculo.",
      "Quem suporta a repetição conquista o domínio.",
      "A prova valoriza o que foi consolidado, não o que foi visitado.",
      "Não há foco sem sacrifício de alternativas.",
      "A mente forte simplifica, prioriza e executa.",
      "Quem corrige rápido sofre menos tempo.",
      "O estudo eficiente é a união entre intensidade e lucidez.",
      "A força não está em nunca cansar, mas em continuar comandando cansado.",
      "Quem evita o desconforto adia a evolução.",
      "A disciplina é o contrato assinado com a própria palavra.",
      "Cada escolha fraca cobra presença no resultado final.",
      "O método transforma ansiedade em procedimento.",
      "Quem domina a rotina domina o medo da prova.",
      "A humildade é ferramenta de alta performance.",
      "Não existe aprovação acidental para quem vive desorganizado.",
      "A mente que revisa não se assusta com repetição.",
      "Quem abandona o básico abre portas para a banca.",
      "A coragem madura é silenciosa, precisa e constante.",
      "O estudo sem foco é energia vazando.",
      "Quem vive no quase ainda está fora do alvo.",
      "A disciplina remove do futuro o peso do arrependimento.",
      "A maior luta é contra a versão que aceita menos.",
      "Quem não mede não corrige; quem não corrige repete.",
      "O progresso exige honestidade brutal com os próprios hábitos.",
      "A força se prova quando o plano continua após a falha.",
      "A mente forte sabe que descanso também obedece estratégia.",
      "Não chame de destino o que foi falta de preparo.",
      "Quem faz o mínimo por tempo suficiente supera quem promete o máximo.",
      "A vitória começa na organização do dia.",
      "O estudo verdadeiro deixa rastros: revisão, erro corrigido e avanço.",
      "Quem não enfrenta a própria desordem será comandado por ela.",
      "A constância reduz a distância entre desejo e realidade.",
      "Todo dia sem execução fortalece o adversário invisível.",
      "A mente que pensa demais e age pouco perde terreno.",
      "Quem protege a atenção protege a aprovação.",
      "A disciplina é o escudo contra a tirania da vontade fraca.",
      "O silêncio do trabalho bem feito não precisa se defender.",
      "Quem escolhe o difícil com propósito deixa de temê-lo.",
      "A revisão é o retorno estratégico ao campo onde houve perda.",
      "Não existe força sem fricção.",
      "Quem aceita ser corrigido acelera o próprio avanço.",
      "A prova é vencida antes, nos dias que pareciam comuns.",
      "O foco é uma decisão renovada a cada distração rejeitada.",
      "Quem confia apenas na memória despreza a natureza do esquecimento.",
      "A disciplina faz hoje o que a motivação prometeu ontem.",
      "O homem livre é aquele que governa os próprios impulsos.",
      "A qualidade do treino define a calma no confronto.",
      "Quem insiste no plano quando tudo pesa constrói autoridade interna.",
      "A vitória não exige perfeição; exige retorno rápido ao caminho.",
      "O método é a ponte entre esforço e resultado.",
      "Quem usa o erro como mestre não o transforma em inimigo.",
      "A mente que suporta o processo não implora pelo resultado.",
      "Cada correção séria aproxima a resposta certa.",
      "Não deixe a ansiedade ocupar o lugar da execução.",
      "Quem adia revisão agenda arrependimento.",
      "A força moral nasce de cumprir o combinado consigo mesmo.",
      "A banca encontra brechas onde o candidato deixa vaidade.",
      "Todo avanço cobra abandono de algum conforto.",
      "Quem caminha todos os dias não teme a distância.",
      "A disciplina é a arquitetura invisível da vitória.",
      "Não basta querer vencer; é preciso viver como alguém que se prepara para vencer.",
      "O foco cresce quando o ambiente deixa de sabotar a missão.",
      "Quem transforma o dia em missão transforma a semana em campanha.",
      "A mente superior não discute com a distração.",
      "O resultado é apenas o relatório final dos hábitos.",
      "Quem faz o que precisa antes do que gosta ganha liberdade.",
      "A constância é o talento treinado pelos humildes.",
      "O erro anotado vira munição; o erro ignorado vira ameaça.",
      "A pressão favorece quem já decidiu antes.",
      "Quem não organiza a energia perde para o cansaço sem lutar.",
      "A força aparece quando a desculpa perde espaço.",
      "Não se vence uma prova com esperança desorganizada.",
      "Quem revisa com seriedade fecha portas para o acaso.",
      "A rotina certa é uma forma de inteligência prática.",
      "Todo dia exige uma resposta: avançar ou justificar.",
      "Quem não protege a manhã entrega o dia à bagunça.",
      "A disciplina é mais confiável que a empolgação.",
      "A mente treinada não se surpreende com dificuldade.",
      "Cada ciclo cumprido aumenta o respeito por si mesmo.",
      "O desconforto disciplinado é melhor que o arrependimento confortável.",
      "Quem executa sem aplauso constrói poder real.",
      "A prova cobra presença mental, não apenas horas acumuladas.",
      "Não use o cansaço como juiz da missão.",
      "Quem respeita o detalhe obriga a sorte a trabalhar menos.",
      "A força nasce quando a identidade muda: eu faço porque sou assim.",
      "O estudo maduro não depende de urgência.",
      "Quem transforma conhecimento em revisão transforma esforço em permanência.",
      "A disciplina vence porque aparece todos os dias.",
      "O medo da prova diminui quando o treino fica mais parecido com ela.",
      "Quem não aceita o processo não sustenta o resultado.",
      "A atenção é o recurso mais caro da preparação.",
      "Todo hábito fraco é um vazamento de futuro.",
      "Quem abandona a correção escolhe repetir a dor.",
      "A mente que age com método não precisa dramatizar.",
      "A vitória favorece quem faz o óbvio por tempo incomum.",
      "Não existe força sem direção.",
      "Quem treina pouco a consciência exagera na confiança.",
      "A disciplina protege o sonho da instabilidade emocional.",
      "Cada questão respondida exige uma segunda missão: entender o porquê.",
      "Quem mantém palavra consigo mesmo ganha respeito interno."
  ];
  const briefingEnds = [
    "Marque, corrija e avance.", "Volte para a missão.", "Registre e neutralize.", "Execute o próximo bloco.",
    "Não negocie com a distração.", "Transforme em revisão.", "Faça a prova antes da prova.", "Corrija enquanto ainda há tempo.",
    "Mantenha o padrão.", "Hoje é dia de somar.", "Sem drama: método.", "Comando é rotina.",
    "Ajuste a rota agora.", "Menos sensação, mais dado.", "Vença o próximo item.", "Faça o simples com precisão.",
    "Treine como será cobrado.", "O alvo continua de pé.", "Acerte a próxima.", "Não abandone o plano."
  ];
  const briefings = briefingBases.flatMap(base => briefingEnds.map(end => `${base} ${end}`)).slice(0, 5000);

  const lawLinks = [
    ["Constituição Federal","constitucional","Direitos fundamentais, administração pública e segurança pública.","https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"],
    ["Código Penal","penal","Parte geral e crimes em espécie.","https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm"],
    ["Código de Processo Penal","penal","Inquérito, ação penal, provas, prisões e procedimentos.","https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm"],
    ["Código de Trânsito Brasileiro","transito","CTB — infrações, penalidades e normas gerais.","https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm"],
    ["Lei de Drogas","especial","Lei nº 11.343/2006.","https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm"],
    ["Lei Maria da Penha","especial","Lei nº 11.340/2006.","https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm"],
    ["ECA","especial","Estatuto da Criança e do Adolescente.","https://www.planalto.gov.br/ccivil_03/leis/l8069.htm"],
    ["Estatuto do Desarmamento","especial","Lei nº 10.826/2003.","https://www.planalto.gov.br/ccivil_03/leis/2003/l10.826.htm"],
    ["Crimes Ambientais","especial","Lei nº 9.605/1998.","https://www.planalto.gov.br/ccivil_03/leis/l9605.htm"],
    ["Abuso de Autoridade","especial","Lei nº 13.869/2019.","https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13869.htm"],
    ["Organizações Criminosas","especial","Lei nº 12.850/2013.","https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12850.htm"],
    ["Lavagem de Dinheiro","especial","Lei nº 9.613/1998.","https://www.planalto.gov.br/ccivil_03/leis/l9613.htm"],
    ["Lei de Tortura","especial","Lei nº 9.455/1997.","https://www.planalto.gov.br/ccivil_03/leis/l9455.htm"],
    ["Interceptação Telefônica","especial","Lei nº 9.296/1996.","https://www.planalto.gov.br/ccivil_03/leis/l9296.htm"],
    ["Prisão Temporária","penal","Lei nº 7.960/1989.","https://www.planalto.gov.br/ccivil_03/leis/l7960.htm"],
    ["Juizados Especiais Criminais","penal","Lei nº 9.099/1995.","https://www.planalto.gov.br/ccivil_03/leis/l9099.htm"],
    ["Hediondos","especial","Lei nº 8.072/1990.","https://www.planalto.gov.br/ccivil_03/leis/l8072.htm"],
    ["Lei de Execução Penal","penal","Lei nº 7.210/1984.","https://www.planalto.gov.br/ccivil_03/leis/l7210.htm"],
    ["Identificação Criminal","penal","Lei nº 12.037/2009.","https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12037.htm"],
    ["Investigação Criminal pelo Delegado","penal","Lei nº 12.830/2013.","https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12830.htm"],
    ["Improbidade Administrativa","administrativo","Lei nº 8.429/1992.","https://www.planalto.gov.br/ccivil_03/leis/l8429.htm"],
    ["Processo Administrativo Federal","administrativo","Lei nº 9.784/1999.","https://www.planalto.gov.br/ccivil_03/leis/l9784.htm"],
    ["Nova Lei de Licitações","administrativo","Lei nº 14.133/2021.","https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm"],
    ["Lei de Acesso à Informação","administrativo","Lei nº 12.527/2011.","https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm"],
    ["LGPD","administrativo","Lei nº 13.709/2018.","https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"],
    ["Súmulas Vinculantes STF","jurisprudencia","Consulta oficial de súmulas vinculantes.","https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26"],
    ["Jurisprudência STF","jurisprudencia","Pesquisa de decisões e informativos.","https://portal.stf.jus.br/jurisprudencia/"],
    ["Jurisprudência STJ","jurisprudencia","Pesquisa de decisões e informativos.","https://scon.stj.jus.br/SCON/"],
    ["Informativos STJ","jurisprudencia","Informativos por ramo do Direito.","https://processo.stj.jus.br/jurisprudencia/externo/informativo/"],
    ["Lei Orgânica Nacional das Polícias Civis","especial","Lei nº 14.735/2023 — organização, garantias e diretrizes das Polícias Civis.","https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14735.htm"],
    ["SUSP","especial","Lei nº 13.675/2018 — Sistema Único de Segurança Pública.","https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13675.htm"],
    ["Estatuto da Pessoa Idosa","especial","Lei nº 10.741/2003.","https://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm"],
    ["Estatuto da Igualdade Racial","especial","Lei nº 12.288/2010.","https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12288.htm"],
    ["Lei de Racismo","especial","Lei nº 7.716/1989.","https://www.planalto.gov.br/ccivil_03/leis/l7716.htm"],
    ["Pessoa com Deficiência","especial","Lei nº 13.146/2015.","https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm"],
    ["Contravenções Penais","penal","Decreto-Lei nº 3.688/1941.","https://www.planalto.gov.br/ccivil_03/decreto-lei/del3688.htm"],
    ["Crimes contra a Ordem Tributária","penal","Lei nº 8.137/1990.","https://www.planalto.gov.br/ccivil_03/leis/l8137.htm"],
    ["Crimes contra o Sistema Financeiro","penal","Lei nº 7.492/1986.","https://www.planalto.gov.br/ccivil_03/leis/l7492.htm"],
    ["Código de Defesa do Consumidor","especial","Lei nº 8.078/1990 — relações de consumo e crimes correlatos.","https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"],
    ["Terrorismo","especial","Lei nº 13.260/2016.","https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13260.htm"],
    ["Crimes Eleitorais — Código Eleitoral","especial","Lei nº 4.737/1965.","https://www.planalto.gov.br/ccivil_03/leis/l4737compilado.htm"],
    ["Lei das Eleições","especial","Lei nº 9.504/1997.","https://www.planalto.gov.br/ccivil_03/leis/l9504.htm"],
    ["LINDB","administrativo","Decreto-Lei nº 4.657/1942.","https://www.planalto.gov.br/ccivil_03/decreto-lei/del4657compilado.htm"],
    ["Mandado de Segurança","constitucional","Lei nº 12.016/2009.","https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12016.htm"],
    ["Habeas Data","constitucional","Lei nº 9.507/1997.","https://www.planalto.gov.br/ccivil_03/leis/l9507.htm"],
    ["Ação Popular","constitucional","Lei nº 4.717/1965.","https://www.planalto.gov.br/ccivil_03/leis/l4717.htm"],
    ["Controle de Constitucionalidade","constitucional","Lei nº 9.868/1999.","https://www.planalto.gov.br/ccivil_03/leis/l9868.htm"],
    ["ADPF","constitucional","Lei nº 9.882/1999.","https://www.planalto.gov.br/ccivil_03/leis/l9882.htm"],
    ["Banco Nacional de Perfis Genéticos","penal","Lei nº 12.654/2012.","https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12654.htm"],
    ["Busca de Pessoas Desaparecidas","especial","Lei nº 13.812/2019.","https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13812.htm"],
    ["Marco Civil da Internet","especial","Lei nº 12.965/2014 — crimes digitais e prova digital como tema correlato.","https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm"],
    ["Súmulas STJ","jurisprudencia","Consulta às súmulas do STJ.","https://scon.stj.jus.br/SCON/sumstj/"],
    ["Informativos STF","jurisprudencia","Informativos do Supremo Tribunal Federal.","https://portal.stf.jus.br/textos/verTexto.asp?servico=informativoSTF"],
    ["Súmulas STF","jurisprudencia","Consulta de súmulas do Supremo Tribunal Federal.","https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp"],
    ["Súmulas STF/STJ","jurisprudencia","Atalho operacional para súmulas dos tribunais superiores.","https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp"],
    ["Informativos STF/STJ","jurisprudencia","Atalho operacional para acompanhamento dos informativos dos tribunais superiores.","https://portal.stf.jus.br/textos/verTexto.asp?servico=informativoSTF"],
    ["Crimes Resultantes de Preconceito de Raça ou de Cor","especial","Lei nº 7.716/1989 — tema recorrente em carreiras policiais.","https://www.planalto.gov.br/ccivil_03/leis/l7716.htm"],
    ["Crimes contra Criança e Adolescente na Internet","especial","Lei nº 13.441/2017 — infiltração de agentes na internet.","https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13441.htm"],  ].map(([title,category,desc,url]) => ({ title,category,desc,url }));

  let state = loadState();
  let timer = { mode: "focus", running: false, remaining: state.settings.focusMinutes * 60, total: state.settings.focusMinutes * 60, interval: null, startedAt: null, endsAt: null, focusForecastEndAt: null, alarmCtx: null, wakeLock: null };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY + ".backup") || "null");
      if (!saved) return clone(defaultState);
      return {
        ...clone(defaultState),
        ...saved,
        ui: { ...defaultState.ui, ...(saved.ui || {}) },
        settings: { ...defaultState.settings, ...(saved.settings || {}) },
        edital: { ...defaultState.edital, ...(saved.edital || {}), subjects: Array.isArray(saved.edital?.subjects) ? saved.edital.subjects.map(normSubject) : clone(defaultSubjects) },
        questionGoal: { ...defaultState.questionGoal, ...(saved.questionGoal || {}) },
        stats: { ...defaultState.stats, ...(saved.stats || {}), focusBySubject: saved.stats?.focusBySubject && typeof saved.stats.focusBySubject==="object" ? saved.stats.focusBySubject : {} },
        studyLogs: Array.isArray(saved.studyLogs) ? saved.studyLogs : [],
        summaries: Array.isArray(saved.summaries) ? saved.summaries : [],
        lawMarks: saved.lawMarks && typeof saved.lawMarks==="object" ? saved.lawMarks : {},
        calendarEvents: saved.calendarEvents && typeof saved.calendarEvents==="object" ? saved.calendarEvents : {},
        weeklyPlan: saved.weeklyPlan && typeof saved.weeklyPlan==="object" ? { ...clone(defaultState.weeklyPlan), ...saved.weeklyPlan, days: Array.isArray(saved.weeklyPlan.days) ? saved.weeklyPlan.days : [], completions: saved.weeklyPlan.completions && typeof saved.weeklyPlan.completions==="object" ? saved.weeklyPlan.completions : {}, blockLogs: saved.weeklyPlan.blockLogs && typeof saved.weeklyPlan.blockLogs==="object" ? saved.weeklyPlan.blockLogs : {}, importedAt: saved.weeklyPlan.importedAt || null } : clone(defaultState.weeklyPlan),
        verticalized: normVerticalizedState(saved.verticalized),
        verticalizedSelectedContest: saved.verticalizedSelectedContest || saved.verticalized?.selectedContest || saved.edital?.targetContest || "custom",
        verticalizedByContest: saved.verticalizedByContest && typeof saved.verticalizedByContest==="object" ? saved.verticalizedByContest : {},
        verticalizedDev: saved.verticalizedDev && typeof saved.verticalizedDev==="object" ? { enabled: !!saved.verticalizedDev.enabled, activeTemplateId: saved.verticalizedDev.activeTemplateId || "", templates: Array.isArray(saved.verticalizedDev.templates) ? saved.verticalizedDev.templates : [] } : clone(defaultState.verticalizedDev),
        contestProfiles: saved.contestProfiles && typeof saved.contestProfiles==="object" ? saved.contestProfiles : {},
        questions: Array.isArray(saved.questions) ? saved.questions.map(normQuestion) : [],
        simulations: Array.isArray(saved.simulations) ? saved.simulations : [],
        taf: Array.isArray(saved.taf) ? saved.taf : [],
        tafExercises: Array.isArray(saved.tafExercises) && saved.tafExercises.length ? saved.tafExercises : clone(defaultState.tafExercises),
        tafExerciseLogs: Array.isArray(saved.tafExerciseLogs) ? saved.tafExerciseLogs : [],
        customGuides: Array.isArray(saved.customGuides) ? saved.customGuides : [],
        activeQuestionId: saved.activeQuestionId || null
      };
    } catch { return clone(defaultState); }
  }
  function normSubject(s, i = 0) { return typeof s === "string" ? { id: uid(), name: s, weight: 1, topics: "" } : { id: s.id || uid(), name: String(s.name || `Disciplina ${i+1}`).trim(), weight: Math.max(1,n(s.weight,1)), topics: String(s.topics || "") }; }
  function normQuestion(q = {}) {
    const type = q.type === "Múltipla escolha" ? "Múltipla escolha" : "Certo/Errado";
    const status = q.status === "correct" || q.status === "wrong" ? q.status : "pending";
    const rawAlternatives = Array.isArray(q.alternatives) ? q.alternatives : [];
    const alternatives = type === "Múltipla escolha" ? Array.from({ length: 5 }, (_, i) => String(rawAlternatives[i] || "").trim()) : [];
    const history = Array.isArray(q.history) ? q.history : [];
    const attempts = Math.max(n(q.attempts, 0), history.length);
    const correctCount = Math.max(n(q.correctCount, 0), history.filter(h => h.result === "correct").length);
    const wrongCount = Math.max(n(q.wrongCount, 0), history.filter(h => h.result === "wrong").length);
    const streak = status === "correct" ? Math.max(n(q.streak, 0), Math.min(correctCount, n(q.reviewLevel, 0))) : 0;
    return {
      id: q.id || uid(), date: q.date || todayKey(), subject: String(q.subject || defaultSubjects[0]?.name || "Geral").trim(), topic: String(q.topic || "").trim(), board: String(q.board || "").trim(), type,
      support: String(q.support || q.context || "").trim(), statement: String(q.statement || "").trim(), alternatives, answer: String(q.answer || "").trim(), comment: String(q.comment || q.professorComment || "").trim(), personalComment: String(q.personalComment || q.myComment || "").trim(), source: String(q.source || "").trim(),
      tags: Array.isArray(q.tags) ? q.tags : String(q.tags || "").split(",").map(x => x.trim()).filter(Boolean), status, favorite: !!q.favorite, reviewLevel: Math.max(0, n(q.reviewLevel, 0)), attempts, correctCount, wrongCount, streak, nextReview: q.nextReview || todayKey(), lastReview: q.lastReview || "", lastResult: q.lastResult || null, commentUnlocked: !!(q.commentUnlocked || attempts > 0 || status !== "pending"), history, errorReason: String(q.errorReason || "").trim(), myAnswer: String(q.myAnswer || "").trim(), externalId: String(q.externalId || "").trim(), sourceUrl: String(q.sourceUrl || q.url || "").trim(), capturedAt: q.capturedAt || "", platform: String(q.platform || "").trim()
    };
  }
  function save(render = true) {
    try{
      const __payload = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, __payload);
      localStorage.setItem(STORAGE_KEY + ".backup", __payload);
      localStorage.setItem(STORAGE_KEY + ".lastSavedAt", new Date().toISOString());
    }catch(e){
      console.error("[Setor X] Falha ao salvar localStorage", e);
      toast("Não consegui salvar no navegador. Exporte/limpe dados antigos se o problema continuar.");
    }
    if (render) renderAll();
  }
  function toast(msg) {
    const el = $("#toast");
    if(!el){ console.log("[Setor X]", msg); return; }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function touchDay() {
    const t = todayKey();
    state.stats.focusByDate = state.stats.focusByDate || {};
    if (state.stats.lastActiveDate && state.stats.lastActiveDate !== t) state.stats.focusMinutesToday = state.stats.focusByDate[t] || 0;
    if (state.stats.lastActiveDate === t) return;
    state.stats.streak = state.stats.lastActiveDate === addDays(t,-1) ? state.stats.streak + 1 : 1;
    state.stats.lastActiveDate = t;
  }
  function xp(amount, reason) { state.stats.xp += Math.max(0, Math.round(amount)); touchDay(); toast(`+${Math.round(amount)} XP — ${reason}`); }
  function subjects() { return state.edital.subjects.map(normSubject).filter(s => s.name); }
  function subjectNames() { return subjects().map(s => s.name); }
  
  function populateSubjects(){
    const names = subjectNames();
    const options = names.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("") || `<option value="Geral">Geral</option>`;
    const qSubject = $("#question-subject");
    if(qSubject){
      const cur = qSubject.value;
      qSubject.innerHTML = options;
      if(names.includes(cur)) qSubject.value = cur;
    }
    const qFilter = $("#question-filter-subject");
    if(qFilter){
      const cur = qFilter.value;
      qFilter.innerHTML = `<option value="">Todas as disciplinas</option>${options}`;
      if(cur==="" || names.includes(cur)) qFilter.value = cur;
    }
    const addVerticalSubject = $("#verticalized-add-subject");
    if(addVerticalSubject && !addVerticalSubject.value && names[0]) addVerticalSubject.placeholder = `Disciplina — ex: ${names[0]}`;
    const promptSubject = $("#prompt-build-subject");
    if(promptSubject && !promptSubject.value && names[0]) promptSubject.placeholder = `Ex: ${names[0]}`;
    const focusSubject = $("#focus-subject");
    if(focusSubject){
      const cur = state.settings.focusSubject || focusSubject.value || names[0] || "Geral";
      focusSubject.innerHTML = `${names.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("")}${names.length?"":`<option value="Geral">Geral</option>`}`;
      focusSubject.value = names.includes(cur) ? cur : (names[0] || "Geral");
      state.settings.focusSubject = focusSubject.value;
    }
  }
function qCounts() {
    const total = state.questions.length;
    const answeredUnique = state.questions.filter(q => (q.attempts || 0) > 0).length;
    const correct = state.questions.filter(q => q.status === "correct").length;
    const wrong = state.questions.filter(q => q.status === "wrong").length;
    const attemptsTotal = state.questions.reduce((sum, q) => sum + Math.max(n(q.attempts, 0), Array.isArray(q.history) ? q.history.length : 0), 0);
    const correctAttempts = state.questions.reduce((sum, q) => sum + n(q.correctCount, 0), 0);
    const wrongAttempts = state.questions.reduce((sum, q) => sum + n(q.wrongCount, 0), 0);
    const favorites = state.questions.filter(q => q.favorite).length;
    const due = dueQuestions().length;
    const accuracy = (correctAttempts + wrongAttempts) ? Math.round(correctAttempts / (correctAttempts + wrongAttempts) * 100) : 0;
    const subjectStats = subjectNames().map(subject => {
      const qs = state.questions.filter(q => q.subject === subject);
      const att = qs.reduce((a, q) => a + n(q.attempts, 0), 0);
      const hits = qs.reduce((a, q) => a + n(q.correctCount, 0), 0);
      const misses = qs.reduce((a, q) => a + n(q.wrongCount, 0), 0);
      const errRate = (hits + misses) ? Math.round(misses / (hits + misses) * 100) : 0;
      return { subject, total: qs.length, attempts: att, correct: hits, wrong: misses, errRate };
    });
    const worst = subjectStats.filter(s => s.wrong > 0).sort((a, b) => b.errRate - a.errRate || b.wrong - a.wrong)[0];
    return { total, answered: answeredUnique, attemptsTotal, correct, wrong, correctAttempts, wrongAttempts, favorites, due, accuracy, subjectStats, worstSubject: worst?.subject || "--" };
  }
  function dueQuestions() { const t = todayKey(); return state.questions.filter(q => n(q.attempts,0)>0 && q.nextReview && q.nextReview <= t); }
  function reviewableQuestions() { return state.questions.filter(q => n(q.attempts,0)>0 && q.nextReview); }
  function isQuestionDueForReview(q){ return n(q?.attempts,0)>0 && q?.nextReview && q.nextReview<=todayKey(); }
  function phase() { const d = daysUntil(state.edital.date); if (!state.edital.date) return { title:"Sem data-alvo", desc:"Cadastre a data da prova.", progress:0, days:0 }; if (d>90) return { title:"Base técnica", desc:"Teoria, lei seca e questões por disciplina.", progress:20, days:d }; if (d>60) return { title:"Consolidação", desc:"Questões, revisão e primeiros simulados.", progress:42, days:d }; if (d>30) return { title:"Intensificação", desc:"Banca, simulados e revisão por erro.", progress:68, days:d }; if (d>7) return { title:"Reta final", desc:"Simulado, correção e lei seca crítica.", progress:88, days:d }; return { title:"Semana da prova", desc:"Revisão cirúrgica e descanso estratégico.", progress:100, days:d }; }
  function questionGoalDailyNeeded(){ const gp=goalProgress(); return gp.daily; }
  function normalizeQuestionDate(value){
    const s=String(value||"").trim();
    if(!s) return "";
    const m=s.match(/^(\d{4}-\d{2}-\d{2})/);
    if(m) return m[1];
    const d=new Date(s);
    if(Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function qHistory(q){ return Array.isArray(q?.history) ? q.history : []; }
  function qAttemptsTotal(q){ return Math.max(n(q?.attempts,0), qHistory(q).length, n(q?.correctCount,0)+n(q?.wrongCount,0)); }
  function bankQuestionAttempts(){ return state.questions.reduce((sum,q)=>sum + qAttemptsTotal(q), 0); }
  function manualByDate(){
    state.questionGoal = state.questionGoal && typeof state.questionGoal==="object" ? state.questionGoal : clone(defaultState.questionGoal);
    state.questionGoal.manualByDate = state.questionGoal.manualByDate && typeof state.questionGoal.manualByDate==="object" ? state.questionGoal.manualByDate : {};
    return state.questionGoal.manualByDate;
  }
  function manualQuestionAttempts(){
    const datedTotal=Object.values(manualByDate()).reduce((sum,v)=>sum+Math.max(0,parsePtInt(v||0)),0);
    state.questionGoal.manualDone = Math.max(0, parsePtInt(state.questionGoal.manualDone || 0), datedTotal);
    return state.questionGoal.manualDone;
  }
  function totalQuestionAttempts(){ return bankQuestionAttempts() + manualQuestionAttempts(); }
  function bankQuestionsDoneOn(dateKey){
    return state.questions.reduce((sum,q)=>{
      const hist=qHistory(q);
      const histCount=hist.filter(h => normalizeQuestionDate(h.date || h.answeredAt || h.createdAt)===dateKey).length;
      if(histCount>0) return sum+histCount;
      const lastDate=normalizeQuestionDate(q.lastReview || q.lastResult?.answeredAt || q.answeredAt || q.updatedAt);
      return lastDate===dateKey ? sum+Math.max(1,qAttemptsTotal(q)) : sum;
    },0);
  }
  function bankQuestionsDoneToday(){ return bankQuestionsDoneOn(todayKey()); }
  function manualQuestionsDoneToday(){ return Math.max(0, parsePtInt(manualByDate()[todayKey()] || 0)); }
  function questionsDoneToday(){ return bankQuestionsDoneToday() + manualQuestionsDoneToday(); }
  function dashboardPendingReviews(){
    const questionDue=dueQuestions().length;
    const summaryDue=(state.summaries||[]).filter(s=>s.nextReview && s.nextReview<=todayKey()).length;
    const lawDue=lawMarkStats ? n(lawMarkStats().review,0) : 0;
    return questionDue + summaryDue + lawDue;
  }
  function goalProgress(){ const bank=bankQuestionAttempts(), manual=manualQuestionAttempts(), done=bank+manual, ph=phase(), target=Math.max(1,n(state.questionGoal.target,0)), left=Math.max(0,state.questionGoal.target-done); return { bank, manual, done, left, percent:clamp(done/target*100,0,100), daily:ph.days ? Math.ceil(left/Math.max(1,ph.days)) : Math.max(0,n(state.settings.dailyQuestionGoal,0)) }; }
  function focusByDate(){ state.stats.focusByDate = state.stats.focusByDate && typeof state.stats.focusByDate==="object" ? state.stats.focusByDate : {}; return state.stats.focusByDate; }
  function focusMinutesForToday(){ const fb=focusByDate(), t=todayKey(); const stored=Math.max(0,n(fb[t],0)); const legacy=(state.stats.lastFocusDate===t || !state.stats.lastFocusDate) ? Math.max(0,n(state.stats.focusMinutesToday,0)) : 0; const value=Math.max(stored, legacy); fb[t]=value; state.stats.focusMinutesToday=value; state.stats.lastFocusDate=t; return value; }
  function addFocusMinutesToday(minutes){ const fb=focusByDate(), t=todayKey(); const current=focusMinutesForToday(); const value=current+Math.max(0,n(minutes,0)); fb[t]=value; state.stats.focusMinutesToday=value; state.stats.lastFocusDate=t; return value; }
  function focusBySubject(){ state.stats.focusBySubject = state.stats.focusBySubject && typeof state.stats.focusBySubject==="object" ? state.stats.focusBySubject : {}; return state.stats.focusBySubject; }
  function focusSubjectKey(name=""){ return String(name||"Geral").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || "geral"; }
  function selectedFocusSubject(){
    const names=subjectNames();
    const chosen=String(state.settings.focusSubject||"").trim();
    if(chosen) return chosen;
    state.settings.focusSubject=names[0]||"Geral";
    return state.settings.focusSubject;
  }
  function focusSubjectEntry(subject){
    const name=String(subject||selectedFocusSubject()||"Geral").trim()||"Geral";
    const key=focusSubjectKey(name);
    const fb=focusBySubject();
    fb[key]=fb[key]&&typeof fb[key]==="object"?fb[key]:{name,total:0,byDate:{}};
    fb[key].name=name;
    fb[key].byDate=fb[key].byDate&&typeof fb[key].byDate==="object"?fb[key].byDate:{};
    fb[key].total=Math.max(0,n(fb[key].total,0));
    return fb[key];
  }
  function addFocusMinutesToSubject(subject, minutes){
    const m=Math.max(0,n(minutes,0));
    if(!m) return 0;
    const entry=focusSubjectEntry(subject);
    const t=todayKey();
    entry.byDate[t]=Math.max(0,n(entry.byDate[t],0))+m;
    entry.total=Math.max(0,n(entry.total,0))+m;
    return entry.total;
  }
  function focusMinutesBySubject(subject){
    const fb=focusBySubject();
    const key=focusSubjectKey(subject);
    return Math.max(0,n(fb[key]?.total,0));
  }
  function focusMinutesBySubjectToday(subject){
    const fb=focusBySubject();
    const key=focusSubjectKey(subject);
    return Math.max(0,n(fb[key]?.byDate?.[todayKey()],0));
  }
  function summaries(){ state.summaries = Array.isArray(state.summaries) ? state.summaries : []; return state.summaries; }
  function tafExercises(){ return Array.isArray(state.tafExercises) ? state.tafExercises : (state.tafExercises=[]); }
  function tafLogs(){ return Array.isArray(state.tafExerciseLogs) ? state.tafExerciseLogs : (state.tafExerciseLogs=[]); }
  function latestTAF() { return state.taf[0] || null; }
  function bmi(height, weight) { const h = n(height)/100, w = n(weight); return h>0 && w>0 ? w/(h*h) : null; }
  function bmiClass(v) { if (!v) return "Sem registro"; if (v<18.5) return "Abaixo do peso"; if (v<25) return "Peso normal"; if (v<30) return "Sobrepeso"; if (v<35) return "Obesidade grau I"; if (v<40) return "Obesidade grau II"; return "Obesidade grau III"; }
  function idealRange(hcm) { const h = n(hcm)/100; return h ? { min:Number((18.5*h*h).toFixed(1)), max:Number((24.9*h*h).toFixed(1)) } : null; }
  function autoTargetWeight(hcm) { const h=n(hcm)/100; return h ? Number((24*h*h).toFixed(1)) : 0; }
  function relativeStrengthScore(record){ const w=n(record?.weight); if(!w) return null; const pull=n(record?.pullups), push=n(record?.pushups), sit=n(record?.situps); const score=(pull*6 + push*1.2 + sit*0.8)/w*10; return Number(score.toFixed(1)); }
  function relativeStrengthClass(score){ if(score===null) return "Sem dados"; if(score>=8) return "Muito boa"; if(score>=6) return "Boa"; if(score>=4) return "Em construção"; return "Baixa"; }
  function tafRunRisk(bmiValue, run){ if(!bmiValue) return "Informe altura e peso."; if(bmiValue>=30) return "Atenção alta: excesso de peso aumenta impacto na corrida. Priorize redução gradual e força relativa."; if(bmiValue>=25) return "Atenção moderada: reduzir peso tende a melhorar corrida, barra e recuperação."; if(n(run)>=2400) return "Boa base aeróbica. Mantenha progressão e evite queda de força."; return "Priorize corrida progressiva, técnica e constância semanal."; }

  const patentImages = {
    "Recruta":"assets/images/patentes/recruta.png",
    "Soldado":"assets/images/patentes/soldado.png",
    "Taifeiro":"assets/images/patentes/taifeiro.png",
    "Cabo":"assets/images/patentes/cabo.png",
    "3º Sargento":"assets/images/patentes/3sargento.png",
    "2º Sargento":"assets/images/patentes/2sargento.png",
    "1º Sargento":"assets/images/patentes/1sargento.png",
    "Subtenente":"assets/images/patentes/subtenente.png",
    "Aspirante":"assets/images/patentes/aspirante.png",
    "2º Tenente":"assets/images/patentes/2tenente.png",
    "1º Tenente":"assets/images/patentes/1tenente.png",
    "Capitão":"assets/images/patentes/capitao.png",
    "Major":"assets/images/patentes/major.png",
    "Tenente-Coronel":"assets/images/patentes/tenentecoronel.png",
    "Coronel":"assets/images/patentes/coronel.png",
    "General-de-Brigada":"assets/images/patentes/generalbrigada.png",
    "General-de-Divisão":"assets/images/patentes/generaldivisao.png",
    "General-de-Exército":"assets/images/patentes/generalexercito.png",
    "Marechal":"assets/images/patentes/marechal.png",
    "Caveira":"assets/images/patentes/caveira.png",
    "Forças Especiais":"assets/images/patentes/forcasespeciais.png",
    "Setor X":"assets/images/patentes/setorx.png"
  };
  function rankIcon(rank, mini=false){
    const img = patentImages[rank.title];
    if(img) return `<img src="${img}" alt="${esc(rank.title)}" class="rank-symbol-img${mini?" mini":""}">`;
    const w = mini ? 80 : 132, h = mini ? 56 : 86;
    const bg = `<path class="insignia-bg" d="M12 ${h-16} 12 22 ${w/2} 6 ${w-12} 22 ${w-12} ${h-16}Z"/>`;
    if(rank.type==="chevron"){
      let lines=""; for(let i=0;i<rank.level;i++){ const y=h-18-i*9; lines += `<path class="insignia-line" d="M24 ${y} ${w/2} ${y-18} ${w-24} ${y}"/>`; }
      return `<svg viewBox="0 0 ${w} ${h}">${bg}${lines || `<path class="insignia-line" d="M28 ${h-24} ${w/2} ${h-42} ${w-28} ${h-24}"/>`}</svg>`;
    }
    if(rank.type==="bar"){
      return `<svg viewBox="0 0 ${w} ${h}"><path class="insignia-bg" d="M10 ${h-16} 10 24 ${w-18} 24 ${w-18} ${h-16}Z"/><circle class="insignia-gold" cx="20" cy="${h/2}" r="6"/><path class="insignia-line" d="M${w/2-13} ${h/2-16} ${w/2+13} ${h/2+16}M${w/2+13} ${h/2-16} ${w/2-13} ${h/2+16}"/></svg>`;
    }
    if(rank.type==="star"){
      let stars=""; for(let i=0;i<rank.level;i++){ stars += star(42+i*16, h/2, 7); }
      return `<svg viewBox="0 0 ${w} ${h}"><path class="insignia-bg" d="M10 ${h-16} 10 24 ${w-18} 24 ${w-18} ${h-16}Z"/><circle class="insignia-gold" cx="20" cy="${h/2}" r="6"/>${stars}</svg>`;
    }
    if(rank.type==="general"){
      let stars=""; for(let i=0;i<rank.level;i++){ stars += star(w-30-i*14, h-26, 5); }
      return `<svg viewBox="0 0 ${w} ${h}"><path class="insignia-bg" d="M10 ${h-16} 10 24 ${w-18} 24 ${w-18} ${h-16}Z"/><ellipse cx="${w/2}" cy="${h/2}" rx="20" ry="10" fill="#0b6741" stroke="#ffca64" stroke-width="2"/><path class="insignia-line" d="M${w/2-12} ${h/2} ${w/2+12} ${h/2}M${w/2} ${h/2-7} ${w/2} ${h/2+7}"/>${stars}</svg>`;
    }
    const label = rank.level===1 ? "☠" : rank.level===2 ? "FE" : "X";
    return `<svg viewBox="0 0 ${w} ${h}"><path class="insignia-special" d="M8 ${h-14} 8 18 ${w/2} 5 ${w-8} 18 ${w-8} ${h-14} ${w/2} ${h-4}Z"/><text x="${w/2}" y="${h/2+9}" text-anchor="middle" font-size="${rank.level===1?30:24}" font-weight="900" fill="#ffca64">${label}</text>${star(24,h-24,5)}${star(w-24,h-24,5)}</svg>`;
  }
  function star(cx, cy, r){ let p=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r:r*.42; p.push(`${cx+Math.cos(a)*rr},${cy+Math.sin(a)*rr}`); } return `<polygon class="insignia-star" points="${p.join(" ")}"/>`; }

  function currentRank(){
    state.stats=state.stats&&typeof state.stats==="object"?{...defaultState.stats,...state.stats}:clone(defaultState.stats);
    let cur=ranks[0], next=ranks[1];
    const xpNow=Math.max(0,n(state.stats.xp,0));
    for(let i=0;i<ranks.length;i++){ if(xpNow>=ranks[i].xp){cur=ranks[i]; next=ranks[i+1]||null;} }
    return {cur,next};
  }
  function renderDashboard(){
    const ph=phase(), c=qCounts(), gp=goalProgress(), taf=latestTAF();
    state.settings.dailyQuestionGoal=gp.daily;
    $("#days-left").textContent = state.edital.date ? ph.days : "--";
    $("#countdown-label").textContent = `${state.edital.name || "prova"} • ${state.edital.date ? fmtDate(state.edital.date) : "sem data"}`;
    $("#phase-label").textContent=ph.title; $("#phase-small").textContent=`Fase: ${ph.title} • ${ph.desc}`; $("#phase-progress").style.width=`${ph.progress}%`;
    const bankToday=bankQuestionsDoneToday(), manualToday=manualQuestionsDoneToday(), todayQ=bankToday+manualToday, dailyGoal=Math.max(0, questionGoalDailyNeeded());
    const dailyPct=dailyGoal?Math.round(Math.min(100, todayQ/dailyGoal*100)):0;
    $("#kpi-questions-total").textContent=fmtInt(todayQ);
    $("#kpi-questions-target").textContent=dailyGoal?`Meta diária: ${fmtInt(todayQ)}/${fmtInt(dailyGoal)} • ${dailyPct}%${todayQ>=dailyGoal?" • meta batida":` • faltam ${fmtInt(Math.max(0,dailyGoal-todayQ))}`}`:"Sem meta diária";
    const qBreak=$("#kpi-questions-breakdown"); if(qBreak) qBreak.textContent=`Banco QX: ${fmtInt(bankToday)} • Manuais: ${fmtInt(manualToday)}`;
    const qProgress=$("#kpi-questions-daily-progress"); if(qProgress) qProgress.style.width=`${dailyGoal?Math.min(100,dailyPct):0}%`;
    const pending=dashboardPendingReviews();
    $("#kpi-reviews-due").textContent=fmtInt(pending);
    const pendingLabel=$("#kpi-pending-reviews-label"); if(pendingLabel) pendingLabel.textContent=pending?`${fmtInt(dueQuestions().length)} questões vencidas • ${fmtInt(Math.max(0,pending-dueQuestions().length))} outras revisões`:"Nada pendente agora";
    const studyToday=focusMinutesForToday();
    const dailyStudyGoal=Math.max(0, Math.round(n(state.settings.dailyHours,0)*60));
    const studyPct=dailyStudyGoal?Math.round(Math.min(100, studyToday/dailyStudyGoal*100)):0;
    $("#kpi-reviews-total").textContent=fmtMinutes(studyToday);
    const studyGoalLabel=$("#kpi-study-goal-label"); if(studyGoalLabel) studyGoalLabel.textContent=dailyStudyGoal?`Meta: ${fmtMinutes(studyToday)}/${fmtMinutes(dailyStudyGoal)} • ${studyPct}%${studyToday>=dailyStudyGoal?" • meta batida":` • faltam ${fmtMinutes(Math.max(0,dailyStudyGoal-studyToday))}`}`:"Configure horas/dia";
    const studyProgress=$("#kpi-study-daily-progress"); if(studyProgress) studyProgress.style.width=`${dailyStudyGoal?Math.min(100,studyPct):0}%`;
    $("#kpi-weight").textContent=taf?.weight ? `${String(taf.weight).replace(".", ",")}kg` : "--"; $("#kpi-weight-label").textContent=taf?.targetWeight ? `Alvo: ${String(taf.targetWeight).replace(".", ",")}kg` : "Sem registro";
    $("#focus-minutes").value=state.settings.focusMinutes; $("#break-minutes").value=state.settings.breakMinutes; $("#daily-hours").value=state.settings.dailyHours; $("#daily-question-goal").value=gp.daily;
  }
  function renderEdital(){
    $("#edital-name").value=state.edital.name||""; $("#edital-board").value=state.edital.board||""; $("#edital-date").value=state.edital.date||""; $("#edital-type").value=state.edital.type||"Certo/Errado"; $("#edital-objective-weight").value=state.edital.objectiveWeight||""; $("#edital-notes").value=state.edital.notes||"";
    $("#edital-summary").innerHTML=`<strong>${esc(state.edital.name||"Edital sem nome")} • ${esc(state.edital.board||"Banca não informada")}</strong><span>Prova: ${fmtDate(state.edital.date)} • Tipo: ${esc(state.edital.type)} • ${subjects().length} disciplinas cadastradas.</span>${state.edital.notes?`<span>${esc(state.edital.notes)}</span>`:""}`;
    $("#subject-grid").innerHTML=subjects().map(s=>{const qs=state.questions.filter(q=>q.subject===s.name), wrong=qs.filter(q=>q.status==="wrong").length; return `<div class="subject-card" data-id="${s.id}"><div class="subject-card-head"><strong>${esc(s.name)}</strong><button class="delete-mini" data-action="delete-subject"><i class="fa-solid fa-trash"></i></button></div><span>Peso ${s.weight} • ${qs.length} questões • ${wrong} erros</span><span>${esc(s.topics||"Sem assuntos cadastrados")}</span></div>`}).join("");
  }

  function renderQuestionGoal(){
    const c=qCounts(), ph=phase(), gp=goalProgress();
    $("#question-goal-input").value=fmtInt(state.questionGoal.target);
    $("#goal-daily-needed").textContent=fmtInt(gp.daily); $("#goal-daily-detail").textContent=`${fmtInt(gp.left)} restantes em ${ph.days||0} dias. Manual: ${fmtInt(gp.manual)} • Banco QX: ${fmtInt(gp.bank)}.`;
    $("#question-goal-progress").style.width=`${gp.percent}%`; $("#goal-progress-label").textContent=`${fmtInt(gp.done)} feitas de ${fmtInt(state.questionGoal.target)} (${Math.round(gp.percent)}%)`;
    const done=$("#goal-done-count"), bank=$("#goal-bank-count"), manual=$("#goal-manual-count"), left=$("#goal-left-count"), pct=$("#goal-progress-percent");
    if(done) done.textContent=fmtInt(gp.done); if(bank) bank.textContent=fmtInt(gp.bank); if(manual) manual.textContent=fmtInt(gp.manual); if(left) left.textContent=fmtInt(gp.left); if(pct) pct.textContent=`${Math.round(gp.percent)}%`;
  }
  function filteredQuestions(){
    const search=($("#question-search")?.value||"").toLowerCase().trim();
    const sub=$("#question-filter-subject")?.value||"all", topic=$("#question-filter-topic")?.value||"all", board=$("#question-filter-board")?.value||"all", type=$("#question-filter-type")?.value||"all", status=$("#question-filter-status")?.value||"all", due=$("#question-filter-due")?.value||"all", mode=$("#question-filter-mode")?.value||"all", today=todayKey();
    return state.questions.filter(q=>{
      const tagText=Array.isArray(q.tags)?q.tags.join(" "):String(q.tags||"");
      const txt=`${q.subject} ${q.topic} ${q.board} ${q.source} ${q.statement} ${q.support} ${q.comment} ${q.personalComment} ${tagText}`.toLowerCase();
      const isReviewed=n(q.attempts,0)>0; const dueOk=due==="all"||(due==="due"&&isReviewed&&q.nextReview&&q.nextReview<=today)||(due==="today"&&isReviewed&&q.nextReview===today)||(due==="future"&&isReviewed&&q.nextReview&&q.nextReview>today);
      const modeOk=mode==="all"||(mode==="wrong"&&q.status==="wrong")||(mode==="favorite"&&q.favorite)||(mode==="unanswered"&&!(q.attempts>0))||(mode==="answered"&&(q.attempts>0));
      return (!search||txt.includes(search))&&(sub==="all"||q.subject===sub)&&(topic==="all"||q.topic===topic)&&(board==="all"||q.board===board)&&(type==="all"||q.type===type)&&(status==="all"||q.status===status)&&dueOk&&modeOk;
    });
  }
  function renderQuestions(){
    state.questions = state.questions.map(normQuestion);
    const c=qCounts(), filtered=filteredQuestions(), today=todayKey();
    const setText=(id,val)=>{ const el=$(id); if(el) el.textContent=val; };
    setText("#questions-total",fmtInt(c.total)); setText("#questions-answered-total",fmtInt(c.attemptsTotal)); setText("#questions-correct-total",fmtInt(c.correctAttempts)); setText("#questions-wrong-total",fmtInt(c.wrongAttempts)); setText("#questions-accuracy",`${c.accuracy}%`); setText("#questions-revisions-due",fmtInt(c.due)); setText("#questions-favorites-total",fmtInt(c.favorites)); setText("#questions-worst-subject",c.worstSubject);
    setText("#question-list-count",`${filtered.length} itens`);
    const activeFilters=[]; [["Disciplina",$("#question-filter-subject")?.value],["Assunto",$("#question-filter-topic")?.value],["Banca",$("#question-filter-board")?.value],["Tipo",$("#question-filter-type")?.value],["Status",$("#question-filter-status")?.value],["Revisão",$("#question-filter-due")?.value],["Caderno",$("#question-filter-mode")?.value]].forEach(([k,v])=>{ if(v&&v!=="all") activeFilters.push(`${k}: ${v}`); });
    setText("#qx-filter-summary",activeFilters.length?`Filtros ativos: ${activeFilters.join(" • ")}`:"Filtros ativos: todos");
    $("#question-list").innerHTML=filtered.map((q,i)=>{ const isDue=q.nextReview&&q.nextReview<=today, active=q.id===state.activeQuestionId, stat=labelStatus(q.status), level=q.status==="wrong"?"Reset":`Nível ${Math.min(n(q.reviewLevel,0)+1,5)}`; return `<div class="question-card qx-list-card ${active?"active":""} ${isDue?"due":""}" data-id="${q.id}"><div class="question-card-head"><strong>#${i+1} • ${esc(q.subject||"Geral")}</strong><button class="card-action ${q.favorite?"favorited":""}" data-action="toggle-favorite" title="Favoritar"><i class="${q.favorite?"fa-solid":"fa-regular"} fa-star"></i></button></div><span class="qx-list-topic">${esc(q.topic||"Sem assunto")}</span><div class="question-tags"><span class="tag">${esc(q.type)}</span><span class="tag ${q.status}">${stat}</span>${isDue?`<span class="tag wrong">Revisar hoje</span>`:""}</div><span>${esc(q.statement||"Sem enunciado").slice(0,150)}${(q.statement||"").length>150?"...":""}</span><span>Revisão: ${fmtDate(q.nextReview)} • ${level} • Tentativas: ${q.attempts||0}</span></div>`; }).join("") || `<div class="question-card"><strong>Nenhuma questão encontrada</strong><span>Cadastre questões ou ajuste filtros. O caderno de erros fica dentro do próprio Banco QX.</span></div>`;
    renderQuestionStatsPanel(c); renderPractice(filtered);
  }
  function renderQuestionStatsPanel(c){
    const panel=$("#question-subject-stats"); if(panel){ panel.innerHTML=`<div class="section-head compact-head"><div><p class="eyebrow">Estatísticas por disciplina</p><h3>Mapa de erro do Banco QX</h3></div></div><div class="qx-subject-grid">${c.subjectStats.map(s=>`<div class="breakdown-card"><strong>${esc(s.subject)}</strong><span>${s.total} cadastradas • ${s.attempts} respostas</span><span>Acertos: ${s.correct} • Erros: ${s.wrong} • Erro: ${s.errRate}%</span><div class="progress-track"><div class="progress-fill" style="width:${clamp(100-s.errRate,0,100)}%"></div></div></div>`).join("") || `<div class="breakdown-card"><strong>Sem disciplinas</strong><span>Cadastre a Matriz do Edital.</span></div>`}</div>`; }
    const key=$("#qx-answerkey-panel"); if(key){ const recent=state.questions.filter(q=>n(q.attempts,0)>0).slice().sort((a,b)=>String(b.lastReview||"").localeCompare(String(a.lastReview||""))).slice(0,30); key.innerHTML=`<div class="section-head compact-head"><div><p class="eyebrow">Gabarito liberado</p><h3>Questões respondidas, comentários e histórico</h3></div></div><div class="qx-answerkey-grid">${recent.map(q=>{ const hist=(q.history||[]).slice(-3).reverse().map(h=>`${fmtDate(String(h.date||"").slice(0,10))}: ${h.result==="correct"?"acerto":"erro"} (${esc(h.answer||"--")})`).join(" • "); return `<div class="breakdown-card qx-answerkey-full"><strong>${esc(q.subject)} • ${esc(q.topic||"Sem assunto")}</strong><span><b>Gabarito:</b> ${esc(q.answer||"--")} • <b>Última resposta:</b> ${esc(q.myAnswer||"--")}</span><span><b>Status:</b> ${labelStatus(q.status)} • <b>Próxima revisão:</b> ${fmtDate(q.nextReview)}</span><details><summary>Comentários e histórico</summary><div class="qx-answerkey-detail"><strong>Comentário do professor</strong>${renderStoredRich(q.comment,"Nenhum comentário do professor cadastrado.")}<strong>Meu comentário</strong>${renderStoredRich(q.personalComment,"Nenhum comentário pessoal cadastrado.")}<strong>Histórico recente</strong><p>${hist||"Sem histórico detalhado."}</p></div></details></div>`; }).join("") || `<div class="breakdown-card"><strong>Nenhuma resposta ainda</strong><span>O gabarito aparece aqui após resolver questões.</span></div>`}</div>`; }
  }
  function labelStatus(s){ return ({correct:"Acertei",wrong:"Errei",pending:"Pendente"})[s]||"Pendente"; }
  function getActiveQuestion(){ return state.questions.find(q=>q.id===state.activeQuestionId)||null; }
  function qxIsSessionUnlocked(q){ return !!(q && state.qxUnlockedNowId && state.qxUnlockedNowId===q.id); }
  function qxLockPractice(){ state.qxUnlockedNowId=null; state.qxSelectedAnswer=""; }
  function currentQuestionIndex(filtered=filteredQuestions()){ return filtered.findIndex(q=>q.id===state.activeQuestionId); }
  function renderPractice(filtered=filteredQuestions()){
    let q=getActiveQuestion();
    const unanswered=filtered.filter(x=>!(n(x.attempts,0)>0));
    const activeInside = q && (filtered.some(x=>x.id===q.id) || qxIsSessionUnlocked(q));

    if(!filtered.length){
      state.activeQuestionId=null;
      $("#practice-empty").hidden=false;
      $("#practice-card").hidden=true;
      $("#qx-top-counter").textContent="Nenhuma questão filtrada";
      const msg=$("#practice-empty-message"); if(msg) msg.textContent="Nenhuma questão encontrada com estes filtros. Escolha outra lista ou limpe os filtros.";
      return;
    }

    // Se o usuário clicou em uma questão da lista, abre a questão mesmo que já tenha sido respondida.
    // Isso permite revisar questões respondidas sem deixar gabarito antigo aberto automaticamente.
    if(!activeInside){
      if(unanswered.length){
        q=unanswered[0];
        state.activeQuestionId=q.id;
      }else{
        state.activeQuestionId=null;
        $("#practice-empty").hidden=false;
        $("#practice-card").hidden=true;
        $("#qx-top-counter").textContent="Lista concluída";
        const msg=$("#practice-empty-message"); if(msg) msg.textContent="Você concluiu todas as questões desta lista. Elas voltam automaticamente em Revisar hoje na data programada. Para refazer antes, clique em uma questão do índice: ela abrirá bloqueada, sem gabarito.";
        return;
      }
    }

    if(!q){ $("#practice-empty").hidden=false; $("#practice-card").hidden=true; return; }
    q=normQuestion(q); const realIndex=state.questions.findIndex(x=>x.id===q.id); if(realIndex>=0) state.questions[realIndex]=q;
    $("#practice-empty").hidden=true; $("#practice-card").hidden=false; if(!qxIsSessionUnlocked(q)) state.qxSelectedAnswer="";
    const idx=currentQuestionIndex(filtered), total=filtered.length, isDue=q.nextReview&&q.nextReview<=todayKey();
    $("#qx-top-counter").textContent=total?`Questão ${idx+1} de ${total} filtradas`:`Questão selecionada`; $("#practice-topic").textContent=q.topic||"Questão sem assunto"; $("#practice-source").textContent=q.source||q.board||"Fonte não informada";
    const tags=[`<span class="tag">${esc(q.subject)}</span>`,`<span class="tag">${esc(q.board||"Banca")}</span>`,`<span class="tag">${esc(q.type)}</span>`,`<span class="tag ${q.status}">${labelStatus(q.status)}</span>`]; if(isDue) tags.push(`<span class="tag wrong">Revisar hoje</span>`); if(q.favorite) tags.push(`<span class="tag favorite">Favorita</span>`); (q.tags||[]).slice(0,4).forEach(t=>tags.push(`<span class="tag">#${esc(t)}</span>`)); $("#practice-tags").innerHTML=tags.join("");
    const support=$("#practice-support"); support.hidden=!q.support; support.innerHTML=q.support?`<strong>Conteúdo de apoio</strong><p>${esc(q.support).replace(/\n/g,"<br>")}</p>`:""; $("#practice-statement").innerHTML=esc(q.statement||"Sem enunciado.").replace(/\n/g,"<br>"); renderAnswerArea(q); renderTabs(q);
    const fav=$("#favorite-active-question"); if(fav) fav.innerHTML=`<i class="${q.favorite?"fa-solid":"fa-regular"} fa-star"></i> ${q.favorite?"Favorita":"Favoritar"}`;
    const fb=$("#answer-feedback"); fb.hidden=true; fb.className="answer-feedback"; fb.innerHTML="";
    if(qxIsSessionUnlocked(q) && q.lastResult){ const ok=q.lastResult.status==="correct"; fb.hidden=false; fb.className=`answer-feedback ${ok?"correct":"wrong"}`; fb.innerHTML= ok?`<strong>Resposta correta.</strong> Gabarito: ${esc(q.answer||"--")} • Próxima revisão: ${fmtDate(q.nextReview)}.`:`<strong>Resposta errada.</strong> Gabarito: ${esc(q.answer||"--")} • Revisão reagendada para ${fmtDate(q.nextReview)}.`; }
  }
  function renderStoredRich(content, fallback=""){
    const raw = String(content || "").trim();
    if(!raw) return `<p>${esc(fallback).replace(/\n/g,"<br>")}</p>`;
    const hasHtml = /<[^>]+>/.test(raw);
    return hasHtml ? `<div class="qx-rich-render">${raw}</div>` : `<p>${esc(raw).replace(/\n/g,"<br>")}</p>`;
  }

  function renderAnswerArea(q){
    const unlocked = qxIsSessionUnlocked(q);
    const normAnswer = (v) => normalizeAnswer(v);
    const optionClass = (answer) => {
      if(!unlocked) return "";
      const chosen = q.myAnswer && normAnswer(q.myAnswer) === normAnswer(answer);
      const official = q.answer && normAnswer(q.answer) === normAnswer(answer);
      if(chosen && official) return "selected qx-answer-correct qx-answer-marked";
      if(chosen && !official) return "selected qx-answer-wrong qx-answer-marked";
      if(!chosen && official) return "qx-answer-official";
      return "qx-answer-neutral";
    };
    const optionBadge = (answer) => {
      if(!unlocked) return "";
      const chosen = q.myAnswer && normAnswer(q.myAnswer) === normAnswer(answer);
      const official = q.answer && normAnswer(q.answer) === normAnswer(answer);
      if(chosen && official) return `<em class="qx-result-badge ok"><i class="fa-solid fa-check"></i> Sua resposta correta</em>`;
      if(chosen && !official) return `<em class="qx-result-badge fail"><i class="fa-solid fa-xmark"></i> Sua resposta</em>`;
      if(!chosen && official) return `<em class="qx-result-badge official"><i class="fa-solid fa-key"></i> Gabarito</em>`;
      return "";
    };
    if(q.type==="Certo/Errado"){
      const opts=[["Certo","C"],["Errado","E"]];
      $("#answer-area").innerHTML=opts.map(([answer,letter])=>`<button class="answer-option qx-ce-option ${optionClass(answer)}" data-answer="${answer}"><span class="letter">${letter}</span><span>${answer}</span>${optionBadge(answer)}</button>`).join("");
    } else {
      const alts=Array.from({length:5},(_,i)=>q.alternatives?.[i]||"");
      $("#answer-area").innerHTML=alts.map((txt,i)=>{
        const letter="ABCDE"[i];
        return `<button class="answer-option ${optionClass(letter)}" data-answer="${letter}"><span class="letter">${letter}</span><span>${esc(txt||`Alternativa ${letter}`)}</span>${optionBadge(letter)}</button>`;
      }).join("");
    }
  }
  function renderTabs(q){ const unlocked = qxIsSessionUnlocked(q); const lock = $("#comment-lock"), tabs = $(".comment-tabs"); if(lock) lock.hidden = unlocked; if(tabs) tabs.hidden = !unlocked; ["#tab-professor","#tab-personal","#tab-stats","#tab-review"].forEach(sel => { const el = $(sel); if(el) el.hidden = !unlocked; }); if(!unlocked) return; $("#tab-professor").innerHTML=`<div class="qx-comment-card"><strong>Gabarito oficial: ${esc(q.answer||"--")}</strong>${renderStoredRich(q.comment, "Nenhum comentário do professor cadastrado.")}</div>`; $("#tab-personal").innerHTML=`<div class="qx-comment-card"><label>Meu comentário<textarea id="personal-comment-edit" rows="4">${esc(q.personalComment||"")}</textarea></label><label>Por que errei?<select id="error-reason-select"><option value="">Selecionar motivo</option>${errorReasons().map(r=>`<option value="${esc(r)}" ${q.errorReason===r?"selected":""}>${esc(r)}</option>`).join("")}</select></label><button id="save-personal-comment" class="secondary-btn small" type="button"><i class="fa-solid fa-floppy-disk"></i> Salvar anotação</button></div>`; const hist=(q.history||[]).slice().reverse().map(h=>`<div class="history-item"><strong>${fmtDate(String(h.date||"").slice(0,10))} • ${h.result==="correct"?"Acerto":"Erro"} • Resposta: ${esc(h.answer||"--")}</strong><span>${esc(h.errorReason||"Sem motivo registrado")} ${h.wasDue?"• revisão vencida":""}</span></div>`).join("") || `<div class="history-item"><strong>Sem tentativas registradas</strong><span>Responda a questão para criar histórico.</span></div>`; $("#tab-stats").innerHTML=`<div class="metric-grid qx-mini-metrics"><div><span>Tentativas</span><strong>${q.attempts||0}</strong></div><div><span>Acertos</span><strong>${q.correctCount||0}</strong></div><div><span>Erros</span><strong>${q.wrongCount||0}</strong></div><div><span>Sequência</span><strong>${q.streak||0}</strong></div></div><div class="history-list">${hist}</div>`; $("#tab-review").innerHTML=`<div class="qx-comment-card"><strong>Revisão estilo Anki</strong><p>Próxima revisão: <b>${fmtDate(q.nextReview)}</b>. Nível atual: <b>${q.status==="wrong"?"Reset por erro":`Nível ${Math.min(n(q.reviewLevel,0)+1,5)}`}</b>.</p><p>Erro agenda 1 dia. Primeiro acerto agenda 3 dias. Acertos consecutivos avançam para 7, 15, 30 e 60 dias. Erro depois de acertos reseta o ciclo.</p></div>`; }
  function errorReasons(){ return ["Falta de atenção","Desconhecimento","Confusão de conceito","Erro de leitura","Chute","Literalidade da lei","Jurisprudência","Pegadinha da banca"]; }
  function selectedAnswer(){ return state.qxSelectedAnswer || $(".answer-option.selected")?.dataset.answer || ""; }
  function schedule(q,status,wasDue=false){ const intervals=[3,7,15,30,60]; q.status=status; q.attempts=(q.attempts||0)+1; q.lastReview=todayKey(); q.commentUnlocked=false; if(status==="correct"){ const level=clamp(n(q.reviewLevel,0),0,intervals.length-1); q.nextReview=addDays(todayKey(),intervals[level]); q.reviewLevel=Math.min(level+1,intervals.length-1); q.correctCount=(q.correctCount||0)+1; q.streak=(q.streak||0)+1; } else { q.reviewLevel=0; q.streak=0; q.nextReview=addDays(todayKey(),1); q.wrongCount=(q.wrongCount||0)+1; } }
  function answerActive(){
    const q=getActiveQuestion(); if(!q) return;
    const ans=state.qxSelectedAnswer || selectedAnswer();
    if(!ans) return toast("Selecione uma resposta.");
    const wasDue=!!(q.nextReview&&q.nextReview<=todayKey());

    q.myAnswer=ans;
    q.commentUnlocked=false;
    const ok=normalizeAnswer(ans)===normalizeAnswer(q.answer);
    schedule(q, ok?"correct":"wrong", wasDue);
    q.myAnswer=ans;
    q.lastResult={status:ok?"correct":"wrong", answeredAt:new Date().toISOString(), answer:q.myAnswer};
    q.history=q.history||[];
    q.history.push({date:new Date().toISOString(), answer:ans, result:ok?"correct":"wrong", errorReason:q.errorReason||"", wasDue});
    xp((ok?8:4) + (wasDue?5:0), ok ? (wasDue?"questão revisada e acertada":"questão acertada") : (wasDue?"revisão vencida executada":"questão respondida"));

    const list=filteredQuestions();
    const pendingAfter=list.filter(x=>x.id!==q.id && !(n(x.attempts,0)>0));

    state.activeQuestionId=q.id;
    state.qxUnlockedNowId=q.id;
    state.qxSelectedAnswer="";
    save();

    if(!pendingAfter.length){
      toast("Questão respondida. Lista concluída; ao sair, ela voltará apenas na revisão.");
    }
  }
  function normalizeAnswer(v){ const s=String(v||"").trim().toLowerCase(); if(["c","certo","correto","verdadeiro","v"].includes(s)) return "certo"; if(["e","errado","falso","f"].includes(s)) return "errado"; return s.charAt(0); }
  function canonicalQuestionText(v){ return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").replace(/[^a-z0-9 ]/g,"").trim(); }
  function isDuplicateQuestion(statement, editingId){ const key=canonicalQuestionText(statement); if(!key) return false; return state.questions.some(q=>q.id!==editingId && canonicalQuestionText(q.statement)===key); }
  function moveQuestion(step){ const list=filteredQuestions(); if(!list.length) return; const idx=currentQuestionIndex(list); const next=list[clamp(idx+step,0,list.length-1)] || list[0]; state.activeQuestionId=next.id; qxLockPractice(); save(); }
  function shuffleQuestion(){ const list=filteredQuestions(); if(!list.length) return; const q=list[Math.floor(Math.random()*list.length)]; state.activeQuestionId=q.id; qxLockPractice(); save(); }
  function toggleFavoriteActive(){ const q=getActiveQuestion(); if(!q) return; q.favorite=!q.favorite; save(); toast(q.favorite?"Questão favoritada.":"Questão removida das favoritas."); }
  function deleteActiveQuestion(){ const q=getActiveQuestion(); if(!q) return; if(!confirm("Excluir esta questão do Banco QX?")) return; state.questions=state.questions.filter(x=>x.id!==q.id); state.activeQuestionId=filteredQuestions()[0]?.id||state.questions[0]?.id||null; qxLockPractice(); save(); toast("Questão excluída."); }

  function resetQuestionForm(){ const form=$("#question-form"); form.dataset.editing=""; form.hidden=false; ["#question-topic","#question-support","#question-statement","#question-answer","#question-source","#question-tags-input","#question-comment","#question-personal-comment"].forEach(s=>{ const el=$(s); if(el) el.value=""; }); $("#question-board").value=state.edital.board||""; $("#question-type").value=state.edital.type==="Múltipla escolha"?"Múltipla escolha":"Certo/Errado"; const title=$("#question-editor-title"); if(title) title.textContent="Nova questão"; const dup=$("#duplicate-warning"); if(dup){ dup.hidden=true; dup.textContent=""; } renderAlternativesBox(); form.scrollIntoView({behavior:"smooth",block:"start"}); }
  function fillQuestionForm(q){ const form=$("#question-form"); form.hidden=false; form.dataset.editing=q.id; $("#question-subject").value=q.subject; $("#question-topic").value=q.topic||""; $("#question-board").value=q.board||""; $("#question-type").value=q.type||"Certo/Errado"; $("#question-support").value=q.support||""; $("#question-statement").value=q.statement||""; $("#question-answer").value=q.answer||""; $("#question-source").value=q.source||""; $("#question-tags-input").value=(q.tags||[]).join(", "); $("#question-comment").value=q.comment||""; $("#question-personal-comment").value=q.personalComment||""; const title=$("#question-editor-title"); if(title) title.textContent="Editar questão"; renderAlternativesBox(q.alternatives||[]); form.scrollIntoView({behavior:"smooth",block:"start"}); }
  function renderAlternativesBox(values=[]){ const box=$("#alternatives-box"); if(!box) return; if($("#question-type")?.value!=="Múltipla escolha"){ box.innerHTML=`<div class="ce-help"><strong>Certo/Errado</strong><span>Use gabarito “Certo” ou “Errado”.</span></div>`; return; } box.innerHTML=Array.from({length:5},(_,i)=>`<label>Alternativa ${"ABCDE"[i]}<input data-alt="${"ABCDE"[i]}" value="${esc(values[i]||"")}" placeholder="Texto da alternativa ${"ABCDE"[i]}" /></label>`).join(""); }

  function renderSimulados(){
    $("#simulation-date").value ||= todayKey();
    $("#simulation-subject-inputs").innerHTML=subjects().map(s=>`<div class="sim-subject-row" data-subject="${esc(s.name)}"><span>${esc(s.name)}</span><label>Total<input type="number" min="0" data-field="total" placeholder="0"></label><label>Certas<input type="number" min="0" data-field="correct" placeholder="0"></label><label>Erradas<input type="number" min="0" data-field="wrong" placeholder="0"></label><label>Em branco<input type="number" min="0" data-field="blank" placeholder="0"></label></div>`).join("");
    const last=state.simulations[0];
    if(!last){ $("#last-simulation-score").textContent="--"; $("#last-simulation-detail").textContent="Nenhum simulado cadastrado."; $("#simulation-summary-kpis").innerHTML=""; $("#simulation-breakdown").innerHTML=""; $("#simulation-history").innerHTML=`<div class="history-item"><strong>Sem simulados</strong><span>Cadastre o resultado por disciplina.</span></div>`; renderSimulationComparator(); return; }
    $("#last-simulation-score").textContent=`${last.score} pts • ${last.percent}%`;
    $("#last-simulation-detail").textContent=`${last.name} • ${fmtDate(last.date)} • ${last.type} • ${last.total} questões`;
    $("#simulation-summary-kpis").innerHTML=`<div><span>Certas</span><strong>${last.correct}</strong></div><div><span>Erradas</span><strong>${last.wrong}</strong></div><div><span>Em branco</span><strong>${last.blank}</strong></div><div><span>Total</span><strong>${last.total}</strong></div>`;
    $("#simulation-breakdown").innerHTML=last.subjects.map(s=>`<div class="breakdown-card"><strong>${esc(s.subject)} • ${s.percent}%</strong><span>${s.correct} certas • ${s.wrong} erradas • ${s.blank} em branco • Pontos: ${s.score}</span><div class="breakdown-bar"><div style="width:${clamp(Math.max(0,s.percent),0,100)}%"></div></div></div>`).join("");
    $("#simulation-history").innerHTML=state.simulations.slice(0,8).map(sim=>`<div class="history-item"><strong>${esc(sim.name)} • ${sim.score} pts • ${sim.percent}%</strong><span>${fmtDate(sim.date)} • Certas: ${sim.correct} • Erradas: ${sim.wrong} • Em branco: ${sim.blank} • Total: ${sim.total}</span></div>`).join(""); renderSimulationComparator();
  }

  function syncTimerFromClock(){
    if(!timer.running || !timer.endsAt) return;
    timer.remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
  }
  function calculateFocusForecastEndAt(){
    const todayFocus=focusMinutesForToday();
    const remainMin=Math.max(0,state.settings.dailyHours*60-todayFocus);
    if(!remainMin) return null;
    const cycles=Math.ceil(remainMin/Math.max(1,state.settings.focusMinutes));
    const totalMin=remainMin+cycles*state.settings.breakMinutes;
    return Date.now()+totalMin*60000;
  }

  function initAlarmAudio(){
    try{
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if(!AudioCtx) return null;
      if(!timer.alarmCtx) timer.alarmCtx = new AudioCtx();
      if(timer.alarmCtx.state === "suspended") timer.alarmCtx.resume().catch(()=>{});
      return timer.alarmCtx;
    }catch{
      return null;
    }
  }

  function playTone(ctx, frequency, start, duration, gainValue=0.09){
    if(!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + start);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.03);
  }

  function playTimerAlarm(kind="finish"){
    const ctx = initAlarmAudio();
    if(ctx){
      if(kind === "start"){
        playTone(ctx, 660, 0, .16, .07);
        playTone(ctx, 880, .18, .18, .08);
      }else{
        playTone(ctx, 784, 0, .22, .09);
        playTone(ctx, 988, .28, .22, .09);
        playTone(ctx, 1175, .56, .34, .10);
      }
    }
    if(navigator.vibrate){
      navigator.vibrate(kind === "start" ? [70,40,70] : [180,80,180,80,260]);
    }
  }

  async function requestTimerWakeLock(){
    try{
      if("wakeLock" in navigator && !timer.wakeLock){
        timer.wakeLock = await navigator.wakeLock.request("screen");
        timer.wakeLock.addEventListener("release", () => { timer.wakeLock = null; });
      }
    }catch{
      timer.wakeLock = null;
    }
  }

  function releaseTimerWakeLock(){
    try{
      if(timer.wakeLock){
        const lock = timer.wakeLock;
        timer.wakeLock = null;
        lock.release().catch(()=>{});
      }
    }catch{
      timer.wakeLock = null;
    }
  }

  function tickTimer(){
    if(!timer.running) return;
    syncTimerFromClock();
    if(timer.remaining <= 0){
      completeTimer(true);
    }else{
      renderTimer();
    }
  }

  function renderTimer(){
    syncTimerFromClock();
    const min=Math.floor(timer.remaining/60), sec=timer.remaining%60; $("#timer-display").textContent=`${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    if(timer.running) document.title=`${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")} • ${timer.mode==="focus"?"Foco":"Pausa"} • Setor X`; else document.title="Setor X PRO V4 QX | Central Tática de Estudos";
    const mini=$("#summary-mini-timer-display"); if(mini) mini.textContent=`${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    const miniMode=$("#summary-mini-timer-mode"); if(miniMode) miniMode.textContent=timer.mode==="focus"?"Foco tático":"Pausa estratégica";
    $("#timer-ring").style.strokeDashoffset=String(603*(1-(timer.total?1-timer.remaining/timer.total:0))); $("#timer-mode").textContent=timer.mode==="focus"?"Foco tático":"Pausa estratégica";
    const todayFocus=focusMinutesForToday();
    const remainMin=Math.max(0,state.settings.dailyHours*60-todayFocus);
    const forecastEndAt = timer.running && timer.focusForecastEndAt ? timer.focusForecastEndAt : calculateFocusForecastEndAt();
    const end=forecastEndAt?new Date(forecastEndAt):null;
    const dailyNeeded=questionGoalDailyNeeded(); state.settings.dailyQuestionGoal=dailyNeeded;
    const fm=$("#focus-minutes-today"); if(fm) fm.textContent=fmtMinutes(todayFocus);
    const focusSelect=$("#focus-subject");
    if(focusSelect && document.activeElement!==focusSelect){
      const names=subjectNames();
      const chosen=selectedFocusSubject();
      if(!focusSelect.options.length || names.some(s=>![...focusSelect.options].some(o=>o.value===s))) populateSubjects();
      focusSelect.value=names.includes(chosen)?chosen:(names[0]||"Geral");
      state.settings.focusSubject=focusSelect.value;
    }
    const fsToday=$("#focus-subject-today"); if(fsToday) fsToday.textContent=fmtMinutes(focusMinutesBySubjectToday(selectedFocusSubject()));
    const fsTotal=$("#focus-subject-total"); if(fsTotal) fsTotal.textContent=fmtMinutes(focusMinutesBySubject(selectedFocusSubject()));
    const fsLabel=$("#focus-subject-label"); if(fsLabel) fsLabel.textContent=selectedFocusSubject();
    $("#focus-end-forecast").textContent=remainMin&&end?end.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):"Meta batida";
    const dn=$("#daily-needed-auto"); if(dn) dn.textContent=fmtInt(dailyNeeded);
    const todayAnswered=questionsDoneToday();
    $("#questions-left-today").textContent=Math.max(0,dailyNeeded-todayAnswered);
    $("#daily-question-goal").value=dailyNeeded;
  }
  function startTimer(){
    if(timer.running) return;
    initAlarmAudio();
    playTimerAlarm("start");
    timer.running=true;
    timer.startedAt=Date.now();
    timer.endsAt=Date.now() + Math.max(1,timer.remaining) * 1000;
    timer.focusForecastEndAt=calculateFocusForecastEndAt();
    clearInterval(timer.interval);
    timer.interval=setInterval(tickTimer,1000);
    requestTimerWakeLock();
    toast("Cronômetro iniciado com alarme ativo.");
    renderTimer();
  }
  function pauseTimer(){
    syncTimerFromClock();
    timer.running=false;
    timer.startedAt=null;
    timer.endsAt=null;
    timer.focusForecastEndAt=null;
    clearInterval(timer.interval);
    releaseTimerWakeLock();
    renderTimer();
  }
  function resetTimer(){
    pauseTimer();
    timer.mode="focus";
    timer.total=state.settings.focusMinutes*60;
    timer.remaining=timer.total;
    renderTimer();
  }
  function completeTimer(auto=false){
    if(timer.running) syncTimerFromClock();
    timer.running=false;
    timer.startedAt=null;
    timer.endsAt=null;
    timer.focusForecastEndAt=null;
    clearInterval(timer.interval);
    releaseTimerWakeLock();
    playTimerAlarm("finish");
    if(timer.mode==="focus"){
      const elapsedSeconds=Math.max(0,(n(timer.total,0)-n(timer.remaining,0)));
      const m=auto ? state.settings.focusMinutes : Math.max(1,Math.round(elapsedSeconds/60));
      const subject=selectedFocusSubject();
      addFocusMinutesToday(m);
      addFocusMinutesToSubject(subject,m);
      state.stats.completedSessions++;
      xp(25+Math.round(m/5), auto ? `tempo finalizado em ${subject}` : `bloco de foco concluído em ${subject}`);
      timer.mode="break"; timer.total=state.settings.breakMinutes*60;
      toast(`Bloco finalizado. ${fmtMinutes(m)} salvos em ${subject}.`);
    }else{
      timer.mode="focus"; timer.total=state.settings.focusMinutes*60; xp(5,"pausa respeitada");
      toast("Pausa finalizada. Volte ao foco.");
    }
    timer.remaining=timer.total; timer.focusForecastEndAt=null; save();
  }
  function renderTAF(){
    const pr={run:Math.max(0,...state.taf.map(x=>n(x.run))),pullups:Math.max(0,...state.taf.map(x=>n(x.pullups))),pushups:Math.max(0,...state.taf.map(x=>n(x.pushups))),situps:Math.max(0,...state.taf.map(x=>n(x.situps)))};
    $("#pr-run").textContent=`${pr.run} m`; $("#pr-pullups").textContent=pr.pullups; $("#pr-pushups").textContent=pr.pushups; $("#pr-situps").textContent=pr.situps;

    const latest=latestTAF(), b=latest?bmi(latest.height,latest.weight):null;
    const ideal=latest?.height?idealRange(latest.height):null;
    const target=latest?.height?(n(latest.targetWeight)||autoTargetWeight(latest.height)):0;
    const cur=n(latest?.weight);
    const diff=cur&&target?Number((cur-target).toFixed(1)):0;
    const rel=relativeStrengthScore(latest);

    $("#bmi-value").textContent=latest?.weight?`${String(latest.weight).replace(".",",")}kg`:"--";
    $("#bmi-class").textContent=b?`IMC ${b.toFixed(1)} • ${bmiClass(b)}${latest?.age?` • ${latest.age} anos`:""}`:"Informe altura e peso.";
    $("#bmi-marker").style.left=`${b?clamp((b-15)/25*100,0,100):0}%`;
    const idealEl=$("#taf-ideal-range"); if(idealEl) idealEl.textContent=ideal?`${ideal.min.toFixed(1)}–${ideal.max.toFixed(1)}kg`:"--";
    const targetEl=$("#taf-target-weight"); if(targetEl) targetEl.textContent=target?`${target.toFixed(1)}kg`:"--";
    const diffEl=$("#taf-weight-diff"); if(diffEl) diffEl.textContent=cur&&target?`${Math.abs(diff).toFixed(1)}kg ${diff>0?"acima":"abaixo/ok"}`:"--";
    const relEl=$("#taf-relative-strength"); if(relEl) relEl.textContent=rel!==null?`${rel} • ${relativeStrengthClass(rel)}`:"--";

    if(latest?.height&&!$("#taf-height").value) $("#taf-height").value=latest.height;
    if(latest?.age&&!$("#taf-age").value) $("#taf-age").value=latest.age;

    let html=`<div><strong>Sem dados suficientes.</strong> Registre altura e peso para calcular IMC, faixa ideal, peso-alvo operacional e força relativa.</div>`;
    if(latest?.height&&latest?.weight){
      html=`<div><strong>IMC técnico:</strong> ${b.toFixed(1)} — ${bmiClass(b)}. A faixa saudável estimada por IMC é ${ideal.min.toFixed(1)}kg a ${ideal.max.toFixed(1)}kg.</div>
      <div><strong>Peso-alvo operacional:</strong> ${target.toFixed(1)}kg. Esse alvo usa IMC 24, mais realista para performance do que a média baixa da faixa saudável.</div>
      <div><strong>Força relativa:</strong> ${rel!==null?`${rel} (${relativeStrengthClass(rel)})`:"sem dados"}. Quanto maior sua força por kg corporal, melhor tende a ser barra, corrida e resistência.</div>
      <div><strong>Conduta operacional:</strong> ${tafRunRisk(b,latest.run)}</div>
      <div><strong>Diretriz:</strong> reduza peso sem perder força, monitore a média semanal e compare marcas contra os índices do TAF.</div>`;
    }
    $("#physical-analysis").innerHTML=html;

    const exs=tafExercises(), logs=tafLogs();
    const sel=$("#taf-log-exercise"); if(sel){ const curSel=sel.value; sel.innerHTML=exs.map(e=>`<option value="${e.id}">${esc(e.name)} — meta ${esc(e.target)} ${esc(e.unit||"")}</option>`).join("")||`<option value="">Cadastre um exercício</option>`; if(exs.some(e=>e.id===curSel)) sel.value=curSel; }
    const bestFor=e=>{ const vals=logs.filter(l=>l.exerciseId===e.id).map(l=>n(l.value)); if(!vals.length) return null; return e.mode==="lower"?Math.min(...vals):Math.max(...vals); };
    const doneFor=e=>{ const best=bestFor(e); if(best===null) return 0; return e.mode==="lower" ? (best<=n(e.target)?100:clamp(n(e.target)/Math.max(1,best)*100,0,100)) : clamp(best/Math.max(1,n(e.target))*100,0,140); };
    $("#taf-exercise-grid").innerHTML=exs.map(e=>{const best=bestFor(e), pct=doneFor(e); return `<div class="taf-ex-card" data-id="${e.id}"><div><strong>${esc(e.name)}</strong><span>Índice: ${esc(e.target)} ${esc(e.unit||"")} • ${e.mode==="lower"?"menor é melhor":"maior é melhor"}</span></div><div class="mini-progress"><span>Melhor marca: ${best===null?"--":esc(best)} ${esc(e.unit||"")} • ${Math.round(pct)}% do índice</span><div class="progress-track"><div class="progress-fill" style="width:${clamp(pct,0,100)}%"></div></div></div><button class="delete-mini" data-action="delete-taf-ex"><i class="fa-solid fa-trash"></i></button></div>`}).join("")||`<div class="history-item"><strong>Nenhum exercício padrão</strong><span>Cadastre os exercícios exigidos no TAF do edital.</span></div>`;
    const physicalHistory=state.taf.slice(0,8).map(x=>{ const xb=bmi(x.height,x.weight), xr=relativeStrengthScore(x); return `<div class="history-item"><strong>${fmtDate(x.date)} • ${x.weight||"--"}kg • IMC ${xb?.toFixed(1)||"--"}${x.age?` • ${x.age} anos`:""}</strong><span>Alvo: ${x.targetWeight||autoTargetWeight(x.height)||"--"}kg • Força relativa: ${xr??"--"} • Corrida: ${x.run||0}m • Barra: ${x.pullups||0} • Flexões: ${x.pushups||0} • Abdômen: ${x.situps||0}</span></div>`}).join("");
    const performanceHistory=logs.slice(0,10).map(l=>{const e=exs.find(x=>x.id===l.exerciseId); return `<div class="history-item"><strong>${fmtDate(l.date)} • ${esc(e?.name||"Exercício")}: ${esc(l.value)} ${esc(e?.unit||"")}</strong><span>Meta: ${esc(e?.target||"--")} ${esc(e?.unit||"")} • ${esc(l.note||"Sem observação")}</span></div>`}).join("");
    $("#taf-history").innerHTML=(physicalHistory||`<div class="history-item"><strong>Sem registros físicos</strong><span>Adicione peso, altura, idade e marcas de TAF.</span></div>`)+performanceHistory;
  }

  function lawKey(title){ return String(title||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
  function lawMarks(){ state.lawMarks = state.lawMarks && typeof state.lawMarks==="object" ? state.lawMarks : {}; return state.lawMarks; }
  function lawMarkFor(title){ const marks=lawMarks(), key=lawKey(title); marks[key]=marks[key]||{read:false,important:false,review:false,note:"",updatedAt:""}; return marks[key]; }
  function toggleLawMark(title, field){ const mark=lawMarkFor(title); mark[field]=!mark[field]; mark.updatedAt=new Date().toISOString(); xp(field==="read"?3:2, field==="read"?"lei marcada":"marcação de lei"); save(); }
  function lawMarkStats(){ const vals=Object.values(lawMarks()); return { read: vals.filter(v=>v.read).length, important: vals.filter(v=>v.important).length, review: vals.filter(v=>v.review).length, marked: vals.filter(v=>v.read||v.important||v.review||v.note).length }; }

  function renderLaws(){
    const search=($("#law-search").value||"").toLowerCase(), filter=$("#law-filter").value;
    const stats=lawMarkStats(), summary=$("#law-mark-summary");
    if(summary) summary.innerHTML=`<div><span>Marcadas</span><strong>${fmtInt(stats.marked)}</strong></div><div><span>Lidas</span><strong>${fmtInt(stats.read)}</strong></div><div><span>Importantes</span><strong>${fmtInt(stats.important)}</strong></div><div><span>Revisar</span><strong>${fmtInt(stats.review)}</strong></div>`;
    const list=lawLinks.filter(l=>{
      const mark=lawMarkFor(l.title);
      const textOk=!search||`${l.title} ${l.desc} ${l.category} ${mark.note||""}`.toLowerCase().includes(search);
      const catOk=filter==="all"||l.category===filter||
        (filter==="marked"&&(mark.read||mark.important||mark.review||mark.note))||
        (filter==="read"&&mark.read)||
        (filter==="important"&&mark.important)||
        (filter==="review"&&mark.review);
      return textOk&&catOk;
    });
    $("#law-grid").innerHTML=list.map(l=>{ const mark=lawMarkFor(l.title); const key=lawKey(l.title); return `<article class="law-card law-mark-card ${mark.read?"read":""} ${mark.important?"important":""} ${mark.review?"review":""}" data-law-title="${esc(l.title)}">
      <div class="law-card-top"><strong>${esc(l.title)}</strong><span class="tag">${esc(labelLaw(l.category))}</span></div>
      <span>${esc(l.desc)}</span>
      <div class="law-mark-actions">
        <button class="ghost-btn small ${mark.read?"active":""}" type="button" data-law-action="read"><i class="fa-solid fa-check"></i> Lida</button>
        <button class="ghost-btn small ${mark.important?"active":""}" type="button" data-law-action="important"><i class="fa-solid fa-star"></i> Importante</button>
        <button class="ghost-btn small ${mark.review?"active":""}" type="button" data-law-action="review"><i class="fa-solid fa-rotate"></i> Revisar</button>
      </div>
      <textarea class="law-note" data-law-note="${esc(key)}" rows="3" placeholder="Anotação rápida: artigo, pegadinha, jurisprudência, literalidade...">${esc(mark.note||"")}</textarea>
      <a href="${l.url}" target="_blank" rel="noopener noreferrer">Abrir fonte oficial <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
    </article>`}).join("")||`<article class="law-card"><strong>Nenhum atalho encontrado</strong><span>Ajuste os filtros ou marcações.</span></article>`;
  }
  function labelLaw(c){return {constitucional:"Constitucional",penal:"Penal / Processo Penal",administrativo:"Administrativo",especial:"Legislação Especial",transito:"Trânsito",jurisprudencia:"Jurisprudência"}[c]||"Geral";}


  function dayISO(date){ return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
  function monthLabel(date){ return date.toLocaleDateString("pt-BR",{month:"long",year:"numeric"}).replace(/^./,c=>c.toUpperCase()); }

  function calendarEvents(){ state.calendarEvents = state.calendarEvents && typeof state.calendarEvents==="object" ? state.calendarEvents : {}; return state.calendarEvents; }
  function eventsForDate(dateKey){ const events=calendarEvents(); events[dateKey]=Array.isArray(events[dateKey])?events[dateKey]:[]; return events[dateKey]; }
  function eventTypeLabel(type){ return {prova:"Prova",exame:"Exame médico",taf:"TAF",documento:"Documento",estudo:"Estudo",outro:"Outro"}[type]||"Evento"; }
  function eventTypeIcon(type){ return {prova:"fa-file-pen",exame:"fa-stethoscope",taf:"fa-person-running",documento:"fa-file-shield",estudo:"fa-book-open",outro:"fa-calendar-day"}[type]||"fa-calendar-day"; }

  function studyDayMetrics(dateKey){
    const focus=n(focusByDate()[dateKey],0);
    const bank=bankQuestionsDoneOn(dateKey);
    const manual=parsePtInt(manualByDate()[dateKey]||0);
    const sims=state.simulations.filter(s=>String(s.date||"").slice(0,10)===dateKey).length;
    const taf=(state.taf||[]).filter(x=>String(x.date||"").slice(0,10)===dateKey).length + (state.tafExerciseLogs||[]).filter(x=>String(x.date||"").slice(0,10)===dateKey).length;
    const resumos=summaries().filter(s=>String(s.updatedAt||s.createdAt||"").slice(0,10)===dateKey).length;
    const questions=bank+manual;
    const events=eventsForDate(dateKey).length;
    const score=(focus?1:0)+(questions?1:0)+(sims?1:0)+(taf?1:0)+(resumos?1:0)+(events?1:0);
    return {focus,bank,manual,questions,sims,taf,resumos,events,score,active:score>0};
  }
  function currentStudyStreak(){
    let d=new Date(), streak=0;
    for(let i=0;i<370;i++){
      const key=dayISO(d), m=studyDayMetrics(key);
      if(m.active) streak++; else if(i===0){ d.setDate(d.getDate()-1); continue; } else break;
      d.setDate(d.getDate()-1);
    }
    return streak;
  }
  function renderCalendar(){
    const grid=$("#study-calendar-grid"); if(!grid) return;
    const offset=n(state.ui.calendarOffset,0), today=new Date(), base=new Date(today.getFullYear(),today.getMonth()+offset,1);
    const year=base.getFullYear(), month=base.getMonth(), first=new Date(year,month,1), last=new Date(year,month+1,0);
    $("#calendar-title").textContent=monthLabel(base);
    $("#calendar-subtitle").textContent=`${last.getDate()} dias monitorados • clique em um dia para detalhes`;
    const cells=[];
    for(let i=0;i<first.getDay();i++) cells.push(`<div class="calendar-cell empty"></div>`);
    let activeDays=0,totalFocus=0,totalQuestions=0,totalSims=0;
    for(let day=1; day<=last.getDate(); day++){
      const d=new Date(year,month,day), key=dayISO(d), m=studyDayMetrics(key), isToday=key===todayKey();
      if(m.active) activeDays++;
      totalFocus+=m.focus; totalQuestions+=m.questions; totalSims+=m.sims;
      const level=m.score>=4?"high":m.score>=2?"mid":m.score>=1?"low":"none";
      const eventList=eventsForDate(key);
      cells.push(`<button class="calendar-cell ${level} ${isToday?"today":""} ${eventList.length?"has-event":""}" type="button" data-date="${key}">
        <strong>${day}</strong>
        <span>${m.focus?`${fmtMinutes(m.focus)}`:""}</span>
        <small>${m.questions?`${fmtInt(m.questions)} q`:""}${m.sims?` • ${m.sims} sim`:""}${eventList.length?` • ${eventList.length} evento(s)`:""}</small>
        ${eventList.length?`<em class="calendar-event-mini"><i class="fa-solid ${eventTypeIcon(eventList[0].type)}"></i> ${esc(eventList[0].title).slice(0,22)}</em>`:""}
      </button>`);
    }
    grid.innerHTML=cells.join("");
    const daysUntilToday = offset===0 ? today.getDate() : last.getDate();
    const freq=Math.round(activeDays/Math.max(1,daysUntilToday)*100);
    const rhythm=freq>=80?"Operacional forte":freq>=60?"Bom ritmo":freq>=35?"Ritmo irregular":"Baixa frequência";
    $("#cal-active-days").textContent=fmtInt(activeDays);
    $("#cal-frequency").textContent=`${freq}%`;
    $("#cal-rhythm").textContent=rhythm;
    $("#cal-streak").textContent=`${fmtInt(currentStudyStreak())} dias`;
  }
  function showCalendarDetail(dateKey){
    const m=studyDayMetrics(dateKey), el=$("#calendar-detail"); if(!el) return;
    const ev=eventsForDate(dateKey);
    const eventsHtml=ev.length?`<div class="calendar-events-list">${ev.map(item=>`<div class="calendar-event-chip ${esc(item.type)}" data-event-id="${esc(item.id)}" data-date="${esc(dateKey)}"><span><i class="fa-solid ${eventTypeIcon(item.type)}"></i> <b>${esc(eventTypeLabel(item.type))}</b> — ${esc(item.title)}</span><button type="button" data-delete-event="${esc(item.id)}"><i class="fa-solid fa-trash"></i></button></div>`).join("")}</div>`:`<div class="calendar-events-list muted-line">Nenhuma data importante marcada neste dia.</div>`;
    el.innerHTML=`<strong>${fmtDate(dateKey)} • ${m.active?"Dia ativo":"Dia sem registro"}</strong>
    <span>Tempo líquido: ${fmtMinutes(m.focus)} • Questões: ${fmtInt(m.questions)} (${fmtInt(m.bank)} Banco QX + ${fmtInt(m.manual)} manual) • Simulados: ${fmtInt(m.sims)} • TAF: ${fmtInt(m.taf)} • Resumos: ${fmtInt(m.resumos)} • Eventos: ${fmtInt(ev.length)}</span>
    ${eventsHtml}`;
    const input=$("#calendar-event-date"); if(input) input.value=dateKey;
  }


  function renderRanks(){
    state.stats=state.stats&&typeof state.stats==="object"?{...clone(defaultState.stats),...state.stats}:clone(defaultState.stats);
    const {cur,next}=currentRank();
    if(!cur){ console.warn("[Setor X] patente atual inválida"); return; }
    const xpNow=Math.max(0,n(state.stats?.xp,0));
    const set=(sel,prop,val)=>{ const el=$(sel); if(el) el[prop]=val; };
    const setHTML=(sel,val)=>{ const el=$(sel); if(el) el.innerHTML=val; };
    setHTML("#rank-emblem",rankIcon(cur));
    set("#rank-title","textContent",cur.title);
    set("#rank-description","textContent",cur.desc);
    set("#rank-xp","textContent",`${fmtInt(xpNow)} XP`);
    set("#sidebar-rank","textContent",cur.title);
    set("#sidebar-xp","textContent",`${fmtInt(xpNow)} XP operacional`);
    setHTML("#top-rank-badge",`<span class="mini-rank">${rankIcon(cur,true)}</span><div><strong>${esc(cur.title)}</strong><small>${fmtInt(xpNow)} XP</small></div>`);
    const nextEl=$("#rank-next"), bar=$("#rank-progress-bar");
    if(next){ const span=Math.max(1,next.xp-cur.xp), done=xpNow-cur.xp; if(nextEl) nextEl.textContent=`Próxima: ${next.title} • faltam ${fmtInt(Math.max(0,next.xp-xpNow))} XP`; if(bar) bar.style.width=`${clamp(done/span*100,0,100)}%`; }
    else { if(nextEl) nextEl.textContent="Patente máxima alcançada"; if(bar) bar.style.width="100%"; }
    setHTML("#rank-ladder",ranks.map(r=>`<div class="rank-step ${xpNow>=r.xp?"reached":""}"><div class="rank-step-icon">${rankIcon(r,true)}</div><strong>${esc(r.title)}</strong><span>${fmtInt(r.xp)} XP</span></div>`).join(""));
  }


  function initFocusMusic(){
    const input=$("#local-music-files"), player=$("#focus-audio-player"), list=$("#local-music-list");
    if(!input || !player || !list || input.dataset.bound==="1") return;
    input.dataset.bound="1";
    input.onchange=()=>{
      const files=Array.from(input.files||[]).filter(f=>f.type.startsWith("audio/"));
      if(!files.length){ list.innerHTML="<span>Nenhuma música local selecionada.</span>"; return; }
      list.innerHTML=files.map((f,i)=>`<button class="music-local-item ${i===0?"active":""}" type="button" data-i="${i}"><i class="fa-solid fa-play"></i><span>${esc(f.name)}</span></button>`).join("");
      const urls=files.map(f=>URL.createObjectURL(f));
      const playIndex=(i)=>{ player.src=urls[i]; player.play().catch(()=>{}); $$(".music-local-item",list).forEach(b=>b.classList.toggle("active",Number(b.dataset.i)===i)); };
      list.onclick=e=>{ const btn=e.target.closest(".music-local-item"); if(btn) playIndex(Number(btn.dataset.i)); };
      playIndex(0);
    };
  }


  function renderSummaries(){
    const list=$("#summary-list"), search=($("#summary-search")?.value||"").toLowerCase().trim();
    if(!list) return;
    const data=summaries().filter(s=>`${s.title||""} ${s.subject||""} ${s.content||""} ${(s.questionLinks||[]).join(" ")} ${(s.videos||[]).join(" ")}`.toLowerCase().includes(search));
    list.innerHTML=data.map(s=>`<article class="summary-card" data-id="${s.id}">
      <div>
        <strong>${esc(s.title||"Resumo sem título")}</strong>
        <span>${esc(s.subject||"Geral")} • ${fmtInt((s.questionLinks||[]).length)} questões • ${fmtInt((s.videos||[]).length)} vídeos • Atualizado em ${fmtDate(String(s.updatedAt||s.createdAt||todayKey()).slice(0,10))}</span>
      </div>
      <div class="summary-card-actions">
        <button class="ghost-btn small" data-action="open-summary" type="button"><i class="fa-solid fa-eye"></i> Abrir</button>
        <button class="danger-btn small" data-action="delete-summary" type="button"><i class="fa-solid fa-trash"></i></button>
      </div>
    </article>`).join("") || `<div class="history-item"><strong>Nenhum resumo encontrado</strong><span>Crie seu primeiro resumo pessoal no editor ao lado.</span></div>`;
  }

  function ensureSummaryModalLayer(){
    const modal=$("#summary-editor-card"), backdrop=$("#summary-modal-backdrop");
    if(!modal || !backdrop || modal.dataset.layerReady==="1") return;
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    modal.dataset.layerReady="1";
  }

  function openSummaryEditor(){
    ensureSummaryModalLayer();
    const modal=$("#summary-editor-card"), backdrop=$("#summary-modal-backdrop");
    if(backdrop){ backdrop.hidden=false; backdrop.classList.add("show"); }
    if(modal){ modal.hidden=false; modal.classList.remove("summary-closed"); modal.classList.add("show"); }
    document.body.classList.add("summary-modal-open");
    renderSummaryQuestionOptions();
  }
  function closeSummaryEditor(){
    const modal=$("#summary-editor-card"), backdrop=$("#summary-modal-backdrop");
    if(modal){ modal.classList.add("summary-closed"); modal.classList.remove("show"); modal.hidden=true; }
    if(backdrop){ backdrop.classList.remove("show"); backdrop.hidden=true; }
    document.body.classList.remove("summary-modal-open");
  }

  function refreshSummaryCurrentInfo(){
    const info=$("#summary-current-info"); if(!info) return;
    const title=$("#summary-title")?.value?.trim(), subject=$("#summary-subject")?.value?.trim();
    if(!title){ info.innerHTML=`<strong>Nenhum resumo aberto</strong><span>Abra ou crie um resumo. O editor abre em janela própria para manter a plataforma organizada.</span>`; return; }
    const words=($("#summary-editor")?.innerText||"").trim().split(/\s+/).filter(Boolean).length;
    const links=summaryCurrentLinks().length, videos=summaryCurrentVideos().length;
    info.innerHTML=`<strong>${esc(title)}</strong><span>${esc(subject||"Geral")} • ${fmtInt(words)} palavras • ${fmtInt(links)} questões vinculadas • ${fmtInt(videos)} vídeos</span>`;
  }
  function summaryCurrentLinks(){ try{return JSON.parse($("#summary-linked-questions")?.value||"[]")}catch{return []} }
  function setSummaryCurrentLinks(ids){ const unique=[...new Set((ids||[]).filter(Boolean))]; const el=$("#summary-linked-questions"); if(el) el.value=JSON.stringify(unique); renderSummaryLinks(); refreshSummaryCurrentInfo(); }
  function summaryCurrentVideos(){ try{return JSON.parse($("#summary-videos-data")?.value||"[]")}catch{return []} }
  function setSummaryCurrentVideos(videos){ const clean=(videos||[]).filter(Boolean); const el=$("#summary-videos-data"); if(el) el.value=JSON.stringify(clean); renderSummaryVideos(); refreshSummaryCurrentInfo(); }
  function summaryQuestionLabel(q){ return `${q.subject||"Geral"} • ${q.topic||"Assunto"} • ${String(q.statement||"").replace(/\s+/g," ").slice(0,90)}`; }
  function renderSummaryQuestionOptions(){
    const sel=$("#summary-question-select"); if(!sel) return;
    const linked=new Set(summaryCurrentLinks());
    const candidates=state.questions.filter(q=>(q.status==="wrong"||n(q.wrongCount,0)>0)&&!linked.has(q.id));
    sel.innerHTML=candidates.map(q=>`<option value="${esc(q.id)}">${esc(summaryQuestionLabel(q))}</option>`).join("") || `<option value="">Nenhum erro disponível no Banco QX</option>`;
  }
  function renderSummaryLinks(){
    const box=$("#summary-linked-list"); if(!box) return;
    const links=summaryCurrentLinks();
    box.innerHTML=links.map(id=>{ const q=state.questions.find(x=>x.id===id); return `<div class="summary-linked-chip" data-id="${esc(id)}"><span>${esc(q?summaryQuestionLabel(q):"Questão não encontrada")}</span><button type="button" data-remove-link="${esc(id)}"><i class="fa-solid fa-xmark"></i></button></div>`; }).join("") || `<span>Nenhuma questão vinculada. Vincule erros para revisar o resumo junto com o Banco QX.</span>`;
    renderSummaryQuestionOptions();
  }
  function youtubeVideoInfo(url){
    const raw=String(url||"").trim(); if(!raw) return {url:"",watch:"",id:"",thumb:"",isYoutube:false};
    let id="";
    const patterns=[
      /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
      /youtube\.com\/watch\?.*?[?&]?v=([a-zA-Z0-9_-]{6,})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
      /youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/
    ];
    for(const p of patterns){ const m=raw.match(p); if(m){ id=m[1]; break; } }
    id=(id||"").split(/[?&]/)[0];
    return id ? {url:raw,watch:`https://www.youtube.com/watch?v=${id}`,id,thumb:`https://img.youtube.com/vi/${id}/hqdefault.jpg`,isYoutube:true} : {url:raw,watch:raw,id:"",thumb:"",isYoutube:false};
  }
  function youtubeEmbedUrl(url){
    const info=youtubeVideoInfo(url);
    return info.watch || info.url;
  }
  function renderSummaryVideos(){
    const box=$("#summary-video-list"); if(!box) return;
    const videos=summaryCurrentVideos();
    box.innerHTML=videos.map((v,i)=>{ const info=youtubeVideoInfo(v); return `<div class="summary-video-item video-link-card" data-i="${i}">
      ${info.isYoutube?`<a class="summary-video-thumb" href="${esc(info.watch)}" target="_blank" rel="noopener noreferrer"><img src="${esc(info.thumb)}" alt="Miniatura do vídeo"><span><i class="fa-brands fa-youtube"></i> Abrir no YouTube</span></a>`:`<a class="summary-video-external" href="${esc(info.watch||info.url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-up-right-from-square"></i> ${esc(info.watch||info.url)}</a>`}
      <button type="button" data-remove-video="${i}" class="danger-btn small"><i class="fa-solid fa-trash"></i></button>
    </div>`}).join("") || `<span>Nenhum vídeo vinculado.</span>`;
  }
  function renderSummaryToc(){
    const editor=$("#summary-editor"), list=$("#summary-toc-list"); if(!editor||!list) return;
    const mode=$("#summary-toc-mode")?.value||"all";
    const selector=mode==="titles" ? "h1,h2" : "h1,h2,h3";
    const heads=Array.from(editor.querySelectorAll(selector)).filter(h=>h.textContent.trim());
    if(!heads.length){ list.innerHTML=`<span>Use “Título” ou “Subtítulo” para criar o sumário.</span>`; refreshSummaryCurrentInfo(); return; }
    heads.forEach((h,i)=>{ if(!h.id) h.id=`summary-heading-${Date.now()}-${i}`; });
    list.innerHTML=heads.map(h=>`<button type="button" class="summary-toc-item ${h.tagName.toLowerCase()}" data-target="${esc(h.id)}">${esc(h.textContent.trim())}</button>`).join("");
    refreshSummaryCurrentInfo();
  }
  function normalizeSummaryFont(){
    const editor=$("#summary-editor"); if(!editor) return;
    editor.style.fontFamily="Arial, sans-serif";
    editor.querySelectorAll("*").forEach(el=>{
      el.style.fontFamily="Arial, sans-serif";
      el.style.fontSize="";
      el.style.lineHeight="";
    });
    renderSummaryToc();
    toast("Fonte ajustada para Arial.");
  }
  function buildOrganizedSummaryHtml(raw){
    const lines=String(raw||"").replace(/\r/g,"").trim().split(/\n+/).map(x=>x.trim()).filter(Boolean);
    const mark=(text)=>{
      let s=esc(text);
      s=s.replace(/\b(Art\.?\s*\d+[ºo]?(?:-[A-Z])?|§\s*\d+[ºo]?|inciso\s+[IVXLCDM]+|Lei\s*n?[º°]?\s*[\d.]+\/\d{2,4}|CF\/?88|Constituição Federal|CPP|CP|CTB|ECA|LEP|LGPD|LINDB)\b/gi,'<mark class="mk-law">$1</mark>');
      s=s.replace(/\b(STF|STJ|súmula|jurisprudência|informativo|repercussão geral|tema\s*\d+|tese|entendimento)\b/gi,'<mark class="mk-juris">$1</mark>');
      s=s.replace(/\b(atenção|cuidado|pegadinha|exceto|salvo|ressalvado|nunca|sempre|vedado|obrigatório|facultativo|poderá|deverá|não se aplica|competência|legitimidade)\b/gi,'<mark class="mk-alert">$1</mark>');
      s=s.replace(/\b(\d+\s*(dias?|meses?|anos?|horas?)|prazo|prescrição|decadência|prorrogável|improrrogável)\b/gi,'<mark class="mk-time">$1</mark>');
      s=s.replace(/\b(CEBRASPE|CESPE|FGV|VUNESP|FCC|IAUPE|AOCP|IBFC)\b/gi,'<mark class="mk-banca">$1</mark>');
      return s;
    };
    const isHeading=(line,i)=> i===0 && line.length<120 || /:$/.test(line) || /^(\d+\.|[IVXLCDM]+\.)\s+/.test(line) || (/^[A-ZÁÉÍÓÚÃÕÇ0-9\s\/.-]{6,}$/.test(line) && line.length<95);
    const isBullet=(line)=>/^([-•*]|✅|►|>)\s*/.test(line);
    let html="", openList=false;
    const closeList=()=>{ if(openList){ html+="</ul>"; openList=false; } };
    lines.forEach((line,i)=>{
      const clean=line.replace(/\s+/g," ").trim();
      if(isHeading(clean,i)){ closeList(); html+=`<h2>${mark(clean.replace(/:$/,""))}</h2>`; return; }
      if(isBullet(clean)){ if(!openList){ html+='<ul class="summary-auto-list">'; openList=true; } html+=`<li>${mark(clean.replace(/^([-•*]|✅|►|>)\s*/,""))}</li>`; return; }
      closeList();
      const sentences=clean.split(/(?<=[.!?;])\s+/).filter(Boolean);
      const first=sentences.shift()||clean;
      html+=`<p><strong>${mark(first)}</strong>${sentences.length?` ${sentences.map(mark).join(" ")}`:""}</p>`;
    });
    closeList();
    return html || esc(raw);
  }
  function organizeSummaryContent(){
    const editor=$("#summary-editor"); if(!editor) return;
    const sel=window.getSelection();
    if(!sel || sel.rangeCount===0 || sel.isCollapsed) return toast("Selecione o trecho do resumo que deseja organizar.");
    const range=sel.getRangeAt(0);
    if(!editor.contains(range.commonAncestorContainer)) return toast("Selecione um trecho dentro do resumo.");
    const raw=sel.toString().trim();
    if(!raw) return toast("Selecione um trecho com texto.");
    const holder=document.createElement("div");
    holder.innerHTML=buildOrganizedSummaryHtml(raw);
    const frag=document.createDocumentFragment();
    while(holder.firstChild) frag.appendChild(holder.firstChild);
    range.deleteContents();
    range.insertNode(frag);
    sel.removeAllRanges();
    normalizeSummaryFont();
    renderSummaryToc();
    toast("Organização PRO aplicada somente ao trecho selecionado.");
  }

    function renderCurrentSummaryReview(){
    const panel=$(".summary-review-panel"), box=$("#summary-review-status"); if(!box) return;
    const id=$("#summary-id")?.value;
    const s=id?summaries().find(x=>x.id===id):null;
    if(!s){
      if(panel) panel.hidden=true;
      box.innerHTML=`<span>Salve o resumo para ativar o ciclo de revisão.</span>`;
      return;
    }
    if(panel) panel.hidden=false;
    normalizeSummaryReview(s);
    const due=s.nextReview && s.nextReview<=todayKey();
    box.innerHTML=`<span class="${due?"rev-due":"rev-ok"}">${due?"Revisão vencida":"Próxima revisão"}</span><strong>${fmtDate(s.nextReview)}</strong><small>Nível ${fmtInt((s.reviewLevel||0)+1)} • ${fmtInt((s.reviewHistory||[]).length)} revisão(ões) feitas</small>`;
  }
  function markCurrentSummaryReview(rating){
    const id=$("#summary-id")?.value;
    if(!id) return toast("Salve o resumo antes de registrar revisão.");
    markSummaryReview(id,rating);
    renderCurrentSummaryReview();
  }
  
  function clearSummaryEditor(){
    const id=$("#summary-id"), title=$("#summary-title"), subject=$("#summary-subject"), editor=$("#summary-editor");
    openSummaryEditor();
    if(id) id.value=""; if(title) title.value=""; if(subject) subject.value="";
    const l=$("#summary-linked-questions"), v=$("#summary-videos-data"); if(l) l.value="[]"; if(v) v.value="[]";
    if(editor){ editor.innerHTML=""; editor.dataset.placeholder="Digite seu resumo aqui. Use Título/Subtítulo, cores e marca-texto para organizar."; }
    renderSummaryLinks(); renderSummaryVideos(); renderSummaryToc(); renderCurrentSummaryReview();
  }
  function loadSummaryEditor(summary){
    openSummaryEditor();
    $("#summary-id").value=summary.id;
    $("#summary-title").value=summary.title||"";
    $("#summary-subject").value=summary.subject||"";
    $("#summary-linked-questions").value=JSON.stringify(summary.questionLinks||[]);
    $("#summary-videos-data").value=JSON.stringify(summary.videos||[]);
    $("#summary-editor").innerHTML=summary.content||"";
    renderSummaryLinks(); renderSummaryVideos(); renderSummaryToc(); renderCurrentSummaryReview();
    $("#summary-title")?.focus();
  }
  function saveSummaryFromEditor(){
    const id=$("#summary-id").value || uid(), title=$("#summary-title").value.trim(), subject=$("#summary-subject").value.trim()||"Geral", content=$("#summary-editor").innerHTML.trim();
    if(!title) return toast("Informe o título do resumo.");
    if(!content || content==="<br>") return toast("Escreva o conteúdo do resumo.");
    const arr=summaries(), old=arr.find(s=>s.id===id);
    const item=normalizeSummaryReview({...(old||{}),id,title,subject,content,questionLinks:summaryCurrentLinks(),videos:summaryCurrentVideos(),updatedAt:new Date().toISOString(),createdAt:old?.createdAt||new Date().toISOString()});
    if(old) arr[arr.findIndex(s=>s.id===id)]=item; else arr.unshift(item);
    $("#summary-id").value=id;
    renderSummaryToc(); renderCurrentSummaryReview();
    xp(old?4:8, old?"resumo atualizado":"resumo criado");
    save();
  }
  function applySummaryCommand(command, value=null){
    const editor=$("#summary-editor"); if(!editor) return;
    editor.focus();
    if(command==="hiliteColor"){
      document.execCommand("hiliteColor",false,value);
      document.execCommand("backColor",false,value);
      renderSummaryToc();
      return;
    }
    if(command==="formatBlock"){
      document.execCommand("formatBlock",false,value);
      renderSummaryToc();
      return;
    }
    document.execCommand(command,false,value);
    renderSummaryToc();
  }


  function simSubjectMap(sim){ const map={}; (sim?.subjects||[]).forEach(s=>{ map[s.name||"Geral"]=s; }); return map; }
  function renderSimulationComparator(){
    const box=$("#simulation-comparator"); if(!box) return;
    const sims=state.simulations||[];
    if(sims.length<2){ box.innerHTML=`<div class="history-item"><strong>Comparador aguardando dados</strong><span>Cadastre pelo menos 2 simulados para comparar evolução.</span></div>`; return; }
    const [last,prev]=sims;
    const deltaScore=n(last.score)-n(prev.score), deltaPct=n(last.percent)-n(prev.percent);
    const subjNames=[...new Set([...(last.subjects||[]).map(s=>s.name),...(prev.subjects||[]).map(s=>s.name)])];
    const lm=simSubjectMap(last), pm=simSubjectMap(prev);
    const rows=subjNames.map(name=>{ const a=lm[name]||{}, b=pm[name]||{}; const pa=n(a.total)?Math.round(n(a.correct)/Math.max(1,n(a.total))*100):0; const pb=n(b.total)?Math.round(n(b.correct)/Math.max(1,n(b.total))*100):0; return {name,pa,pb,delta:pa-pb}; }).sort((a,b)=>a.delta-b.delta);
    const worse=rows[0], best=rows[rows.length-1];
    box.innerHTML=`<div class="sim-compare-top">
      <div><span>Anterior</span><strong>${esc(prev.name)}</strong><small>${fmtDate(prev.date)} • ${prev.score} pts • ${prev.percent}%</small></div>
      <div><span>Atual</span><strong>${esc(last.name)}</strong><small>${fmtDate(last.date)} • ${last.score} pts • ${last.percent}%</small></div>
      <div class="${deltaScore>=0?"positive":"negative"}"><span>Variação</span><strong>${deltaScore>=0?"+":""}${deltaScore} pts</strong><small>${deltaPct>=0?"+":""}${deltaPct}% de aproveitamento</small></div>
    </div>
    <div class="sim-compare-insight">
      <strong>${deltaScore>=0?"Evolução detectada":"Queda detectada"}</strong>
      <span>${worse?`Maior alerta: ${esc(worse.name)} (${worse.delta>=0?"+":""}${worse.delta}%).`:"Sem disciplinas comparáveis."} ${best?`Melhor evolução: ${esc(best.name)} (${best.delta>=0?"+":""}${best.delta}%).`:""}</span>
    </div>
    <div class="sim-compare-table">${rows.map(r=>`<div><span>${esc(r.name)}</span><strong>${r.pb}% → ${r.pa}%</strong><em class="${r.delta>=0?"positive":"negative"}">${r.delta>=0?"+":""}${r.delta}%</em></div>`).join("")}</div>`;
  }
  function lastSimDays(){ const last=(state.simulations||[])[0]; if(!last?.date) return 999; return Math.max(0,Math.floor((new Date(todayKey())-new Date(last.date))/86400000)); }
  function operationalAlerts(){
    const alerts=[], due=dueQuestions().length, gp=goalProgress(), todayQ=questionsDoneToday(), daily=questionGoalDailyNeeded(), laws=lawMarkStats?lawMarkStats():{review:0}, focus=focusMinutesForToday(), simDays=lastSimDays();
    const nextEvents=Object.entries(calendarEvents?calendarEvents():{}).flatMap(([date,items])=>(items||[]).map(item=>({date,...item}))).filter(e=>new Date(e.date)>=new Date(todayKey()) && new Date(e.date)<=new Date(addDays(todayKey(),7))).sort((a,b)=>a.date.localeCompare(b.date));
    if(due>0) alerts.push(["danger","Revisões vencidas",`${fmtInt(due)} questões estão vencidas no Banco QX.`]);
    if(daily>0 && todayQ<daily) alerts.push(["warn","Meta de questões do dia",`Faltam ${fmtInt(Math.max(0,daily-todayQ))} questões hoje.`]);
    if(simDays>=7) alerts.push(["warn","Simulado atrasado",`Você está há ${fmtInt(simDays)} dias sem registrar simulado.`]);
    if(laws.review>0) alerts.push(["info","Lei seca pendente",`${fmtInt(laws.review)} lei(s) marcadas para revisar.`]);
    if(focus<60 && n(state.settings.dailyHours,0)>=2) alerts.push(["warn","Pouco tempo líquido",`Hoje só constam ${fmtMinutes(focus)} de estudo líquido.`]);
    if(nextEvents.length) alerts.push(["info","Agenda próxima",`${fmtInt(nextEvents.length)} evento(s) nos próximos 7 dias. Próximo: ${fmtDate(nextEvents[0].date)} — ${esc(nextEvents[0].title)}.`]);
    if(!alerts.length) alerts.push(["ok","Operação sob controle","Sem alerta crítico agora. Mantenha o padrão."]);
    return alerts;
  }
  function renderOperationalAlerts(){
    const box=$("#operational-alerts"); if(!box) return;
    box.innerHTML=operationalAlerts().map(a=>`<article class="op-alert ${a[0]}"><i class="fa-solid ${a[0]==="danger"?"fa-fire":a[0]==="warn"?"fa-triangle-exclamation":a[0]==="ok"?"fa-circle-check":"fa-circle-info"}"></i><div><strong>${a[1]}</strong><span>${a[2]}</span></div></article>`).join("");
  }
  function medalDefinitions(){
    const attempts=totalQuestionAttempts(), sims=state.simulations.length, bestSim=Math.max(0,...state.simulations.map(s=>n(s.percent,0))), summariesCount=summaries().length, lawStats=lawMarkStats?lawMarkStats():{marked:0,review:0}, focusTotal=Object.values(focusByDate()).reduce((a,b)=>a+n(b,0),0), streak=n(state.stats.streak,0), tafLogs=(state.taf||[]).length+(state.tafExerciseLogs||[]).length;
    return [
      ["Operador de Questões", attempts>=1000, `${fmtInt(attempts)}/1.000 questões`, "Resolver 1.000 questões no total."],
      ["Máquina de Questões", attempts>=5000, `${fmtInt(attempts)}/5.000 questões`, "Resolver 5.000 questões no total."],
      ["Simulado de Guerra", sims>=10, `${fmtInt(sims)}/10 simulados`, "Registrar 10 simulados."],
      ["Padrão 80%", bestSim>=80, `${fmtInt(bestSim)}% melhor simulado`, "Bater 80% em algum simulado."],
      ["Lei Seca Marcada", lawStats.marked>=30, `${fmtInt(lawStats.marked)}/30 marcações`, "Marcar 30 leis/atalhos."],
      ["Arsenal de Resumos", summariesCount>=20, `${fmtInt(summariesCount)}/20 resumos`, "Criar 20 resumos pessoais."],
      ["Constância 7D", streak>=7, `${fmtInt(streak)}/7 dias`, "Manter 7 dias de sequência."],
      ["Força TAF", tafLogs>=15, `${fmtInt(tafLogs)}/15 registros`, "Registrar 15 marcas físicas/TAF."],
      ["Foco 100h", focusTotal>=6000, `${fmtMinutes(focusTotal)}/100h`, "Acumular 100 horas líquidas."],
      ["Revisão Blindada", dueQuestions().length===0 && reviewableQuestions().length>=30, `${fmtInt(dueQuestions().length)} vencidas`, "Ter 30+ revisáveis e nenhuma vencida."]
    ];
  }
  function renderMedals(){
    const grid=$("#medals-grid"); if(!grid) return;
    grid.innerHTML=medalDefinitions().map(m=>`<article class="medal-card ${m[1]?"unlocked":"locked"}"><i class="fa-solid ${m[1]?"fa-medal":"fa-lock"}"></i><strong>${esc(m[0])}</strong><span>${esc(m[2])}</span><small>${esc(m[3])}</small></article>`).join("");
  }



  const summaryReviewIntervals = [1,3,7,15,30,60];
  function normalizeSummaryReview(s){
    if(!s) return s;
    s.reviewLevel = Math.max(0,n(s.reviewLevel,0));
    s.reviewHistory = Array.isArray(s.reviewHistory) ? s.reviewHistory : [];
    if(!s.nextReview){
      const base=String(s.createdAt||todayKey()).slice(0,10);
      s.nextReview=addDays(base,1);
    }
    return s;
  }
  function summaryDueList(){ const t=todayKey(); return summaries().map(normalizeSummaryReview).filter(s=>s.nextReview && s.nextReview<=t); }
  function markSummaryReview(id, rating){
    const s=summaries().find(x=>x.id===id); if(!s) return;
    normalizeSummaryReview(s);
    let level=s.reviewLevel||0;
    if(rating==="hard") level=0;
    else if(rating==="easy") level=Math.min(summaryReviewIntervals.length-1,level+2);
    else level=Math.min(summaryReviewIntervals.length-1,level+1);
    const interval=rating==="hard" ? 1 : summaryReviewIntervals[level];
    s.reviewLevel=level;
    s.lastReviewed=todayKey();
    s.nextReview=addDays(todayKey(),interval);
    s.reviewHistory.push({date:new Date().toISOString(),rating,nextReview:s.nextReview,level});
    xp(rating==="hard"?4:rating==="easy"?12:8,"revisão de resumo");
    save();
  }
  function reviewLoadLabel(total){ if(total>=25) return "Pesada"; if(total>=12) return "Moderada"; if(total>=4) return "Controlada"; return "Leve"; }
  function renderReviewCenter(){
    const qBox=$("#revision-questions"), sBox=$("#revision-summaries"), lBox=$("#revision-laws"); if(!qBox||!sBox||!lBox) return;
    const qdue=dueQuestions(), sdue=summaryDueList();
    const lawReview=lawLinks.filter(l=>lawMarkFor(l.title).review);
    const total=qdue.length+sdue.length+lawReview.length;
    $("#rev-q-due").textContent=fmtInt(qdue.length);
    $("#rev-s-due").textContent=fmtInt(sdue.length);
    $("#rev-l-due").textContent=fmtInt(lawReview.length);
    $("#rev-load").textContent=reviewLoadLabel(total);
    const guidance=$("#revision-guidance");
    guidance.innerHTML=`<strong>Protocolo neuroaprendizado</strong><span>Prioridade: erros recentes e conteúdos vencidos. Use ciclos 1 → 3 → 7 → 15 → 30 → 60 dias. Se houver erro/recall fraco, reinicie em 1 dia. Se estiver fácil, avance dois níveis.</span>`;
    qBox.innerHTML=qdue.slice(0,20).map(q=>`<div class="revision-item"><div><strong>${esc(q.subject||"Geral")} • ${esc(q.topic||"Assunto")}</strong><span>${esc(String(q.statement||"").replace(/\s+/g," ").slice(0,140))}</span><small>Venceu em ${fmtDate(q.nextReview)} • Erros: ${fmtInt(q.wrongCount||0)} • Nível ${fmtInt((q.reviewLevel||0)+1)}</small></div><button class="secondary-btn small" data-review-question="${esc(q.id)}" type="button">Abrir questão</button></div>`).join("") || `<div class="history-item"><strong>Nenhuma questão vencida</strong><span>Banco QX sob controle.</span></div>`;
    sBox.innerHTML=sdue.slice(0,20).map(s=>`<div class="revision-item"><div><strong>${esc(s.title||"Resumo sem título")}</strong><span>${esc(s.subject||"Geral")} • Próxima revisão venceu em ${fmtDate(s.nextReview)}</span><small>Nível ${fmtInt((s.reviewLevel||0)+1)} • Histórico: ${fmtInt((s.reviewHistory||[]).length)} revisões</small></div><div class="revision-actions"><button class="ghost-btn small" data-open-summary="${esc(s.id)}" type="button">Abrir</button><button class="danger-btn small" data-summary-rate="hard" data-summary-id="${esc(s.id)}" type="button">Difícil</button><button class="secondary-btn small" data-summary-rate="good" data-summary-id="${esc(s.id)}" type="button">Bom</button><button class="primary-btn small" data-summary-rate="easy" data-summary-id="${esc(s.id)}" type="button">Fácil</button></div></div>`).join("") || `<div class="history-item"><strong>Nenhum resumo vencido</strong><span>Crie resumos ou aguarde o próximo ciclo.</span></div>`;
    lBox.innerHTML=lawReview.map(l=>{ const mark=lawMarkFor(l.title); return `<div class="revision-item"><div><strong>${esc(l.title)}</strong><span>${esc(l.desc)}</span><small>${mark.note?esc(mark.note).slice(0,120):"Sem anotação."}</small></div><div class="revision-actions"><a class="ghost-btn small" href="${l.url}" target="_blank" rel="noopener noreferrer">Abrir lei</a><button class="primary-btn small" data-law-reviewed="${esc(l.title)}" type="button">Revisada</button></div></div>`; }).join("") || `<div class="history-item"><strong>Nenhuma lei marcada</strong><span>Use “Revisar” na aba Lei Seca/Juris para aparecer aqui.</span></div>`;
  }

  function isSavedCustomContest(key){ return String(key||"").startsWith("custom:"); }
  function customContestKey(name){
    const base=String(name||"Concurso personalizado").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,50)||"concurso";
    let key=`custom:${base}`, i=2;
    state.contestProfiles=state.contestProfiles&&typeof state.contestProfiles==="object"?state.contestProfiles:{};
    while(state.contestProfiles[key]) key=`custom:${base}-${i++}`;
    return key;
  }
  function blankCustomEdital(){
    return { targetContest:"custom", name:"", board:"", date:"", type:"Misto", objectiveWeight:120, notes:"", subjects:[] };
  }

  function saveCurrentContestProfile(){
    const key=state.edital.targetContest||"custom";
    state.contestProfiles=state.contestProfiles&&typeof state.contestProfiles==="object"?state.contestProfiles:{};
    if(isSavedCustomContest(key)){
      state.contestProfiles[key]={
        custom:true,
        label:state.edital.name||"Concurso personalizado",
        edital:{...state.edital, targetContest:key, subjects:clone(state.edital.subjects||[])},
        savedAt:new Date().toISOString()
      };
      return;
    }
    if(key!=="custom"){
      state.contestProfiles[key]={
        custom:false,
        label:contestPresets[key]?.label||state.edital.name||key,
        edital:{...state.edital, subjects:clone(state.edital.subjects||[])},
        savedAt:new Date().toISOString()
      };
    }
  }
  function restoreContestProfile(key){
    state.contestProfiles=state.contestProfiles&&typeof state.contestProfiles==="object"?state.contestProfiles:{};
    return state.contestProfiles[key]?.edital || null;
  }
  function applyContestPreset(key){
    state.contestProfiles=state.contestProfiles&&typeof state.contestProfiles==="object"?state.contestProfiles:{};
    saveCurrentContestProfile();

    if(isSavedCustomContest(key)){
      const saved=state.contestProfiles[key]?.edital;
      if(saved){
        state.edital={...state.edital,...saved,targetContest:key,subjects:Array.isArray(saved.subjects)?saved.subjects:[]};
        save(); renderAll(); toast(`Perfil personalizado carregado: ${state.contestProfiles[key]?.label||state.edital.name}.`);
      }
      return;
    }

    const preset=contestPresets[key]; if(!preset) return;
    state.edital.targetContest=key;

    if(key==="custom"){
      state.edital=blankCustomEdital();
    }else{
      state.edital.name=preset.label;
      state.edital.board=preset.board||state.edital.board;
      state.edital.type=preset.type||state.edital.type;
      state.edital.subjects=presetSubjects(key);
    }

    xp(key==="custom"?2:10,"matriz do concurso aplicada");
    saveCurrentContestProfile();
    save();
    renderAll();
    toast(key==="custom" ? "Novo personalizado aberto. Preencha e salve para criar na lista." : `Concurso-alvo alterado para ${preset.label}. Histórico anterior preservado.`);
  }
  function renderContestTarget(){
    const sel=$("#contest-target-select"); if(!sel) return;
    if(state.edital.targetContest==="pf-2025") state.edital.targetContest="pf-agente-2025";
    const current=state.edital.targetContest||"custom";
    const savedCustom=Object.entries(state.contestProfiles||{}).filter(([k,v])=>isSavedCustomContest(k)&&v?.edital);
    sel.innerHTML=`<option value="custom">Novo personalizado / manual</option>
      <option value="prf">PRF — Policial Rodoviário Federal</option>
      <option value="pf-agente-2025">PF 2025 — Agente</option>
      <option value="pf-escrivao-2025">PF 2025 — Escrivão</option>
      ${savedCustom.length?`<optgroup label="Personalizados salvos">${savedCustom.map(([k,v])=>`<option value="${esc(k)}">${esc(v.label||v.edital?.name||"Concurso personalizado")}</option>`).join("")}</optgroup>`:""}`;
    sel.value=savedCustom.some(([k])=>k===current)||["custom","prf","pf-agente-2025","pf-escrivao-2025"].includes(current)?current:"custom";
  }



  const promptLibrary = [
    {
      id:"q-cebraspe-ce",
      category:"questoes",
      title:"Criar questões CEBRASPE certo/errado",
      tag:"Banco QX",
      body:`Atue como professor especialista em concursos policiais e banca CEBRASPE.

Crie questões no estilo CERTO/ERRADO sobre o tema abaixo, com pegadinhas realistas e foco em literalidade da lei.

Tema:
[COLE O TEMA OU ARTIGO AQUI]

Regras:
1. Não fuja da literalidade da lei.
2. Use linguagem de banca, sem facilitar.
3. Misture itens certos e errados.
4. Inclua pegadinhas com: poderá/deverá, sempre/nunca, salvo/exceto, competência, prazo e sujeito.
5. Após cada item, forneça:
   - Gabarito;
   - Comentário objetivo;
   - Base legal/artigo;
   - Motivo da pegadinha.

Formato:
Item 1: ...
Gabarito:
Comentário:
Base legal:
Pegadinha:`
    },
    {
      id:"q-multipla",
      category:"questoes",
      title:"Criar questão múltipla escolha",
      tag:"FGV/VUNESP/FCC",
      body:`Atue como elaborador de questões para concursos policiais.

Crie 5 questões de múltipla escolha sobre:
[TEMA]

Perfil:
- Concurso: [CONCURSO]
- Banca: [BANCA]
- Nível: [MÉDIO/SUPERIOR]
- Disciplina: [DISCIPLINA]

Regras:
1. Cada questão deve ter alternativas A, B, C, D e E.
2. Apenas uma alternativa correta.
3. As alternativas erradas devem ser plausíveis.
4. Use pegadinhas de banca.
5. Após cada questão, traga gabarito e comentário.

Formato:
Questão 1
Enunciado:
A)
B)
C)
D)
E)
Gabarito:
Comentário:
Base legal ou teórica:`
    },
    {
      id:"comentario-qcon",
      category:"comentarios",
      title:"Comentário estilo Qconcursos",
      tag:"Comentário objetivo",
      body:`Atue como comentarista de questões de concurso no estilo Qconcursos/TecConcursos.

Comente a questão abaixo de forma objetiva, didática e baseada na literalidade da lei.

Questão:
[COLE A QUESTÃO]

Gabarito:
[COLE O GABARITO]

Meu raciocínio:
[OPCIONAL]

Regras:
1. Explique por que está certo ou errado.
2. Cite artigo, inciso, parágrafo ou entendimento relevante.
3. Mostre a pegadinha da banca.
4. Seja direto, mas completo.
5. Finalize com um bizu de memorização.

Estrutura:
Gabarito:
Fundamento:
Comentário:
Pegadinha:
Bizu final:`
    },
    {
      id:"redacao-cebraspe",
      category:"redacao",
      title:"Correção de redação CEBRASPE",
      tag:"Discursiva",
      body:`Atue como corretor especialista em redações discursivas do CEBRASPE para concursos policiais.

Corrija minha redação abaixo com rigor de banca.

Tema:
[COLE O TEMA]

Texto:
[COLE SUA REDAÇÃO]

Critérios:
1. Conteúdo.
2. Estrutura argumentativa.
3. Coesão e coerência.
4. Domínio da norma culta.
5. Adequação ao tema.
6. Progressão textual.
7. Proposta de melhoria.

Entregue:
- Nota estimada;
- Pontos fortes;
- Erros graves;
- Correções linha a linha;
- Sugestão de versão melhorada;
- Checklist para eu não errar novamente.

Não seja genérico. Seja técnico e direto.`
    },
    {
      id:"redacao-esqueleto",
      category:"redacao",
      title:"Esqueleto de redação policial",
      tag:"Estrutura",
      body:`Atue como professor de discursiva para concursos policiais.

Monte um esqueleto de redação para o tema abaixo:

Tema:
[TEMA]

Regras:
1. Linguagem formal.
2. Tese clara.
3. Argumentos jurídicos e sociais.
4. Possível uso de Constituição Federal, direitos fundamentais, segurança pública e políticas públicas.
5. Estrutura: introdução, desenvolvimento 1, desenvolvimento 2 e conclusão.

Entregue:
- Tese;
- Repertórios possíveis;
- Introdução modelo;
- Desenvolvimento 1;
- Desenvolvimento 2;
- Conclusão;
- Frases prontas adaptáveis;
- Erros que a banca pode penalizar.`
    },
    {
      id:"lei-seca-literal",
      category:"lei-seca",
      title:"Lei seca literal com pegadinhas",
      tag:"Literalidade",
      body:`Atue como professor especialista em lei seca para concursos policiais.

Explique o dispositivo abaixo sem fugir da literalidade.

Dispositivo legal:
[COLE O ARTIGO/LEI]

Quero:
1. Texto explicado em linguagem simples.
2. Termos-chave que a banca pode trocar.
3. Pegadinhas prováveis.
4. Diferença entre poderá/deverá, salvo/exceto, competência e prazo.
5. Exemplo de questão CEBRASPE.
6. Gabarito comentado.
7. Bizu final de memorização.

Não invente jurisprudência. Se não houver base, diga que depende de pesquisa específica.`
    },
    {
      id:"resumo-bizurado",
      category:"resumos",
      title:"Resumo bizurado por banca",
      tag:"Resumo",
      body:`Atue como professor especialista em concursos policiais.

Crie um resumo bizurado sobre o tema abaixo:

Tema:
[TEMA]

Concurso:
[CONCURSO]

Banca:
[BANCA]

Regras:
1. Priorize o que mais cai em prova.
2. Explique com foco em acerto de questão.
3. Destaque pegadinhas.
4. Traga artigos importantes.
5. Faça quadro mental sem usar tabela.
6. Crie perguntas de revisão ao final.
7. Finalize com "O que a banca tenta te fazer errar".

Formato:
1. Ideia central
2. Pontos mais cobrados
3. Literalidade importante
4. Pegadinhas
5. Questões mentais
6. Bizu final`
    },
    {
      id:"revisao-anki",
      category:"revisao",
      title:"Transformar conteúdo em revisão Anki",
      tag:"Revisão espaçada",
      body:`Atue como especialista em neuroaprendizado e revisão espaçada.

Transforme o conteúdo abaixo em material de revisão ativa.

Conteúdo:
[COLE O CONTEÚDO]

Crie:
1. Perguntas objetivas.
2. Flashcards frente/verso.
3. Perguntas estilo certo/errado.
4. Pontos que exigem repetição.
5. Ciclo de revisão recomendado: 1, 3, 7, 15, 30 e 60 dias.
6. Alertas de confusão conceitual.

Formato:
Flashcard 1
Frente:
Verso:
Erro comum:
Revisão recomendada:`
    },
    {
      id:"recurso-questao",
      category:"comentarios",
      title:"Analisar possibilidade de recurso",
      tag:"Recurso",
      body:`Atue como especialista em recursos de concursos públicos.

Analise se há possibilidade de recurso na questão abaixo.

Questão:
[COLE A QUESTÃO]

Gabarito preliminar:
[GABARITO DA BANCA]

Minha resposta:
[SUA RESPOSTA]

Base que encontrei:
[ARTIGO/JURISPRUDÊNCIA/DOUTRINA, SE HOUVER]

Quero:
1. Análise técnica.
2. Verificar se o gabarito está correto.
3. Identificar ambiguidade, erro material ou conflito normativo.
4. Sugerir tese de recurso.
5. Escrever recurso em linguagem formal e objetiva.
6. Informar se o recurso é forte, médio ou fraco.

Não invente fundamento. Se faltar base, diga exatamente o que preciso pesquisar.`
    },
    {
      id:"simulado-pos",
      category:"questoes",
      title:"Diagnóstico pós-simulado",
      tag:"Simulados",
      body:`Atue como analista de desempenho para concursos policiais.

Analise meu simulado:

Concurso:
[CONCURSO]

Banca:
[BANCA]

Resultado:
[COLE CERTAS, ERRADAS, BRANCAS, PONTUAÇÃO]

Erros por disciplina:
[COLE OS ERROS]

Quero:
1. Diagnóstico dos principais problemas.
2. Disciplinas críticas.
3. Possíveis causas dos erros.
4. Plano de correção para 7 dias.
5. Meta diária de questões.
6. O que revisar primeiro.
7. O que parar de fazer.

Seja direto e operacional.`
    },
    {
      id:"portugues-cebraspe",
      category:"resumos",
      title:"Português CEBRASPE — análise de item",
      tag:"Português",
      body:`Atue como professor de Língua Portuguesa especialista em CEBRASPE.

Analise o item abaixo:

Item:
[COLE O ITEM]

Texto de apoio:
[COLE O TEXTO, SE HOUVER]

Quero:
1. Identificar o assunto cobrado.
2. Explicar a regra.
3. Mostrar a pegadinha da banca.
4. Dizer se o item está certo ou errado.
5. Justificar com gramática normativa.
6. Criar 3 itens parecidos para treino.

Não seja genérico. Foque no padrão CEBRASPE.`
    }
  ];


  promptLibrary.push(
    {
      id:"prompt-questoes-json-banco-qx",
      category:"questoes",
      title:"Criar questões prontas para cadastrar no Banco QX",
      tag:"Importação manual",
      body:`Atue como elaborador de questões para concursos policiais.

Crie 10 questões sobre o tema abaixo, já no formato exato para eu cadastrar no Banco QX.

Tema:
[COLE O TEMA]

Concurso:
[CONCURSO]

Banca:
[BANCA]

Tipo:
[Certo/Errado ou Múltipla escolha]

Para cada questão, entregue:
Disciplina:
Assunto:
Banca:
Tipo:
Enunciado:
Conteúdo de apoio, se houver:
Alternativas A-E, se for múltipla escolha:
Gabarito:
Comentário do professor:
Comentário pessoal sugerido:
Fonte:
Tags:

Regras:
1. Use linguagem real de banca.
2. Não invente artigo se não souber.
3. Informe quando a questão depender de jurisprudência.
4. Coloque pegadinhas com termos absolutos, exceções, competência e prazo.
5. O comentário deve ser objetivo, com artigo/inciso quando possível.`
    },
    {
      id:"prompt-redacao-grade-cebraspe",
      category:"redacao",
      title:"Redação CEBRASPE com grade rigorosa",
      tag:"Correção avançada",
      body:`Atue como corretor experiente de discursivas CEBRASPE.

Corrija minha redação com rigor, simulando uma banca examinadora.

Tema:
[COLE O TEMA]

Critérios oficiais, se houver:
[COLE A GRADE]

Texto:
[COLE A REDAÇÃO]

Entregue:
1. Nota estimada por critério.
2. Diagnóstico de conteúdo.
3. Diagnóstico de estrutura.
4. Problemas de coesão, coerência e progressão.
5. Erros gramaticais relevantes.
6. Trechos que perderiam ponto.
7. Versão reescrita mais forte.
8. Checklist de treino para a próxima redação.
9. Risco de fuga ao tema ou tangenciamento.

Seja técnico, direto e rigoroso.`
    },
    {
      id:"prompt-peca-recursal",
      category:"comentarios",
      title:"Recurso de questão com tese objetiva",
      tag:"Recurso",
      body:`Atue como especialista em recursos administrativos de concursos.

Analise a questão e escreva um recurso objetivo, técnico e respeitoso.

Questão:
[COLE A QUESTÃO]

Gabarito preliminar:
[COLE O GABARITO]

Minha tese:
[COLE SUA IDEIA]

Base legal/jurisprudencial:
[COLE A BASE]

Entregue:
1. Probabilidade do recurso: forte, médio ou fraco.
2. Fundamento principal.
3. Ponto de ambiguidade ou erro.
4. Recurso final em até 20 linhas.
5. Versão mais curta em até 10 linhas.
6. O que não devo escrever para não enfraquecer o recurso.

Não invente fundamento. Se faltar base, diga exatamente o que buscar.`
    },
    {
      id:"prompt-lei-seca-caderno-artigos",
      category:"lei-seca",
      title:"Caderno de artigos com pegadinhas",
      tag:"Lei Seca PRO",
      body:`Atue como professor de lei seca para carreiras policiais.

Transforme os artigos abaixo em um caderno de revisão.

Artigos:
[COLE OS ARTIGOS]

Para cada artigo, entregue:
1. Ideia central.
2. Palavras que a banca pode trocar.
3. Exceções.
4. Prazos.
5. Competência.
6. Pegadinha CEBRASPE.
7. Questão certo/errado.
8. Gabarito comentado.
9. Frase de memorização.

Não fuja da literalidade do texto legal.`
    },
    {
      id:"prompt-resumo-jurisprudencia",
      category:"resumos",
      title:"Resumo de jurisprudência para prova policial",
      tag:"STF/STJ",
      body:`Atue como professor de jurisprudência para concursos policiais.

Resuma o entendimento abaixo:

Jurisprudência:
[COLE O JULGADO/INFORMATIVO/SÚMULA]

Entregue:
1. Tema.
2. Tribunal.
3. Tese em linguagem simples.
4. Fundamento.
5. Como a banca cobra.
6. Pegadinha provável.
7. Exemplo de item certo/errado.
8. Conexão com lei seca.
9. Revisão em 5 perguntas.

Se o texto não for suficiente para identificar a tese, diga o que falta.`
    },
    {
      id:"prompt-revisao-erros",
      category:"revisao",
      title:"Revisão cirúrgica por erro",
      tag:"Caderno de erros",
      body:`Atue como especialista em aprendizagem e caderno de erros.

Analise meus erros abaixo:

Erros:
[COLE QUESTÕES/ASSUNTOS/MOTIVOS]

Quero:
1. Classificar cada erro: atenção, desconhecimento, leitura, jurisprudência, literalidade ou pegadinha.
2. Identificar padrão dominante.
3. Criar revisão ativa.
4. Criar 10 perguntas de recuperação.
5. Criar 5 flashcards.
6. Definir ciclo de revisão 1, 3, 7, 15, 30 e 60 dias.
7. Dizer o que eu devo fazer antes de resolver novas questões do tema.`
    }
  );

  let activePromptFilter = "all";

  function renderPromptLibrary(){
    const box=$("#prompt-library"); if(!box) return;
    const search=($("#prompt-search")?.value||"").toLowerCase().trim();
    const list=promptLibrary.filter(p=>{
      const text=`${p.title} ${p.category} ${p.tag} ${p.body}`.toLowerCase();
      return p.category!=="planejamento" && (activePromptFilter==="all"||p.category===activePromptFilter) && (!search||text.includes(search));
    });
    box.innerHTML=list.map(p=>`<article class="prompt-card" data-prompt-id="${esc(p.id)}">
      <div class="prompt-card-head">
        <div>
          <span class="prompt-tag">${esc(p.tag)}</span>
          <strong>${esc(p.title)}</strong>
        </div>
        <button class="secondary-btn small" type="button" data-copy-prompt="${esc(p.id)}"><i class="fa-solid fa-copy"></i> Copiar</button>
      </div>
      <pre>${esc(p.body)}</pre>
    </article>`).join("") || `<div class="history-item"><strong>Nenhum prompt encontrado</strong><span>Ajuste a busca ou os filtros.</span></div>`;
  }

  function buildContextPrompt(){
    const contest=$("#prompt-build-contest")?.value.trim()||state.edital?.name||"concurso policial";
    const board=$("#prompt-build-board")?.value.trim()||state.edital?.board||"banca do concurso";
    const subject=$("#prompt-build-subject")?.value.trim()||"disciplina informada";
    const goal=$("#prompt-build-goal")?.value||"questoes";
    const map={
      questoes:`Atue como professor especialista em ${board} e concursos policiais. Crie questões sobre ${subject} para o concurso ${contest}, com gabarito, comentário, base legal e pegadinhas de banca. Priorize literalidade, jurisprudência relevante e padrão da banca.`,
      comentario:`Atue como comentarista de questões estilo Qconcursos/TecConcursos. Comente a questão de ${subject} para ${contest}, banca ${board}, explicando gabarito, fundamento, pegadinha e bizu final.`,
      redacao:`Atue como corretor de discursivas para ${contest}, banca ${board}. Corrija minha redação com rigor, nota estimada, erros, pontos fortes, correções e versão melhorada.`,
      resumo:`Atue como professor especialista em ${contest}. Faça um resumo bizurado de ${subject}, focado na banca ${board}, com pontos cobrados, artigos, pegadinhas e perguntas de revisão.`,
      lei:`Atue como professor de lei seca para ${contest}. Explique o dispositivo de ${subject} com literalidade, artigos, incisos, exceções, pegadinhas e exemplos de questão ${board}.`,
      revisao:`Atue como especialista em neuroaprendizado. Monte uma revisão ativa de ${subject} para ${contest}, banca ${board}, usando perguntas, flashcards e ciclo 1, 3, 7, 15, 30 e 60 dias.`
    };
    const out=$("#context-prompt-output");
    if(out) out.value=map[goal]||map.questoes;
  }

  async function copyTextToClipboard(text){
    try{
      await navigator.clipboard.writeText(text);
      toast("Prompt copiado.");
    }catch{
      const ta=document.createElement("textarea");
      ta.value=text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Prompt copiado.");
    }
  }


  const defaultGuides = [
    {id:"default-caveira", title:"Projeto Caveira", url:"https://app.caveira.com/home", category:"curso", icon:"fa-skull", description:"Acesso à plataforma Caveira.", locked:true},
    {id:"default-qconcursos", title:"Qconcursos", url:"https://www.qconcursos.com/usuario/novo-inicio", category:"questoes", icon:"fa-circle-question", description:"Questões, comentários e histórico de treino.", locked:true},
    {id:"default-aprovado", title:"Aprovado", url:"https://aprovadoapp.com/#", category:"curso", icon:"fa-chart-line", description:"Organização, controle e acompanhamento de estudos.", locked:true},
    {id:"default-pci", title:"PCI Concursos", url:"https://www.pciconcursos.com.br/", category:"noticias", icon:"fa-newspaper", description:"Editais, notícias e acompanhamento de concursos.", locked:true}
  ];
  function customGuides(){ state.customGuides=Array.isArray(state.customGuides)?state.customGuides:[]; return state.customGuides; }
  function allGuides(){ return [...defaultGuides, ...customGuides()]; }
  function openGuideModal(guide=null){
    const root=$("#guide-modal-root"); if(!root) return;
    root.hidden=false; document.body.classList.add("guide-modal-open");
    $("#guide-id").value=guide?.id||"";
    $("#guide-title").value=guide?.title||"";
    $("#guide-url").value=guide?.url||"";
    $("#guide-category").value=guide?.category||"curso";
    $("#guide-icon").value=guide?.icon||"fa-graduation-cap";
    $("#guide-description").value=guide?.description||"";
    $("#guide-modal-title").textContent=guide?"Editar guia":"Adicionar guia";
  }
  function closeGuideModal(){ const root=$("#guide-modal-root"); if(root) root.hidden=true; document.body.classList.remove("guide-modal-open"); }
  function renderCourses(){
    const grid=$("#courses-grid"); if(!grid) return;
    grid.innerHTML=allGuides().map(g=>`<article class="course-card guide-card ${g.locked?"guide-fixed":"guide-custom"}" data-id="${esc(g.id)}">
      <a class="guide-main-link" href="${esc(g.url)}" target="_blank" rel="noopener noreferrer">
        <div class="guide-icon-box"><i class="fa-solid ${esc(g.icon||"fa-link")}"></i></div>
        <div class="guide-content">
          <strong>${esc(g.title)}</strong>
          <span>${esc(g.description||"Guia externo.")}</span>
          <small>${esc(({curso:"Curso",questoes:"Questões",drive:"Material",noticias:"Editais/notícias",outro:"Outro"}[g.category]||"Guia"))}</small>
        </div>
      </a>
      ${g.locked?``:`<div class="guide-card-actions"><button class="ghost-btn small" data-guide-edit="${esc(g.id)}" type="button"><i class="fa-solid fa-pen"></i> Editar</button><button class="danger-btn small" data-guide-delete="${esc(g.id)}" type="button"><i class="fa-solid fa-trash"></i></button></div>`}
    </article>`).join("");
  }


  const weeklyDayOrder = ["SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO","DOMINGO"];
  const weeklyDayIcon = (day="") => /SÁBADO|SABADO/i.test(day) ? "fa-rotate" : /DOMINGO/i.test(day) ? "fa-file-circle-check" : "fa-calendar-day";
  function emptyWeeklyPlan(){ return {title:"",days:[],completions:{},importedAt:null}; }
  function weeklyPlan(){ state.weeklyPlan = state.weeklyPlan && typeof state.weeklyPlan==="object" ? state.weeklyPlan : emptyWeeklyPlan(); state.weeklyPlan.days=Array.isArray(state.weeklyPlan.days)?state.weeklyPlan.days:[]; state.weeklyPlan.completions=state.weeklyPlan.completions&&typeof state.weeklyPlan.completions==="object"?state.weeklyPlan.completions:{}; return state.weeklyPlan; }
  function weeklyBlockId(dayIndex, blockIndex){ return `d${dayIndex}_b${blockIndex}`; }
  function weeklyExtractLink(text=""){ const m=String(text).match(/\((https?:\/\/[^)]+)\)|\[(?:[^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/\S+)/i); return m ? (m[1]||m[2]||m[3]).replace(/[)\]]+$/,"") : ""; }
  function weeklyCleanValue(line=""){ return String(line).replace(/^\*\*[^:]+:\*\*\s*/,"").replace(/^[^:]+:\s*/,"").trim(); }
  
  function weeklyNormalizeBlock(block={}, idx=0){
    const material=String(block.material||block.materialText||block.aula||block.video||"").trim();
    const questions=String(block.questions||block.questoes||block.questionText||"").trim();
    const materialLink=String(block.materialLink||block.aulaLink||block.videoLink||weeklyExtractLink(material)||"").trim();
    const questionLink=String(block.questionLink||block.questoesLink||weeklyExtractLink(questions)||"").trim();
    return {
      id:block.id||uid(),
      number:n(block.number||block.numero||idx+1,idx+1),
      discipline:String(block.discipline||block.disciplina||block.subjectName||"").trim(),
      subject:String(block.subject||block.assunto||block.topic||"").trim(),
      material,
      materialLink,
      questions,
      questionLink,
      meta:parsePtInt(block.meta||block.questoesMeta||block.goal)||0,
      type:block.type||block.tipo||"study",
      notes:String(block.notes||block.observacoes||"").trim()
    };
  }
  function weeklyNormalizePlan(input){
    const raw = input && typeof input==="object" ? input : {};
    const daysIn = Array.isArray(raw.days) ? raw.days : Array.isArray(raw.dias) ? raw.dias : [];
    const plan = {title:raw.title||raw.titulo||"Planejamento semanal", aluno:raw.aluno||raw.student||raw.nomeAluno||"", concurso:raw.concurso||raw.contest||"", banca:raw.banca||raw.board||"", mentor:raw.mentor||"Matheus G.", semana:raw.semana||raw.week||raw.periodo||"", mensagemMentor:raw.mensagemMentor||raw.briefing||raw.message||"", metaSemanal:parsePtInt(raw.metaSemanal||raw.weeklyGoal)||0, days:[], completions:raw.completions||raw.conclusoes||{}, blockLogs:raw.blockLogs||raw.registros||{}, importedAt:new Date().toISOString(), source:raw.source||"json"};
    if(daysIn.length){
      plan.days = daysIn.map((d,di)=>{
        const blocksIn=Array.isArray(d.blocks)?d.blocks:Array.isArray(d.blocos)?d.blocos:[];
        const blocks=blocksIn.map((b,bi)=>weeklyNormalizeBlock(b,bi)).filter(b=>b.discipline||b.subject||b.type!=="study");
        return {
          id:d.id||uid(),
          day:String(d.day||d.dia||d.weekday||`DIA ${di+1}`).trim(),
          date:String(d.date||d.data||"").trim(),
          review:String(d.review||d.revisao||"").trim(),
          disciplines:String(d.disciplines||d.disciplinas||blocks.map(b=>b.discipline).filter(Boolean).join(" + ")).trim(),
          metaDay:parsePtInt(d.metaDay||d.metaDia)||blocks.reduce((a,b)=>a+n(b.meta),0),
          blocks
        };
      }).filter(d=>d.day||d.blocks.length);
      return plan;
    }
    const items=Array.isArray(raw.items)?raw.items:Array.isArray(raw.itens)?raw.itens:Array.isArray(raw.blocos)?raw.blocos:[];
    if(items.length){
      const map={};
      items.forEach((it,idx)=>{
        const day=String(it.day||it.dia||it.weekday||"SEM DIA").trim();
        map[day]=map[day]||{id:uid(),day,date:String(it.date||it.data||"").trim(),review:String(it.review||it.revisao||"").trim(),disciplines:"",metaDay:0,blocks:[]};
        map[day].blocks.push(weeklyNormalizeBlock(it, map[day].blocks.length));
      });
      plan.days=Object.values(map).map(d=>({...d,disciplines:d.blocks.map(b=>b.discipline).filter(Boolean).join(" + "),metaDay:d.blocks.reduce((a,b)=>a+n(b.meta),0)}));
    }
    return plan;
  }
  function parseWeeklyImported(raw){
    const text=String(raw||"").trim();
    if(!text) return emptyWeeklyPlan();
    if(text.startsWith("{") || text.startsWith("[")){
      try{
        const data=JSON.parse(text);
        return weeklyNormalizePlan(Array.isArray(data)?{items:data}:data);
      }catch(e){
        toast("JSON inválido. Verifique a exportação do seu programa.");
        return emptyWeeklyPlan();
      }
    }
    return parseWeeklyMarkdown(text);
  }
  function weeklyJsonTemplate(){
    return JSON.stringify({
      title:"Planejamento PRF — Saldanha",
      aluno:"Saldanha",
      concurso:"PRF",
      banca:"CEBRASPE",
      mentor:"Matheus G.",
      semana:"11/05 a 17/05",
      mensagemMentor:"Saldanha, sua missão da semana foi carregada. Prioridade: cumprir os blocos, registrar questões e não acumular revisão.",
      metaSemanal:1000,
      days:[
        {
          day:"SEGUNDA-FEIRA",
          date:"11/05/2026",
          review:"Revisão dos erros da semana anterior.",
          disciplines:"Direito Constitucional + Direito Administrativo",
          metaDay:100,
          blocks:[
            {
              number:1,
              discipline:"Direito Constitucional",
              subject:"Direitos e garantias fundamentais",
              material:"Aula do professor / PDF",
              materialLink:"https://link-da-aula.com",
              questions:"Filtro QConcursos",
              questionLink:"https://link-das-questoes.com",
              meta:50,
              type:"study"
            },
            {
              number:2,
              discipline:"Direito Administrativo",
              subject:"Atos administrativos",
              material:"",
              materialLink:"",
              questions:"",
              questionLink:"",
              meta:50,
              type:"study"
            }
          ]
        }
      ]
    }, null, 2);
  }
  function weeklyDownloadJson(){
    const plan=weeklyPlan();
    const data=JSON.stringify(plan,null,2);
    const blob=new Blob([data],{type:"application/json;charset=utf-8"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`planejamento-setor-x-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

function parseWeeklyMarkdown(raw=""){
    const text=String(raw||"").replace(/\r/g,"").trim();
    if(!text) return emptyWeeklyPlan();
    const dayRe=/^##\s*[✅\s-]*(SEGUNDA-FEIRA|TERÇA-FEIRA|TERCA-FEIRA|QUARTA-FEIRA|QUINTA-FEIRA|SEXTA-FEIRA|SÁBADO|SABADO|DOMINGO)(?:\s*[–-]\s*([^\n]+))?/gmi;
    const matches=[...text.matchAll(dayRe)];
    const plan={title:"Planejamento semanal",days:[],completions:{},importedAt:new Date().toISOString()};
    matches.forEach((m,idx)=>{
      const start=m.index, end=idx<matches.length-1?matches[idx+1].index:text.length;
      const chunk=text.slice(start,end);
      const dayName=m[1].toUpperCase().replace("TERCA","TERÇA").replace("SABADO","SÁBADO");
      const date=(m[2]||"").trim();
      const review=(chunk.match(/\*\*Revisão:\*\*\s*([^\n]+)/i)||[])[1]?.trim()||"";
      const disciplineLine=(chunk.match(/\*\*Disciplina do dia:\*\*\s*([^\n]+)/i)||[])[1]?.trim()||"";
      const metaDay=parsePtInt((chunk.match(/\*\*Meta do dia:\*\*\s*([^\n]+)/i)||[])[1]||"");
      const blockRe=/^###\s*Bloco\s*(\d+)\s*[–-]\s*([^\n]+)/gmi;
      const bms=[...chunk.matchAll(blockRe)];
      const blocks=[];
      if(bms.length){
        bms.forEach((bm,bidx)=>{
          const bs=bm.index, be=bidx<bms.length-1?bms[bidx+1].index:chunk.length;
          const bchunk=chunk.slice(bs,be);
          const discipline=(bm[2]||"").trim();
          const subject=(bchunk.match(/\*\*Assunto\s*:?\*\*\s*([^\n]*)/i)||[])[1]?.trim()||"";
          const material=(bchunk.match(/\*\*Material de apoio:\*\*\s*([^\n]*)/i)||[])[1]?.trim()||"";
          const questions=(bchunk.match(/\*\*Questões:\*\*\s*([^\n]*)/i)||[])[1]?.trim()||"";
          const meta=parsePtInt((bchunk.match(/\*\*Meta:\*\*\s*([^\n]*)/i)||[])[1]||"")||50;
          blocks.push({id:uid(),number:n(bm[1],bidx+1),discipline,subject,material,materialLink:weeklyExtractLink(material),questions,questionLink:weeklyExtractLink(questions),meta,type:"study"});
        });
      }else{
        const lines=chunk.split("\n").map(x=>x.replace(/^-+\s*/,"").trim()).filter(Boolean);
        const tasks=lines.filter(l=>!/^(##|---)/.test(l)).slice(1).map((l,i)=>({id:uid(),number:i+1,discipline:l.replace(/\*\*/g,""),subject:"",material:"",materialLink:"",questions:"",questionLink:"",meta:0,type:/simulado/i.test(l)?"simulado":"review"}));
        blocks.push(...tasks);
      }
      plan.days.push({id:uid(),day:dayName,date,review,disciplines:disciplineLine,metaDay,blocks});
    });
    if(!plan.days.length){
      const blocks=text.split(/\n+/).map((line,i)=>line.trim()).filter(Boolean).map((line,i)=>{
        const [discipline="",subject="",meta="",material="",questions=""] = line.split("|").map(x=>x.trim());
        return {id:uid(),number:i+1,discipline,subject,material,materialLink:weeklyExtractLink(material),questions,questionLink:weeklyExtractLink(questions),meta:parsePtInt(meta)||50,type:"study"};
      });
      return buildWeeklyAutoPlan(blocks,4,50);
    }
    return plan;
  }
  function buildWeeklyAutoPlan(blocks=[], blocksPerDay=4, defaultMeta=50){
    const days=["SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA"];
    const plan={title:"Planejamento semanal automático",days:[],completions:{},importedAt:new Date().toISOString()};
    let idx=0;
    days.forEach((day,d)=>{
      const dayBlocks=[];
      for(let i=0;i<blocksPerDay && idx<blocks.length;i++,idx++){
        const b=blocks[idx];
        dayBlocks.push({id:uid(),number:i+1,discipline:b.discipline||`Disciplina ${idx+1}`,subject:b.subject||"",material:b.material||"",materialLink:weeklyExtractLink(b.material||""),questions:b.questions||"",questionLink:weeklyExtractLink(b.questions||""),meta:parsePtInt(b.meta)||defaultMeta,type:"study"});
      }
      if(dayBlocks.length) plan.days.push({id:uid(),day,date:"",review:d===0?"Revisão dos erros da semana anterior.":(plan.days[d-1]?.blocks||[]).map(b=>b.discipline).join(" + "),disciplines:dayBlocks.map(b=>b.discipline).join(" + "),metaDay:dayBlocks.reduce((a,b)=>a+n(b.meta),0),blocks:dayBlocks});
    });
    plan.days.push({id:uid(),day:"SÁBADO",date:"",review:"Revisão geral da semana.",disciplines:"Revisão geral",metaDay:0,blocks:[{id:uid(),number:1,discipline:"Revisão geral",subject:"Refazer erros, revisar anotações e separar pontos fracos.",material:"",materialLink:"",questions:"",questionLink:"",meta:0,type:"review"}]});
    plan.days.push({id:uid(),day:"DOMINGO",date:"",review:"Simulado e correção.",disciplines:"Simulado / Correção",metaDay:0,blocks:[{id:uid(),number:1,discipline:"Simulado / Correção",subject:"Realizar simulado, corrigir e registrar percentual por disciplina.",material:"",materialLink:"",questions:"",questionLink:"",meta:0,type:"simulado"}]});
    return plan;
  }
  function weeklyTemplate(){
    return `## ✅ SEGUNDA-FEIRA – 11/05/2026

**Revisão:** Revisão dos erros da semana anterior.
**Disciplina do dia:** Direito Constitucional + Direito Administrativo + Português + Informática
**Meta do dia:** 200 questões

### Bloco 1 – Direito Constitucional

**Assunto:** Direitos e garantias fundamentais

**Material de apoio:** https://...

**Questões:** [Acessar questões](https://...)

**Meta:** 50 questões

### Bloco 2 – Direito Administrativo

**Assunto:** Atos administrativos

**Material de apoio:**

**Questões:**

**Meta:** 50 questões

---

## ✅ SÁBADO – Revisão Geral

- Refazer questões erradas da semana.
- Revisar anotações dos blocos.

## ✅ DOMINGO – Simulado / Correção

- Realizar simulado.
- Corrigir e registrar percentual por disciplina.`;
  }
  
  function weeklyBlockLog(key){ const p=weeklyPlan(); p.blockLogs=p.blockLogs&&typeof p.blockLogs==="object"?p.blockLogs:{}; return p.blockLogs[key]||null; }
  function weeklyLoggedQuestionsToday(){
    const p=weeklyPlan(), t=todayKey();
    const logs=p.blockLogs&&typeof p.blockLogs==="object"?p.blockLogs:{};
    return Object.values(logs).reduce((sum,l)=>sum+(String(l?.date||"").slice(0,10)===t?Math.max(0,n(l.done,0)):0),0);
  }
  function saveWeeklyBlockLog(key, data){
    const p=weeklyPlan();
    p.blockLogs=p.blockLogs&&typeof p.blockLogs==="object"?p.blockLogs:{};
    const prev=p.blockLogs[key]||{};
    const prevDone=Math.max(0,n(prev.done,0));
    const nextDone=Math.max(0,n(data.done,0));
    p.blockLogs[key]={...prev,...data,done:nextDone,correct:Math.max(0,n(data.correct,0)),wrong:Math.max(0,n(data.wrong,0)),date:todayKey(),updatedAt:new Date().toISOString()};
    const delta=Math.max(0,nextDone-prevDone);
    if(delta>0){
      const mb=manualByDate(), t=todayKey();
      mb[t]=Math.max(0,parsePtInt(mb[t]||0))+delta;
      state.questionGoal.manualDone=Math.max(0,parsePtInt(state.questionGoal.manualDone||0))+delta;
    }
  }
  function weeklyNextPending(){
    const p=weeklyPlan();
    for(let di=0; di<(p.days||[]).length; di++){
      const blocks=p.days[di].blocks||[];
      for(let bi=0; bi<blocks.length; bi++){
        const key=weeklyBlockId(di,bi);
        if(!p.completions[key]) return {day:p.days[di], block:blocks[bi], key, di, bi};
      }
    }
    return null;
  }

  function openWeeklyLogModal(key, di, bi){
    const p=weeklyPlan(), day=p.days?.[di], block=day?.blocks?.[bi]; if(!block) return;
    const log=weeklyBlockLog(key)||{};
    $("#weekly-log-key").value=key;
    $("#weekly-log-title").textContent=`${block.discipline||"Bloco"} — ${day.day||""}`;
    $("#weekly-log-subtitle").textContent=block.subject||"Registre questões feitas, acertos e erros.";
    $("#weekly-log-done").value=log.done||"";
    $("#weekly-log-correct").value=log.correct||"";
    $("#weekly-log-wrong").value=log.wrong||"";
    $("#weekly-log-note").value=log.note||"";
    $("#weekly-log-modal").hidden=false;
  }
  function closeWeeklyLogModal(){ const m=$("#weekly-log-modal"); if(m) m.hidden=true; }
  function findWeeklyBlockByKey(key){
    const p=weeklyPlan();
    for(let di=0;di<(p.days||[]).length;di++){
      const blocks=p.days[di].blocks||[];
      for(let bi=0;bi<blocks.length;bi++) if(weeklyBlockId(di,bi)===key) return {day:p.days[di],block:blocks[bi],di,bi};
    }
    return null;
  }

  function weeklyPlanDateLabel(day, index){
    const raw = String(day?.date || "").trim();
    if(raw) return raw;
    // tenta sincronizar pela semana importada: se houver primeira data, calcula os próximos dias
    try{
      const p=weeklyPlan();
      const first=(p.days||[]).map(d=>String(d.date||"").trim()).find(Boolean);
      const m=first && first.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
      if(m){
        const year=Number(m[3]?.length===2?`20${m[3]}`:(m[3]||new Date().getFullYear()));
        const dt=new Date(year, Number(m[2])-1, Number(m[1]));
        dt.setDate(dt.getDate()+index);
        return dt.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
      }
    }catch(e){}
    return "";
  }
function renderWeeklyPlanner(){
    const plan=weeklyPlan(), board=$("#weekly-board"); if(!board) return;
    plan.blockLogs=plan.blockLogs&&typeof plan.blockLogs==="object"?plan.blockLogs:{};
    const totalDays=plan.days.length;
    const allBlocks=plan.days.flatMap((d,di)=>(d.blocks||[]).map((b,bi)=>({d,di,b,bi,key:weeklyBlockId(di,bi)})));
    const totalBlocks=allBlocks.length;
    const totalQuestions=allBlocks.reduce((a,x)=>a+n(x.b.meta),0);
    const loggedQuestions=Object.values(plan.blockLogs).reduce((a,l)=>a+n(l?.done),0);
    const done=allBlocks.filter(x=>plan.completions[x.key]).length;
    const percent=totalBlocks?Math.round(done/totalBlocks*100):0;
    const next=weeklyNextPending();
    $("#weekly-kpi-days").textContent=fmtInt(totalDays);
    $("#weekly-kpi-blocks").textContent=fmtInt(totalBlocks);
    $("#weekly-kpi-questions").textContent=fmtInt(totalQuestions);
    $("#weekly-kpi-done").textContent=totalBlocks?`${percent}%`:"0%";
    const info=$("#weekly-current-info");
    if(info) info.innerHTML=plan.importedAt?`<div class="weekly-briefing">
      <div class="weekly-briefing-main">
        <p class="eyebrow"><i class="fa-solid fa-bullhorn"></i> Briefing operacional</p>
        <strong>${esc(plan.concurso?`Planejamento ${plan.concurso}${plan.aluno?` — ${plan.aluno}`:""}`:(plan.title||"Planejamento semanal"))}</strong>
        <span>${plan.semana?`Semana: ${esc(plan.semana)} • `:""}${plan.banca?`Banca: ${esc(plan.banca)} • `:""}Mentor: ${esc(plan.mentor||"Matheus G.")}</span>
        ${plan.mensagemMentor?`<div class="weekly-mentor-message"><i class="fa-solid fa-user-shield"></i><span>${esc(plan.mensagemMentor)}</span></div>`:""}
      </div>
      <div class="weekly-briefing-stats">
        <div><span>Blocos</span><strong>${fmtInt(totalBlocks)}</strong></div>
        <div><span>Questões previstas</span><strong>${fmtInt(plan.metaSemanal||totalQuestions)}</strong></div>
        <div><span>Registradas</span><strong>${fmtInt(loggedQuestions)}</strong></div>
        <div><span>Execução</span><strong>${percent}%</strong></div>
      </div>
      ${next?`<div class="weekly-next-mission"><i class="fa-solid fa-crosshairs"></i><span>Próxima missão: ${esc(next.day.day)} • ${esc(next.block.discipline||"Bloco")} ${next.block.subject?`— ${esc(next.block.subject)}`:""}</span></div>`:`<div class="weekly-next-mission done"><i class="fa-solid fa-check-double"></i><span>Missão semanal concluída. Gere o relatório e avance para a próxima operação.</span></div>`}
      <div class="weekly-progress-mini"><div style="width:${percent}%"></div></div>
    </div>`:`<strong>Nenhum planejamento importado</strong><span>Clique em Importar planejamento para carregar o arquivo individual do aluno em JSON ou Markdown.</span>`;
    if(!totalDays){ board.innerHTML=`<div class="weekly-empty"><i class="fa-solid fa-clipboard-list"></i><strong>Planejamento vazio</strong><span>Importe o planejamento individual do aluno para visualizar a semana com blocos, aulas, questões, revisão e metas.</span></div>`; return; }
    const weeklyView=window.__setorXWeeklyView||"today";
    const todayName=new Date().toLocaleDateString("pt-BR",{weekday:"long"}).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const pairs=plan.days.map((day,di)=>({day,di}));
    const todayIndex=pairs.findIndex(x=>String(x.day.day||"").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(todayName.split("-")[0]));
    const filteredPairs=pairs.filter(({day,di})=>{
      const blocks=day.blocks||[];
      const doneCount=blocks.filter((b,bi)=>plan.completions[weeklyBlockId(di,bi)]).length;
      const allDone=blocks.length>0 && doneCount===blocks.length;
      const anyDone=doneCount>0;
      if(String(weeklyView).startsWith("day:")) return di===Number(String(weeklyView).split(":")[1]||0);
      if(weeklyView==="all") return true;
      if(weeklyView==="done") return allDone;
      if(weeklyView==="pending") return !allDone;
      if(weeklyView==="late") return di < Math.max(0,todayIndex) && !allDone;
      return todayIndex>=0 ? di===todayIndex : di===0;
    });
    const weeklyTabs=`<div class="weekly-view-tabs">
      <button class="weekly-view-tab ${weeklyView==="today"?"active":""}" data-weekly-view="today" type="button">Hoje</button>
      <button class="weekly-view-tab ${weeklyView==="all"?"active":""}" data-weekly-view="all" type="button">Todos</button>
      <button class="weekly-view-tab ${weeklyView==="pending"?"active":""}" data-weekly-view="pending" type="button">Pendentes</button>
      <button class="weekly-view-tab ${weeklyView==="done"?"active":""}" data-weekly-view="done" type="button">Concluídos</button>
      <button class="weekly-view-tab ${weeklyView==="late"?"active":""}" data-weekly-view="late" type="button">Atrasados</button>
    </div>`;
    const weeklyCalendar=`<div class="weekly-mini-calendar"><strong>CALENDÁRIO</strong><div>${pairs.map((x,i)=>{ const dLabel=weeklyPlanDateLabel(x.day,i); return `<button class="weekly-mini-day ${i===todayIndex?"today":""} ${String(weeklyView)===`day:${i}`?"active":""} ${((x.day.blocks||[]).every((b,bi)=>plan.completions[weeklyBlockId(x.di,bi)]) && (x.day.blocks||[]).length)?"done":""}" data-weekly-jump="${i}" title="${esc(x.day.day||`Dia ${i+1}`)}${dLabel?` • ${esc(dLabel)}`:""}" type="button"><b>${i+1}</b>${dLabel?`<small>${esc(dLabel)}</small>`:""}</button>`}).join("")}</div></div>`;
    board.innerHTML=weeklyTabs+(filteredPairs.length?filteredPairs.map(({day,di})=>{
      const blocks=day.blocks||[];
      const dayTotal=blocks.reduce((a,b)=>a+n(b.meta),0)||day.metaDay||0;
      const dayDone=blocks.filter((b,bi)=>plan.completions[weeklyBlockId(di,bi)]).length;
      const dayLogged=blocks.reduce((a,b,bi)=>a+n(weeklyBlockLog(weeklyBlockId(di,bi))?.done),0);
      const dayPct=blocks.length?Math.round(dayDone/blocks.length*100):0;
      const dayStatus=dayPct===100?"Missão cumprida":dayPct>0?"Em andamento":"Não iniciado";
      return `<article class="weekly-day-card weekly-day-pro" data-day-index="${di}">
        <div class="weekly-day-head">
          <div>
            <span><i class="fa-solid ${weeklyDayIcon(day.day)}"></i> ${esc(day.day)} ${day.date?`• ${esc(day.date)}`:""}</span>
            <strong>${esc(day.disciplines||day.review||"Operação do dia")}</strong>
          </div>
          <em>${fmtInt(dayLogged)}/${fmtInt(dayTotal)} questões</em>
        </div>
        <div class="weekly-day-status"><span>${dayStatus}</span><small>${dayPct}% dos blocos concluídos</small></div>
        <div class="weekly-day-progress"><div style="width:${dayPct}%"></div></div>
        ${day.review?`<div class="weekly-review-line"><i class="fa-solid fa-rotate"></i><span>${esc(day.review)}</span></div>`:""}
        <div class="weekly-blocks">${blocks.map((b,bi)=>{ 
          const key=weeklyBlockId(di,bi), checked=!!plan.completions[key], log=weeklyBlockLog(key)||{};
          const icon=b.type==="simulado"?"fa-file-circle-check":b.type==="review"?"fa-rotate":"fa-graduation-cap";
          const hasMaterial=!!(b.materialLink||weeklyExtractLink(b.material||""));
          const hasQuestions=!!(b.questionLink||weeklyExtractLink(b.questions||""));
          const materialHref=hasMaterial?esc(b.materialLink||weeklyExtractLink(b.material)):"";
          const questionHref=hasQuestions?esc(b.questionLink||weeklyExtractLink(b.questions)):"";
          const blockDone=n(log.done), blockMeta=n(b.meta);
          const blockPct=blockMeta?clamp(blockDone/blockMeta*100,0,100):checked?100:0;
          return `<div class="weekly-block ${checked?"done":""}" data-block-key="${esc(key)}">
          <button class="weekly-check" data-weekly-check="${esc(key)}" type="button" title="Marcar bloco como concluído"><i class="fa-solid ${checked?"fa-check":"fa-circle"}"></i></button>
          <div class="weekly-block-main">
            <div class="weekly-block-title">
              <i class="fa-solid ${icon}"></i>
              <strong>Bloco ${fmtInt(b.number||bi+1)} — ${esc(b.discipline||"Disciplina")}</strong>
              ${checked?`<span class="weekly-status-done">Concluído</span>`:""}
            </div>
            ${b.subject?`<p><i class="fa-solid fa-bookmark"></i> ${esc(b.subject)}</p>`:""}
            <div class="weekly-block-tools">
              <span><i class="fa-solid fa-bullseye"></i> ${fmtInt(blockDone)}/${fmtInt(b.meta||0)} questões</span>
              ${hasMaterial?`<a class="weekly-tool-link" href="${materialHref}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-video"></i> Aula/material</a>`:""}
              ${hasQuestions?`<a class="weekly-tool-link" href="${questionHref}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-circle-question"></i> Questões</a>`:""}
              ${(b.type!=="review"||n(b.meta)>0)?`<button class="weekly-tool-button" data-weekly-log="${esc(key)}" data-di="${di}" data-bi="${bi}" type="button"><i class="fa-solid fa-pen-to-square"></i> Registrar questões</button>`:""}
              ${b.notes?`<span><i class="fa-solid fa-note-sticky"></i> ${esc(b.notes)}</span>`:""}
            </div>
            ${blockMeta||blockDone?`<div class="weekly-block-progress"><div style="width:${blockPct}%"></div></div>`:""}
            ${log.updatedAt?`<div class="weekly-log-line"><i class="fa-solid fa-chart-simple"></i> Feitas: ${fmtInt(log.done)} • Acertos: ${fmtInt(log.correct)} • Erros: ${fmtInt(log.wrong)}${log.note?` • ${esc(log.note)}`:""}</div>`:""}
          </div>
        </div>`}).join("")}</div>
      </article>`;
    }).join(""):`<div class="weekly-empty"><i class="fa-solid fa-filter"></i><strong>Nenhum bloco neste filtro</strong><span>Altere a visão acima para visualizar outros dias do planejamento.</span></div>`)+weeklyCalendar;
  }

  
  function simpleHash(str){
    let h=0, s=String(str||"");
    for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; }
    return Math.abs(h).toString(36);
  }
  function normalizeQxAnswer(value, type){
    const v=String(value||"").trim();
    if(type==="Certo/Errado"){
      if(/^(certo|correto|true|verdadeiro|sim)$/i.test(v)) return "Certo";
      if(/^(errado|incorreto|false|falso|não|nao)$/i.test(v)) return "Errado";
      if(/^c$/i.test(v)) return "Certo";
      if(/^e$/i.test(v)) return "Errado";
      return v||"";
    }
    const letter=(v.match(/[A-E]/i)||[])[0];
    return letter?letter.toUpperCase():v;
  }
  function normalizeQxExtensionCapture(raw={}){
    const rawAlts = raw.alternatives && !Array.isArray(raw.alternatives)
      ? ["A","B","C","D","E"].map(k=>raw.alternatives[k]||raw.alternatives[k.toLowerCase()]||"")
      : Array.isArray(raw.alternatives) ? raw.alternatives : [];
    const altText = rawAlts.map(x=>String(x||"")).join(" ");
    const statementRaw = String(raw.statement || raw.enunciado || raw.question || "").trim();
    const cePattern = raw.type==="Certo/Errado"
      || /Certo\/Errado|certo ou errado|julgue/i.test(statementRaw + " " + altText + " " + (raw.board||raw.banca||""))
      || (/C\s*\d{1,3}(?:[.,]\d{1,2})?\s*%\s*Certo/i.test(altText) && /E\s*\d{1,3}(?:[.,]\d{1,2})?\s*%\s*Errado/i.test(altText))
      || (rawAlts.length<=2 && /Certo/i.test(altText) && /Errado/i.test(altText));
    const type = cePattern ? "Certo/Errado" : rawAlts.filter(Boolean).length >= 2 ? "Múltipla escolha" : "Certo/Errado";
    const alternativesRaw = type==="Certo/Errado" ? [] : rawAlts.map(x=>String(x||"").replace(/^[A-E][\)\.\-:]\s*/i,"").trim()).filter(Boolean).slice(0,5);
    const result = raw.result==="correct" || raw.status==="correct" || raw.isCorrect===true ? "correct" : "wrong";
    const capturedAt = raw.capturedAt || new Date().toISOString();
    let statement = statementRaw
      .replace(/https?:\/\/\S+/gi,"")
      .replace(/(Q\d{4,}|Banca:.*?Ano:\s*\d{4}.*?N[íi]vel:[^\n\r]*)/gi,"")
      .replace(/Conte[úu]do de apoio|arrow_drop_down|Sua resposta|Responder questão|Responder questao|Resposta/gi,"")
      .replace(/\b(C|E)\s*\d{1,3}(?:[.,]\d{1,2})?\s*%\s*(Certo|Errado)\b/gi,"")
      .replace(/%5B|%5D|%20|discipline_ids|subject_ids|examining_board_ids/gi,"")
      .replace(/\s{2,}/g," ")
      .trim();
    const sourceUrl = String(raw.url || raw.sourceUrl || "").trim();
    const externalId = raw.externalId || raw.questionId || `ext-${simpleHash(`${sourceUrl}|${statement}|${capturedAt}`)}`;
    const normalizeAns=(value)=>{
      const v=String(value||"").trim();
      if(type==="Certo/Errado"){
        if(/^(c|certo|correto|true|verdadeiro)$/i.test(v)) return "Certo";
        if(/^(e|errado|incorreto|false|falso)$/i.test(v)) return "Errado";
      }
      const letter=(v.match(/[A-E]/i)||[])[0];
      return type==="Múltipla escolha"&&letter?letter.toUpperCase():v;
    };
    const answer = normalizeAns(raw.correctAnswer || raw.answer || raw.gabarito || "");
    const myAnswer = normalizeAns(raw.myAnswer || raw.respostaAluno || "");
    const q = {
      id: uid(),
      externalId,
      date: todayKey(),
      capturedAt,
      platform: raw.platform || raw.source || "Extensão Setor X",
      sourceUrl,
      subject: raw.discipline || raw.subject || raw.disciplina || "Geral",
      topic: raw.topic || raw.assunto || "",
      board: raw.board || raw.banca || "",
      type,
      support: raw.supportText || raw.support || raw.context || "",
      statement,
      alternatives: alternativesRaw,
      answer,
      comment: raw.teacherComment || raw.comment || raw.comentario || "",
      personalComment: raw.personalComment || raw.studentComment || raw.myComment || "",
      source: `${raw.platform || raw.source || "Extensão Setor X"}${raw.questionId?` • ${raw.questionId}`:""}`,
      tags: ["captura-extensao","setor-x-captura-qx"].concat(raw.tags||[]).filter(Boolean),
      status: result,
      attempts: 1,
      correctCount: result==="correct"?1:0,
      wrongCount: result==="wrong"?1:0,
      streak: result==="correct"?1:0,
      reviewLevel: result==="correct"?1:0,
      nextReview: result==="correct"?addDays(todayKey(),3):addDays(todayKey(),1),
      lastReview: todayKey(),
      lastResult: {status:result, answeredAt:capturedAt, answer:myAnswer},
      commentUnlocked: true,
      history: [{date:capturedAt, answer:myAnswer, result, errorReason:raw.errorReason||"", wasDue:false}],
      errorReason: raw.errorReason || "",
      myAnswer
    };
    return normQuestion(q);
  }
  function importQxExtensionCaptures(payload){
    const list = Array.isArray(payload) ? payload : Array.isArray(payload?.captures) ? payload.captures : payload ? [payload] : [];
    if(!list.length) return 0;
    let added=0, skipped=0;
    list.forEach(raw=>{
      const q=normalizeQxExtensionCapture(raw);
      if(!q.statement && !q.sourceUrl){ skipped++; return; }
      const exists=state.questions.some(old =>
        (q.externalId && old.externalId===q.externalId) ||
        (q.sourceUrl && old.sourceUrl===q.sourceUrl && old.statement===q.statement) ||
        (old.source && q.sourceUrl && old.source.includes(q.sourceUrl) && old.statement===q.statement)
      );
      if(exists){ skipped++; return; }
      state.questions.unshift(q);
      added++;
    });
    if(added){
      xp(added*6, `${added} questão(ões) capturada(s) pela extensão`);
      state.activeQuestionId=state.questions[0]?.id||state.activeQuestionId;
      save();
      try{ window.postMessage({type:"SETORX_QX_CAPTURE_ACK", added, skipped}, "*"); }catch{}
    }else{
      toast(skipped ? "Capturas já estavam no Banco QX." : "Nenhuma captura válida encontrada.");
    }
    return added;
  }
  function processQxExtensionQueue(){
    try{
      const raw=localStorage.getItem("SETORX_QX_EXTENSION_QUEUE");
      if(!raw) return;
      localStorage.removeItem("SETORX_QX_EXTENSION_QUEUE");
      const parsed=JSON.parse(raw);
      importQxExtensionCaptures(parsed);
    }catch(e){ console.warn("Setor X: falha ao processar fila da extensão", e); }
  }
  window.addEventListener("message", e=>{
    const data=e.data||{};
    if(data.type==="SETORX_QX_CAPTURE_IMPORT"){
      importQxExtensionCaptures(data.payload||data.captures||[]);
    }
  });
  window.addEventListener("storage", e=>{ if(e.key==="SETORX_QX_EXTENSION_QUEUE") processQxExtensionQueue(); });
  setInterval(processQxExtensionQueue, 2500);


  function fixQxCapturedCertoErrado(){
    let fixed=0;
    state.questions.forEach(q=>{
      const altText=Array.isArray(q.alternatives)?q.alternatives.join(" "):"";
      const shouldFix = q.type==="Múltipla escolha" && (
        /C\s*\d{1,3}(?:[.,]\d{1,2})?\s*%\s*Certo/i.test(altText) ||
        /E\s*\d{1,3}(?:[.,]\d{1,2})?\s*%\s*Errado/i.test(altText) ||
        /Certo\/Errado|certo ou errado|julgue/i.test(q.statement||"")
      );
      if(shouldFix){
        q.type="Certo/Errado";
        q.alternatives=[];
        q.answer = /errado/i.test(q.answer||"") || /^E$/i.test(q.answer||"") ? "Errado" : /certo/i.test(q.answer||"") || /^C$/i.test(q.answer||"") ? "Certo" : q.answer;
        q.myAnswer = /errado/i.test(q.myAnswer||"") || /^E$/i.test(q.myAnswer||"") ? "Errado" : /certo/i.test(q.myAnswer||"") || /^C$/i.test(q.myAnswer||"") ? "Certo" : q.myAnswer;
        q.statement=String(q.statement||"")
          .replace(/Conte[úu]do de apoio|arrow_drop_down|Sua resposta|Responder questão|Responder questao|Resposta/gi,"")
          .replace(/\b(C|E)\s*\d{1,3}(?:[.,]\d{1,2})?\s*%\s*(Certo|Errado)\b/gi,"")
          .replace(/\s{2,}/g," ")
          .trim();
        fixed++;
      }
    });
    if(fixed){ save(); toast(`${fixed} questão(ões) capturada(s) corrigida(s) para Certo/Errado.`); }
    else toast("Nenhuma captura C/E bagunçada encontrada.");
  }

  function cleanQxCapturedLinks(){
    let fixed=0;
    state.questions.forEach(q=>{
      let changed=false;
      ["statement","comment","personalComment","source"].forEach(k=>{
        if(typeof q[k]==="string" && /https?:\/\/\S+/i.test(q[k])){
          q[k]=q[k].replace(/https?:\/\/\S+/gi,"").replace(/\s{2,}/g," ").trim();
          changed=true;
        }
      });
      if(changed) fixed++;
    });
    if(fixed){ save(); toast(`${fixed} questão(ões) limpas de links visíveis.`); }
    else toast("Nenhum link visível para limpar nas capturas.");
  }


  function verticalSlug(str){
    return String(str||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,80)||"item";
  }
  function splitVerticalTopics(raw){
    const clean=String(raw||"").replace(/\s+/g," ").trim();
    if(!clean) return [];
    return clean.split(/\s*(?:;|\n|\r|\u2022|\|)\s*/g).map(x=>x.trim()).filter(Boolean).filter(x=>x.length>2);
  }
  function verticalEstimateMinutes(subjectWeight=1, topic=""){
    const len=String(topic||"").length;
    const base=subjectWeight>=4?75:subjectWeight>=3?60:45;
    return clamp(base + (len>90?15:0),30,120);
  }
  function normVerticalTopic(t={}, subjectName="", index=0){
    const rawTitle=String(t.title||t.topic||t.name||`Tópico ${index+1}`).trim();
    const code=String(t.code||t.numero||t.number||"").trim();
    const title=rawTitle || `Tópico ${index+1}`;
    const detectedLevel=code && /^\d+(?:\.\d+)+$/.test(code) ? Math.min(4,code.split(".").length) : 1;
    const id=t.id || `vx-topic-${verticalSlug(subjectName)}-${verticalSlug(code?`${code}-${title}`:title)}-${index}`;
    return {
      id,
      code,
      level: Math.max(1,Math.min(4,n(t.level||t.nivel||detectedLevel,detectedLevel))),
      title,
      difficulty: String(t.difficulty||t.dificuldade||"Média"),
      minutes: Math.max(10,n(t.minutes||t.tempo||60,60)),
      source: String(t.source||"manual"),
      fromBase: !!t.fromBase,
      fromPlanning: !!t.fromPlanning,
      fromImported: !!t.fromImported,
      materialLink: String(t.materialLink||t.aula||""),
      questionLink: String(t.questionLink||t.questoes||""),
      meta: Math.max(0,n(t.meta||0)),
      days: Array.isArray(t.days)?t.days:[],
      children: Array.isArray(t.children)?t.children:[]
    };
  }
  function normVerticalSubject(s={}, index=0){
    const name=String(s.name||s.discipline||s.disciplina||`Disciplina ${index+1}`).trim();
    return {
      id:s.id||`vx-sub-${verticalSlug(name)}`,
      name,
      weight:Math.max(1,n(s.weight||s.peso||1,1)),
      source:String(s.source||"manual"),
      topics:Array.isArray(s.topics)?s.topics.map((t,i)=>normVerticalTopic(t,name,i)):[]
    };
  }
  function verticalAllContestOptions(){
    state.contestProfiles=state.contestProfiles&&typeof state.contestProfiles==="object"?state.contestProfiles:{};
    const items=[];
    const currentKey=state.edital?.targetContest||"custom";
    const push=(key,label,kind="base")=>{ if(!key) return; if(items.some(x=>x.key===key)) return; items.push({key,label:label||key,kind}); };
    push(currentKey,state.edital?.name||"Concurso atual","atual");
    Object.entries(contestPresets||{}).forEach(([key,p])=>push(key,p?.label||key,"preset"));
    Object.entries(state.contestProfiles||{}).forEach(([key,v])=>v?.edital&&push(key,v.label||v.edital?.name||key,v.custom?"personalizado":"salvo"));
    return items.sort((a,b)=>(a.kind==="atual"?-1:b.kind==="atual"?1:String(a.label).localeCompare(String(b.label),"pt-BR")));
  }
  function verticalActiveKey(){
    state.verticalizedSelectedContest = state.verticalizedSelectedContest || state.verticalized?.selectedContest || state.edital?.targetContest || "custom";
    return state.verticalizedSelectedContest;
  }
  function verticalActiveEdital(){
    const key=verticalActiveKey();
    const saved=state.contestProfiles && state.contestProfiles[key]?.edital;
    if(saved) return {...saved,subjects:Array.isArray(saved.subjects)?saved.subjects:[]};
    const preset=contestPresets && contestPresets[key];
    if(preset) return {targetContest:key,name:preset.label,board:preset.board||"",type:preset.type||"Misto",subjects:presetSubjects(key)};
    return {...state.edital,subjects:Array.isArray(state.edital?.subjects)?state.edital.subjects:[]};
  }
  function verticalBaseSubjects(){
    const edital=verticalActiveEdital();
    return Array.isArray(edital.subjects)?edital.subjects.map(normSubject).filter(s=>s.name):[];
  }
  function verticalSetActiveContest(key){
    const options=verticalAllContestOptions();
    const valid=options.some(x=>x.key===key)?key:(state.edital?.targetContest||"custom");
    state.verticalizedSelectedContest=valid;
    const v=verticalState();
    v.selectedContest=valid;
    if(!v.title){
      const ed=verticalActiveEdital();
      v.title=`${ed.name||"Edital"} — Verticalizado`;
    }
  }
  function normVerticalizedState(v){
    const base=clone(defaultState.verticalized||{title:"",autoSync:true,showDone:true,filter:"all",collapsed:{},completions:{},notes:{},subjects:[],createdAt:null,updatedAt:null,lastSourceSignature:"",selectedContest:""});
    if(!v||typeof v!=="object") return base;
    return {
      ...base,
      ...v,
      autoSync:v.autoSync!==false,
      showDone:v.showDone!==false,
      filter:v.filter||"all",
      collapsed:v.collapsed&&typeof v.collapsed==="object"?v.collapsed:{},
      completions:v.completions&&typeof v.completions==="object"?v.completions:{},
      notes:v.notes&&typeof v.notes==="object"?v.notes:{},
      selectedContest:v.selectedContest||state.verticalizedSelectedContest||state.edital?.targetContest||"custom",
      subjects:Array.isArray(v.subjects)?v.subjects.map(normVerticalSubject):[]
    };
  }
  function verticalState(){
    state.verticalizedByContest=state.verticalizedByContest&&typeof state.verticalizedByContest==="object"?state.verticalizedByContest:{};
    const key=verticalActiveKey();
    if(!state.verticalizedByContest[key]){
      const seed=(state.verticalized && (state.verticalized.selectedContest===key || key===(state.edital?.targetContest||"custom"))) ? state.verticalized : {};
      state.verticalizedByContest[key]=normVerticalizedState({...seed,selectedContest:key});
    }
    const v=normVerticalizedState({...state.verticalizedByContest[key],selectedContest:key});
    state.verticalizedByContest[key]=v;
    state.verticalized=v;
    return v;
  }
  function verticalTopicKey(subjectName, topicTitle){ return `${verticalSlug(subjectName)}::${verticalSlug(topicTitle)}`; }
  function verticalMergeSubjects(current=[], incoming=[]){
    const map=new Map();
    current.map(normVerticalSubject).forEach(s=>{
      const sk=verticalSlug(s.name);
      map.set(sk,{...s,topics:[...s.topics]});
    });
    incoming.map(normVerticalSubject).forEach(s=>{
      const sk=verticalSlug(s.name);
      if(!map.has(sk)) map.set(sk,{...s,topics:[]});
      const target=map.get(sk);
      target.weight=Math.max(n(target.weight,1), n(s.weight,1));
      target.source=[...new Set(String(`${target.source},${s.source}`).split(",").map(x=>x.trim()).filter(Boolean))].join(", ");
      const tmap=new Map(target.topics.map(t=>[verticalSlug(t.title),t]));
      s.topics.forEach(t=>{
        const tk=verticalSlug(t.title);
        if(tmap.has(tk)){
          const old=tmap.get(tk);
          Object.assign(old,{
            difficulty: old.difficulty || t.difficulty,
            minutes: Math.max(n(old.minutes,0), n(t.minutes,0)),
            fromBase: old.fromBase || t.fromBase,
            fromPlanning: old.fromPlanning || t.fromPlanning,
            source:[...new Set(String(`${old.source},${t.source}`).split(",").map(x=>x.trim()).filter(Boolean))].join(", "),
            materialLink: old.materialLink || t.materialLink,
            questionLink: old.questionLink || t.questionLink,
            meta: Math.max(n(old.meta,0),n(t.meta,0)),
            days:[...new Set([...(old.days||[]),...(t.days||[])])]
          });
        }else{
          target.topics.push(t);
          tmap.set(tk,t);
        }
      });
      target.topics.sort((a,b)=>String(a.title).localeCompare(String(b.title),"pt-BR",{numeric:true,sensitivity:"base"}));
    });
    return [...map.values()].sort((a,b)=>String(a.name).localeCompare(String(b.name),"pt-BR"));
  }
  function verticalFromBase(){
    return verticalBaseSubjects().map(s=>{
      const topics=splitVerticalTopics(s.topics).map((title,i)=>normVerticalTopic({
        id:`vx-topic-${verticalSlug(s.name)}-${verticalSlug(title)}`,
        title,
        difficulty:"Média",
        minutes:verticalEstimateMinutes(s.weight,title),
        source:"Base-mãe",
        fromBase:true
      },s.name,i));
      return normVerticalSubject({id:`vx-sub-${verticalSlug(s.name)}`,name:s.name,weight:s.weight,source:"Base-mãe",topics:topics.length?topics:[normVerticalTopic({title:"Conteúdo programático da disciplina",source:"Base-mãe",fromBase:true,minutes:verticalEstimateMinutes(s.weight,"")},s.name,0)]});
    });
  }
  function weeklyExtractUrl(raw=""){
    const m=String(raw||"").match(/https?:\/\/\S+/i);
    return m?m[0].replace(/[),.;]+$/,""):"";
  }
  function verticalFromPlanning(){
    const p=weeklyPlan();
    const bySubject=new Map();
    const allowed=new Set(verticalBaseSubjects().map(s=>verticalSlug(s.name)));
    (p.days||[]).forEach((day,di)=>{
      (day.blocks||[]).forEach((b,bi)=>{
        const discipline=String(b.discipline||b.materia||b.subjectName||"Planejamento").trim()||"Planejamento";
        const topic=String(b.subject||b.topic||b.assunto||b.title||"Bloco de estudo").trim()||"Bloco de estudo";
        const sk=verticalSlug(discipline);
        if(allowed.size && !allowed.has(sk)) return;
        if(!bySubject.has(sk)) bySubject.set(sk,{id:`vx-sub-${sk}`,name:discipline,weight:2,source:"Planejamento",topics:[]});
        const subj=bySubject.get(sk);
        const tk=verticalSlug(topic);
        let t=subj.topics.find(x=>verticalSlug(x.title)===tk);
        if(!t){
          t=normVerticalTopic({id:`vx-topic-${sk}-${tk}`,title:topic,difficulty:"Média",minutes:n(b.minutes||b.duration||60,60),source:"Planejamento",fromPlanning:true,meta:n(b.meta||0),days:[]},discipline,subj.topics.length);
          subj.topics.push(t);
        }
        t.fromPlanning=true;
        t.source=[...new Set(String(`${t.source},Planejamento`).split(",").map(x=>x.trim()).filter(Boolean))].join(", ");
        t.meta=Math.max(n(t.meta,0),n(b.meta||0));
        t.materialLink=t.materialLink||b.materialLink||weeklyExtractUrl(b.material||"");
        t.questionLink=t.questionLink||b.questionLink||weeklyExtractUrl(b.questions||"");
        const label=day.date?`${day.day||`Dia ${di+1}`} • ${day.date}`:(day.day||`Dia ${di+1}`);
        t.days=[...new Set([...(t.days||[]),label])];
      });
    });
    return [...bySubject.values()].map(normVerticalSubject);
  }
  function verticalSourceSignature(){
    const ed=verticalActiveEdital();
    const base=verticalBaseSubjects().map(s=>[s.name,s.weight,s.topics]);
    const p=weeklyPlan();
    const allowed=new Set(verticalBaseSubjects().map(s=>verticalSlug(s.name)));
    const plan=(p.days||[]).map(d=>[d.day,d.date,(d.blocks||[]).filter(b=>!allowed.size||allowed.has(verticalSlug(b.discipline||b.materia||b.subjectName||""))).map(b=>[b.discipline,b.subject,b.meta,b.materialLink,b.questionLink])]);
    return simpleHash(JSON.stringify({contest:verticalActiveKey(),base,plan,edital:ed?.name,weekly:p.importedAt||""}));
  }
  function verticalSync(source="all", silent=false){
    const v=verticalState();
    const incoming=[];
    if(source==="base"||source==="all") incoming.push(...verticalFromBase());
    if(source==="planning"||source==="all") incoming.push(...verticalFromPlanning());
    if(!incoming.length){ if(!silent) toast("Nenhuma fonte encontrada para o edital escolhido."); return 0; }
    const fresh = source==="planning" ? verticalMergeSubjects(v.subjects,incoming) : verticalMergeSubjects([],incoming);
    verticalPreserveProgressForSubjects(fresh);
    v.subjects=fresh;
    const ed=verticalActiveEdital();
    v.title=v.title||`${ed?.name||weeklyPlan().concurso||"Edital"} — Verticalizado`;
    v.selectedContest=verticalActiveKey();
    v.createdAt=v.createdAt||new Date().toISOString();
    v.updatedAt=new Date().toISOString();
    v.lastSourceSignature=verticalSourceSignature();
    const total=incoming.reduce((sum,s)=>sum+(s.topics?.length||0),0);
    if(!silent){ xp(5,"edital verticalizado sincronizado"); save(); toast(`Edital escolhido sincronizado: ${total} tópico(s).`); }
    return total;
  }
  function verticalMaybeAutoSync(){
    const v=verticalState();
    const sig=verticalSourceSignature();
    if(v.autoSync && sig!==v.lastSourceSignature){
      verticalSync("all",true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }
  function verticalStats(){
    const v=verticalState();
    const subjectsArr=v.subjects||[];
    const topics=subjectsArr.flatMap(s=>(s.topics||[]).map(t=>({s,t})));
    const done=topics.filter(x=>v.completions[x.t.id]).length;
    const minutes=topics.reduce((a,x)=>a+n(x.t.minutes,0),0);
    const studied=subjectsArr.reduce((a,s)=>a+focusMinutesBySubject(s.name),0);
    return {subjects:subjectsArr.length,topics:topics.length,done,percent:topics.length?Math.round(done/topics.length*100):0,minutes,studied};
  }
  function renderVerticalized(){
    const board=$("#verticalized-board"); if(!board) return;
    const selector=$("#verticalized-contest-select");
    if(selector){
      const options=verticalAllContestOptions();
      const active=verticalActiveKey();
      selector.innerHTML=options.map(o=>`<option value="${esc(o.key)}">${esc(o.label)}${o.kind==="atual"?" • atual":""}</option>`).join("") || `<option value="custom">Concurso atual</option>`;
      selector.value=options.some(o=>o.key===active)?active:(state.edital?.targetContest||"custom");
    }
    verticalMaybeAutoSync();
    const v=verticalState();
    const stats=verticalStats();
    const activeEdital=verticalActiveEdital();
    const titleInput=$("#verticalized-title"); if(titleInput && document.activeElement!==titleInput) titleInput.value=v.title||"";
    const auto=$("#verticalized-autosync"); if(auto) auto.checked=!!v.autoSync;
    const showDone=$("#verticalized-show-done"); if(showDone) showDone.checked=!!v.showDone;
    setText("#verticalized-kpi-subjects",fmtInt(stats.subjects));
    setText("#verticalized-kpi-topics",fmtInt(stats.topics));
    setText("#verticalized-kpi-done",`${stats.percent}%`);
    setText("#verticalized-kpi-time",fmtMinutes(stats.minutes));
    setText("#verticalized-kpi-studied",fmtMinutes(stats.studied));
    setText("#verticalized-source-label",`${activeEdital?.name||"Edital escolhido"} • ${verticalBaseSubjects().length} disciplinas`);
    setText("#verticalized-source-detail",v.updatedAt?`Última atualização: ${new Date(v.updatedAt).toLocaleString("pt-BR")} • Fonte: ${activeEdital?.board||"banca não informada"}`:"Escolha o edital e clique em sincronizar/gerar.");
    const empty=$("#verticalized-empty");
    const search=String($("#verticalized-search")?.value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const filter=v.filter||"all";
    $$(".verticalized-tab").forEach(btn=>btn.classList.toggle("active",(btn.dataset.verticalFilter||"all")===filter));
    if(empty) empty.hidden=stats.topics>0;
    if(!stats.topics){ board.innerHTML=""; return; }
    const visibleSubjects=(v.subjects||[]).map(normVerticalSubject).map(sub=>{
      const topics=(sub.topics||[]).filter(t=>{
        const done=!!v.completions[t.id];
        if(!v.showDone && done) return false;
        if(filter==="pending" && done) return false;
        if(filter==="done" && !done) return false;
        if(filter==="planning" && !t.fromPlanning) return false;
        const hay=`${sub.name} ${t.title} ${t.source}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
        return !search || hay.includes(search);
      });
      return {...sub,topics};
    }).filter(s=>s.topics.length);
    board.innerHTML=visibleSubjects.map(sub=>{
      const all=(sub.topics||[]).length;
      const done=(sub.topics||[]).filter(t=>v.completions[t.id]).length;
      const pct=all?Math.round(done/all*100):0;
      const collapsed=v.collapsed[sub.id]===true;
      const studied=focusMinutesBySubject(sub.name);
      const studiedToday=focusMinutesBySubjectToday(sub.name);
      return `<article class="verticalized-subject ${collapsed?"collapsed":""}" data-vertical-subject="${esc(sub.id)}">
        <button class="verticalized-subject-head" data-vertical-collapse="${esc(sub.id)}" type="button">
          <div class="verticalized-subject-title-block">
            <span><i class="fa-solid fa-book-bookmark"></i> ${esc(sub.name)}</span>
            <strong>${done}/${all} tópicos concluídos • ${fmtMinutes(studied)} estudado${studiedToday?` • hoje ${fmtMinutes(studiedToday)}`:""}</strong>
          </div>
          <div class="verticalized-subject-progress"><em>${pct}%</em><div><b style="width:${pct}%"></b></div><i class="fa-solid fa-chevron-down"></i></div>
        </button>
        <div class="verticalized-topic-list">
          ${sub.topics.map((t,i)=>{
            const done=!!v.completions[t.id];
            const note=v.notes[t.id]||"";
            const sourceBadges=[t.fromBase?"Base-mãe":"",t.fromPlanning?"Planejamento":"",t.fromImported?"Texto importado":""].filter(Boolean);
            const prefix=t.code?esc(t.code):String(i+1);
            const level=Math.max(1,Math.min(4,n(t.level,1)));
            const levelClass=`level-${level}`;
            return `<div class="verticalized-topic ${done?"done":""} ${levelClass}" data-vertical-topic="${esc(t.id)}">
              <button class="verticalized-check" data-vertical-toggle="${esc(t.id)}" type="button" title="Marcar tópico"><i class="fa-solid ${done?"fa-check":"fa-circle"}"></i></button>
              <div class="verticalized-topic-main">
                <div class="verticalized-topic-title"><span class="verticalized-topic-kind">${level===1?"Tópico":"Subtópico"}</span><strong><em class="verticalized-topic-code">${prefix}</em> ${esc(t.title)}</strong>${sourceBadges.map(b=>`<span>${esc(b)}</span>`).join("")}</div>
                <div class="verticalized-topic-meta">
                  <span><i class="fa-solid fa-signal"></i> ${esc(t.difficulty||"Média")}</span>
                  <span><i class="fa-regular fa-clock"></i> ${fmtInt(t.minutes||60)}min estimado</span>
                  <span><i class="fa-solid fa-hourglass-half"></i> ${fmtMinutes(studied)} na disciplina</span>
                  ${t.meta?`<span><i class="fa-solid fa-bullseye"></i> ${fmtInt(t.meta)} questões</span>`:""}
                  ${t.days?.length?`<span><i class="fa-solid fa-calendar-days"></i> ${esc(t.days.slice(0,2).join(" • "))}${t.days.length>2?` +${t.days.length-2}`:""}</span>`:""}
                </div>
                <div class="verticalized-topic-tools">
                  ${t.materialLink?`<a href="${esc(t.materialLink)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-video"></i> Aula</a>`:""}
                  ${t.questionLink?`<a href="${esc(t.questionLink)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-circle-question"></i> Questões</a>`:""}
                  <button data-vertical-focus-subject="${esc(sub.name)}" data-vertical-start-focus="${esc(t.title)}" type="button"><i class="fa-solid fa-stopwatch"></i> Foco</button>
                  <button data-vertical-create-summary="${esc(t.title)}" type="button"><i class="fa-solid fa-book-open"></i> Resumo</button>
                  <button data-vertical-review="${esc(t.id)}" type="button"><i class="fa-solid fa-rotate"></i> Revisar</button>
                </div>
                <input class="verticalized-note" data-vertical-note="${esc(t.id)}" value="${esc(note)}" placeholder="Anotação rápida do aluno/professor..." />
              </div>
            </div>`;
          }).join("")}
        </div>
      </article>`;
    }).join("") || `<div class="verticalized-empty inline"><i class="fa-solid fa-filter"></i><strong>Nada neste filtro</strong><span>Altere a busca ou marque para mostrar concluídos.</span></div>`;
  }
  function verticalAddManual(subjectName, topicTitle, difficulty="Média", minutes=60){
    const v=verticalState();
    const sName=String(subjectName||"").trim();
    const tTitle=String(topicTitle||"").trim();
    if(!sName) return toast("Informe a disciplina.");
    v.subjects=verticalMergeSubjects(v.subjects,[normVerticalSubject({name:sName,weight:1,source:"Manual",topics:tTitle?[normVerticalTopic({title:tTitle,difficulty,minutes,source:"Manual"},sName,0)]:[]})]);
    v.title=v.title||`${verticalActiveEdital()?.name||"Edital"} — Verticalizado`;
    v.createdAt=v.createdAt||new Date().toISOString();
    v.updatedAt=new Date().toISOString();
    xp(3,tTitle?"assunto verticalizado cadastrado":"disciplina verticalizada criada");
    save();
  }


  function verticalCleanImportLine(line=""){
    return String(line||"")
      .replace(/^[\s>•·▪▫◆◇*#–—-]+/g,"")
      .replace(/^\[\s*[x ]\s*\]\s*/i,"")
      .replace(/^\(?\d+[\.)º°-]?\)?\s+/g,"")
      .replace(/^\d+(?:\.\d+)+[\.)-]?\s*/g,"")
      .replace(/^\(?[a-z]\)\s+/i,"")
      .replace(/\s{2,}/g," ")
      .trim();
  }
  function verticalLooksLikeHeading(line=""){
    const s=String(line||"").trim().replace(/:$/g,"");
    if(!s) return false;
    if(/^BLOCO\s+[IVXLCDM\d]+$/i.test(s)) return false;
    if(/^\d{1,3}$/.test(s)) return false;
    if(/^Art\.?\s*\d+/i.test(s)) return false;
    if(/^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|PARTE|LIVRO)\b/i.test(s)) return false;
    if(s.length>120) return false;
    const known=/^(?:\d+[\.)º°-]?\s*)?(L[ÍI]NGUA PORTUGUESA|PORTUGU[ÊE]S|RACIOC[ÍI]NIO L[ÓO]GICO(?:-MATEM[ÁA]TICO)?|MATEM[ÁA]TICA|INFORM[ÁA]TICA|F[ÍI]SICA|QU[ÍI]MICA|BIOLOGIA|ATUALIDADES|[ÉE]TICA(?:\s+E\s+CIDADANIA)?|GEOPOL[ÍI]TICA|L[ÍI]NGUA ESTRANGEIRA|L[ÍI]NGUA INGLESA|L[ÍI]NGUA ESPANHOLA|INGL[ÊE]S|ESPANHOL|DIREITO\s+[A-ZÀ-Ü\s]+|LEGISLA[ÇC][ÃA]O\s+[A-ZÀ-Ü\s]+|CONHECIMENTOS\s+[A-ZÀ-Ü\s]+|NO[ÇC][ÕO]ES\s+DE\s+[A-ZÀ-Ü\s]+|GEOGRAFIA|HIST[ÓO]RIA|REDA[ÇC][ÃA]O|CRIMINOLOGIA|MEDICINA LEGAL|ARQUIVOLOGIA|ADMINISTRA[ÇC][ÃA]O|CONTABILIDADE|ESTAT[ÍI]STICA|DIREITOS HUMANOS)\b/i;
    const letters=s.replace(/[^A-Za-zÀ-ÿ]/g,"");
    const upper=s.replace(/[^A-Za-zÀ-ÿ]/g,"").replace(/[a-zà-ÿ]/g,"");
    const hasLower=/[a-zà-ÿ]/.test(s);
    const upperRatio=letters.length?upper.length/letters.length:0;
    if(known.test(s) && (!hasLower || upperRatio>.82)) return true;
    if(letters.length>=5 && upperRatio>.82 && !hasLower) return true;
    return false;
  }
  function verticalNormalizeSubjectName(line=""){
    let s=String(line||"").trim()
      .replace(/^BLOCO\s+[IVXLCDM\d]+\s*/i,"")
      .replace(/^[\s•\-–—]*\d+[\.)º°-]?\s*/,"")
      .replace(/:$/g,"")
      .trim();
    s=s.replace(/\s{2,}/g," ");
    if(!s) return "Disciplina";
    return s.split(/\s+-\s+|\s+—\s+/)[0].trim() || s;
  }
  function verticalTopicItemsFromText(text=""){
    const raw=String(text||"").replace(/\s+/g," ").trim();
    if(!raw) return [];
    const parts=[];
    const re=/(^|\s)(\d+(?:\.\d+)*)(?:[\.)])?\s+(?=[A-ZÀ-Ü0-9])/g;
    let matches=[], m;
    while((m=re.exec(raw))!==null){
      const start=m.index + (m[1]?m[1].length:0);
      matches.push({start, code:m[2], textStart:re.lastIndex});
    }
    if(!matches.length){
      return raw.split(/\s*;\s*/g).map(x=>x.trim()).filter(x=>x.length>2).map(title=>({title,code:"",level:1}));
    }
    matches.forEach((hit,i)=>{
      const end=i+1<matches.length?matches[i+1].start:raw.length;
      const title=raw.slice(hit.textStart,end).trim().replace(/\s*;\s*$/g,"");
      if(title.length>1) parts.push({title,code:hit.code,level:hit.code.includes(".")?Math.min(4,hit.code.split(".").length):1});
    });
    return parts;
  }
  function verticalSplitTopicText(text=""){
    return verticalTopicItemsFromText(text).map(x=>x.title);
  }
  function parseVerticalizedText(raw=""){
    const original=String(raw||"").replace(/\r/g,"\n");
    const physical=original.split("\n").map(x=>x.replace(/\t/g," ").trim()).filter(Boolean);
    const lines=[];
    physical.forEach(line=>{
      let s=line.replace(/\s{2,}/g," ").trim();
      if(!s) return;
      if(/^\d{1,3}$/.test(s)) return; // remove numeração de página de edital/PDF
      if(/^BLOCO\s+[IVXLCDM\d]+$/i.test(s)){ return; }
      if(lines.length && !verticalLooksLikeHeading(s) && !/^\d+(?:\.\d+)*[\.)]?\s+/.test(s)){
        const last=lines[lines.length-1];
        const dangling=/(?:^|\s)\d+(?:\.\d+)*\.?$/.test(last) || /\b(de|do|da|dos|das|e|entre|com|para|por|em|no|na|nos|nas|da|das|ao|aos)\.?$/i.test(last);
        if((!verticalLooksLikeHeading(last) || /^([^:]{3,120}):\s+/.test(last)) && !/^BLOCO\s+/i.test(last) && (!/[.;:]$/.test(last) || dangling)){
          lines[lines.length-1]=`${last} ${s}`.replace(/\s{2,}/g," ");
          return;
        }
      }
      lines.push(s);
    });
    const subjects=[];
    let current=null;
    let detectedTitle="";
    let lastTopic=null;
    const ensureSubject=(name)=>{
      const clean=verticalNormalizeSubjectName(name);
      if(!clean || /^BLOCO\s+/i.test(clean)) return current;
      const key=verticalSlug(clean);
      current=subjects.find(s=>verticalSlug(s.name)===key);
      if(!current){ current={name:clean,weight:2,source:"Texto importado",topics:[]}; subjects.push(current); }
      lastTopic=null;
      return current;
    };
    const addTopic=(item, opts={})=>{
      if(!current) current=ensureSubject("Conteúdo Geral");
      const rawTitle=typeof item==="object"?item.title:item;
      const code=String((typeof item==="object"?item.code:opts.code)||"").trim();
      const level=Math.max(1,Math.min(4,n((typeof item==="object"?item.level:opts.level)||1,1)));
      const clean=verticalCleanImportLine(rawTitle);
      if(!clean || clean.length<2) return;
      if(/^(VIG[ÊE]NCIA|MENSAGEM DE VETO|DECRETA:?|O PRESIDENTE|DISPOSI[ÇC][ÕO]ES FINAIS|BLOCO\s+[IVXLCDM\d]+)$/i.test(clean)) return;
      const existing=current.topics.find(t=>verticalSlug(`${t.code||""}-${t.title}`)===verticalSlug(`${code||""}-${clean}`) || (!code && verticalSlug(t.title)===verticalSlug(clean)));
      if(existing) return;
      const t=normVerticalTopic({
        id:`vx-topic-${verticalSlug(current.name)}-${verticalSlug(code?`${code}-${clean}`:clean)}-${current.topics.length}`,
        code,
        level,
        title:clean,
        difficulty:opts.difficulty||"Média",
        minutes:verticalEstimateMinutes(2,clean),
        source:"Texto importado",
        fromImported:true
      },current.name,current.topics.length);
      current.topics.push(t);
      lastTopic=t;
    };

    lines.forEach((line,idx)=>{
      let s=line.replace(/\s{2,}/g," ").trim();
      if(!s || /^\d{1,3}$/.test(s) || /^BLOCO\s+[IVXLCDM\d]+$/i.test(s)) return;
      if(idx===0 && lines.length>1 && !verticalLooksLikeHeading(s) && !/^\d+(?:\.\d+)*[\.)]?\s+/.test(s) && s.length<90){ detectedTitle=s; return; }

      const colon=s.match(/^([^:]{3,120}):\s*(.+)$/);
      if(colon && verticalLooksLikeHeading(colon[1])){
        ensureSubject(colon[1]);
        verticalTopicItemsFromText(colon[2]).forEach(addTopic);
        return;
      }
      if(verticalLooksLikeHeading(s)){
        ensureSubject(s);
        return;
      }
      if(!current && /^[A-ZÀ-Ü][A-Za-zÀ-ÿ0-9\s\-/()]{3,95}$/.test(s) && !/[.;]$/.test(s)){
        ensureSubject(s);
        return;
      }
      const numbered=/^\s*\d+(?:\.\d+)*[\.)]?\s+/.test(line);
      if(!numbered && lastTopic && s.length<180 && /^[a-zà-ÿ,;()]/.test(s)){
        lastTopic.title=`${lastTopic.title} ${s}`.replace(/\s{2,}/g," ").trim();
        return;
      }
      verticalTopicItemsFromText(s).forEach(addTopic);
    });
    const foreign=subjects.find(s=>/L[ÍI]NGUA\s+ESTRANGEIRA/i.test(s.name||""));
    if(foreign){
      for(let i=subjects.length-1;i>=0;i--){
        const s=subjects[i];
        if(s===foreign) continue;
        if(/^(ESPANHOL[A]?|INGL[ÊE]S|L[ÍI]NGUA\s+ESPANHOL[A]?|L[ÍI]NGUA\s+INGLESA)$/i.test(String(s.name||"").trim())){
          const prefix=/ESPANHOL/i.test(s.name)?"Língua Espanhola":"Língua Inglesa";
          (s.topics||[]).forEach(t=>foreign.topics.push({...t,title:`${prefix}: ${t.title}`}));
          subjects.splice(i,1);
        }
      }
    }
    const normalized=subjects
      .map((s,i)=>normVerticalSubject({...s,id:`vx-sub-${verticalSlug(s.name)}`,topics:s.topics},i))
      .filter(s=>s.topics.length || s.name);
    return {title:detectedTitle, subjects:normalized};
  }
  function verticalSubjectsToBaseSubjects(vSubjects=[]){
    return (vSubjects||[]).map(s=>({
      id: uid(),
      name: s.name,
      weight: Math.max(1,n(s.weight,2)),
      topics: (s.topics||[]).map(t=>`${t.code?`${t.code} `:""}${t.title}`.trim()).join("; ")
    }));
  }
  function verticalUpdateBaseFromSubjects(vSubjects=[], mode="replace"){
    if(!Array.isArray(vSubjects) || !vSubjects.length) return;
    const incoming=verticalSubjectsToBaseSubjects(vSubjects);
    if(mode==="merge"){
      const by= new Map(subjects().map(s=>[verticalSlug(s.name),{...s}]));
      incoming.forEach(s=>{
        const key=verticalSlug(s.name);
        if(!by.has(key)) by.set(key,s);
        else{
          const old=by.get(key);
          const oldTopics=splitVerticalTopics(old.topics).map(x=>x.trim()).filter(Boolean);
          const newTopics=splitVerticalTopics(s.topics).map(x=>x.trim()).filter(Boolean);
          old.topics=[...new Set([...oldTopics,...newTopics])].join("; ");
          old.weight=Math.max(n(old.weight,1),n(s.weight,1));
        }
      });
      state.edital.subjects=[...by.values()].map(normSubject);
    }else{
      state.edital.subjects=incoming.map(normSubject);
    }
  }
  function verticalApplyImportedText(raw, mode="replace", title="", updateBase=true){
    const parsed=parseVerticalizedText(raw);
    if(!parsed.subjects.length || !parsed.subjects.some(s=>(s.topics||[]).length)){
      toast("Não identifiquei disciplinas/tópicos no texto. Separe por linhas, com a disciplina acima dos assuntos.");
      return 0;
    }
    const v=verticalState();
    if(mode==="merge") v.subjects=verticalMergeSubjects(v.subjects,parsed.subjects);
    else{
      const newSubjects=verticalMergeSubjects([],parsed.subjects);
      verticalPreserveProgressForSubjects(newSubjects);
      v.subjects=newSubjects;
      v.collapsed={};
    }
    if(updateBase) verticalUpdateBaseFromSubjects(parsed.subjects,mode);
    const cleanTitle=String(title||parsed.title||v.title||verticalActiveEdital()?.name||weeklyPlan().concurso||"Edital verticalizado").trim();
    v.title=cleanTitle.includes("Verticalizado")?cleanTitle:`${cleanTitle} — Verticalizado`;
    v.createdAt=v.createdAt||new Date().toISOString();
    v.updatedAt=new Date().toISOString();
    v.lastSourceSignature=verticalSourceSignature();
    xp(6,"edital verticalizado importado por texto");
    save();
    return parsed.subjects.reduce((s,x)=>s+(x.topics?.length||0),0);
  }
  function verticalRenderImportPreview(raw=""){
    const box=$("#verticalized-import-preview-box"); if(!box) return;
    const parsed=parseVerticalizedText(raw);
    const topics=parsed.subjects.reduce((s,x)=>s+(x.topics?.length||0),0);
    box.hidden=false;
    box.innerHTML=`<strong>Prévia da importação</strong><span>${parsed.subjects.length} disciplina(s) • ${topics} tópico(s)</span>${parsed.subjects.slice(0,8).map(s=>`<p><b>${esc(s.name)}</b> — ${(s.topics||[]).length} tópico(s)</p>`).join("")}${parsed.subjects.length>8?`<small>+ ${parsed.subjects.length-8} disciplina(s)</small>`:""}`;
  }
  function verticalExportAsText(){
    const v=verticalState();
    const lines=[];
    lines.push(v.title||"Edital Verticalizado Setor X");
    lines.push("");
    (v.subjects||[]).map(normVerticalSubject).forEach(sub=>{
      lines.push(String(sub.name||"").toUpperCase());
      (sub.topics||[]).forEach((t,i)=>{
        const ok=v.completions[t.id]?"[x]":"[ ]";
        lines.push(`${ok} ${t.code||`${i+1}.`} ${t.title}`.replace(/\s+/g," "));
      });
      lines.push("");
    });
    const text=lines.join("\n").trim()+"\n";
    if(navigator.clipboard?.writeText){ navigator.clipboard.writeText(text).then(()=>toast("Edital verticalizado copiado em texto.")); }
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));
    a.download=`setorx-edital-verticalizado-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),600);
  }

  function normVerticalTemplate(t={}, index=0){
    const title=String(t.title||t.name||t.edital||`Padrão ${index+1}`).trim() || `Padrão ${index+1}`;
    const subjects=Array.isArray(t.subjects)?t.subjects.map(normVerticalSubject):[];
    const id=t.id || `vx-template-${verticalSlug(title)}-${simpleHash(JSON.stringify(subjects)).slice(0,8)}`;
    return {
      id,
      title,
      contest:String(t.contest||t.concurso||state.edital?.name||title||"").trim(),
      board:String(t.board||t.banca||state.edital?.board||"").trim(),
      type:String(t.type||state.edital?.type||"Certo/Errado").trim(),
      source:String(t.source||"Modo desenvolvedor").trim(),
      createdAt:t.createdAt||new Date().toISOString(),
      updatedAt:t.updatedAt||new Date().toISOString(),
      subjects
    };
  }
  function verticalDevState(){
    const raw=state.verticalizedDev && typeof state.verticalizedDev==="object" ? state.verticalizedDev : {};
    state.verticalizedDev={
      enabled:!!raw.enabled,
      activeTemplateId:raw.activeTemplateId||"",
      templates:Array.isArray(raw.templates)?raw.templates.map(normVerticalTemplate):[]
    };
    return state.verticalizedDev;
  }
  function verticalPreserveProgressForSubjects(newSubjects=[]){
    const v=verticalState();
    const oldDone=new Map();
    const oldNotes=new Map();
    (v.subjects||[]).forEach(s=>(s.topics||[]).forEach(t=>{
      const key=verticalTopicKey(s.name,t.title);
      if(v.completions[t.id]) oldDone.set(key,true);
      if(v.notes[t.id]) oldNotes.set(key,v.notes[t.id]);
    }));
    const completions={};
    const notes={};
    newSubjects.forEach(s=>(s.topics||[]).forEach(t=>{
      const key=verticalTopicKey(s.name,t.title);
      if(oldDone.get(key)) completions[t.id]=true;
      if(oldNotes.get(key)) notes[t.id]=oldNotes.get(key);
    }));
    v.completions=completions;
    v.notes=notes;
  }
  function verticalRebuildFromSources(includePlanning=false){
    const v=verticalState();
    const incoming=[...verticalFromBase(), ...(includePlanning?verticalFromPlanning():[])];
    if(!incoming.length){ toast("O edital escolhido não tem disciplinas na Base-mãe."); return 0; }
    const newSubjects=verticalMergeSubjects([], incoming);
    verticalPreserveProgressForSubjects(newSubjects);
    v.subjects=newSubjects;
    v.selectedContest=verticalActiveKey();
    v.title=v.title || `${verticalActiveEdital()?.name||"Edital"} — Verticalizado`;
    v.createdAt=v.createdAt||new Date().toISOString();
    v.updatedAt=new Date().toISOString();
    v.lastSourceSignature=verticalSourceSignature();
    xp(5,includePlanning?"edital escolhido recriado pela Base-mãe + Planejamento":"edital escolhido recriado pela Base-mãe");
    save();
    return newSubjects.reduce((sum,s)=>sum+(s.topics?.length||0),0);
  }
  function verticalTemplateFromCurrent(){
    const v=verticalState();
    const subjectsSrc=(v.subjects&&v.subjects.length)?v.subjects:verticalFromBase();
    return normVerticalTemplate({
      title:v.title || state.edital?.name || "Edital Setor X",
      contest:state.edital?.name||"",
      board:state.edital?.board||"",
      type:state.edital?.type||"Certo/Errado",
      source:"Gerado no modo desenvolvedor",
      subjects:subjectsSrc
    });
  }
  function verticalSaveTemplateFromCurrent(){
    const dev=verticalDevState();
    const current=verticalTemplateFromCurrent();
    const name=prompt("Nome do padrão oficial que será salvo:", current.title.replace(/\s+—\s+Verticalizado$/,""));
    if(!name) return;
    current.title=name.trim();
    current.id=`vx-template-${verticalSlug(current.title)}-${simpleHash(JSON.stringify(current.subjects)).slice(0,8)}`;
    current.updatedAt=new Date().toISOString();
    const idx=dev.templates.findIndex(t=>t.id===current.id || norm(t.title)===norm(current.title));
    if(idx>=0) dev.templates[idx]={...dev.templates[idx],...current,updatedAt:new Date().toISOString()};
    else dev.templates.push(current);
    dev.activeTemplateId=current.id;
    xp(4,"padrão de edital salvo");
    save();
  }
  function verticalTemplateToBaseSubjects(tpl){
    return (tpl.subjects||[]).map(s=>({
      id:uid(),
      name:s.name,
      weight:Math.max(1,n(s.weight,1)),
      topics:(s.topics||[]).map(t=>t.title).join("; ")
    }));
  }
  function verticalApplyTemplate(target="verticalized"){
    const dev=verticalDevState();
    const tpl=dev.templates.find(t=>t.id===dev.activeTemplateId) || dev.templates[0];
    if(!tpl){ toast("Nenhum padrão salvo para aplicar."); return; }
    if(target==="base"){
      if(!confirm(`Aplicar "${tpl.title}" na Base-mãe? Isso substituirá as disciplinas atuais do edital.`)) return;
      state.edital.name=tpl.contest||tpl.title||state.edital.name;
      state.edital.board=tpl.board||state.edital.board;
      state.edital.type=tpl.type||state.edital.type;
      state.edital.subjects=verticalTemplateToBaseSubjects(tpl);
      verticalRebuildFromSources(false);
      toast("Padrão aplicado na Base-mãe e sincronizado no Verticalizado.");
      return;
    }
    const v=verticalState();
    const newSubjects=(tpl.subjects||[]).map(normVerticalSubject);
    verticalPreserveProgressForSubjects(newSubjects);
    v.subjects=newSubjects;
    v.title=tpl.title.includes("Verticalizado")?tpl.title:`${tpl.title} — Verticalizado`;
    v.createdAt=v.createdAt||new Date().toISOString();
    v.updatedAt=new Date().toISOString();
    v.lastSourceSignature=verticalSourceSignature();
    xp(4,"padrão aplicado no edital verticalizado");
    save();
  }
  function verticalDeleteTemplate(){
    const dev=verticalDevState();
    if(!dev.activeTemplateId){ toast("Selecione um padrão para excluir."); return; }
    const tpl=dev.templates.find(t=>t.id===dev.activeTemplateId);
    if(!tpl) return;
    if(!confirm(`Excluir o padrão "${tpl.title}" desta máquina?`)) return;
    dev.templates=dev.templates.filter(t=>t.id!==dev.activeTemplateId);
    dev.activeTemplateId=dev.templates[0]?.id||"";
    save();
    toast("Padrão excluído.");
  }
  function verticalDevDownload(name, data, mime="application/json;charset=utf-8"){
    const blob=new Blob([typeof data==="string"?data:JSON.stringify(data,null,2)],{type:mime});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),700);
  }
  function verticalExportDevPackage(){
    const dev=verticalDevState();
    const current=verticalTemplateFromCurrent();
    const templates=verticalMergeTemplates([current, ...dev.templates]);
    const payload={
      type:"setorx-edital-verticalizado-devpack",
      version:"17.0",
      creator:"Matheus G.",
      exportedAt:new Date().toISOString(),
      instructions:"Envie este JSON ao ChatGPT para embutir estes editais-padrão na versão final do Setor X. A estrutura foi gerada pelo modo desenvolvedor e é baseada na Base-mãe/Verticalizado.",
      baseMae:{
        edital:{
          name:state.edital?.name||"",
          board:state.edital?.board||"",
          type:state.edital?.type||"",
          date:state.edital?.date||"",
          objectiveWeight:state.edital?.objectiveWeight||""
        },
        subjects:subjects()
      },
      currentVerticalized:{
        title:verticalState().title||"",
        subjects:(verticalState().subjects||[]).map(normVerticalSubject)
      },
      stats:{
        templates:templates.length,
        subjects:templates.reduce((s,t)=>s+(t.subjects?.length||0),0),
        topics:templates.reduce((s,t)=>s+(t.subjects||[]).reduce((a,x)=>a+(x.topics?.length||0),0),0)
      },
      templates
    };
    const stamp=new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    verticalDevDownload(`setorx-editais-verticalizados-devpack-${stamp}.json`,payload);
    toast(`Pacote exportado: ${payload.stats.templates} padrão(ões).`);
  }
  function verticalMergeTemplates(list=[]){
    const map=new Map();
    list.map(normVerticalTemplate).forEach(t=>{
      const key=norm(t.title)||t.id;
      const old=map.get(key);
      if(!old || (t.subjects||[]).reduce((s,x)=>s+(x.topics?.length||0),0) >= (old.subjects||[]).reduce((s,x)=>s+(x.topics?.length||0),0)){
        map.set(key,t);
      }
    });
    return [...map.values()].sort((a,b)=>String(a.title).localeCompare(String(b.title),"pt-BR"));
  }
  function verticalImportDevPackage(raw){
    let data;
    try{ data=typeof raw==="string"?JSON.parse(raw):raw; }catch{ toast("JSON inválido."); return 0; }
    let incoming=[];
    if(Array.isArray(data)) incoming=data;
    else if(Array.isArray(data.templates)) incoming=data.templates;
    else if(Array.isArray(data.subjects)) incoming=[data];
    else if(data.currentVerticalized?.subjects) incoming=[{title:data.currentVerticalized.title||"Padrão importado",subjects:data.currentVerticalized.subjects}];
    if(!incoming.length){ toast("Não encontrei templates ou subjects no JSON."); return 0; }
    const dev=verticalDevState();
    dev.templates=verticalMergeTemplates([...dev.templates, ...incoming]);
    dev.activeTemplateId=dev.templates[0]?.id||"";
    save();
    toast(`${incoming.length} padrão(ões) adicionados ao modo desenvolvedor.`);
    return incoming.length;
  }
  function verticalDevSummaryText(){
    const dev=verticalDevState();
    const lines=[];
    lines.push("SETOR X — RESUMO DOS EDITAIS VERTICALIZADOS");
    lines.push("");
    lines.push(`Base-mãe atual: ${state.edital?.name||"Sem nome"} • ${state.edital?.board||"Sem banca"}`);
    lines.push(`Disciplinas na Base-mãe: ${subjects().length}`);
    lines.push(`Padrões salvos: ${dev.templates.length}`);
    lines.push("");
    dev.templates.forEach((t,i)=>{
      const topics=(t.subjects||[]).reduce((s,x)=>s+(x.topics?.length||0),0);
      lines.push(`${i+1}. ${t.title} — ${t.subjects.length} disciplina(s), ${topics} tópico(s)`);
    });
    return lines.join("\n");
  }
  function renderVerticalizedDev(){
    const panel=$("#verticalized-dev-panel"); if(!panel) return;
    const dev=verticalDevState();
    panel.hidden=!dev.enabled;
    const templates=dev.templates;
    const select=$("#verticalized-dev-template-select");
    if(select){
      select.innerHTML=templates.length
        ? templates.map(t=>`<option value="${esc(t.id)}">${esc(t.title)}</option>`).join("")
        : `<option value="">Nenhum padrão salvo</option>`;
      select.value=dev.activeTemplateId || templates[0]?.id || "";
    }
    const summary=$("#verticalized-dev-summary");
    if(summary){
      const topics=templates.reduce((s,t)=>s+(t.subjects||[]).reduce((a,x)=>a+(x.topics?.length||0),0),0);
      summary.textContent=templates.length?`${templates.length} padrão(ões) • ${topics} tópico(s) prontos para exportar`:"Nenhum padrão salvo. Recrie pela Base-mãe e salve como padrão.";
    }
    const list=$("#verticalized-dev-template-list");
    if(list){
      list.innerHTML=templates.length?templates.map(t=>{
        const topics=(t.subjects||[]).reduce((s,x)=>s+(x.topics?.length||0),0);
        const active=t.id===(dev.activeTemplateId||templates[0]?.id);
        return `<button class="verticalized-dev-template ${active?"active":""}" type="button" data-template-id="${esc(t.id)}">
          <strong>${esc(t.title)}</strong>
          <span>${esc(t.board||"Banca não informada")} • ${t.subjects.length} disciplina(s) • ${topics} tópico(s)</span>
          <small>${esc(t.source||"Modo desenvolvedor")} • ${t.updatedAt?new Date(t.updatedAt).toLocaleString("pt-BR"):"sem data"}</small>
        </button>`;
      }).join(""):`<div class="verticalized-dev-empty"><i class="fa-solid fa-box-open"></i><strong>Nenhum padrão criado</strong><span>Use “Recriar pela Base-mãe” e depois “Salvar como padrão”.</span></div>`;
    }
  }


  function safeModule(name, fn){
    try{
      if(typeof fn === "function") return fn();
      console.warn(`[Setor X] Módulo ausente: ${name}`);
      return null;
    }
    catch(e){
      console.error(`[Setor X] Módulo travou: ${name}`, e);
      const warn=$("#setorx-runtime-warning");
      if(warn){
        warn.hidden=false;
        warn.innerHTML=`<strong>Hotfix ativo:</strong> o módulo <b>${esc(name)}</b> teve uma falha isolada, mas o restante da plataforma continua funcionando.`;
      }
      return null;
    }
  }
  function callByName(label, name){
    safeModule(label, () => {
      const fn = (typeof window !== "undefined" && typeof window[name] === "function") ? window[name] : null;
      if(fn) return fn();
      try{ return eval(`typeof ${name} === "function" ? ${name}() : null`); }
      catch(e){ console.warn(`[Setor X] Função não encontrada: ${name}`); return null; }
    });
  }
  function renderAll(){
    safeModule("shell",()=>{ const shell=$("#app-shell"); if(shell) shell.classList.toggle("sidebar-collapsed",!!state.ui.sidebarCollapsed); });
    const modules = [
      ["listas de disciplinas","populateSubjects"],
      ["dashboard/data da prova","renderDashboard"],
      ["alertas","renderOperationalAlerts"],
      ["revisões","renderReviewCenter"],
      ["base-mãe","renderEdital"],
      ["prompts","renderPromptLibrary"],
      ["cursos/guias","renderCourses"],
      ["concurso-alvo","renderContestTarget"],
      ["meta de questões","renderQuestionGoal"],
      ["questões","renderQuestions"],
      ["simulados","renderSimulados"],
      ["foco tático","renderTimer"],
      ["TAF","renderTAF"],
      ["vade mecum","renderLaws"],
      ["calendário","renderCalendar"],
      ["planejamento","renderWeeklyPlanner"],
      ["patentes","renderRanks"],
      ["medalhas","renderMedals"],
      ["música foco","initFocusMusic"],
      ["resumos","renderSummaries"],
      ["links resumos","renderSummaryLinks"],
      ["vídeos resumos","renderSummaryVideos"],
      ["sumário resumos","renderSummaryToc"],
      ["revisão resumo atual","renderCurrentSummaryReview"]
    ];
    modules.forEach(([label,name])=>callByName(label,name));
  }

  function bindCriticalFallbacks(){
    // Fallback de navegação das guias laterais: mantém a plataforma navegável mesmo se outro script falhar.
    const workspaceMap = {
      command:["dashboard","cursos"],
      planning:["planejamento-semanal","calendario","edital","meta-questoes"],
      focus:["pomodoro"],
      questions:["questoes"],
      summaries:["resumos"],
      vade:["vade-mecum"],
      lawdry:["lei-seca-pro"],
      highlights:["biblioteca-grifos"],
      revisionsPro:["central-revisao-pro"],
      statsPro:["estatisticas-pro"],
      simulations:["simulados"],
      performance:["taf"],
      prompts:["prompts-ia"],
      system:["patentes","licenca","backup"]
    };
    function workspaceFromHash(){
      const id=(location.hash||"#dashboard").replace("#","");
      return Object.keys(workspaceMap).find(k=>workspaceMap[k].includes(id)) || "command";
    }
    function applyFallbackWorkspace(){
      const key=workspaceFromHash();
      if(document.body.classList.contains("workspace-active")) return;
      document.body.classList.add("workspace-active");
      $$("main.content > section").forEach(sec=>{
        const visible=(workspaceMap[key]||workspaceMap.command).includes(sec.id);
        sec.classList.toggle("workspace-visible", visible);
        sec.classList.toggle("workspace-hidden", !visible);
      });
      $$(".sidebar-nav .nav-link").forEach(a=>{
        const aKey=a.dataset.workspaceNav||"command";
        a.classList.toggle("active", aKey===key);
      });
    }
    document.addEventListener("click",e=>{
      const nav=e.target.closest(".sidebar-nav .nav-link");
      if(nav){ setTimeout(applyFallbackWorkspace,0); }
    },true);
    window.addEventListener("hashchange",applyFallbackWorkspace);
    const repairBtn=$("#setorx-repair-runtime"); if(repairBtn && !repairBtn.dataset.sxFallback){ repairBtn.dataset.sxFallback="1"; repairBtn.onclick=()=>{ try{ bindCriticalFallbacks(); renderAll(); toast("Interface reparada/recarregada."); }catch(e){ console.error(e); } }; }

    // Fallback do edital/data: se o submit original não funcionar, este salva.
    const editalForm=$("#edital-form");
    if(editalForm && !editalForm.dataset.sxFallback){
      editalForm.dataset.sxFallback="1";
      editalForm.addEventListener("submit",e=>{
        if(e.defaultPrevented) return;
        e.preventDefault();
        const payload={
          name:$("#edital-name")?.value.trim()||"Concurso personalizado",
          board:$("#edital-board")?.value.trim()||"",
          date:$("#edital-date")?.value||"",
          type:$("#edital-type")?.value||"Certo/Errado",
          objectiveWeight:n($("#edital-objective-weight")?.value,120),
          notes:$("#edital-notes")?.value.trim()||""
        };
        state.edital={...state.edital,...payload};
        save();
        toast("Edital salvo.");
      });
    }

    // Fallback rápido de guias/cursos.
    const openGuide=$("#open-guide-modal");
    if(openGuide && !openGuide.dataset.sxFallback){
      openGuide.dataset.sxFallback="1";
      openGuide.addEventListener("click",()=>{ try{ openGuideModal(); }catch(e){ console.error(e); toast("Não consegui abrir o modal de guia."); } });
    }
  }

  function bind(){

    
    const verticalDevToggle=$("#verticalized-dev-toggle"); if(verticalDevToggle) verticalDevToggle.onclick=()=>{ const dev=verticalDevState(); dev.enabled=!dev.enabled; save(); };
    const verticalDevClose=$("#verticalized-dev-close"); if(verticalDevClose) verticalDevClose.onclick=()=>{ const dev=verticalDevState(); dev.enabled=false; save(); };
    const verticalDevRebuildBase=$("#verticalized-dev-rebuild-base"); if(verticalDevRebuildBase) verticalDevRebuildBase.onclick=()=>verticalRebuildFromSources(false);
    const verticalDevRebuildAll=$("#verticalized-dev-rebuild-all"); if(verticalDevRebuildAll) verticalDevRebuildAll.onclick=()=>verticalRebuildFromSources(true);
    const verticalDevSaveTemplate=$("#verticalized-dev-save-template"); if(verticalDevSaveTemplate) verticalDevSaveTemplate.onclick=verticalSaveTemplateFromCurrent;
    const verticalDevExportPackage=$("#verticalized-dev-export-package"); if(verticalDevExportPackage) verticalDevExportPackage.onclick=verticalExportDevPackage;
    const verticalDevImportFileBtn=$("#verticalized-dev-import-file-btn"); if(verticalDevImportFileBtn) verticalDevImportFileBtn.onclick=()=>$("#verticalized-dev-import-file")?.click();
    const verticalDevImportFile=$("#verticalized-dev-import-file"); if(verticalDevImportFile) verticalDevImportFile.onchange=async e=>{ const file=e.target.files?.[0]; if(!file) return; try{ verticalImportDevPackage(await file.text()); }catch{ toast("Erro ao ler arquivo JSON."); } e.target.value=""; };
    const verticalDevImportTextBtn=$("#verticalized-dev-import-text-btn"); if(verticalDevImportTextBtn) verticalDevImportTextBtn.onclick=()=>{ const p=$("#verticalized-dev-import-text-panel"); if(p) p.hidden=false; };
    const verticalDevImportJsonClose=$("#verticalized-dev-import-json-close"); if(verticalDevImportJsonClose) verticalDevImportJsonClose.onclick=()=>{ const p=$("#verticalized-dev-import-text-panel"); if(p) p.hidden=true; };
    const verticalDevImportJsonApply=$("#verticalized-dev-import-json-apply"); if(verticalDevImportJsonApply) verticalDevImportJsonApply.onclick=()=>{ const count=verticalImportDevPackage($("#verticalized-dev-import-json")?.value||""); if(count){ const p=$("#verticalized-dev-import-text-panel"); if(p) p.hidden=true; const ta=$("#verticalized-dev-import-json"); if(ta) ta.value=""; } };
    const verticalDevTemplateSelect=$("#verticalized-dev-template-select"); if(verticalDevTemplateSelect) verticalDevTemplateSelect.onchange=()=>{ const dev=verticalDevState(); dev.activeTemplateId=verticalDevTemplateSelect.value; save(); };
    const verticalDevApplyVertical=$("#verticalized-dev-apply-vertical"); if(verticalDevApplyVertical) verticalDevApplyVertical.onclick=()=>verticalApplyTemplate("verticalized");
    const verticalDevApplyBase=$("#verticalized-dev-apply-base"); if(verticalDevApplyBase) verticalDevApplyBase.onclick=()=>verticalApplyTemplate("base");
    const verticalDevDeleteTemplate=$("#verticalized-dev-delete-template"); if(verticalDevDeleteTemplate) verticalDevDeleteTemplate.onclick=verticalDeleteTemplate;
    const verticalDevCopySummary=$("#verticalized-dev-copy-summary"); if(verticalDevCopySummary) verticalDevCopySummary.onclick=()=>{ const txt=verticalDevSummaryText(); if(navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(()=>toast("Resumo dos padrões copiado.")); else toast(txt); };
    const verticalDevList=$("#verticalized-dev-template-list"); if(verticalDevList) verticalDevList.onclick=e=>{ const btn=e.target.closest("[data-template-id]"); if(!btn) return; const dev=verticalDevState(); dev.activeTemplateId=btn.dataset.templateId; save(); };

    const verticalContestSelect=$("#verticalized-contest-select"); if(verticalContestSelect) verticalContestSelect.onchange=()=>{ verticalSetActiveContest(verticalContestSelect.value); verticalSync("base",true); save(); toast("Edital verticalizado alterado para o edital escolhido."); };
    const verticalTitle=$("#verticalized-title"); if(verticalTitle) verticalTitle.onchange=()=>{ const v=verticalState(); v.title=verticalTitle.value.trim(); v.updatedAt=new Date().toISOString(); save(); };
    const verticalAuto=$("#verticalized-autosync"); if(verticalAuto) verticalAuto.onchange=()=>{ const v=verticalState(); v.autoSync=verticalAuto.checked; if(v.autoSync) verticalSync("base",true); save(); toast(v.autoSync?"Sincronização automática ativada para o edital escolhido.":"Sincronização automática desativada."); };
    const verticalShowDone=$("#verticalized-show-done"); if(verticalShowDone) verticalShowDone.onchange=()=>{ const v=verticalState(); v.showDone=verticalShowDone.checked; save(); };
    const verticalSearch=$("#verticalized-search"); if(verticalSearch) verticalSearch.oninput=renderVerticalized;
    const verticalImportOpen=$("#verticalized-import-open"); if(verticalImportOpen) verticalImportOpen.onclick=()=>{ const p=$("#verticalized-import-panel"); if(p){ p.hidden=false; setTimeout(()=>$("#verticalized-import-title")?.focus(),40); } };
    const verticalImportClose=$("#verticalized-import-close"); if(verticalImportClose) verticalImportClose.onclick=()=>{ const p=$("#verticalized-import-panel"); if(p) p.hidden=true; };
    const verticalImportClear=$("#verticalized-import-clear"); if(verticalImportClear) verticalImportClear.onclick=()=>{ const t=$("#verticalized-import-text"); if(t) t.value=""; const b=$("#verticalized-import-preview-box"); if(b) b.hidden=true; };
    const verticalImportPreview=$("#verticalized-import-preview"); if(verticalImportPreview) verticalImportPreview.onclick=()=>verticalRenderImportPreview($("#verticalized-import-text")?.value||"");
    const verticalImportApply=$("#verticalized-import-apply"); if(verticalImportApply) verticalImportApply.onclick=()=>{ const updateBase=$("#verticalized-import-to-base") ? $("#verticalized-import-to-base").checked : true; const count=verticalApplyImportedText($("#verticalized-import-text")?.value||"", $("#verticalized-import-mode")?.value||"replace", $("#verticalized-import-title")?.value||"", updateBase); if(count){ const p=$("#verticalized-import-panel"); if(p) p.hidden=true; toast(`${count} tópico(s) importado(s) para o Edital Verticalizado.`); } };
    const verticalExportText=$("#verticalized-export-text"); if(verticalExportText) verticalExportText.onclick=verticalExportAsText;
    const verticalSyncAll=$("#verticalized-sync-all"); if(verticalSyncAll) verticalSyncAll.onclick=()=>verticalSync("all");
    const verticalSyncBase=$("#verticalized-sync-base"); if(verticalSyncBase) verticalSyncBase.onclick=()=>verticalSync("base");
    const verticalForceBase=$("#verticalized-force-base"); if(verticalForceBase) verticalForceBase.onclick=()=>{ if(typeof verticalRebuildFromSources==="function"){ verticalRebuildFromSources(false); toast("Edital verticalizado gerado pela Base-mãe."); } else { verticalSync("base"); } };
    const verticalSyncPlan=$("#verticalized-sync-plan"); if(verticalSyncPlan) verticalSyncPlan.onclick=()=>verticalSync("planning");
    const verticalCreate=$("#verticalized-create"); if(verticalCreate) verticalCreate.onclick=()=>{ const name=prompt("Nome da disciplina para iniciar o edital verticalizado:", subjectNames()[0]||"Língua Portuguesa"); if(name) verticalAddManual(name,"", "Média",60); };
    const verticalExpand=$("#verticalized-expand-all"); if(verticalExpand) verticalExpand.onclick=()=>{ const v=verticalState(); v.collapsed={}; save(); };
    const verticalCollapse=$("#verticalized-collapse-all"); if(verticalCollapse) verticalCollapse.onclick=()=>{ const v=verticalState(); (v.subjects||[]).forEach(s=>v.collapsed[s.id]=true); save(); };
    const verticalReset=$("#verticalized-reset-progress"); if(verticalReset) verticalReset.onclick=()=>{ if(!confirm("Zerar progresso do Edital Verticalizado?")) return; const v=verticalState(); v.completions={}; v.updatedAt=new Date().toISOString(); save(); toast("Progresso do edital verticalizado zerado."); };
    $$(".verticalized-tab").forEach(btn=>btn.onclick=()=>{ const v=verticalState(); v.filter=btn.dataset.verticalFilter||"all"; save(); });
    const verticalAddForm=$("#verticalized-add-form"); if(verticalAddForm) verticalAddForm.onsubmit=e=>{ e.preventDefault(); verticalAddManual($("#verticalized-add-subject")?.value, $("#verticalized-add-topic")?.value, $("#verticalized-add-difficulty")?.value||"Média", n($("#verticalized-add-minutes")?.value,60)); e.target.reset(); };
    const verticalEmpty=$("#verticalized-empty"); if(verticalEmpty) verticalEmpty.onclick=e=>{ const btn=e.target.closest("[data-vertical-empty]"); if(!btn) return; if(btn.dataset.verticalEmpty==="sync") verticalSync("all"); else $("#verticalized-create")?.click(); };
    const verticalBoard=$("#verticalized-board"); if(verticalBoard) verticalBoard.onclick=e=>{
      const collapse=e.target.closest("[data-vertical-collapse]");
      if(collapse){ const v=verticalState(); const id=collapse.dataset.verticalCollapse; v.collapsed[id]=!v.collapsed[id]; save(); return; }
      const toggle=e.target.closest("[data-vertical-toggle]");
      if(toggle){ const v=verticalState(); const id=toggle.dataset.verticalToggle; v.completions[id]=!v.completions[id]; if(v.completions[id]) xp(2,"tópico do edital concluído"); v.updatedAt=new Date().toISOString(); save(); return; }
      const focus=e.target.closest("[data-vertical-start-focus]");
      if(focus){ const sub=focus.dataset.verticalFocusSubject||selectedFocusSubject(); state.settings.focusSubject=sub; populateSubjects(); save(false); location.hash="#pomodoro"; startTimer(); toast(`Foco iniciado em ${sub}: ${focus.dataset.verticalStartFocus}`); return; }
      const summary=e.target.closest("[data-vertical-create-summary]");
      if(summary){ location.hash="#resumos"; setTimeout(()=>{ clearSummaryEditor(); const ed=$("#summary-editor"); if(ed) ed.innerHTML=`<h2>${esc(summary.dataset.verticalCreateSummary)}</h2><p><strong>Edital verticalizado:</strong> preencher resumo do assunto.</p><h3>Pontos principais</h3><p></p><h3>Pegadinhas de banca</h3><p></p>`; },80); toast("Modelo de resumo aberto."); return; }
      const review=e.target.closest("[data-vertical-review]");
      if(review){ const v=verticalState(); v.completions[review.dataset.verticalReview]=false; v.updatedAt=new Date().toISOString(); save(); toast("Tópico devolvido para revisão."); return; }
    };
    if(verticalBoard) verticalBoard.addEventListener("change",e=>{ const note=e.target.closest("[data-vertical-note]"); if(!note) return; const v=verticalState(); v.notes[note.dataset.verticalNote]=note.value.trim(); v.updatedAt=new Date().toISOString(); save(false); toast("Anotação do edital salva."); });

    const qxCleanCaptureLinks=$("#qx-clean-capture-links"); if(qxCleanCaptureLinks) qxCleanCaptureLinks.onclick=cleanQxCapturedLinks;
    const qxFixCeCaptures=$("#qx-fix-ce-captures"); if(qxFixCeCaptures) qxFixCeCaptures.onclick=fixQxCapturedCertoErrado;

    const qxImportExtensionBtn=$("#qx-import-extension-btn"); if(qxImportExtensionBtn) qxImportExtensionBtn.onclick=()=>$("#qx-import-extension-file")?.click();
    const qxImportExtensionFile=$("#qx-import-extension-file"); if(qxImportExtensionFile) qxImportExtensionFile.onchange=async e=>{ const file=e.target.files?.[0]; if(!file) return; try{ const data=JSON.parse(await file.text()); const added=importQxExtensionCaptures(data); toast(added?`${added} captura(s) importada(s) para o Banco QX.`:"Nenhuma captura nova importada."); }catch{ toast("Arquivo de capturas inválido."); } e.target.value=""; };


    const weeklyOpenImport=$("#weekly-open-import"); if(weeklyOpenImport) weeklyOpenImport.onclick=()=>{ const p=$("#weekly-import-panel"); if(p) p.hidden=false; };
    const weeklyCloseImport=$("#weekly-close-import"); if(weeklyCloseImport) weeklyCloseImport.onclick=()=>{ const p=$("#weekly-import-panel"); if(p) p.hidden=true; };
    const weeklyLoadTemplate=$("#weekly-load-template"); if(weeklyLoadTemplate) weeklyLoadTemplate.onclick=()=>{ const ta=$("#weekly-markdown-input"); if(ta) ta.value=weeklyTemplate(); };
    const weeklyLoadJsonModel=$("#weekly-load-json-model"); if(weeklyLoadJsonModel) weeklyLoadJsonModel.onclick=()=>{ const ta=$("#weekly-markdown-input"); if(ta) ta.value=weeklyJsonTemplate(); };
    const weeklySelectFile=$("#weekly-select-file"); if(weeklySelectFile) weeklySelectFile.onclick=()=>$("#weekly-file-input")?.click();
    const weeklyFileInput=$("#weekly-file-input"); if(weeklyFileInput) weeklyFileInput.onchange=async e=>{ const file=e.target.files?.[0]; if(!file) return; const raw=await file.text(); const plan=parseWeeklyImported(raw); if(!plan.days.length) return toast("Arquivo sem dias/blocos válidos."); state.weeklyPlan=plan; xp(8,"planejamento semanal importado"); save(); toast("Planejamento importado do arquivo."); e.target.value=""; };
    const weeklyImportMarkdown=$("#weekly-import-markdown"); if(weeklyImportMarkdown) weeklyImportMarkdown.onclick=()=>{ const raw=$("#weekly-markdown-input")?.value||""; const plan=parseWeeklyImported(raw); if(!plan.days.length) return toast("Não encontrei dias/blocos no conteúdo importado."); state.weeklyPlan=plan; xp(8,"planejamento semanal importado"); save(); toast("Planejamento semanal importado."); };
    const weeklyExportJson=$("#weekly-export-json"); if(weeklyExportJson) weeklyExportJson.onclick=weeklyDownloadJson;
    const weeklyClear=$("#weekly-clear-plan"); if(weeklyClear) weeklyClear.onclick=()=>{ if(!confirm("Limpar o planejamento semanal atual?")) return; state.weeklyPlan=emptyWeeklyPlan(); save(); toast("Planejamento limpo."); };
    const weeklyBoard=$("#weekly-board"); if(weeklyBoard) weeklyBoard.onclick=e=>{ 
      const viewBtn=e.target.closest("[data-weekly-view]"); if(viewBtn){ window.__setorXWeeklyView=viewBtn.dataset.weeklyView||"today"; renderWeeklyPlanner(); return; }
      const jumpBtn=e.target.closest("[data-weekly-jump]"); if(jumpBtn){ window.__setorXWeeklyView=`day:${jumpBtn.dataset.weeklyJump}`; renderWeeklyPlanner(); setTimeout(()=>document.querySelector(`[data-day-index="${jumpBtn.dataset.weeklyJump}"]`)?.scrollIntoView({behavior:"smooth",block:"start"}),80); return; }
      const logBtn=e.target.closest("[data-weekly-log]");
      if(logBtn){ openWeeklyLogModal(logBtn.dataset.weeklyLog,n(logBtn.dataset.di),n(logBtn.dataset.bi)); return; }
      const btn=e.target.closest("[data-weekly-check]"); if(!btn) return; const p=weeklyPlan(); const key=btn.dataset.weeklyCheck; p.completions[key]=!p.completions[key]; xp(p.completions[key]?3:0,"bloco semanal concluído"); save(); 
    };



    
    const weeklyLogClose=$("#weekly-log-close"); if(weeklyLogClose) weeklyLogClose.onclick=closeWeeklyLogModal;
    const weeklyLogBackdrop=$("#weekly-log-backdrop"); if(weeklyLogBackdrop) weeklyLogBackdrop.onclick=closeWeeklyLogModal;
    const weeklyLogAuto=$("#weekly-log-auto-complete"); if(weeklyLogAuto) weeklyLogAuto.onclick=()=>{ const key=$("#weekly-log-key")?.value; if(!key) return; const p=weeklyPlan(); p.completions[key]=true; closeWeeklyLogModal(); xp(3,"bloco semanal concluído"); save(); };
    const weeklyLogForm=$("#weekly-log-form"); if(weeklyLogForm) weeklyLogForm.onsubmit=e=>{ e.preventDefault(); const key=$("#weekly-log-key")?.value; if(!key) return; const ref=findWeeklyBlockByKey(key); const done=Math.max(0,n($("#weekly-log-done")?.value)); const correct=Math.max(0,n($("#weekly-log-correct")?.value)); const wrong=Math.max(0,n($("#weekly-log-wrong")?.value)); saveWeeklyBlockLog(key,{done,correct,wrong,note:$("#weekly-log-note")?.value.trim()||""}); const p=weeklyPlan(); if(ref && n(ref.block.meta)>0 && done>=n(ref.block.meta)) p.completions[key]=true; xp(5,"questões do planejamento registradas"); closeWeeklyLogModal(); save(); };

    const openGuide=$("#open-guide-modal"); if(openGuide) openGuide.onclick=()=>openGuideModal();
    const guideClose=$("#guide-modal-close"); if(guideClose) guideClose.onclick=closeGuideModal;
    const guideBackdrop=$("#guide-modal-backdrop"); if(guideBackdrop) guideBackdrop.onclick=closeGuideModal;
    const guideClear=$("#guide-clear"); if(guideClear) guideClear.onclick=()=>openGuideModal();
    const guideForm=$("#guide-form"); if(guideForm) guideForm.onsubmit=e=>{e.preventDefault(); const id=$("#guide-id").value||uid(), title=$("#guide-title").value.trim(), url=$("#guide-url").value.trim(); if(!title||!url) return toast("Informe nome e URL do guia."); const item={id,title,url,category:$("#guide-category").value,icon:$("#guide-icon").value,description:$("#guide-description").value.trim()}; const arr=customGuides(), idx=arr.findIndex(x=>x.id===id); if(idx>=0) arr[idx]=item; else arr.unshift(item); xp(4,"guia adicionado"); closeGuideModal(); save();};
    const coursesGrid=$("#courses-grid"); if(coursesGrid) coursesGrid.onclick=e=>{ const edit=e.target.closest("[data-guide-edit]"), del=e.target.closest("[data-guide-delete]"); if(edit){ const g=customGuides().find(x=>x.id===edit.dataset.guideEdit); if(g) openGuideModal(g); return; } if(del){ if(!confirm("Excluir este guia?")) return; state.customGuides=customGuides().filter(x=>x.id!==del.dataset.guideDelete); save(); toast("Guia excluído."); } };

    const promptSearch=$("#prompt-search"); if(promptSearch) promptSearch.oninput=renderPromptLibrary;
    $$(".prompt-filter").forEach(btn=>btn.onclick=()=>{ activePromptFilter=btn.dataset.promptFilter||"all"; $$(".prompt-filter").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); renderPromptLibrary(); renderCourses(); });
    const promptLib=$("#prompt-library"); if(promptLib) promptLib.onclick=e=>{ const btn=e.target.closest("[data-copy-prompt]"); if(!btn) return; const p=promptLibrary.find(x=>x.id===btn.dataset.copyPrompt); if(p) copyTextToClipboard(p.body); };
    const genPrompt=$("#generate-context-prompt"); if(genPrompt) genPrompt.onclick=buildContextPrompt;
    const copyContextPrompt=$("#copy-context-prompt"); if(copyContextPrompt) copyContextPrompt.onclick=()=>copyTextToClipboard($("#context-prompt-output")?.value||"");

    const contestTarget=$("#contest-target-select");
    if(contestTarget){
      contestTarget.onchange=e=>applyContestPreset(e.target.value);
      contestTarget.addEventListener("input",e=>applyContestPreset(e.target.value));
    }

    $("#sidebar-toggle").onclick=()=>{state.ui.sidebarCollapsed=!state.ui.sidebarCollapsed; save();};
    $("#quick-start").onclick=()=>{location.hash="#pomodoro"; startTimer();};
    $("#local-briefing").onclick=()=>{$("#daily-briefing").textContent=briefings[Math.floor(Math.random()*briefings.length)];};
    $("#edital-form").onsubmit=e=>{
      e.preventDefault();
      const payload={name:$("#edital-name").value.trim()||"Concurso personalizado",board:$("#edital-board").value.trim(),date:$("#edital-date").value,type:$("#edital-type").value,objectiveWeight:n($("#edital-objective-weight").value,120),notes:$("#edital-notes").value.trim()};
      Object.assign(state.edital,payload);
      if(state.edital.targetContest==="custom" || isSavedCustomContest(state.edital.targetContest)){
        const key=isSavedCustomContest(state.edital.targetContest)?state.edital.targetContest:customContestKey(state.edital.name);
        state.edital.targetContest=key;
        state.contestProfiles=state.contestProfiles&&typeof state.contestProfiles==="object"?state.contestProfiles:{};
        state.contestProfiles[key]={custom:true,label:state.edital.name,edital:{...state.edital,subjects:clone(state.edital.subjects||[])},savedAt:new Date().toISOString()};
      }else{
        saveCurrentContestProfile();
      }
      state.verticalizedSelectedContest=state.edital.targetContest||state.verticalizedSelectedContest;
      save(); renderContestTarget(); toast("Edital salvo e concurso personalizado atualizado na lista.");
    };
    $("#subject-form").onsubmit=e=>{e.preventDefault(); const name=$("#subject-name").value.trim(); if(!name) return toast("Informe a disciplina."); if(subjectNames().some(s=>s.toLowerCase()===name.toLowerCase())) return toast("Disciplina já cadastrada."); state.edital.subjects.push({id:uid(),name,weight:Math.max(1,n($("#subject-weight").value,1)),topics:$("#subject-topics").value.trim()}); saveCurrentContestProfile(); e.target.reset(); xp(3,"disciplina cadastrada"); save();};
    $("#subject-grid").onclick=e=>{const btn=e.target.closest("button"), card=e.target.closest(".subject-card"); if(btn?.dataset.action==="delete-subject"&&card){state.edital.subjects=state.edital.subjects.filter(s=>s.id!==card.dataset.id); saveCurrentContestProfile(); save();}};
    $("#question-goal-form").onsubmit=e=>{e.preventDefault(); const target=parsePtInt($("#question-goal-input").value); if(!target) return toast("Digite uma meta válida."); state.questionGoal.target=target; xp(5,"meta definida"); save();};
    $("#question-goal-input").addEventListener("input", e=>{const pos=e.target.selectionStart; e.target.value=fmtInt(parsePtInt(e.target.value));});
    const manualForm=$("#manual-question-form"); if(manualForm) manualForm.onsubmit=e=>{e.preventDefault(); const amount=parsePtInt($("#manual-question-input").value); if(!amount) return toast("Digite quantas questões quer somar."); const mbd=manualByDate(); const t=todayKey(); state.questionGoal.manualDone=Math.max(0, parsePtInt(state.questionGoal.manualDone||0)+amount); mbd[t]=Math.max(0, parsePtInt(mbd[t]||0)+amount); $("#manual-question-input").value=""; xp(Math.min(30,Math.max(3,Math.round(amount/20))),"questões externas registradas"); save();};
    const resetManual=$("#reset-manual-questions"); if(resetManual) resetManual.onclick=()=>{ if(!confirm("Zerar somente as questões manuais da meta? O Banco QX não será alterado.")) return; state.questionGoal.manualDone=0; state.questionGoal.manualByDate={}; save(); toast("Questões manuais zeradas."); };
    $("#open-fast-question").onclick=()=>resetQuestionForm();
    $("#close-question-form").onclick=()=>{$("#question-form").hidden=true;};
    $("#question-type").onchange=()=>renderAlternativesBox();
    $("#question-statement").addEventListener("input",()=>{ const editing=$("#question-form").dataset.editing; const dup=$("#duplicate-warning"); if(!dup) return; const duplicate=isDuplicateQuestion($("#question-statement").value, editing); dup.hidden=!duplicate; dup.textContent=duplicate?"Possível duplicidade detectada: já existe uma questão com enunciado igual ou muito semelhante.":""; });
    $("#question-form").onsubmit=e=>{ e.preventDefault(); const editing=e.target.dataset.editing, old=state.questions.find(q=>q.id===editing), type=$("#question-type").value, statement=$("#question-statement").value.trim(); if(!statement) return toast("Preencha o enunciado da questão."); if(isDuplicateQuestion(statement, editing)) return toast("Questão duplicada bloqueada."); const alts=type==="Múltipla escolha"?Array.from({length:5},(_,i)=>$(`[data-alt="${"ABCDE"[i]}"]`)?.value.trim()||""):[]; if(type==="Múltipla escolha" && alts.filter(Boolean).length<2) return toast("Preencha ao menos duas alternativas."); const q=normQuestion({...(old||{}),id:editing||uid(),date:old?.date||todayKey(),subject:$("#question-subject").value,topic:$("#question-topic").value.trim(),board:$("#question-board").value.trim()||state.edital.board,type,support:$("#question-support").value.trim(),statement,alternatives:alts,answer:$("#question-answer").value.trim(),comment:$("#question-comment").value.trim(),personalComment:$("#question-personal-comment").value.trim(),source:$("#question-source").value.trim(),tags:$("#question-tags-input").value.split(",").map(x=>x.trim()).filter(Boolean),nextReview:old?.nextReview||todayKey()}); if(!q.answer) return toast("Informe o gabarito."); if(old) state.questions[state.questions.findIndex(x=>x.id===old.id)]=q; else state.questions.unshift(q); state.activeQuestionId=q.id; xp(old?5:8,old?"questão atualizada":"questão cadastrada"); $("#question-form").hidden=true; save(); };
    $("#clear-question-form").onclick=resetQuestionForm;
    ["#question-search","#question-filter-subject","#question-filter-topic","#question-filter-board","#question-filter-type","#question-filter-status","#question-filter-due","#question-filter-mode"].forEach(s=>{ const el=$(s); if(el){ el.oninput=renderQuestions; el.onchange=renderQuestions; }});
    $("#qx-filter-errors").onclick=()=>{$("#question-filter-mode").value="wrong"; renderQuestions();}; $("#qx-filter-due").onclick=()=>{$("#question-filter-due").value="due"; renderQuestions();}; $("#qx-clear-filters").onclick=()=>{["#question-search","#question-filter-subject","#question-filter-topic","#question-filter-board","#question-filter-type","#question-filter-status","#question-filter-due","#question-filter-mode"].forEach(s=>{const el=$(s); if(el) el.value=s==="#question-search"?"":"all";}); renderQuestions();};
    $("#question-list").onclick=e=>{const card=e.target.closest(".question-card"), btn=e.target.closest("button"); if(!card?.dataset.id) return; if(btn?.dataset.action==="toggle-favorite"){const q=state.questions.find(x=>x.id===card.dataset.id); if(q) q.favorite=!q.favorite; save(); return;} state.activeQuestionId=card.dataset.id; qxLockPractice(); save();};

    const setQxMode=(mode,due="all")=>{ const m=$("#question-filter-mode"), d=$("#question-filter-due"); if(m) m.value=mode; if(d) d.value=due; state.activeQuestionId=null; qxLockPractice(); save(); location.hash="#questoes"; };
    const showAll=$("#show-all-questions"); if(showAll) showAll.onclick=()=>setQxMode("all","all");
    const showUnanswered=$("#show-unanswered-questions"); if(showUnanswered) showUnanswered.onclick=()=>setQxMode("unanswered","all");
    const showWrong=$("#show-wrong-questions"); if(showWrong) showWrong.onclick=()=>setQxMode("wrong","all");
    const showDue=$("#show-due-questions"); if(showDue) showDue.onclick=()=>setQxMode("all","due");

    $("#answer-area").onclick=e=>{const opt=e.target.closest(".answer-option"); if(!opt) return; state.qxSelectedAnswer=opt.dataset.answer; $$(".answer-option",$("#answer-area")).forEach(o=>{o.classList.remove("selected","qx-answer-correct","qx-answer-wrong","qx-answer-official","qx-answer-neutral","qx-answer-marked"); const badge=o.querySelector(".qx-result-badge"); if(badge) badge.remove();}); opt.classList.add("selected"); const hint=$("#qx-answer-hint"); if(hint) hint.textContent=`Resposta selecionada: ${opt.dataset.answer}`;};
    $("#submit-answer").onclick=()=>answerActive(); $("#prev-question").onclick=()=>moveQuestion(-1); $("#next-question").onclick=()=>moveQuestion(1); $("#shuffle-questions").onclick=shuffleQuestion; $("#back-to-question-list").onclick=()=>$("#question-list")?.scrollIntoView({behavior:"smooth",block:"start"}); $("#favorite-active-question").onclick=toggleFavoriteActive; $("#delete-active-question").onclick=deleteActiveQuestion; $("#edit-active-question").onclick=()=>{const q=getActiveQuestion(); if(q) fillQuestionForm(q);};
    $("#practice-card").onclick=e=>{const tab=e.target.closest(".tab-btn"); if(tab){$$(".tab-btn",$("#practice-card")).forEach(b=>b.classList.remove("active")); $$(".tab-panel",$("#practice-card")).forEach(p=>p.classList.remove("active")); tab.classList.add("active"); $(`#tab-${tab.dataset.tab}`).classList.add("active"); return;} if(e.target.closest("#save-personal-comment")){const q=getActiveQuestion(); if(q){q.personalComment=$("#personal-comment-edit").value.trim(); q.errorReason=$("#error-reason-select").value; const last=q.history?.[q.history.length-1]; if(last) last.errorReason=q.errorReason; save(); toast("Anotação salva.");}}};
    $$(".qx-menu-btn").forEach(btn=>btn.onclick=()=>{$$(".qx-menu-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); const target={questions:"#qx-workbench",index:"#qx-index-panel",stats:"#question-subject-stats",answerkey:"#qx-answerkey-panel"}[btn.dataset.qxView] || "#qx-workbench"; $(target)?.scrollIntoView({behavior:"smooth",block:"start"});});
    $("#simulation-form").onsubmit=e=>{e.preventDefault(); const rows=$$(".sim-subject-row"); const type=$("#simulation-type").value; const subs=rows.map(row=>{const subject=row.dataset.subject,total=n(row.querySelector('[data-field="total"]').value),correct=n(row.querySelector('[data-field="correct"]').value),wrong=n(row.querySelector('[data-field="wrong"]').value),blank=n(row.querySelector('[data-field="blank"]').value),realTotal=total||correct+wrong+blank,score=type==="Certo/Errado"?correct-wrong:correct,percent=realTotal?Math.round((score/realTotal)*100):0; return {subject,total:realTotal,correct,wrong,blank,score,percent};}).filter(x=>x.total||x.correct||x.wrong||x.blank); if(!subs.length) return toast("Preencha ao menos uma disciplina."); const total=subs.reduce((a,b)=>a+b.total,0), correct=subs.reduce((a,b)=>a+b.correct,0), wrong=subs.reduce((a,b)=>a+b.wrong,0), blank=subs.reduce((a,b)=>a+b.blank,0), score=type==="Certo/Errado"?correct-wrong:correct, percent=total?Math.round((score/total)*100):0; state.simulations.unshift({id:uid(),name:$("#simulation-name").value.trim()||`Simulado ${state.simulations.length+1}`,date:$("#simulation-date").value||todayKey(),type,subjects:subs,total,correct,wrong,blank,score,percent}); xp(Math.max(25,Math.round(total/2)),"simulado corrigido"); e.target.reset(); $("#simulation-date").value=todayKey(); save();};
    $("#timer-start").onclick=startTimer; $("#timer-pause").onclick=pauseTimer; $("#timer-reset").onclick=resetTimer; $("#timer-complete").onclick=()=>completeTimer(false);
    const focusSubjectSelect=$("#focus-subject"); if(focusSubjectSelect) focusSubjectSelect.onchange=()=>{ state.settings.focusSubject=focusSubjectSelect.value||"Geral"; save(false); renderTimer(); toast(`Disciplina do foco: ${state.settings.focusSubject}`); };
    if(!window.__setorXTimerSyncBound){
      window.__setorXTimerSyncBound=true;
      document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") tickTimer(); });
      window.addEventListener("focus",tickTimer);
      window.addEventListener("pageshow",tickTimer);
    }
    $("#save-settings").onclick=()=>{state.settings.focusMinutes=clamp(n($("#focus-minutes").value,50),5,120); state.settings.breakMinutes=clamp(n($("#break-minutes").value,10),1,60); state.settings.dailyHours=clamp(n($("#daily-hours").value,6),.5,14); state.settings.dailyQuestionGoal=questionGoalDailyNeeded(); resetTimer(); save(); toast("Configuração salva.");};
    $("#taf-form").onsubmit=e=>{e.preventDefault(); const height=n($("#taf-height").value), age=n($("#taf-age").value), weight=n($("#taf-weight").value), targetWeight=autoTargetWeight(height); if(!height||!weight) return toast("Informe altura e peso."); state.taf.unshift({id:uid(),date:todayKey(),height,age,weight,targetWeight,run:n($("#taf-run").value),pullups:n($("#taf-pullups").value),pushups:n($("#taf-pushups").value),situps:n($("#taf-situps").value)}); xp(24,"físico registrado"); ["#taf-run","#taf-pullups","#taf-pushups","#taf-situps"].forEach(s=>$(s).value=""); save();};
    $("#taf-exercise-form").onsubmit=e=>{e.preventDefault(); const name=$("#taf-ex-name").value.trim(), target=n($("#taf-ex-target").value), unit=$("#taf-ex-unit").value.trim()||"rep", mode=$("#taf-ex-mode").value; if(!name) return toast("Informe o exercício do TAF."); state.tafExercises.push({id:uid(),name,target,unit,mode}); e.target.reset(); xp(6,"exercício TAF cadastrado"); save();};
    $("#taf-performance-form").onsubmit=e=>{e.preventDefault(); const exerciseId=$("#taf-log-exercise").value, value=n($("#taf-log-value").value), note=$("#taf-log-note").value.trim(); if(!exerciseId||!value) return toast("Informe exercício e marca realizada."); state.tafExerciseLogs.unshift({id:uid(),date:todayKey(),exerciseId,value,note}); e.target.reset(); xp(10,"marca TAF registrada"); save();};
    $("#taf-exercise-grid").onclick=e=>{const btn=e.target.closest("button"), card=e.target.closest(".taf-ex-card"); if(btn?.dataset.action==="delete-taf-ex"&&card){state.tafExercises=tafExercises().filter(x=>x.id!==card.dataset.id); state.tafExerciseLogs=tafLogs().filter(x=>x.exerciseId!==card.dataset.id); save();}};
    ["#law-search","#law-filter"].forEach(s=>{$(s).oninput=renderLaws; $(s).onchange=renderLaws;});
    $("#export-backup").onclick=()=>{const blob=new Blob([JSON.stringify({app:"Setor X PRO V4 Refinado",version:"4.1.0",exportedAt:new Date().toISOString(),state},null,2)],{type:"application/json"}), url=URL.createObjectURL(blob), a=document.createElement("a"); a.href=url; a.download=`setor-x-v4-refinado-backup-${todayKey()}.json`; a.click(); URL.revokeObjectURL(url);};
    $("#import-backup").onchange=e=>{const file=e.target.files?.[0]; if(!file) return; const r=new FileReader(); r.onload=()=>{try{const parsed=JSON.parse(String(r.result||"{}")); state={...clone(defaultState),...(parsed.state||parsed)}; save(); toast("Backup importado.");}catch{toast("Backup inválido.");}}; r.readAsText(file);};
    $("#reset-app").onclick=()=>{if(!confirm("Resetar todos os dados?"))return; localStorage.removeItem(STORAGE_KEY); state=clone(defaultState); resetTimer(); save();};


    const lawGrid=$("#law-grid"); if(lawGrid) lawGrid.onclick=e=>{ const card=e.target.closest(".law-card"); const btn=e.target.closest("[data-law-action]"); if(card&&btn){ toggleLawMark(card.dataset.lawTitle, btn.dataset.lawAction); } };
    if(lawGrid) lawGrid.addEventListener("change", e=>{ const note=e.target.closest(".law-note"); if(!note) return; const key=note.dataset.lawNote; const marks=lawMarks(); marks[key]=marks[key]||{read:false,important:false,review:false,note:"",updatedAt:""}; marks[key].note=note.value.trim(); marks[key].updatedAt=new Date().toISOString(); save(); toast("Anotação de lei salva."); });
    const calPrev=$("#calendar-prev"); if(calPrev) calPrev.onclick=()=>{state.ui.calendarOffset=n(state.ui.calendarOffset,0)-1; save();};
    const calNext=$("#calendar-next"); if(calNext) calNext.onclick=()=>{state.ui.calendarOffset=n(state.ui.calendarOffset,0)+1; save();};
    const calToday=$("#calendar-today"); if(calToday) calToday.onclick=()=>{state.ui.calendarOffset=0; save();};
    const calGrid=$("#study-calendar-grid"); if(calGrid) calGrid.onclick=e=>{ const cell=e.target.closest("[data-date]"); if(cell) showCalendarDetail(cell.dataset.date); };
    const calEventForm=$("#calendar-event-form"); if(calEventForm) calEventForm.onsubmit=e=>{ e.preventDefault(); const date=$("#calendar-event-date").value||todayKey(), title=$("#calendar-event-title").value.trim(), type=$("#calendar-event-type").value; if(!title) return toast("Digite o título da data marcada."); eventsForDate(date).push({id:uid(),title,type,createdAt:new Date().toISOString()}); $("#calendar-event-title").value=""; xp(4,"data marcada no calendário"); save(); showCalendarDetail(date); };
    const calDetail=$("#calendar-detail"); if(calDetail) calDetail.onclick=e=>{ const btn=e.target.closest("[data-delete-event]"); if(!btn) return; const date=btn.closest("[data-date]")?.dataset.date; if(!date) return; const events=calendarEvents(); events[date]=eventsForDate(date).filter(ev=>ev.id!==btn.dataset.deleteEvent); save(); showCalendarDetail(date); toast("Data marcada removida."); };



    
    const summaryReviewActions=document.querySelector(".summary-review-actions");
    if(summaryReviewActions) summaryReviewActions.onclick=e=>{ const btn=e.target.closest("[data-summary-current-rate]"); if(btn) markCurrentSummaryReview(btn.dataset.summaryCurrentRate); };

    const summaryModalClose=$("#summary-modal-close"); if(summaryModalClose) summaryModalClose.onclick=closeSummaryEditor;
    const summaryFloatingClose=$("#summary-floating-close"); if(summaryFloatingClose) summaryFloatingClose.onclick=closeSummaryEditor;
    const summaryBackdrop=$("#summary-modal-backdrop"); if(summaryBackdrop) summaryBackdrop.onclick=closeSummaryEditor;
    if(!window.__summaryModalCloseBound){
      window.__summaryModalCloseBound=true;
      document.addEventListener("click",e=>{ if(e.target.closest("#summary-modal-close") || e.target.closest("#summary-close") || e.target.id==="summary-modal-backdrop") closeSummaryEditor(); });
      document.addEventListener("keydown",e=>{ if(e.key==="Escape" && !$("#summary-editor-card")?.hidden) closeSummaryEditor(); });
    }
    const summaryAddQuestion=$("#summary-add-question-link"); if(summaryAddQuestion) summaryAddQuestion.onclick=()=>{ const id=$("#summary-question-select")?.value; if(!id) return toast("Nenhuma questão disponível para vincular."); setSummaryCurrentLinks([...summaryCurrentLinks(), id]); toast("Questão vinculada ao resumo."); };
    const summaryLinkedList=$("#summary-linked-list"); if(summaryLinkedList) summaryLinkedList.onclick=e=>{ const btn=e.target.closest("[data-remove-link]"); if(!btn) return; setSummaryCurrentLinks(summaryCurrentLinks().filter(id=>id!==btn.dataset.removeLink)); };
    const summaryAddVideo=$("#summary-add-video"); if(summaryAddVideo) summaryAddVideo.onclick=()=>{ const input=$("#summary-video-url"), url=youtubeEmbedUrl(input?.value); if(!url) return toast("Cole um link de vídeo/aula."); setSummaryCurrentVideos([...summaryCurrentVideos(), url]); input.value=""; toast("Vídeo vinculado ao resumo."); };
    const summaryVideoList=$("#summary-video-list"); if(summaryVideoList) summaryVideoList.onclick=e=>{ const btn=e.target.closest("[data-remove-video]"); if(!btn) return; const i=Number(btn.dataset.removeVideo); setSummaryCurrentVideos(summaryCurrentVideos().filter((_,idx)=>idx!==i)); };
    const summaryOrganize=$("#summary-organize"); if(summaryOrganize) summaryOrganize.onclick=organizeSummaryContent;
    const summaryNormalizeFont=$("#summary-normalize-font"); if(summaryNormalizeFont) summaryNormalizeFont.onclick=normalizeSummaryFont;
    const summaryTocMode=$("#summary-toc-mode"); if(summaryTocMode) summaryTocMode.onchange=renderSummaryToc;

    const summaryMiniStart=$("#summary-timer-start"); if(summaryMiniStart) summaryMiniStart.onclick=startTimer;
    const summaryMiniPause=$("#summary-timer-pause"); if(summaryMiniPause) summaryMiniPause.onclick=pauseTimer;
    const summaryEditor=$("#summary-editor"); if(summaryEditor) summaryEditor.addEventListener("input",renderSummaryToc);
    const summaryToc=$("#summary-toc-list"); if(summaryToc) summaryToc.onclick=e=>{ const btn=e.target.closest("[data-target]"); if(!btn) return; const target=document.getElementById(btn.dataset.target); if(target) target.scrollIntoView({behavior:"smooth",block:"start"}); };
    $$(".summary-toolbar [data-format]").forEach(btn=>btn.onclick=()=>applySummaryCommand("formatBlock",btn.dataset.format));

    const summarySave=$("#summary-save"); if(summarySave) summarySave.onclick=saveSummaryFromEditor;
    const summaryNew=$("#summary-new"); if(summaryNew) summaryNew.onclick=()=>{clearSummaryEditor(); toast("Novo resumo pronto para edição.");};
    const summaryClose=$("#summary-close"); if(summaryClose) summaryClose.onclick=()=>{closeSummaryEditor(); toast("Resumo fechado.");};
    const summarySearch=$("#summary-search"); if(summarySearch) summarySearch.oninput=renderSummaries;
    const summaryList=$("#summary-list"); if(summaryList) summaryList.onclick=e=>{ const card=e.target.closest(".summary-card"); if(!card) return; const item=summaries().find(s=>s.id===card.dataset.id); if(e.target.closest("[data-action='delete-summary']")){ if(!confirm("Excluir este resumo?")) return; state.summaries=summaries().filter(s=>s.id!==card.dataset.id); save(); return; } if(item) loadSummaryEditor(item); };
    $$(".summary-toolbar [data-cmd]").forEach(btn=>btn.onclick=()=>applySummaryCommand(btn.dataset.cmd));
    $$(".summary-toolbar [data-color]").forEach(btn=>btn.onclick=()=>applySummaryCommand("foreColor",btn.dataset.color));
    $$(".summary-toolbar [data-bg]").forEach(btn=>btn.onclick=()=>applySummaryCommand("hiliteColor",btn.dataset.bg));
    $$(".nav-link").forEach(link=>link.onclick=()=>{$$(".nav-link").forEach(a=>a.classList.remove("active")); link.classList.add("active");});
  }

  function boot(){
    try{ touchDay(); }catch(e){ console.error("[Setor X] touchDay falhou",e); }
    try{ bind(); }catch(e){ console.error("[Setor X] bind falhou",e); toast("Hotfix: algumas ações foram religadas pelo núcleo de segurança."); }
    try{ bindCriticalFallbacks(); }catch(e){ console.error("[Setor X] fallback crítico falhou",e); }
    try{ resetTimer(); }catch(e){ console.error("[Setor X] resetTimer falhou",e); }
    try{ renderAll(); }catch(e){ console.error("[Setor X] renderAll falhou",e); }
    try{ setTimeout(()=>window.SetorXV30StatsFix?.patchAll?.(), 250); }catch(e){}
  }
  window.addEventListener("error",e=>console.error("[Setor X] erro global capturado",e.error||e.message));
  window.addEventListener("unhandledrejection",e=>console.error("[Setor X] promessa rejeitada",e.reason));
  boot();
})();
