/**
 * ENAMED MAP — configuração central da oferta (reconstrução V2).
 * Estrutura: Hero, Faixa de benefícios, Carrossel 1, Áreas organizadas,
 * Carrossel 2 (duas fileiras), Sistema de revisão, 6 bônus, Prova social,
 * Oferta + acesso, FAQ.
 * Campos marcados com "[INFORMAÇÃO NECESSÁRIA]" ainda não foram
 * confirmados — ver relatório de pendências enviado com a entrega.
 */

const OFFER = {

  meta: {
    productName: "ENAMED MAP",
    siteTitle: "ENAMED MAP — 125 Mapas de Decisão Clínica para o ENAMED",
    metaDescription: "125 mapas visuais de decisão clínica para revisar casos clássicos do ENAMED com mais rapidez e segurança."
  },

  checkoutUrl: "#checkout-premium-pendente",

  topbar: {
    enabled: true,
    icon: "🔥",
    label: "OFERTA ESPECIAL"
  },

  hero: {
    eyebrow: "Preparação para o ENAMED",
    headlineHtml: '<span class="hl">+125</span> mapas de decisão visual para você parar de travar nos casos clínicos do <span class="hl">ENAMED</span>',
    subheadlineHtml: 'Pense <span class="hero-sub-highlight">como um médico</span> diante de cada caso clínico e chegue à decisão certa <span class="hero-sub-highlight">com mais rapidez e segurança</span>.',
    updateBadge: { label: "MATERIAL ATUALIZADO • 07/2026", desc: "Alinhado à matriz vigente do ENAMED" },
    ctaLabel: "Quero acessar os mapas",
    microcopy: "Acesso imediato • Material digital • Garantia de 7 dias",
    checklist: [
      "125 mapas de decisão clínica",
      "Organização por especialidade médica",
      "6 bônus exclusivos no plano Premium",
      "Compra segura e acesso imediato"
    ],
    socialProofHtml: '<strong>+6.500 estudantes de medicina</strong> já usam os mapas'
  },

  trustBar: {
    items: [
      { icon: "devices", title: "Acesso em qualquer dispositivo", desc: "Estude pelo celular, tablet ou computador." },
      { icon: "printer", title: "Pronto para imprimir", desc: "Baixe as páginas e monte sua revisão física." },
      { icon: "brain", title: "Revisão mais visual", desc: "Fluxos e mapas para compreender com mais clareza." },
      { icon: "target", title: "Feito para o ENAMED", desc: "Conteúdo organizado para uma preparação direcionada." }
    ]
  },

  // Carrossel 1 — fileira única, amostras reais (Lote 03, mapas 21 a 30).
  amostras: {
    eyebrow: "Por dentro do material",
    titleHtml: 'Veja <span class="hl">amostras reais</span> do material',
    lead: "Arraste para o lado e confira algumas páginas por dentro.",
    items: [
      { title: "Hemorragia Digestiva Alta", category: "Gastroenterologia", image: "assets/img/maps/21_hemorragia_digestiva_alta.png" },
      { title: "Cirrose Hepática e Complicações", category: "Gastroenterologia", image: "assets/img/maps/22_cirrose_hepatica_e_complicacoes.png" },
      { title: "Pancreatite Aguda", category: "Gastroenterologia", image: "assets/img/maps/23_pancreatite_aguda.png" },
      { title: "Dor Abdominal Aguda", category: "Clínica Médica", image: "assets/img/maps/24_dor_abdominal_aguda.png" },
      { title: "Sepse e Choque Séptico", category: "Urgência e Emergência", image: "assets/img/maps/25_sepse_e_choque_septico.png" },
      { title: "Infecção do Trato Urinário", category: "Infectologia", image: "assets/img/maps/26_infeccao_do_trato_urinario.png" },
      { title: "Meningite Bacteriana", category: "Infectologia", image: "assets/img/maps/27_meningite_bacteriana.png" },
      { title: "Tuberculose", category: "Pneumologia", image: "assets/img/maps/28_tuberculose.png" },
      { title: "Acidente Vascular Cerebral", category: "Neurologia", image: "assets/img/maps/29_acidente_vascular_cerebral.png" },
      { title: "Crise Convulsiva / Status Epiléptico", category: "Neurologia", image: "assets/img/maps/30_crise_convulsiva_status_epilepticus.png" }
    ]
  },

  // Áreas organizadas — 8 especialidades confirmadas na referência (cards compactos).
  specialties: {
    eyebrow: "Organização por especialidade",
    titleHtml: '<span class="hl">125 mapas</span> organizados por especialidade',
    lead: "Tudo que você precisa, exatamente onde precisa.",
    items: [
      { name: "Clínica Médica", icon: "🩺" },
      { name: "Cardiologia", icon: "❤️" },
      { name: "Pneumologia", icon: "🫁" },
      { name: "Neurologia", icon: "🧠" },
      { name: "Pediatria", icon: "🧒" },
      { name: "Ginecologia e Obstetrícia", icon: "🤰" },
      { name: "Cirurgia", icon: "🔪" },
      { name: "Medicina Preventiva", icon: "🛡️" }
    ]
  },

  // Carrossel 2 — duas fileiras independentes (mesmos mapas reais, reagrupados por bloco temático).
  gallery2: {
    eyebrow: "Mais exemplos",
    titleHtml: 'Confira <span class="hl">mais casos</span> do material',
    rowA: {
      label: "Urgência e infecciosas",
      items: [
        { title: "Sepse e Choque Séptico", category: "Urgência e Emergência", image: "assets/img/maps/25_sepse_e_choque_septico.png" },
        { title: "Meningite Bacteriana", category: "Infectologia", image: "assets/img/maps/27_meningite_bacteriana.png" },
        { title: "Acidente Vascular Cerebral", category: "Neurologia", image: "assets/img/maps/29_acidente_vascular_cerebral.png" },
        { title: "Crise Convulsiva / Status Epiléptico", category: "Neurologia", image: "assets/img/maps/30_crise_convulsiva_status_epilepticus.png" }
      ]
    },
    rowB: {
      label: "Gastro e ambulatório",
      items: [
        { title: "Hemorragia Digestiva Alta", category: "Gastroenterologia", image: "assets/img/maps/21_hemorragia_digestiva_alta.png" },
        { title: "Cirrose Hepática e Complicações", category: "Gastroenterologia", image: "assets/img/maps/22_cirrose_hepatica_e_complicacoes.png" },
        { title: "Pancreatite Aguda", category: "Gastroenterologia", image: "assets/img/maps/23_pancreatite_aguda.png" },
        { title: "Infecção do Trato Urinário", category: "Infectologia", image: "assets/img/maps/26_infeccao_do_trato_urinario.png" }
      ]
    }
  },

  // Sistema de revisão — banner real (assets/img/sistema-visual-enamed-map.png),
  // já contém título, os 5 passos (Aprenda/Revise/Teste/Corrija/Memorize) e mockups.

  // Para quem é o material — dois perfis de público, identificação rápida.
  audienceFit: {
    eyebrow: "Para quem é",
    titleHtml: 'Para quem é o <span class="hl">material</span>',
    subtitle: "Feito para quem quer revisar melhor, ganhar tempo e chegar mais confiante na prova.",
    blocks: [
      {
        title: "Para quem vai prestar ENAMED ou residência",
        items: [
          "Estudantes de medicina que vão prestar o ENAMED",
          "Quem precisa revisar conteúdos clínicos com mais organização",
          "Quem quer focar nos temas mais importantes da preparação",
          "Quem busca uma revisão prática e direcionada"
        ]
      },
      {
        title: "Para quem aprende melhor de forma visual",
        items: [
          "Quem fixa melhor com mapas, fluxos e esquemas",
          "Quem quer economizar tempo durante a revisão",
          "Quem prefere um material objetivo e direto ao ponto",
          "Quem se perde em apostilas longas e conteúdos extensos"
        ]
      }
    ]
  },

  bonuses: {
    enabled: true,
    eyebrow: "Vai junto",
    titleHtml: '<span class="hl">6 bônus exclusivos</span> para turbinar sua preparação',
    lead: "Materiais complementares para organizar sua revisão, reforçar conteúdos estratégicos e chegar mais preparado ao ENAMED.",
    items: [
      { number: "01", name: "Mapas Visuais do SUS", description: "Princípios, diretrizes, níveis de atenção, políticas públicas e fluxos do SUS organizados de forma visual e objetiva.", icon: "sus", image: "assets/img/bonus/bonus_01_sus.png" },
      { number: "02", name: "Urgência e Emergência", description: "Protocolos, prioridades, condutas iniciais, sinais de gravidade e raciocínio rápido para os principais cenários de emergência.", icon: "urgencia", image: "assets/img/bonus/bonus_02_urgencia.png" },
      { number: "03", name: "Valores Laboratoriais Essenciais", description: "Valores de referência, alterações importantes e interpretação prática dos exames laboratoriais mais relevantes para a prova.", icon: "lab", image: "assets/img/bonus/bonus_03_lab.png" },
      { number: "04", name: "Cronograma de Revisão de 30 Dias", description: "Plano diário para organizar os estudos, distribuir os temas e revisar o conteúdo com constância até a prova.", icon: "cronograma", image: "assets/img/bonus/bonus_04_cronograma.png" },
      { number: "05", name: "Checklist Visual de Véspera", description: "Uma revisão final com pontos-chave, red flags, exames, condutas e temas que não podem ser esquecidos antes do ENAMED.", icon: "checklist", image: "assets/img/bonus/bonus_05_checklist.png" },
      { number: "06", name: "Flashcards Clínicos", description: "Perguntas e respostas rápidas para testar conhecimentos, reforçar a memória ativa e identificar assuntos que precisam ser revisados.", icon: "flashcards", image: "assets/img/bonus/bonus_06_flashcards.png" }
    ]
  },

  // [INFORMAÇÃO NECESSÁRIA] depoimentos reais — nomes e frases não estavam legíveis na referência.
  proof: {
    enabled: true,
    eyebrow: "Prova real",
    titleHtml: 'Estudantes que já <span class="hl">usam e recomendam</span>',
    items: [
      { name: "[INFORMAÇÃO NECESSÁRIA]", role: "Residente em Clínica Médica", quote: "[INFORMAÇÃO NECESSÁRIA: depoimento real]" },
      { name: "[INFORMAÇÃO NECESSÁRIA]", role: "Interno de Medicina", quote: "[INFORMAÇÃO NECESSÁRIA: depoimento real]" },
      { name: "[INFORMAÇÃO NECESSÁRIA]", role: "Aprovado no ENAMED", quote: "[INFORMAÇÃO NECESSÁRIA: depoimento real]" },
      { name: "[INFORMAÇÃO NECESSÁRIA]", role: "Acadêmico de Medicina", quote: "[INFORMAÇÃO NECESSÁRIA: depoimento real]" },
      { name: "[INFORMAÇÃO NECESSÁRIA]", role: "Residente de Pediatria", quote: "[INFORMAÇÃO NECESSÁRIA: depoimento real]" }
    ]
  },

  // [INFORMAÇÃO NECESSÁRIA] preços reais não estavam legíveis na referência.
  // ⚠️ NÃO PUBLICAR com os valores placeholder abaixo.
  pricing: {
    eyebrow: "Acesso vitalício e pagamento único",
    titleHtml: 'Escolha o <span class="hl">plano ideal</span> para sua jornada',
    basic: {
      planName: "Plano Essencial",
      price: "[INFORMAÇÃO NECESSÁRIA]",
      priceNote: "Pagamento único",
      ctaLabel: "Quero o Plano Essencial",
      includes: ["Mapas de decisão principais", "Organização por especialidade", "Acesso digital imediato"]
    },
    premium: {
      planName: "Plano Completo",
      ribbon: "Mais escolhido",
      price: "[INFORMAÇÃO NECESSÁRIA]",
      priceNote: "Pagamento único",
      ctaLabel: "Quero o Plano Completo",
      includes: ["Tudo do Plano Essencial", "6 bônus exclusivos", "Acesso vitalício", "125 mapas de decisão clínica"]
    },
    access: {
      titleHtml: '<span class="hl">Acesse de onde estiver</span> e estude do seu jeito',
      devices: [
        { icon: "📱", label: "Celular" },
        { icon: "📟", label: "Tablet" },
        { icon: "💻", label: "Computador" },
        { icon: "🖨️", label: "Impressão" }
      ]
    }
  },

  guarantee: {
    enabled: true,
    label: "GARANTIA 7 DIAS",
    titleHtml: '<span class="hl">Incondicional</span>',
    terms: "Você tem 7 dias para testar o material. Se não ficar satisfeito por qualquer motivo, devolvemos 100% do seu dinheiro."
  },

  // Passo a passo do acesso — jornada do aluno da compra ao início da revisão.
  accessSteps: {
    eyebrow: "Como funciona",
    titleHtml: 'Passo a passo do <span class="hl">acesso</span>',
    subtitle: "Da compra ao início da revisão em poucos minutos.",
    items: [
      { title: "Você escolhe seu plano", desc: "Selecione a opção ideal para sua preparação e finalize o pagamento com segurança." },
      { title: "Recebe o acesso rapidamente", desc: "Após a confirmação, o acesso é enviado em poucos minutos." },
      { title: "Abre em qualquer dispositivo", desc: "Acesse o material pelo celular, tablet ou computador, com praticidade." },
      { title: "Baixa ou imprime", desc: "Use os arquivos em alta resolução para estudar na tela ou imprimir quando quiser." },
      { title: "Revisa e aplica", desc: "Utilize os mapas visuais para revisar com mais clareza, organização e confiança." }
    ]
  },

  faq: {
    title: "Perguntas frequentes",
    items: [
      { question: "Como recebo o material após a compra?", answer: "O acesso é feito de forma totalmente digital. Após a confirmação do pagamento, você recebe um e-mail com as instruções de acesso." },
      { question: "Por quanto tempo tenho acesso?", answer: "O plano Completo garante acesso vitalício. As condições do plano Essencial estão descritas na página de compra." },
      { question: "Posso imprimir o material?", answer: "Sim, os arquivos são otimizados para impressão caso você prefira estudar no papel." },
      { question: "O material é atualizado?", answer: "Eventuais atualizações de conteúdo são disponibilizadas na própria área de acesso, quando existirem." },
      { question: "Em quais dispositivos posso acessar?", answer: "Celular, tablet ou computador — sem perda de qualidade." },
      { question: "Como funciona a garantia?", answer: "Você tem 7 dias após o acesso para avaliar o material e solicitar o cancelamento, conforme as regras da plataforma de pagamento." },
      { question: "Esse material substitui as aulas?", answer: "Não. É uma ferramenta visual de revisão e organização do raciocínio clínico — complementa livros, aulas e a orientação de professores." },
      { question: "É indicado para quais fases do curso?", answer: "É indicado para quem está se preparando para o ENAMED, incluindo o internato e a reta final do curso." }
    ]
  },

  finalCta: {
    titleHtml: 'Comece a organizar seu <span class="hl">raciocínio clínico</span> hoje',
    ctaLabel: "Quero acessar os mapas"
  },

  legalNotice: "O ENAMED MAP é um material educacional e de apoio à revisão. Não substitui orientação médica, protocolos oficiais, livros ou professores.",

  footer: {
    companyName: "[INFORMAÇÃO NECESSÁRIA]",
    email: "[INFORMAÇÃO NECESSÁRIA]"
  }
};
