
(function(){
  const STORAGE_KEY="setorx_vade_mecum_v1";
  const CUSTOM_LAWS_KEY="setorx_vade_custom_laws_v1";
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
  const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const toast=(msg)=>{const t=$("#toast"); if(t){t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600);}};

  const vadeDB = [
    {
      id:"cf88", discipline:"Direito Constitucional", title:"Constituição Federal/1988", short:"CF", source:"Planalto — Constituição da República Federativa do Brasil de 1988", category:"constitucional",
      articles:[
        {id:"art-1", n:"Art. 1º", text:"A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:\n\nI - a soberania;\nII - a cidadania;\nIII - a dignidade da pessoa humana;\nIV - os valores sociais do trabalho e da livre iniciativa;\nV - o pluralismo político.\n\nParágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição."},
        {id:"art-2", n:"Art. 2º", text:"São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário."},
        {id:"art-3", n:"Art. 3º", text:"Constituem objetivos fundamentais da República Federativa do Brasil:\n\nI - construir uma sociedade livre, justa e solidária;\nII - garantir o desenvolvimento nacional;\nIII - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais;\nIV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação."},
        {id:"art-4", n:"Art. 4º", text:"A República Federativa do Brasil rege-se nas suas relações internacionais pelos seguintes princípios:\n\nI - independência nacional;\nII - prevalência dos direitos humanos;\nIII - autodeterminação dos povos;\nIV - não-intervenção;\nV - igualdade entre os Estados;\nVI - defesa da paz;\nVII - solução pacífica dos conflitos;\nVIII - repúdio ao terrorismo e ao racismo;\nIX - cooperação entre os povos para o progresso da humanidade;\nX - concessão de asilo político.\n\nParágrafo único. A República Federativa do Brasil buscará a integração econômica, política, social e cultural dos povos da América Latina, visando à formação de uma comunidade latino-americana de nações."},
        {id:"art-5-caput", n:"Art. 5º", text:"Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:\n\nI - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;\nII - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;\nIII - ninguém será submetido a tortura nem a tratamento desumano ou degradante;\nIV - é livre a manifestação do pensamento, sendo vedado o anonimato;\nV - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem;\nVI - é inviolável a liberdade de consciência e de crença, sendo assegurado o livre exercício dos cultos religiosos e garantida, na forma da lei, a proteção aos locais de culto e a suas liturgias;\nVII - é assegurada, nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva;\nVIII - ninguém será privado de direitos por motivo de crença religiosa ou de convicção filosófica ou política, salvo se as invocar para eximir-se de obrigação legal a todos imposta e recusar-se a cumprir prestação alternativa, fixada em lei;\nIX - é livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença;\nX - são invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas, assegurado o direito a indenização pelo dano material ou moral decorrente de sua violação."},
        {id:"art-37", n:"Art. 37", text:"A administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência e, também, ao seguinte:\n\nI - os cargos, empregos e funções públicas são acessíveis aos brasileiros que preencham os requisitos estabelecidos em lei, assim como aos estrangeiros, na forma da lei;\nII - a investidura em cargo ou emprego público depende de aprovação prévia em concurso público de provas ou de provas e títulos, de acordo com a natureza e a complexidade do cargo ou emprego, na forma prevista em lei, ressalvadas as nomeações para cargo em comissão declarado em lei de livre nomeação e exoneração."},
        {id:"art-144", n:"Art. 144", text:"A segurança pública, dever do Estado, direito e responsabilidade de todos, é exercida para a preservação da ordem pública e da incolumidade das pessoas e do patrimônio, através dos seguintes órgãos:\n\nI - polícia federal;\nII - polícia rodoviária federal;\nIII - polícia ferroviária federal;\nIV - polícias civis;\nV - polícias militares e corpos de bombeiros militares;\nVI - polícias penais federal, estaduais e distrital.\n\n§ 1º A polícia federal, instituída por lei como órgão permanente, organizado e mantido pela União e estruturado em carreira, destina-se a:\nI - apurar infrações penais contra a ordem política e social ou em detrimento de bens, serviços e interesses da União ou de suas entidades autárquicas e empresas públicas, assim como outras infrações cuja prática tenha repercussão interestadual ou internacional e exija repressão uniforme, segundo se dispuser em lei;\nII - prevenir e reprimir o tráfico ilícito de entorpecentes e drogas afins, o contrabando e o descaminho, sem prejuízo da ação fazendária e de outros órgãos públicos nas respectivas áreas de competência;\nIII - exercer as funções de polícia marítima, aeroportuária e de fronteiras;\nIV - exercer, com exclusividade, as funções de polícia judiciária da União."}
      ]
    },
    {
      id:"cp", discipline:"Direito Penal", title:"Código Penal", short:"CP", category:"penal", source:"Planalto — Decreto-Lei nº 2.848/1940",
      articles:[
        {id:"art-1", n:"Art. 1º", text:"Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal."},
        {id:"art-2", n:"Art. 2º", text:"Ninguém pode ser punido por fato que lei posterior deixa de considerar crime, cessando em virtude dela a execução e os efeitos penais da sentença condenatória.\n\nParágrafo único. A lei posterior, que de qualquer modo favorecer o agente, aplica-se aos fatos anteriores, ainda que decididos por sentença condenatória transitada em julgado."},
        {id:"art-3", n:"Art. 3º", text:"A lei excepcional ou temporária, embora decorrido o período de sua duração ou cessadas as circunstâncias que a determinaram, aplica-se ao fato praticado durante sua vigência."},
        {id:"art-4", n:"Art. 4º", text:"Considera-se praticado o crime no momento da ação ou omissão, ainda que outro seja o momento do resultado."},
        {id:"art-5", n:"Art. 5º", text:"Aplica-se a lei brasileira, sem prejuízo de convenções, tratados e regras de direito internacional, ao crime cometido no território nacional."},
        {id:"art-13", n:"Art. 13", text:"O resultado, de que depende a existência do crime, somente é imputável a quem lhe deu causa. Considera-se causa a ação ou omissão sem a qual o resultado não teria ocorrido.\n\n§ 1º A superveniência de causa relativamente independente exclui a imputação quando, por si só, produziu o resultado; os fatos anteriores, entretanto, imputam-se a quem os praticou.\n\n§ 2º A omissão é penalmente relevante quando o omitente devia e podia agir para evitar o resultado. O dever de agir incumbe a quem:\na) tenha por lei obrigação de cuidado, proteção ou vigilância;\nb) de outra forma, assumiu a responsabilidade de impedir o resultado;\nc) com seu comportamento anterior, criou o risco da ocorrência do resultado."},
        {id:"art-14", n:"Art. 14", text:"Diz-se o crime:\n\nI - consumado, quando nele se reúnem todos os elementos de sua definição legal;\nII - tentado, quando, iniciada a execução, não se consuma por circunstâncias alheias à vontade do agente.\n\nParágrafo único. Salvo disposição em contrário, pune-se a tentativa com a pena correspondente ao crime consumado, diminuída de um a dois terços."},
        {id:"art-23", n:"Art. 23", text:"Não há crime quando o agente pratica o fato:\n\nI - em estado de necessidade;\nII - em legítima defesa;\nIII - em estrito cumprimento de dever legal ou no exercício regular de direito.\n\nParágrafo único. O agente, em qualquer das hipóteses deste artigo, responderá pelo excesso doloso ou culposo."},
        {id:"art-24", n:"Art. 24", text:"Considera-se em estado de necessidade quem pratica o fato para salvar de perigo atual, que não provocou por sua vontade, nem podia de outro modo evitar, direito próprio ou alheio, cujo sacrifício, nas circunstâncias, não era razoável exigir-se.\n\n§ 1º Não pode alegar estado de necessidade quem tinha o dever legal de enfrentar o perigo.\n\n§ 2º Embora seja razoável exigir-se o sacrifício do direito ameaçado, a pena poderá ser reduzida de um a dois terços."},
        {id:"art-25", n:"Art. 25", text:"Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.\n\nParágrafo único. Observados os requisitos previstos no caput deste artigo, considera-se também em legítima defesa o agente de segurança pública que repele agressão ou risco de agressão a vítima mantida refém durante a prática de crimes."},
        {id:"art-121", n:"Art. 121", text:"Matar alguém:\nPena - reclusão, de seis a vinte anos.\n\n§ 1º Se o agente comete o crime impelido por motivo de relevante valor social ou moral, ou sob o domínio de violenta emoção, logo em seguida a injusta provocação da vítima, o juiz pode reduzir a pena de um sexto a um terço."},
        {id:"art-155", n:"Art. 155", text:"Subtrair, para si ou para outrem, coisa alheia móvel:\nPena - reclusão, de um a quatro anos, e multa.\n\n§ 1º A pena aumenta-se de um terço, se o crime é praticado durante o repouso noturno."},
        {id:"art-157", n:"Art. 157", text:"Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa, ou depois de havê-la, por qualquer meio, reduzido à impossibilidade de resistência:\nPena - reclusão, de quatro a dez anos, e multa."}
      ]
    },
    {
      id:"cpp", discipline:"Direito Processual Penal", title:"Código de Processo Penal", short:"CPP", category:"penal", source:"Planalto — Decreto-Lei nº 3.689/1941",
      articles:[
        {id:"art-1", n:"Art. 1º", text:"O processo penal reger-se-á, em todo o território brasileiro, por este Código, ressalvados:\n\nI - os tratados, as convenções e regras de direito internacional;\nII - as prerrogativas constitucionais do Presidente da República, dos ministros de Estado, nos crimes conexos com os do Presidente da República, e dos ministros do Supremo Tribunal Federal, nos crimes de responsabilidade;\nIII - os processos da competência da Justiça Militar;\nIV - os processos da competência do tribunal especial;\nV - os processos por crimes de imprensa."},
        {id:"art-2", n:"Art. 2º", text:"A lei processual penal aplicar-se-á desde logo, sem prejuízo da validade dos atos realizados sob a vigência da lei anterior."},
        {id:"art-3", n:"Art. 3º", text:"A lei processual penal admitirá interpretação extensiva e aplicação analógica, bem como o suplemento dos princípios gerais de direito."},
        {id:"art-4", n:"Art. 4º", text:"A polícia judiciária será exercida pelas autoridades policiais no território de suas respectivas circunscrições e terá por fim a apuração das infrações penais e da sua autoria."},
        {id:"art-5", n:"Art. 5º", text:"Nos crimes de ação pública o inquérito policial será iniciado:\n\nI - de ofício;\nII - mediante requisição da autoridade judiciária ou do Ministério Público, ou a requerimento do ofendido ou de quem tiver qualidade para representá-lo."},
        {id:"art-6", n:"Art. 6º", text:"Logo que tiver conhecimento da prática da infração penal, a autoridade policial deverá:\n\nI - dirigir-se ao local, providenciando para que não se alterem o estado e conservação das coisas, até a chegada dos peritos criminais;\nII - apreender os objetos que tiverem relação com o fato, após liberados pelos peritos criminais;\nIII - colher todas as provas que servirem para o esclarecimento do fato e suas circunstâncias;\nIV - ouvir o ofendido;\nV - ouvir o indiciado, com observância, no que for aplicável, do disposto no Capítulo III do Título VII, deste Livro."},
        {id:"art-240", n:"Art. 240", text:"A busca será domiciliar ou pessoal.\n\n§ 1º Proceder-se-á à busca domiciliar, quando fundadas razões a autorizarem, para:\na) prender criminosos;\nb) apreender coisas achadas ou obtidas por meios criminosos;\nc) apreender instrumentos de falsificação ou de contrafação e objetos falsificados ou contrafeitos;\nd) apreender armas e munições, instrumentos utilizados na prática de crime ou destinados a fim delituoso;\ne) descobrir objetos necessários à prova de infração ou à defesa do réu."},
        {id:"art-244", n:"Art. 244", text:"A busca pessoal independerá de mandado, no caso de prisão ou quando houver fundada suspeita de que a pessoa esteja na posse de arma proibida ou de objetos ou papéis que constituam corpo de delito, ou quando a medida for determinada no curso de busca domiciliar."},
        {id:"art-301", n:"Art. 301", text:"Qualquer do povo poderá e as autoridades policiais e seus agentes deverão prender quem quer que seja encontrado em flagrante delito."},
        {id:"art-302", n:"Art. 302", text:"Considera-se em flagrante delito quem:\n\nI - está cometendo a infração penal;\nII - acaba de cometê-la;\nIII - é perseguido, logo após, pela autoridade, pelo ofendido ou por qualquer pessoa, em situação que faça presumir ser autor da infração;\nIV - é encontrado, logo depois, com instrumentos, armas, objetos ou papéis que façam presumir ser ele autor da infração."},
        {id:"art-306", n:"Art. 306", text:"A prisão de qualquer pessoa e o local onde se encontre serão comunicados imediatamente ao juiz competente, ao Ministério Público e à família do preso ou à pessoa por ele indicada."},
        {id:"art-312", n:"Art. 312", text:"A prisão preventiva poderá ser decretada como garantia da ordem pública, da ordem econômica, por conveniência da instrução criminal ou para assegurar a aplicação da lei penal, quando houver prova da existência do crime e indício suficiente de autoria e de perigo gerado pelo estado de liberdade do imputado."},
        {id:"art-393", n:"Art. 393", text:"Revogado pela Lei nº 12.403, de 2011.", revoked:true}
      ]
    },
    {
      id:"ctb", discipline:"Legislação de Trânsito", title:"Código de Trânsito Brasileiro", short:"CTB", category:"transito", source:"Planalto — Lei nº 9.503/1997",
      articles:[
        {id:"art-1", n:"Art. 1º", text:"O trânsito de qualquer natureza nas vias terrestres do território nacional, abertas à circulação, rege-se por este Código."},
        {id:"art-2", n:"Art. 2º", text:"São vias terrestres urbanas e rurais as ruas, as avenidas, os logradouros, os caminhos, as passagens, as estradas e as rodovias, que terão seu uso regulamentado pelo órgão ou entidade com circunscrição sobre elas, de acordo com as peculiaridades locais e as circunstâncias especiais."},
        {id:"art-5", n:"Art. 5º", text:"O Sistema Nacional de Trânsito é o conjunto de órgãos e entidades da União, dos Estados, do Distrito Federal e dos Municípios que tem por finalidade o exercício das atividades de planejamento, administração, normatização, pesquisa, registro e licenciamento de veículos, formação, habilitação e reciclagem de condutores, educação, engenharia, operação do sistema viário, policiamento, fiscalização, julgamento de infrações e de recursos e aplicação de penalidades."},
        {id:"art-165", n:"Art. 165", text:"Dirigir sob a influência de álcool ou de qualquer outra substância psicoativa que determine dependência:\n\nInfração - gravíssima;\nPenalidade - multa e suspensão do direito de dirigir por 12 (doze) meses;\nMedida administrativa - recolhimento do documento de habilitação e retenção do veículo."},
        {id:"art-165-a", n:"Art. 165-A", text:"Recusar-se a ser submetido a teste, exame clínico, perícia ou outro procedimento que permita certificar influência de álcool ou outra substância psicoativa:\n\nInfração - gravíssima;\nPenalidade - multa e suspensão do direito de dirigir por 12 (doze) meses;\nMedida administrativa - recolhimento do documento de habilitação e retenção do veículo."},
        {id:"art-302", n:"Art. 302", text:"Praticar homicídio culposo na direção de veículo automotor:\nPenas - detenção, de dois a quatro anos, e suspensão ou proibição de se obter a permissão ou a habilitação para dirigir veículo automotor."},
        {id:"art-303", n:"Art. 303", text:"Praticar lesão corporal culposa na direção de veículo automotor:\nPenas - detenção, de seis meses a dois anos e suspensão ou proibição de se obter a permissão ou a habilitação para dirigir veículo automotor."},
        {id:"art-306", n:"Art. 306", text:"Conduzir veículo automotor com capacidade psicomotora alterada em razão da influência de álcool ou de outra substância psicoativa que determine dependência:\n\nPenas - detenção, de seis meses a três anos, multa e suspensão ou proibição de se obter a permissão ou a habilitação para dirigir veículo automotor.\n\n§ 1º As condutas previstas no caput serão constatadas por:\nI - concentração igual ou superior a 6 decigramas de álcool por litro de sangue ou igual ou superior a 0,3 miligrama de álcool por litro de ar alveolar; ou\nII - sinais que indiquem, na forma disciplinada pelo Contran, alteração da capacidade psicomotora."},
        {id:"art-309", n:"Art. 309", text:"Dirigir veículo automotor, em via pública, sem a devida Permissão para Dirigir ou Habilitação ou, ainda, se cassado o direito de dirigir, gerando perigo de dano:\nPenas - detenção, de seis meses a um ano, ou multa."},
        {id:"art-310", n:"Art. 310", text:"Permitir, confiar ou entregar a direção de veículo automotor a pessoa não habilitada, com habilitação cassada ou com o direito de dirigir suspenso, ou, ainda, a quem, por seu estado de saúde, física ou mental, ou por embriaguez, não esteja em condições de conduzi-lo com segurança:\nPenas - detenção, de seis meses a um ano, ou multa."},
        {id:"art-311", n:"Art. 311", text:"Trafegar em velocidade incompatível com a segurança nas proximidades de escolas, hospitais, estações de embarque e desembarque de passageiros, logradouros estreitos, ou onde haja grande movimentação ou concentração de pessoas, gerando perigo de dano:\nPenas - detenção, de seis meses a um ano, ou multa."}
      ]
    },
    {
      id:"cpm", discipline:"Direito Militar", title:"Código Penal Militar", short:"CPM", category:"militar", source:"Planalto — Decreto-Lei nº 1.001/1969",
      articles:[
        {id:"art-1", n:"Art. 1º", text:"Não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal."},
        {id:"art-2", n:"Art. 2º", text:"Ninguém pode ser punido por fato que lei posterior deixa de considerar crime, cessando, em virtude dela, a própria vigência de sentença condenatória irrecorrível, salvo quanto aos efeitos de natureza civil.\n\n§ 1º A lei posterior que, de qualquer outro modo, favorece o agente, aplica-se retroativamente, ainda quando já tenha sobrevindo sentença condenatória irrecorrível."},
        {id:"art-5", n:"Art. 5º", text:"Considera-se praticado o crime no momento da ação ou omissão, ainda que outro seja o do resultado."},
        {id:"art-9", n:"Art. 9º", text:"Consideram-se crimes militares, em tempo de paz:\n\nI - os crimes de que trata este Código, quando definidos de modo diverso na lei penal comum, ou nela não previstos, qualquer que seja o agente, salvo disposição especial;\nII - os crimes previstos neste Código e os previstos na legislação penal, quando praticados nas condições previstas nas alíneas do dispositivo;\nIII - os crimes praticados por militar da reserva, ou reformado, ou por civil, contra as instituições militares, nos termos legais."},
        {id:"art-14", n:"Art. 14", text:"Diz-se o crime:\n\nI - consumado, quando nele se reúnem todos os elementos de sua definição legal;\nII - tentado, quando, iniciada a execução, não se consuma por circunstâncias alheias à vontade do agente."},
        {id:"art-205", n:"Art. 205", text:"Matar alguém:\nPena - reclusão, de seis a vinte anos."}
      ]
    },
    {
      id:"cppm", discipline:"Direito Militar", title:"Código de Processo Penal Militar", short:"CPPM", category:"militar", source:"Planalto — Decreto-Lei nº 1.002/1969",
      articles:[
        {id:"art-1", n:"Art. 1º", text:"O processo penal militar reger-se-á pelas normas contidas neste Código, assim em tempo de paz como em tempo de guerra, salvo legislação especial que lhe for estritamente aplicável.\n\n§ 1º Nos casos concretos, se houver divergência entre essas normas e as de convenção ou tratado de que o Brasil seja signatário, prevalecerão as últimas.\n\n§ 2º Aplicam-se, subsidiariamente, as normas deste Código aos processos regulados em leis especiais."},
        {id:"art-2", n:"Art. 2º", text:"A lei de processo penal militar deve ser interpretada no sentido literal de suas expressões. Os termos técnicos hão de ser entendidos em sua acepção especial, salvo se evidentemente empregados com outra significação."},
        {id:"art-3", n:"Art. 3º", text:"Os casos omissos neste Código serão supridos:\n\na) pela legislação de processo penal comum, quando aplicável ao caso concreto e sem prejuízo da índole do processo penal militar;\nb) pela jurisprudência;\nc) pelos usos e costumes militares;\nd) pelos princípios gerais de Direito;\ne) pela analogia."},
        {id:"art-29", n:"Art. 29", text:"A ação penal é pública e somente pode ser promovida por denúncia do Ministério Público Militar."},
        {id:"art-30", n:"Art. 30", text:"A denúncia deve ser apresentada sempre que houver:\n\na) prova de fato que, em tese, constitua crime;\nb) indícios de autoria."},
        {id:"art-82", n:"Art. 82", text:"O foro militar é especial, e, exceto nos crimes dolosos contra a vida praticados contra civil, a ele estão sujeitos, em tempo de paz, os casos previstos em lei.", revoked:false}
      ]
    },
    {
      id:"drogas", discipline:"Legislação Especial", title:"Lei de Drogas", short:"Lei 11.343/2006", category:"especial", source:"Planalto — Lei nº 11.343/2006",
      articles:[
        {id:"art-28", n:"Art. 28", text:"Quem adquirir, guardar, tiver em depósito, transportar ou trouxer consigo, para consumo pessoal, drogas sem autorização ou em desacordo com determinação legal ou regulamentar será submetido às penas previstas na lei."},
        {id:"art-33", n:"Art. 33", text:"Importar, exportar, remeter, preparar, produzir, fabricar, adquirir, vender, expor à venda, oferecer, ter em depósito, transportar, trazer consigo, guardar, prescrever, ministrar, entregar a consumo ou fornecer drogas, ainda que gratuitamente, sem autorização ou em desacordo com determinação legal ou regulamentar:\nPena - reclusão de 5 (cinco) a 15 (quinze) anos e pagamento de multa."},
        {id:"art-35", n:"Art. 35", text:"Associarem-se duas ou mais pessoas para o fim de praticar, reiteradamente ou não, qualquer dos crimes previstos nos arts. 33, caput e § 1º, e 34 desta Lei:\nPena - reclusão, de 3 (três) a 10 (dez) anos, e pagamento de multa."}
      ]
    },
    {
      id:"abuso", discipline:"Legislação Especial", title:"Lei de Abuso de Autoridade", short:"Lei 13.869/2019", category:"especial", source:"Planalto — Lei nº 13.869/2019",
      articles:[
        {id:"art-1", n:"Art. 1º", text:"Esta Lei define os crimes de abuso de autoridade, cometidos por agente público, servidor ou não, que, no exercício de suas funções ou a pretexto de exercê-las, abuse do poder que lhe tenha sido atribuído."},
        {id:"art-13", n:"Art. 13", text:"Constranger o preso ou o detento, mediante violência, grave ameaça ou redução de sua capacidade de resistência, a exibir-se ou ter seu corpo ou parte dele exibido à curiosidade pública, ou a submeter-se a situação vexatória ou a constrangimento não autorizado em lei."},
        {id:"art-15", n:"Art. 15", text:"Constranger a depor, sob ameaça de prisão, pessoa que, em razão de função, ministério, ofício ou profissão, deva guardar segredo ou resguardar sigilo."},
        {id:"art-22", n:"Art. 22", text:"Invadir ou adentrar, clandestina ou astuciosamente, ou à revelia da vontade do ocupante, imóvel alheio ou suas dependências, ou nele permanecer nas mesmas condições, sem determinação judicial ou fora das condições estabelecidas em lei."}
      ]
    }
  ];

  const additionalVadeLaws = [
  {
    "id": "cf88",
    "discipline": "Direito Constitucional",
    "title": "Constituição Federal",
    "short": "Direitos fundamentais, administração pública e segurança pública.",
    "category": "constitucional",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Constituição Federal\n\nDireitos fundamentais, administração pública e segurança pública.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "cp",
    "discipline": "Direito Penal",
    "title": "Código Penal",
    "short": "Parte geral e crimes em espécie.",
    "category": "penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Código Penal\n\nParte geral e crimes em espécie.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "cpp",
    "discipline": "Direito Processual Penal",
    "title": "Código de Processo Penal",
    "short": "Inquérito, ação penal, provas, prisões e procedimentos.",
    "category": "processual_penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Código de Processo Penal\n\nInquérito, ação penal, provas, prisões e procedimentos.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "ctb",
    "discipline": "Legislação de Trânsito",
    "title": "Código de Trânsito Brasileiro",
    "short": "CTB",
    "category": "transito",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Código de Trânsito Brasileiro\n\nCTB — infrações, penalidades e normas gerais.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "drogas",
    "discipline": "Legislação Especial",
    "title": "Lei de Drogas",
    "short": "Lei nº 11.343/2006.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lei de Drogas\n\nLei nº 11.343/2006.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "maria-penha",
    "discipline": "Legislação Especial",
    "title": "Lei Maria da Penha",
    "short": "Lei nº 11.340/2006.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lei Maria da Penha\n\nLei nº 11.340/2006.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "eca",
    "discipline": "Legislação Especial",
    "title": "ECA",
    "short": "Estatuto da Criança e do Adolescente.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l8069.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l8069.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "ECA\n\nEstatuto da Criança e do Adolescente.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "desarmamento",
    "discipline": "Legislação Especial",
    "title": "Estatuto do Desarmamento",
    "short": "Lei nº 10.826/2003.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/2003/l10.826.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/2003/l10.826.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Estatuto do Desarmamento\n\nLei nº 10.826/2003.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "crimes-ambientais",
    "discipline": "Legislação Especial",
    "title": "Crimes Ambientais",
    "short": "Lei nº 9.605/1998.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9605.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9605.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Crimes Ambientais\n\nLei nº 9.605/1998.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "abuso",
    "discipline": "Legislação Especial",
    "title": "Abuso de Autoridade",
    "short": "Lei nº 13.869/2019.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13869.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13869.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Abuso de Autoridade\n\nLei nº 13.869/2019.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "organizacoes-criminosas",
    "discipline": "Legislação Especial",
    "title": "Organizações Criminosas",
    "short": "Lei nº 12.850/2013.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12850.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12850.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Organizações Criminosas\n\nLei nº 12.850/2013.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "lavagem",
    "discipline": "Legislação Especial",
    "title": "Lavagem de Dinheiro",
    "short": "Lei nº 9.613/1998.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9613.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9613.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lavagem de Dinheiro\n\nLei nº 9.613/1998.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "tortura",
    "discipline": "Legislação Especial",
    "title": "Lei de Tortura",
    "short": "Lei nº 9.455/1997.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9455.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9455.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lei de Tortura\n\nLei nº 9.455/1997.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "interceptacao",
    "discipline": "Legislação Especial",
    "title": "Interceptação Telefônica",
    "short": "Lei nº 9.296/1996.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9296.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9296.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Interceptação Telefônica\n\nLei nº 9.296/1996.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "prisao-temporaria",
    "discipline": "Direito Processual Penal",
    "title": "Prisão Temporária",
    "short": "Lei nº 7.960/1989.",
    "category": "processual_penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l7960.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l7960.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Prisão Temporária\n\nLei nº 7.960/1989.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "juizados-criminais",
    "discipline": "Direito Processual Penal",
    "title": "Juizados Especiais Criminais",
    "short": "Lei nº 9.099/1995.",
    "category": "processual_penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9099.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9099.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Juizados Especiais Criminais\n\nLei nº 9.099/1995.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "hediondos",
    "discipline": "Legislação Especial",
    "title": "Hediondos",
    "short": "Lei nº 8.072/1990.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l8072.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l8072.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Hediondos\n\nLei nº 8.072/1990.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "lep",
    "discipline": "Direito Processual Penal",
    "title": "Lei de Execução Penal",
    "short": "Lei nº 7.210/1984.",
    "category": "processual_penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l7210.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l7210.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lei de Execução Penal\n\nLei nº 7.210/1984.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "identificacao-criminal",
    "discipline": "Direito Processual Penal",
    "title": "Identificação Criminal",
    "short": "Lei nº 12.037/2009.",
    "category": "processual_penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12037.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12037.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Identificação Criminal\n\nLei nº 12.037/2009.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "investigacao-delegado",
    "discipline": "Direito Processual Penal",
    "title": "Investigação Criminal pelo Delegado",
    "short": "Lei nº 12.830/2013.",
    "category": "processual_penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12830.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12830.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Investigação Criminal pelo Delegado\n\nLei nº 12.830/2013.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "improbidade",
    "discipline": "Direito Administrativo",
    "title": "Improbidade Administrativa",
    "short": "Lei nº 8.429/1992.",
    "category": "administrativo",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l8429.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l8429.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Improbidade Administrativa\n\nLei nº 8.429/1992.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "processo-adm",
    "discipline": "Direito Administrativo",
    "title": "Processo Administrativo Federal",
    "short": "Lei nº 9.784/1999.",
    "category": "administrativo",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9784.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9784.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Processo Administrativo Federal\n\nLei nº 9.784/1999.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "licitacoes",
    "discipline": "Direito Administrativo",
    "title": "Nova Lei de Licitações",
    "short": "Lei nº 14.133/2021.",
    "category": "administrativo",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Nova Lei de Licitações\n\nLei nº 14.133/2021.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "lai",
    "discipline": "Direito Administrativo",
    "title": "Lei de Acesso à Informação",
    "short": "Lei nº 12.527/2011.",
    "category": "administrativo",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lei de Acesso à Informação\n\nLei nº 12.527/2011.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "lgpd",
    "discipline": "Direito Administrativo",
    "title": "LGPD",
    "short": "Lei nº 13.709/2018.",
    "category": "administrativo",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "LGPD\n\nLei nº 13.709/2018.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "lonpc",
    "discipline": "Legislação Especial",
    "title": "Lei Orgânica Nacional das Polícias Civis",
    "short": "Lei nº 14.735/2023.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14735.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14735.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lei Orgânica Nacional das Polícias Civis\n\nLei nº 14.735/2023.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "susp",
    "discipline": "Legislação Especial",
    "title": "SUSP",
    "short": "Lei nº 13.675/2018.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13675.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13675.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "SUSP\n\nLei nº 13.675/2018.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "idosa",
    "discipline": "Legislação Especial",
    "title": "Estatuto da Pessoa Idosa",
    "short": "Lei nº 10.741/2003.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Estatuto da Pessoa Idosa\n\nLei nº 10.741/2003.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "igualdade-racial",
    "discipline": "Legislação Especial",
    "title": "Estatuto da Igualdade Racial",
    "short": "Lei nº 12.288/2010.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12288.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12288.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Estatuto da Igualdade Racial\n\nLei nº 12.288/2010.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "racismo",
    "discipline": "Legislação Especial",
    "title": "Lei de Racismo",
    "short": "Lei nº 7.716/1989.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l7716.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l7716.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lei de Racismo\n\nLei nº 7.716/1989.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "pcd",
    "discipline": "Legislação Especial",
    "title": "Pessoa com Deficiência",
    "short": "Lei nº 13.146/2015.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Pessoa com Deficiência\n\nLei nº 13.146/2015.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "contravencoes",
    "discipline": "Direito Penal",
    "title": "Contravenções Penais",
    "short": "Decreto-Lei nº 3.688/1941.",
    "category": "penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/decreto-lei/del3688.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3688.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Contravenções Penais\n\nDecreto-Lei nº 3.688/1941.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "ordem-tributaria",
    "discipline": "Direito Penal",
    "title": "Crimes contra a Ordem Tributária",
    "short": "Lei nº 8.137/1990.",
    "category": "penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l8137.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l8137.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Crimes contra a Ordem Tributária\n\nLei nº 8.137/1990.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "sistema-financeiro",
    "discipline": "Direito Penal",
    "title": "Crimes contra o Sistema Financeiro",
    "short": "Lei nº 7.492/1986.",
    "category": "penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l7492.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l7492.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Crimes contra o Sistema Financeiro\n\nLei nº 7.492/1986.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "cdc",
    "discipline": "Legislação Especial",
    "title": "Código de Defesa do Consumidor",
    "short": "Lei nº 8.078/1990.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Código de Defesa do Consumidor\n\nLei nº 8.078/1990.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "terrorismo",
    "discipline": "Legislação Especial",
    "title": "Terrorismo",
    "short": "Lei nº 13.260/2016.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13260.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13260.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Terrorismo\n\nLei nº 13.260/2016.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "codigo-eleitoral",
    "discipline": "Legislação Especial",
    "title": "Crimes Eleitorais — Código Eleitoral",
    "short": "Lei nº 4.737/1965.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l4737compilado.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l4737compilado.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Crimes Eleitorais — Código Eleitoral\n\nLei nº 4.737/1965.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "eleicoes",
    "discipline": "Legislação Especial",
    "title": "Lei das Eleições",
    "short": "Lei nº 9.504/1997.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9504.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9504.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Lei das Eleições\n\nLei nº 9.504/1997.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "lindb",
    "discipline": "Direito Administrativo",
    "title": "LINDB",
    "short": "Decreto-Lei nº 4.657/1942.",
    "category": "administrativo",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/decreto-lei/del4657compilado.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del4657compilado.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "LINDB\n\nDecreto-Lei nº 4.657/1942.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "mandado-seguranca",
    "discipline": "Direito Constitucional",
    "title": "Mandado de Segurança",
    "short": "Lei nº 12.016/2009.",
    "category": "constitucional",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12016.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12016.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Mandado de Segurança\n\nLei nº 12.016/2009.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "habeas-data",
    "discipline": "Direito Constitucional",
    "title": "Habeas Data",
    "short": "Lei nº 9.507/1997.",
    "category": "constitucional",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9507.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9507.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Habeas Data\n\nLei nº 9.507/1997.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "acao-popular",
    "discipline": "Direito Constitucional",
    "title": "Ação Popular",
    "short": "Lei nº 4.717/1965.",
    "category": "constitucional",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l4717.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l4717.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Ação Popular\n\nLei nº 4.717/1965.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "controle-constitucionalidade",
    "discipline": "Direito Constitucional",
    "title": "Controle de Constitucionalidade",
    "short": "Lei nº 9.868/1999.",
    "category": "constitucional",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9868.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9868.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Controle de Constitucionalidade\n\nLei nº 9.868/1999.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "adpf",
    "discipline": "Direito Constitucional",
    "title": "ADPF",
    "short": "Lei nº 9.882/1999.",
    "category": "constitucional",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l9882.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l9882.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "ADPF\n\nLei nº 9.882/1999.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "perfis-geneticos",
    "discipline": "Direito Processual Penal",
    "title": "Banco Nacional de Perfis Genéticos",
    "short": "Lei nº 12.654/2012.",
    "category": "processual_penal",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12654.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12654.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Banco Nacional de Perfis Genéticos\n\nLei nº 12.654/2012.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "pessoas-desaparecidas",
    "discipline": "Legislação Especial",
    "title": "Busca de Pessoas Desaparecidas",
    "short": "Lei nº 13.812/2019.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13812.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13812.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Busca de Pessoas Desaparecidas\n\nLei nº 13.812/2019.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "marco-civil",
    "discipline": "Legislação Especial",
    "title": "Marco Civil da Internet",
    "short": "Lei nº 12.965/2014.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Marco Civil da Internet\n\nLei nº 12.965/2014.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "crimes-raca-cor",
    "discipline": "Legislação Especial",
    "title": "Crimes Resultantes de Preconceito de Raça ou de Cor",
    "short": "Lei nº 7.716/1989.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/leis/l7716.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/leis/l7716.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Crimes Resultantes de Preconceito de Raça ou de Cor\n\nLei nº 7.716/1989.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  },
  {
    "id": "infiltracao-internet",
    "discipline": "Legislação Especial",
    "title": "Crimes contra Criança e Adolescente na Internet",
    "short": "Lei nº 13.441/2017.",
    "category": "especial",
    "source": "Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13441.htm",
    "officialUrl": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13441.htm",
    "loadStatus": "fonte-oficial-indexada",
    "articles": [
      {
        "id": "fonte-oficial",
        "n": "Fonte oficial cadastrada",
        "text": "Crimes contra Criança e Adolescente na Internet\n\nLei nº 13.441/2017.\n\nFonte oficial cadastrada no Vade Mecum Setor X.\n\nCarga completa: esta lei foi migrada da antiga área Lei Seca/Juris para o Vade Mecum por disciplina. Para manter fidelidade total à lei seca, não foi criado texto fictício de artigos. A estrutura está pronta para receber o pacote completo artigo por artigo desta norma sem alterar a plataforma."
      }
    ]
  }
];
  additionalVadeLaws.forEach(law=>{ if(!vadeDB.some(x=>x.id===law.id || x.title===law.title)) vadeDB.push(law); });
  if(window.SETORX_IMPORTED_VADE_LAWS && Array.isArray(window.SETORX_IMPORTED_VADE_LAWS)){
    window.SETORX_IMPORTED_VADE_LAWS.forEach(law=>{
      const idx=vadeDB.findIndex(x=>x.id===law.id || x.title===law.title);
      const normalized={...law, imported:true, loadStatus:law.loadStatus||"pdf-importado"};
      if(idx>=0) vadeDB[idx]={...vadeDB[idx], ...normalized, articles: normalized.articles && normalized.articles.length ? normalized.articles : vadeDB[idx].articles};
      else vadeDB.push(normalized);
    });
  }
  // V14 final: leis embutidas no código; importações antigas do navegador não sobrescrevem o Vade Mecum final.
  // loadCustomLaws() desativado intencionalmente nesta versão de distribuição.
  vadeDB.forEach(repairArticleSubtitles);



  
  const vadeGroupOrder = [
    "Todos",
    "Direito Constitucional",
    "Direito Penal",
    "Direito Processual Penal",
    "Legislação de Trânsito",
    "Direito Militar",
    "Direito Administrativo",
    "Legislação Especial"
  ];
  function lawGroupName(law){
    if(law.category==="custom") return law.discipline || "Legislação Personalizada";
    if(["cpm","cppm"].includes(law.id) || law.discipline==="Direito Militar") return "Direito Militar";
    if(["cpp","prisao-temporaria","juizados-criminais","lep","identificacao-criminal","investigacao-delegado","perfis-geneticos"].includes(law.id) || law.category==="processual_penal") return "Direito Processual Penal";
    if(law.category==="constitucional") return "Direito Constitucional";
    if(law.category==="penal") return "Direito Penal";
    if(law.category==="transito") return "Legislação de Trânsito";
    if(law.category==="administrativo") return "Direito Administrativo";
    if(law.category==="especial") return law.discipline && !vadeGroupOrder.includes(law.discipline) ? law.discipline : "Legislação Especial";
    return law.discipline || "Legislação Especial";
  }
  function allVadeGroups(){
    const dynamic=[...new Set(vadeDB.map(l=>lawGroupName(l)).filter(Boolean))].filter(g=>!vadeGroupOrder.includes(g)).sort((a,b)=>a.localeCompare(b,"pt-BR"));
    return [...vadeGroupOrder,...dynamic];
  }

  function lawSlug(s){return norm(s).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||("lei-"+uid());}
  function cleanLawLine(line, removeMeta=true){
    let s=String(line||"").replace(/\u00a0/g," ").replace(/[ \t]+/g," ").trim();
    if(!s) return "";
    if(/^(Mensagem de veto|Vigência|Produção de efeitos|Regulamento)$/i.test(s)) return "";
    if(removeMeta){
      s=s.replace(/\s*\((?:Vide|Redação dada|Incluíd[ao]|Vigência|Regulamento|Produção de efeitos|Parágrafo incluído|Parágrafo único renumerado|Renumerado)[^)]*\)/gi,"");
      s=s.replace(/\s*\((?:Revogad[ao])[^)]*\)/gi," (Revogado)");
      s=s.replace(/\s*\((?:VETADO|Vetado)[^)]*\)/g," (VETADO)");
    }
    s=s.replace(/\s+/g," ").trim();
    return s;
  }
  function isVadeArticleStartLine(line){
    return /^Art\.?\s*(\d+)(?:[º°o])?(?:-([A-Z]))?\s*(?:\.|-|–)?\s*(.*)$/i.test(String(line||"").trim());
  }
  function isVadeHierarchyLine(line){
    const s=String(line||"").trim();
    if(!s) return false;
    if(/^(PARTE|LIVRO|T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O)\b/i.test(s)) return true;
    if(/^(DAS?|DOS?)\s+/i.test(s) && s.length<110 && s===s.toUpperCase()) return true;
    return false;
  }
  function isVadeSubtitleCandidate(line){
    const s=String(line||"").trim();
    if(!s || s.length>115) return false;
    if(isVadeHierarchyLine(s)) return false;
    if(/^(Art\.?|Pena\s*-|Par[áa]grafo|§|[IVXLCDM]+\s*[-–]|[a-z]\)|I\s*[-–]|II\s*[-–]|III\s*[-–]|IV\s*[-–]|V\s*[-–]|VI\s*[-–]|VII\s*[-–]|VIII\s*[-–]|IX\s*[-–]|X\s*[-–])/i.test(s)) return false;
    if(/[.;:]$/.test(s)) return false;
    if(/\b(Pena|reclusão|detenção|multa|incorre|aumenta-se|reduzida|somente se procede|na mesma pena)\b/i.test(s)) return false;
    if((s.match(/,/g)||[]).length>=2) return false;
    return /[A-Za-zÀ-ÿ]/.test(s);
  }
  function isVadeArticleFullyRevoked(text){
    const raw=String(text||"").trim();
    if(!raw) return false;
    const compact=raw.replace(/\s+/g," ").trim();
    const after=compact.replace(/^Art\.?\s*\d+[º°oO\. ]*(?:-[A-Z])?\s*[–\-.]?\s*/i,"").trim();
    if(/^\(?\s*(Revogad[oa]|VETADO|Vetado|VETADA|VETADOS)\b[\s\S]{0,180}$/i.test(after)) return true;
    const lines=raw.split("\n").map(x=>x.trim()).filter(Boolean);
    const artIndex=lines.findIndex(x=>/^Art\.?\s*\d+/i.test(x));
    const firstArt=artIndex>=0?lines[artIndex]:(lines[0]||"");
    if(/\b(Revogad[oa]|VETADO|Vetado|VETADA)\b/i.test(firstArt)){
      const rest=lines.slice(Math.max(artIndex,0)+1).filter(x=>!isVadeHierarchyLine(x));
      const active=rest.filter(line=>{
        const stripped=line.replace(/^(§\s*\d+[º°oO]?|Parágrafo\s+único|[IVXLCDM]+\s*[–-]|[a-z]\))\s*/i,"").trim();
        return stripped && !/^\(?\s*(Revogad[oa]|VETADO|Vetado|VETADA)\b/i.test(stripped);
      });
      return active.length===0;
    }
    return false;
  }

  function repairArticleSubtitles(law){
    if(!law || !Array.isArray(law.articles)) return law;
    for(let i=0;i<law.articles.length-1;i++){
      const prev=law.articles[i], next=law.articles[i+1];
      let lines=String(prev.text||"").split("\n");
      const moved=[];
      while(lines.length){
        let j=lines.length-1;
        while(j>=0 && !String(lines[j]||"").trim()) j--;
        if(j<0) break;
        const last=String(lines[j]||"").trim();
        if(isVadeSubtitleCandidate(last) || isVadeHierarchyLine(last)){
          moved.unshift(last);
          lines=lines.slice(0,j);
          continue;
        }
        break;
      }
      if(moved.length){
        prev.text=lines.join("\n").trim();
        prev.revoked=/\b(Revogado|VETADO)\b/i.test(prev.text||"");
        const existing=String(next.heading||"");
        const add=moved.filter(x=>!existing.includes(x)).join(" • ");
        if(add) next.heading=add+(existing?" • "+existing:"");
      }
    }
    return law;
  }
  function parseImportedLawText(raw, options={}){
    const removeMeta = options.removeMeta!==false;
    let text=String(raw||"").replace(/\r/g,"\n").replace(/\u00a0/g," ");
    text=text.replace(/<[^>]+>/g," ");
    text=text.replace(/[ \t]+/g," ");
    const lines=text.split(/\n+/).map(x=>cleanLawLine(x,removeMeta)).filter(Boolean);
    const articles=[];
    let headingParts=[];
    let pendingTitle=[];
    let current=null;
    function flush(){
      if(!current) return;
      current.text=current.lines.join("\n").replace(/\n{3,}/g,"\n\n").trim();
      current.revoked=/\b(Revogado|VETADO)\b/i.test(current.text);
      delete current.lines;
      if(current.text) articles.push(current);
      current=null;
    }
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      const art=line.match(/^Art\.?\s*(\d+)(?:[º°o])?(?:-([A-Z]))?\s*(?:\.|-|–)?\s*(.*)$/i);
      const nextLine=lines[i+1]||"";
      const isHierarchy=isVadeHierarchyLine(line);
      const isSubtitle=isVadeSubtitleCandidate(line);
      if(art){
        flush();
        const num=art[1]+(art[2]?"-"+art[2]:"");
        const label=line.match(/^Art[^A-Za-z0-9]{0,3}\s*[^ ]+/i)?.[0] || `Art. ${num}`;
        const h=[...headingParts.slice(-3), ...pendingTitle].filter(Boolean).slice(-4).join(" • ");
        current={id:"art-"+num.toLowerCase(), n:label.replace(/\s+$/,""), heading:h, lines:[line]};
        pendingTitle=[];
        continue;
      }
      if(isHierarchy){
        flush();
        headingParts.push(line);
        headingParts=headingParts.slice(-5);
        pendingTitle=[];
        continue;
      }
      // Correção central: subtítulo imediatamente antes de novo Art. pertence ao artigo seguinte,
      // não ao artigo anterior. Ex.: "Lei penal no tempo" fica no Art. 2º.
      if(isSubtitle && isVadeArticleStartLine(nextLine)){
        pendingTitle.push(line);
        pendingTitle=pendingTitle.slice(-3);
        continue;
      }
      if(current){ current.lines.push(line); }
      else if(isSubtitle && !/^(O PRESIDENTE|DECRETA|Brasília|Rio de Janeiro|GET[ÚU]LIO|Art\.)/i.test(line)){
        pendingTitle.push(line); pendingTitle=pendingTitle.slice(-3);
      }
    }
    flush();
    const fakeLaw={articles};
    repairArticleSubtitles(fakeLaw);
    return fakeLaw.articles;
  }
  function loadCustomLaws(){
    try{return JSON.parse(localStorage.getItem(CUSTOM_LAWS_KEY)||"[]")||[]}catch(e){return []}
  }
  function saveCustomLaws(list){localStorage.setItem(CUSTOM_LAWS_KEY,JSON.stringify(list||[]));}
  function upsertCustomLaw(law, replace=true){
    law=repairArticleSubtitles(law);
    let list=loadCustomLaws().map(repairArticleSubtitles);
    if(replace){list=list.filter(x=>x.id!==law.id && norm(x.title)!==norm(law.title));}
    list.push(law); saveCustomLaws(list);
    const idx=vadeDB.findIndex(x=>x.id===law.id || norm(x.title)===norm(law.title));
    if(idx>=0) vadeDB[idx]=repairArticleSubtitles({...vadeDB[idx],...law,imported:true}); else vadeDB.push(repairArticleSubtitles({...law,imported:true}));
  }
  function openImportModal(){
    const law=lawById(st.activeLaw)||{};
    $("#vade-import-title").value = law.title && law.id!=="cf88" ? law.title : "";
    $("#vade-import-short").value = law.short && law.id!=="cf88" ? law.short : "";
    $("#vade-import-discipline").value = vadeGroupOrder.includes(law.discipline) ? (law.discipline || "Direito Penal") : "Legislação Especial";
    $("#vade-import-discipline-custom") && ($("#vade-import-discipline-custom").value = law.discipline && !vadeGroupOrder.includes(law.discipline) ? law.discipline : "");
    $("#vade-import-category").value = law.category || "penal";
    $("#vade-import-text").value="";
    $("#vade-import-preview").textContent="Cole a lei seca integral para o Setor X organizar artigo por artigo.";
    $("#vade-import-modal").hidden=false;
  }
  function closeImportModal(){ $("#vade-import-modal").hidden=true; }

  function sanitizeExportLaw(law){
    const clean=repairArticleSubtitles({...law});
    clean.articles=(clean.articles||[]).map(a=>({
      id:a.id,
      n:a.n,
      heading:a.heading||"",
      text:a.text||"",
      kind:a.kind||"",
      intro:!!a.intro,
      revoked:!!a.revoked
    }));
    return clean;
  }
  function downloadJSON(filename,payload){
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},600);
  }
  function exportVadeLawsPack(){
    // Exporta o VADE MECUM INTEIRO: leis nativas + leis importadas + leis criadas manualmente.
    // Não exporta progresso pessoal do aluno: grifos, comentários, lidos, revisão ou histórico.
    const custom=loadCustomLaws().map(sanitizeExportLaw);
    const nativeAndLoaded=vadeDB.map(sanitizeExportLaw);
    const byId=new Map();

    nativeAndLoaded.forEach(law=>{
      if(!law || !law.title || !Array.isArray(law.articles)) return;
      const key=law.id || lawSlug(law.title);
      byId.set(key,{...law, exportOrigin: law.imported ? "importada-ou-substituida" : "base-nativa"});
    });

    // Se existir lei personalizada com mesmo id/nome, ela sobrepõe a versão nativa no pacote.
    custom.forEach(law=>{
      if(!law || !law.title || !Array.isArray(law.articles)) return;
      const existingKey=[...byId.keys()].find(k=>k===law.id || norm(byId.get(k)?.title)===norm(law.title));
      const key=existingKey || law.id || lawSlug(law.title);
      byId.set(key,{...law, exportOrigin:"personalizada-local"});
    });

    const laws=[...byId.values()]
      .filter(l=>l && l.title && Array.isArray(l.articles))
      .sort((a,b)=>String(lawGroupName(a)).localeCompare(String(lawGroupName(b)),"pt-BR") || String(a.title).localeCompare(String(b.title),"pt-BR"));

    const byDiscipline=laws.reduce((acc,law)=>{
      const group=lawGroupName(law)||law.discipline||"Sem disciplina";
      acc[group]=acc[group]||{laws:0,articles:0};
      acc[group].laws += 1;
      acc[group].articles += law.articles?.length||0;
      return acc;
    },{});

    const payload={
      type:"setorx-vade-mecum-completo",
      version:"13.0",
      creator:"Matheus G.",
      exportedAt:new Date().toISOString(),
      instructions:"Envie este arquivo ao ChatGPT para gerar a versão final do Setor X com TODO o Vade Mecum embutido no código. Este pacote exporta todas as leis do Vade: nativas, importadas, substituídas e criadas manualmente. Não exporta progresso pessoal do aluno.",
      stats:{
        laws:laws.length,
        articles:laws.reduce((s,l)=>s+(l.articles?.length||0),0),
        disciplines:Object.keys(byDiscipline).length,
        byDiscipline
      },
      laws
    };
    const stamp=new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    downloadJSON(`setorx-vade-mecum-completo-${stamp}.json`,payload);
    toast(`Vade Mecum completo exportado: ${payload.stats.laws} lei(s), ${payload.stats.articles} artigo(s).`);
  }

function defaultState(){return{activeLaw:"cf88",vadeGroup:"Todos",showRevoked:false,statusFilter:"all",lawSearch:"",articleSearch:"",marks:{},comments:{},highlights:[]};}
  function load(){try{return {...defaultState(),...(JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{})};}catch{return defaultState();}}
  let st=load();
  function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(st)); renderAll();}
  function articleKey(lawId, artId){return `${lawId}::${artId}`;}
  function markFor(lawId, artId){const k=articleKey(lawId,artId); st.marks[k]=st.marks[k]||{read:false,review:false,updatedAt:""}; return st.marks[k];}
  function lawById(id){return vadeDB.find(l=>l.id===id)||vadeDB[0];}
  function getHighlights(lawId, artId){return st.highlights.filter(h=>h.lawId===lawId && (!artId || h.articleId===artId));}
  function updateMiniTimer(){
    const t=$("#vade-mini-time"), m=$("#vade-mini-mode");
    if(!t||!m) return;
    t.textContent=$("#timer-display")?.textContent||"--:--";
    m.textContent=$("#timer-mode")?.textContent||"timer ativo quando iniciado";
  }
  setInterval(updateMiniTimer,1000);

  function openVade(lawId){
    if(lawId) st.activeLaw=lawId;
    $("#vade-modal-root").hidden=false;
    document.body.classList.add("vade-open");
    renderAll();
    updateMiniTimer();
  }
  function closeVade(){ $("#vade-modal-root").hidden=true; document.body.classList.remove("vade-open");}
  function openHighlightPanel(){
    $("#vade-highlights-panel").hidden=false;
    renderHighlightsPanel();
  }
  function closeHighlightPanel(){ $("#vade-highlights-panel").hidden=true; }
  function openHighlightModal(lawId, articleId){
    const law=lawById(lawId), art=law.articles.find(a=>a.id===articleId);
    const selected=String(window.getSelection?.()||"").trim();
    $("#vade-highlight-law").value=lawId;
    $("#vade-highlight-article").value=articleId;
    $("#vade-highlight-title").textContent=`${law.short} • ${art.n}`;
    $("#vade-highlight-text").value=selected || art.text.slice(0,500);
    $("#vade-highlight-note").value="";
    $$(".vade-style-btn").forEach(b=>b.classList.remove("active"));
    $$(".vade-color-grid button").forEach(b=>b.classList.remove("active"));
    $("[data-vade-color='#fff3a3']")?.classList.add("active");
    $("#vade-highlight-modal").hidden=false;
  }
  function closeHighlightModal(){ $("#vade-highlight-modal").hidden=true; }

  function renderLauncher(){
    const totalArts=vadeDB.reduce((a,l)=>a+l.articles.length,0);
    $("#vade-kpi-laws") && ($("#vade-kpi-laws").textContent=vadeDB.length);
    $("#vade-kpi-articles") && ($("#vade-kpi-articles").textContent=totalArts);
    $("#vade-kpi-highlights") && ($("#vade-kpi-highlights").textContent=st.highlights.length);
    $("#vade-kpi-review") && ($("#vade-kpi-review").textContent=Object.values(st.marks).filter(m=>m.review).length);
    const grid=$("#vade-quick-grid"); if(!grid) return;
    const groups = allVadeGroups().filter(g=>g==="Todos" || vadeDB.some(l=>lawGroupName(l)===g));
    grid.innerHTML=groups.filter(g=>g!=="Todos").map(g=>{
      const laws=vadeDB.filter(l=>lawGroupName(l)===g);
      const first=laws[0]?.id||"cf88";
      const articles=laws.reduce((a,l)=>a+l.articles.length,0);
      return `<article class="vade-quick-card" data-vade-group="${esc(g)}" data-vade-open="${esc(first)}">
        <strong>${esc(g)}</strong><span>${laws.length} lei(s) cadastrada(s) • ${articles} item(ns) na carga atual</span><em>Abrir disciplina</em>
      </article>`;
    }).join("");
  }

  function renderLawList(){
    const box=$("#vade-law-list"); if(!box) return;
    const q=norm($("#vade-law-search")?.value ?? st.lawSearch);
    const groups=allVadeGroups().filter(g=>g==="Todos" || vadeDB.some(l=>lawGroupName(l)===g));
    let list=vadeDB.filter(l=>!q || norm(`${l.title} ${l.discipline} ${l.short} ${lawGroupName(l)}`).includes(q));
    if(st.vadeGroup && st.vadeGroup!=="Todos") list=list.filter(l=>lawGroupName(l)===st.vadeGroup);
    box.innerHTML=`<div class="vade-discipline-tabs">${groups.map(g=>`<button class="vade-discipline-tab ${g===st.vadeGroup?"active":""}" data-vade-group="${esc(g)}" type="button">${esc(g)} <span>${g==="Todos"?vadeDB.length:vadeDB.filter(l=>lawGroupName(l)===g).length}</span></button>`).join("")}</div>
      <div class="vade-law-items">${list.map(l=>`<button class="vade-law-item ${l.id===st.activeLaw?"active":""}" data-vade-law="${l.id}" type="button">
        <strong>${esc(l.title)}</strong><span>${esc(lawGroupName(l))}</span><em>${l.articles.length} item(ns)${l.imported?` • Lei seca importada`:""}</em>
      </button>`).join("") || `<div class="vade-empty-list">Nenhuma lei encontrada.</div>`}</div>`;
  }

  function filteredArticles(law){
    const q=norm($("#vade-article-search")?.value ?? st.articleSearch);
    const status=$("#vade-status-filter")?.value ?? st.statusFilter;
    const showRevoked=$("#vade-show-revoked")?.checked ?? st.showRevoked;
    return law.articles.filter(a=>{
      const m=markFor(law.id,a.id);
      const hasH=getHighlights(law.id,a.id).length>0;
      if(a.revoked && !showRevoked) return false;
      if(q && !norm(`${a.n} ${a.text}`).includes(q)) return false;
      if(status==="read" && !m.read) return false;
      if(status==="unread" && m.read) return false;
      if(status==="review" && !m.review) return false;
      if(status==="highlighted" && !hasH) return false;
      return true;
    });
  }

  
  function applyInlineHighlights(text, highlights){
    let html = esc(text);
    const sorted = (highlights||[]).slice().sort((a,b)=>String(b.text||"").length-String(a.text||"").length);
    sorted.forEach(h=>{
      const raw = String(h.text||"").trim();
      if(!raw) return;
      const escaped = esc(raw);
      const style = `background:${esc(h.color||"#fff3a3")}; color:#07111f; border-radius:5px; padding:1px 3px; ${h.bold?'font-weight:950;':''}${h.italic?'font-style:italic;':''}${h.underline?'text-decoration:underline;':''}`;
      const span = `<mark class="vade-inline-highlight" style="${style}" title="${esc(h.note||'Grifo salvo')}">${escaped}</mark>`;
      html = html.split(escaped).join(span);
    });
    return html;
  }
  function selectionInsideVadeArticle(){
    const sel = window.getSelection?.();
    if(!sel || !sel.rangeCount || !String(sel).trim()) return null;
    let node = sel.anchorNode;
    if(node && node.nodeType===3) node=node.parentElement;
    const article = node?.closest?.(".vade-article");
    const textBox = node?.closest?.(".vade-article-text");
    if(!article || !textBox) return null;
    return {article, text:String(sel).trim(), range:sel.getRangeAt(0)};
  }
  function hideVadeSelectionPop(){
    const old=document.getElementById("vade-selection-pop");
    if(old) old.remove();
  }
  function showVadeSelectionPop(){
    hideVadeSelectionPop();
    const data=selectionInsideVadeArticle();
    if(!data || data.text.length<2) return;
    const rect=data.range.getBoundingClientRect();
    const pop=document.createElement("button");
    pop.id="vade-selection-pop";
    pop.className="vade-selection-pop";
    pop.type="button";
    pop.innerHTML='<i class="fa-solid fa-highlighter"></i> Grifar seleção';
    pop.dataset.law=data.article.dataset.law;
    pop.dataset.art=data.article.dataset.art;
    pop.style.left=Math.min(window.innerWidth-170,Math.max(12,rect.left+window.scrollX))+"px";
    pop.style.top=Math.max(12,rect.top+window.scrollY-42)+"px";
    document.body.appendChild(pop);
  }
function renderArticles(){
    const law=lawById(st.activeLaw);
    const arts=filteredArticles(law);
    $("#vade-modal-title") && ($("#vade-modal-title").textContent=law.title);
    $("#vade-modal-subtitle") && ($("#vade-modal-subtitle").textContent=`${law.discipline} • ${law.source}`);
    $("#vade-breadcrumb") && ($("#vade-breadcrumb").textContent=`${law.discipline} / ${law.title}`);
    $("#vade-article-count") && ($("#vade-article-count").textContent=`${arts.length} item(ns) exibido(s) • ${law.articles.length} na carga atual`);
    const box=$("#vade-articles"); if(!box) return;
    box.innerHTML=arts.map(a=>{
      const m=markFor(law.id,a.id), hs=getHighlights(law.id,a.id), k=articleKey(law.id,a.id);
      const comment=st.comments[k]||"";
      const heading=a.heading?`<div class="vade-article-heading">${esc(a.heading)}</div>`:"";
      const isIntro=a.kind==="intro";
      return `<article class="vade-article ${a.revoked?"revoked":""} ${isIntro?"intro":""}" data-law="${law.id}" data-art="${a.id}">
        ${heading}
        <div class="vade-article-head">
          <div><strong>${esc(a.n)}</strong>${a.revoked?` <span>REVOGADO/VETADO</span>`:""}</div>
          <div class="vade-article-actions">
            <button class="vade-mini-btn ${m.read?"active":""}" data-vade-action="read" type="button"><i class="fa-solid fa-check"></i> Lido</button>
            <button class="vade-mini-btn ${m.review?"active":""}" data-vade-action="review" type="button"><i class="fa-solid fa-rotate"></i> Revisar</button>
            ${!isIntro?`<button class="vade-mini-btn" data-vade-action="highlight" type="button"><i class="fa-solid fa-highlighter"></i> Grifar</button>`:""}
          </div>
        </div>
        <div class="vade-article-text">${applyInlineHighlights(a.text||"",hs)}</div>
        <div class="vade-article-comments">
          <textarea rows="3" data-vade-comment="${esc(k)}" placeholder="Comentário pessoal do artigo, pegadinha da banca, jurisprudência correlata...">${esc(comment)}</textarea>
        </div>
      </article>`;
    }).join("") || `<article class="vade-article"><strong>Nenhum artigo encontrado</strong><div class="vade-article-text">Ajuste a busca, filtro ou habilite “Mostrar revogados”.</div></article>`;
  }

  function renderHighlightsPanel(){
    const box=$("#vade-highlights-list"); if(!box) return;
    if(!st.highlights.length){box.innerHTML=`<div class="vade-highlight-row"><strong>Nenhum grifo salvo</strong><small>Selecione um trecho dentro do artigo e clique em Grifar.</small></div>`; return;}
    box.innerHTML=st.highlights.slice().reverse().map(h=>{
      const law=lawById(h.lawId), art=law.articles.find(a=>a.id===h.articleId);
      return `<div class="vade-highlight-row">
        <strong>${esc(law.short)} • ${esc(art?.n||h.articleId)}</strong>
        <p style="background:${esc(h.color)};${h.bold?'font-weight:950;':''}${h.italic?'font-style:italic;':''}${h.underline?'text-decoration:underline;':''}">${esc(h.text)}</p>
        ${h.note?`<small>${esc(h.note)}</small>`:""}
      </div>`;
    }).join("");
  }

  function renderAll(){renderLauncher();renderLawList();renderArticles();renderHighlightsPanel();}

  document.addEventListener("click", e=>{
    const groupBtn=e.target.closest("[data-vade-group]");
    if(groupBtn){
      const group=groupBtn.dataset.vadeGroup;
      st.vadeGroup=group;
      const first=vadeDB.find(l=>group==="Todos" || lawGroupName(l)===group);
      if(first) st.activeLaw=first.id;
      renderAll();
      if(groupBtn.closest("#vade-quick-grid") || groupBtn.dataset.vadeOpen){
        openVade(st.activeLaw);
      }
      return;
    }
    const selPop=e.target.closest("#vade-selection-pop");
    if(selPop){ openHighlightModal(selPop.dataset.law,selPop.dataset.art); hideVadeSelectionPop(); return; }
    const open=e.target.closest("#open-vade-modal,#open-vade-from-laws,[data-vade-open]");
    if(open){ openVade(open.dataset.vadeOpen||st.activeLaw); return; }
    if(e.target.closest("#vade-open-import")){ openImportModal(); return; }
    if(e.target.closest("#vade-export-laws")){ exportVadeLawsPack(); return; }
    if(e.target.closest("#vade-import-close,[data-vade-import-close]")){ closeImportModal(); return; }
    if(e.target.closest("#open-vade-highlights,#open-vade-highlights-2,#vade-view-highlights")){ openHighlightPanel(); return; }
    if(e.target.closest("#vade-close,[data-vade-close]")){ closeVade(); return; }
    if(e.target.closest("#vade-highlight-close,[data-vade-highlight-close]")){ closeHighlightModal(); return; }
    if(e.target.closest("#vade-panel-close,[data-vade-panel-close]")){ closeHighlightPanel(); return; }
    const lawBtn=e.target.closest("[data-vade-law]");
    if(lawBtn){
      st.activeLaw=lawBtn.dataset.vadeLaw;
      renderAll();
      openVade(st.activeLaw);
      return;
    }
    const card=e.target.closest(".vade-article");
    const action=e.target.closest("[data-vade-action]");
    if(card&&action){
      const lawId=card.dataset.law, artId=card.dataset.art, m=markFor(lawId,artId), act=action.dataset.vadeAction;
      if(act==="read"){m.read=!m.read;m.updatedAt=new Date().toISOString();save();toast(m.read?"Artigo marcado como lido.":"Leitura removida.");}
      if(act==="review"){m.review=!m.review;m.updatedAt=new Date().toISOString();save();toast(m.review?"Artigo enviado para revisão.":"Revisão removida.");}
      if(act==="highlight"){openHighlightModal(lawId,artId);}
      return;
    }
    const style=e.target.closest("[data-vade-style]");
    if(style){style.classList.toggle("active"); return;}
    const color=e.target.closest("[data-vade-color]");
    if(color){$$(".vade-color-grid button").forEach(b=>b.classList.remove("active")); color.classList.add("active"); return;}
  });

  document.addEventListener("input", e=>{
    if(e.target.matches("#vade-law-search")){st.lawSearch=e.target.value;renderLawList();}
    if(e.target.matches("#vade-article-search")){st.articleSearch=e.target.value;renderArticles();}
    if(e.target.matches("#vade-import-text")){ const raw=e.target.value.trim(); const arts=parseImportedLawText(e.target.value,{removeMeta:$("#vade-import-hide-meta")?.checked!==false}); $("#vade-import-preview").textContent=raw?(arts.length?`${arts.length} artigo(s) detectado(s). Revogados/VETADOS: ${arts.filter(a=>a.revoked).length}.`:"Nenhum artigo detectado ainda."):"Texto vazio: será possível criar a lei vazia e alimentar depois."; }
  });
  document.addEventListener("change", e=>{
    if(e.target.matches("#vade-status-filter")){st.statusFilter=e.target.value;renderArticles();}
    if(e.target.matches("#vade-show-revoked")){st.showRevoked=e.target.checked;renderArticles();}
    if(e.target.matches("[data-vade-comment]")){st.comments[e.target.dataset.vadeComment]=e.target.value.trim(); localStorage.setItem(STORAGE_KEY,JSON.stringify(st)); toast("Comentário do artigo salvo.");}
  });

  $("#vade-import-form")?.addEventListener("submit", e=>{
    e.preventDefault();
    const title=$("#vade-import-title").value.trim();
    const short=$("#vade-import-short").value.trim() || title;
    const customDiscipline=$("#vade-import-discipline-custom")?.value.trim() || "";
    const discipline=customDiscipline || $("#vade-import-discipline").value;
    let category=$("#vade-import-category").value;
    if(customDiscipline && category==="especial") category="custom";
    const raw=$("#vade-import-text").value;
    const emptyMode=!!e.submitter?.dataset?.emptyLaw;
    let articles=raw.trim()?parseImportedLawText(raw,{removeMeta:$("#vade-import-hide-meta")?.checked!==false}):[];
    if(!title) return toast("Informe o nome da lei.");
    if(!articles.length){
      if(raw.trim() && !emptyMode) return toast("Nenhum artigo encontrado. Confira se o texto possui Art. 1º, Art. 2º...");
      articles=[{id:"lei-criada", n:"Lei criada", heading:"Cadastro manual", text:`${title}

Lei criada manualmente no Vade Mecum. Use Importar lei novamente com o mesmo nome e marque “Substituir lei com mesmo nome” para alimentar os artigos depois.`, intro:true, revoked:false}];
    }
    const law=repairArticleSubtitles({id:lawSlug(title),title,short,discipline,category,source:raw.trim()?"Importação manual — Setor X":"Lei criada manualmente — Setor X",loadStatus:raw.trim()?"lei-seca-manual":"lei-vazia-manual",imported:true,cleaned:true,articles});
    upsertCustomLaw(law,$("#vade-import-replace")?.checked!==false);
    st.vadeGroup=lawGroupName(law); st.activeLaw=law.id;
    closeImportModal(); save(); renderAll(); openVade(law.id); toast(raw.trim()?`${title}: ${articles.length} artigo(s) importado(s).`:`${title}: lei criada no Vade Mecum.`);
  });

  $("#vade-highlight-form")?.addEventListener("submit", e=>{
    e.preventDefault();
    const lawId=$("#vade-highlight-law").value, articleId=$("#vade-highlight-article").value;
    const color=$(".vade-color-grid button.active")?.dataset.vadeColor || "#fff3a3";
    const highlight={
      id:uid(),lawId,articleId,color,
      text:$("#vade-highlight-text").value.trim(),
      note:$("#vade-highlight-note").value.trim(),
      bold:$("[data-vade-style='bold']")?.classList.contains("active")||false,
      italic:$("[data-vade-style='italic']")?.classList.contains("active")||false,
      underline:$("[data-vade-style='underline']")?.classList.contains("active")||false,
      createdAt:new Date().toISOString()
    };
    if(!highlight.text) return toast("Selecione ou digite o trecho.");
    st.highlights.push(highlight);
    closeHighlightModal();
    save();
    toast("Grifo salvo no Vade Mecum.");
  });

  
  document.addEventListener("mouseup", e=>{
    if(e.target.closest("#vade-modal-root")) setTimeout(showVadeSelectionPop,90);
  });
  document.addEventListener("keyup", e=>{
    if(e.target.closest("#vade-modal-root")) setTimeout(showVadeSelectionPop,90);
  });
  document.addEventListener("scroll", hideVadeSelectionPop, true);

  document.addEventListener("mouseup", e=>{
    if(e.target.closest("#vade-modal-root")) setTimeout(showVadeSelectionPop,90);
  });
  document.addEventListener("keyup", e=>{
    if(e.target.closest("#vade-modal-root")) setTimeout(showVadeSelectionPop,90);
  });
  document.addEventListener("scroll", hideVadeSelectionPop, true);
window.SetorXVadeMecum={
    open:openVade,
    openActive:()=>openVade(st.activeLaw),
    openSelected:()=>openVade(st.activeLaw),
    db:vadeDB,
    state:()=>st,
    activeLaw:()=>st.activeLaw
  };
  renderAll();
})();
