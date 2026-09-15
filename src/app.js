"use strict";

/* ============================================================================
   DEVANEIO — ficha do Ascendido, revisão 0.73

   Um arquivo, nenhum servidor, nenhuma dependência. As fichas moram no
   navegador de quem abre a página. O catálogo do livro entra aqui como DADOS,
   extraído do PDF por extrai_dados.js, e nada neste script edita catálogo:
   o livro é leitura, a ficha é escrita.
   ============================================================================ */

/* ------------------------------------------------------------ 1. o sistema */

const ATRIBUTOS = [
  { chave: "corpo",      rot: "Corpo",      sigla: "COR" },
  { chave: "raciocinio", rot: "Raciocínio", sigla: "RAC" },
  { chave: "espirito",   rot: "Espírito",   sigla: "ESP" },
  { chave: "influencia", rot: "Influência", sigla: "INF" },
];

/* O valor não é um bônus: é o tamanho do dado que vai para a mesa. */
const DADO_ATRIBUTO = ["—", "1D6", "1D8", "1D10", "1D12", "1D20"];
const DADO_PERICIA  = ["—", "1D6", "1D8", "1D10", "1D12"];

/* Quinze, e só estas quinze. Elas não pertencem a atributo nenhum: a fórmula
   é 1D do Atributo Chave mais 1D da Perícia Chave, e qual é o Atributo Chave
   quem decide é a cena. O livro passa metade do Capítulo 4 trocando um pelo
   outro — Intimidação por Corpo, Percepção por Fortitude, Lógica por
   Movimentação. Amarrar perícia a atributo na ficha ensinaria errado.
   Em ordem alfabética, porque a lista é para procurar. */
const TODAS_PERICIAS = [
  "Atletismo", "Briga", "Conhecimento", "Destreza", "Domínio",
  "Fortitude", "Intimidação", "Lábia", "Lógica", "Manipulação",
  "Movimentação", "Percepção", "Performance", "Pontaria", "Propósito",
];

/* Duas coisas dependem da Linhagem: quanto o corpo aguenta, e quanta alma cabe. */
const LINHAGENS = {
  "Angelical": { vit: 8,  limiar: 10, traco: "Nada embaixo. O Narrador determina a consequência livremente. Mais espaço e menos proteção." },
  "Dracônico": { vit: 12, limiar: 8,  traco: "O sangue se impõe. Transformação física visível e permanente. Nunca possessão, nunca colapso." },
  "Lunar":     { vit: 6,  limiar: 12, traco: "A Deusa visita. Mudança de comportamento e consciência, uma presença falando através de você. Nunca transformação física." },
  "Maldito":   { vit: 4,  limiar: 14, traco: "A imitação cai. Somem os reflexos que fazem uma pessoa ler como pessoa. Ninguém aponta o que mudou, e ninguém fica." },
  "Bestial":   { vit: 10, limiar: 6,  traco: "A fera assume. O instinto toma as rédeas por uma cena inteira: ataca o que ameaça, foge do que teme, ignora nuance." },
};

const VITALIDADE = [
  { n: 5, nome: "Saudável",          pen: "Nenhuma" },
  { n: 4, nome: "Machucado",         pen: "Nenhuma" },
  { n: 3, nome: "Ferido",            pen: "−1 Face em todos os testes", risco: true },
  { n: 2, nome: "Gravemente Ferido", pen: "−1 Face em tudo, e você não pode reagir", risco: true },
  { n: 1, nome: "Inconsciente",      pen: "Não pode agir", risco: true },
  { n: 0, nome: "Morto",             pen: "Fora da mesa. Não existe repouso que reverta.", risco: true },
];

const ASCENSAO = [
  { nome: "Vislumbre",  cap: 8,  tetoAtr: 3, tetoEsp: 2, vinculo: "Baixo", xp: 0,  ancora: 0, labirinto: "—",           lab: 0 },
  { nome: "Despertar",  cap: 12, tetoAtr: 4, tetoEsp: 3, vinculo: "Médio", xp: 6,  ancora: 1, labirinto: "Instável",    lab: 1 },
  { nome: "Despertado", cap: 16, tetoAtr: 4, tetoEsp: 3, vinculo: "Médio", xp: 12, ancora: 1, labirinto: "Firmado",     lab: 2 },
  { nome: "Aclarado",   cap: 22, tetoAtr: 4, tetoEsp: 4, vinculo: "Alto",  xp: 24, ancora: 1, labirinto: "Consolidado", lab: 3 },
  { nome: "Iluminado",  cap: 30, tetoAtr: 5, tetoEsp: 4, vinculo: "Alto",  xp: 36, ancora: 0, labirinto: "Absoluto",    lab: 4 },
];
const NOMES_ASCENSAO = ASCENSAO.map(a => a.nome);

/* Grau não se compra. É o XP que entrou enquanto aquele Arquétipo estava
   aceso. Ímpar abre prateleira, par engorda o corpo. */
const GRAU_XP = [0, 24, 52, 84, 120, 160, 204, 252];
const PATAMAR_DO_GRAU = { 1: "I", 3: "II", 5: "III", 7: "IV" };

const VINCULOS = {
  "Baixo": { xp: 2, assentada: 1, nd: "sem ND",  retem: "1 só em Terrível" },
  "Médio": { xp: 4, assentada: 2, nd: "ND 2",    retem: "0 passando · 1 falhando · 2 em Terrível" },
  "Alto":  { xp: 8, assentada: 3, nd: "ND 3",    retem: "0 passando · 2 falhando · 3 em Terrível" },
};

const PILARES = {
  "Origem":      { semblante: "Dama",     verbo: "Cria. Protege. Perpetua.",        desfaz: "Tormento",    desfeito: "Extinção" },
  "Extinção":    { semblante: "Corvino",  verbo: "Ceifa. Encerra. Aceita.",         desfaz: "Origem",      desfeito: "Pesadelo" },
  "Controle":    { semblante: "Bauto",    verbo: "Organiza. Delimita. Arbitra.",    desfaz: "Pesadelo",    desfeito: "Causalidade" },
  "Pesadelo":    { semblante: "Volto",    verbo: "Imagina. Perturba. Inspira.",     desfaz: "Extinção",    desfeito: "Controle" },
  "Tormento":    { semblante: "Coviello", verbo: "Sente demais. Destrói. Arde.",    desfaz: "Causalidade", desfeito: "Origem" },
  "Causalidade": { semblante: "Togata",   verbo: "Joga. Improvisa. Desafia.",       desfaz: "Controle",    desfeito: "Tormento" },
};
const NOMES_PILARES = Object.keys(PILARES);

/* Trocar a Afiliação reimprime o dossiê inteiro: papel, tinta, trama, selo,
   carimbo e as palavras do cabeçalho. A gráfica vive no CSS; aqui ficam
   só as palavras e o desenho do selo. */
const AFILIACOES = {
  "O Olho": {
    linha: "Departamento de assuntos que não aconteceram · Tessera",
    carimbo: "ARQUIVADO",
    catalogo: "Catálogo geral. Não privilegia Pilar nenhum.",
    nota: "Você é responsabilidade deles. Isso já foi anotado em algum lugar.",
    selo: '<circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 50c14-20 28-30 42-30s28 10 42 30c-14 20-28 30-42 30S22 70 8 50z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="13" fill="currentColor"/><circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="1"/>',
  },
  "A Penumbra": {
    linha: "Abrigo sem nome · por baixo da cidade",
    carimbo: "SEM REGISTRO",
    catalogo: "Trabalha com Pesadelo.",
    nota: "Ninguém aqui assinou nada. Todo mundo aqui deve alguma coisa.",
    selo: '<path d="M14 74 L22 30 L36 50 L50 22 L64 50 L78 30 L86 74 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 80h72" stroke="currentColor" stroke-width="4"/><path d="M30 44 L44 66 M56 66 L70 44" stroke="currentColor" stroke-width="1"/>',
  },
  "Os Acorrentados": {
    linha: "Ordem do Elo · casa da Archimãe",
    carimbo: "EM ORAÇÃO",
    catalogo: "Trabalha com Tormento.",
    nota: "Coviello atende. A dúvida nunca foi essa.",
    selo: '<path d="M50 6c18 20 26 30 26 44S64 94 50 94 24 64 24 50 32 26 50 6z" fill="none" stroke="currentColor" stroke-width="2"/><rect x="41" y="30" width="18" height="26" rx="9" fill="none" stroke="currentColor" stroke-width="3"/><rect x="41" y="48" width="18" height="26" rx="9" fill="none" stroke="currentColor" stroke-width="3"/>',
  },
  "Guardiões da Árvore": {
    linha: "Custódia dos brotos · raiz maior",
    carimbo: "EM CUSTÓDIA",
    catalogo: "Trabalha com Origem.",
    nota: "São gentis. São também os únicos que sabem podar.",
    selo: '<path d="M50 92V34" stroke="currentColor" stroke-width="3"/><path d="M50 40c-16-2-26-14-26-26 14-2 24 6 26 16 2-10 12-18 26-16 0 12-10 24-26 26z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M50 62c-12 0-20-8-22-16 10-2 20 4 22 12 2-8 12-14 22-12-2 8-10 16-22 16z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M34 92h32" stroke="currentColor" stroke-width="2"/>',
  },
  "O Coletivo do Eco": {
    linha: "Edição extra · tiragem que ninguém autorizou",
    carimbo: "ÚLTIMA HORA",
    catalogo: "Catálogo geral.",
    nota: "Se der errado sai na capa. Se der certo, também.",
    selo: '<path d="M18 38v24h14l26 18V20L32 38z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M68 34c8 8 8 24 0 32M78 26c14 14 14 34 0 48" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  "A Frente": {
    linha: "Destacamento operacional · antiga doutrina de Orian",
    carimbo: "AUTORIZADO",
    catalogo: "Currículo tático do exército de Orian.",
    nota: "Já foram a lei. Hoje são só o método.",
    selo: '<path d="M50 6 88 20v34c0 22-16 34-38 40C28 88 12 76 12 54V20z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 36h56M22 52h56M22 68h44" stroke="currentColor" stroke-width="3"/><path d="M46 28h8v48h-8z" fill="none" stroke="currentColor" stroke-width="1"/>',
  },
  "Mysteria": {
    linha: "TERMINAL MYS://ELINIA — SESSÃO ABERTA",
    carimbo: "[ OK ]",
    catalogo: "Trabalha com Causalidade, Controle e Pesadelo.",
    nota: "> a resposta chega. o formato dela é problema seu_",
    selo: '<path d="M14 22h72v56H14z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M26 40h14v8H26zM48 40h26v3H48zM26 56h34v3H26z" fill="currentColor"/><path d="M14 30h72M38 78v8h24v-8" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  },
  "Sociedade dos Ceifadores": {
    linha: "Ofício da Passagem · registro de cinzas",
    carimbo: "EM LUTO",
    catalogo: "Trabalha com Extinção e Origem.",
    nota: "Cobram caro, e sabem exatamente de quem.",
    selo: '<path d="M22 84c0-34 16-58 46-72-4 16-2 26 6 32-18 4-26 16-28 28-8-2-16 4-24 12z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M34 70c8-18 20-32 34-42M30 78c10-22 24-38 40-50" stroke="currentColor" stroke-width="1"/>',
  },
  "Avulso": {
    linha: "Sem pasta. Sem base. Sem ninguém.",
    carimbo: "AVULSO",
    riscado: true,
    catalogo: "Nenhum. O que tiver, comprou em Moex.",
    nota: "A liberdade é real. O custo dela também.",
    selo: '<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 80 80 20" stroke="currentColor" stroke-width="4"/>',
  },
};
const NOMES_AFILIACOES = Object.keys(AFILIACOES);

const CULTURAS = ["Calem", "Louina", "Hon Ye", "Orian", "Veina", "Mendro",
  "Alta Velana", "Sila", "Moex", "Terras que nunca aceitaram a divisão"];
const PATRIMONIOS = ["Devedor", "Quebrado", "Comum", "Confortável", "Herdeiro"];
const SLOTS = [
  { chave: "maos",    rot: "Mãos",    nota: "ao alcance" },
  { chave: "cintura", rot: "Cintura", nota: "ao alcance" },
  { chave: "bolsos",  rot: "Bolsos",  nota: "ao alcance" },
  { chave: "costas",  rot: "Costas",  nota: "Ação Padrão", longa: "Exige uma Ação Padrão para sacar" },
];
const MARCAS = {
  corpo:  { rot: "Corpo Endurecido", nota: "+1 Ponto de Vitalidade por nível" },
  cordao: { rot: "Cordão Alargado",  nota: "+1 de Limiar" },
};

/* As quatro que nunca puderam ser catalogadas. Todo Ascendido as conhece
   assim que o terceiro olho abre, sem ninguém ensinar. */
const CORRENTES_UNIVERSAIS = [
  "Canalização Positiva", "Canalização Negativa", "Selo Menor", "Estancar",
];

/* -------------------------------------------------------- 2. o que se grava */

const LS_FICHAS  = "devaneio:fichas:v2";
const LS_ANTIGO  = "devaneio:fichas:v1";
const LS_BACKUP  = "devaneio:fichas:backup";
const LS_ARRANJO = "devaneio:arranjo";
const LS_GAVETA  = "devaneio:gaveta";

let db = { fichas: [], ativa: null, lixeira: [] };

const uid = () => "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const num = (v, min, max, pad) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return pad;
  return Math.min(max, Math.max(min, Math.round(n)));
};

function fichaEmBranco() {
  const pericias = {};
  TODAS_PERICIAS.forEach(p => { pericias[p] = 0; });
  return {
    id: uid(),
    nome: "", jogador: "",
    linhagem: "Angelical",
    cultura: "", patrimonio: "Comum", estre: "",
    antecedente: "", conhecimento: "",
    afiliacao: "O Olho",
    pilar: "Origem",
    ascensao: "Vislumbre",
    arquetipo: "",
    attrs: { corpo: 1, raciocinio: 1, espirito: 1, influencia: 1 },
    pericias,                     /* só o que foi comprado */
    concessoes: { cultura: "", antecedente: "" },
    culturaLivre: false,
    vitNivel: 5, vitPontos: 8,
    corrRecente: 0, corrAssentada: 0,
    graus: {},                    /* arquétipo → {xp, marcas:[]} */
    talentos: [],                 /* {nome, fonte, patamar, xp, carga, modo, efeito, ativo} */
    correntes: [
      { origem: "Cultura",     nome: "", efeito: "" },
      { origem: "Antecedente", nome: "", efeito: "" },
      { origem: "Pilar",       nome: "", efeito: "" },
    ],
    cifras: [],                   /* {nome, pilar, vinculo, tipo, sigilos, gatilho, efeito} */
    labTracos: [], labNota: "",
    recolhidos: [],               /* painéis que este personagem não precisa ver */
    ancoras: [
      { nome: "", acredita: "", faria: "", queimada: false },
      { nome: "", acredita: "", faria: "", queimada: false },
    ],
    contatos: 0,
    confiancaTeto: 0, confiancaReserva: 0, acessos: 0,
    divida: "", dividaSegunda: "", indicacoes: "",
    ressonancia: 0, bencaos: [],
    equip: { maos: "", cintura: "", bolsos: "", costas: "" },
    xpTotal: 0, xpOutros: 0,
    notas: "",
  };
}

/* Toda ficha que entra — do armazenamento, de um arquivo ou de uma versão
   anterior — passa por aqui. Campo que falta derruba a tela inteira na hora
   de desenhar, e quem está do outro lado lê isso como "perdi tudo". */
function normaliza(bruta) {
  const base = fichaEmBranco();
  if (!bruta || typeof bruta !== "object") return base;
  const f = Object.assign(base, bruta);

  /* Object.assign não distingue "o campo não veio" de "o campo veio igual ao
     padrão", e todo padrão aqui é 0 ou "". Sem ler do bruto pelo nome antigo,
     a ficha da revisão anterior abria zerada e parecendo intacta — que é o
     pior jeito de perder dado. */
  const antigo = (...nomes) => {
    for (const n of nomes) if (bruta[n] != null && bruta[n] !== "") return bruta[n];
    return undefined;
  };

  f.id = typeof bruta.id === "string" && bruta.id ? bruta.id : uid();
  f.nome = String(f.nome || "");
  f.linhagem = LINHAGENS[String(f.linhagem).replace(/\s*\(padrão\)/, "")] ? String(f.linhagem).replace(/\s*\(padrão\)/, "") : "Angelical";
  f.afiliacao = AFILIACOES[f.afiliacao] ? f.afiliacao : (f.afiliacao === "O Coletivo" ? "O Coletivo do Eco" : "O Olho");
  const pilarBruto = antigo("pilar", "selo");
  f.pilar = PILARES[pilarBruto] ? pilarBruto : "Origem";
  f.ascensao = NOMES_ASCENSAO.includes(f.ascensao) ? f.ascensao : "Vislumbre";
  f.patrimonio = PATRIMONIOS.includes(f.patrimonio) ? f.patrimonio : "Comum";
  f.arquetipo = DADOS.arquetipos.some(a => a.nome === f.arquetipo) ? f.arquetipo : "";

  const at = Object.assign({}, base.attrs, bruta.attrs || {});
  f.attrs = {};
  ATRIBUTOS.forEach(a => { f.attrs[a.chave] = num(at[a.chave], 1, 5, 1); });

  /* A revisão anterior tinha vinte perícias em outros quatro grupos. O que
     sobreviveu à 0.73 é recuperado pelo nome; Resistência virou Fortitude. */
  const velhas = Object.assign({}, bruta.skills || {}, bruta.pericias || {});
  if (velhas["Resistência"] != null && velhas["Fortitude"] == null) velhas["Fortitude"] = velhas["Resistência"];
  f.pericias = {};
  TODAS_PERICIAS.forEach(p => { f.pericias[p] = num(velhas[p], 0, 4, 0); });

  const conc = (f.concessoes && typeof f.concessoes === "object") ? f.concessoes : {};
  f.concessoes = {
    cultura: TODAS_PERICIAS.includes(conc.cultura) ? conc.cultura : "",
    antecedente: TODAS_PERICIAS.includes(conc.antecedente) ? conc.antecedente : "",
  };
  f.culturaLivre = !!f.culturaLivre;
  /* ficha antiga já trazia Antecedente escolhido, mas nenhuma concessão */
  if (!f.concessoes.antecedente && f.antecedente) {
    const ant = DADOS.antecedentes.find(x => x.nome === f.antecedente);
    if (ant && TODAS_PERICIAS.includes(ant.pericia)) f.concessoes.antecedente = ant.pericia;
  }

  f.vitNivel = num(antigo("vitNivel", "vitLvl"), 0, 5, 5);
  f.vitPontos = num(antigo("vitPontos", "vitPts"), 0, 99, LINHAGENS[f.linhagem].vit);
  f.corrRecente = num(f.corrRecente, 0, 99, 0);
  f.corrAssentada = num(f.corrAssentada, 0, 99, 0);

  f.graus = (f.graus && typeof f.graus === "object") ? f.graus : {};
  Object.keys(f.graus).forEach(k => {
    const g = f.graus[k] || {};
    f.graus[k] = { xp: num(g.xp, 0, 9999, 0), marcas: Array.isArray(g.marcas) ? g.marcas.slice(0, 4) : [] };
  });

  f.talentos = (Array.isArray(f.talentos) ? f.talentos : []).map(t => ({
    nome: String(t.nome || ""), fonte: String(t.fonte || "Geral"),
    patamar: String(t.patamar || "I"), xp: num(t.xp, 0, 99, 2),
    carga: num(t.carga, 0, 9, 0), modo: t.modo === "Passivo" ? "Passivo" : "Ativo",
    efeito: String(t.efeito || ""), ativo: !!t.ativo,
  })).filter(t => t.nome);

  f.correntes = (Array.isArray(f.correntes) ? f.correntes : base.correntes)
    .map(c => ({ origem: String(c.origem || ""), nome: String(c.nome || ""), efeito: String(c.efeito || "") }));
  while (f.correntes.length < 3) f.correntes.push({ origem: "", nome: "", efeito: "" });

  f.cifras = (Array.isArray(f.cifras) ? f.cifras : []).map(c => ({
    nome: String(c.nome || ""),
    pilar: PILARES[c.pilar] ? c.pilar : (PILARES[c.selo] ? c.selo : "Origem"),
    vinculo: VINCULOS[c.vinculo] ? c.vinculo : "Baixo",
    tipo: String(c.tipo || ""),
    sigilos: Array.isArray(c.sigilos) ? c.sigilos : String(c.gestos || c.sigilos || "").split(/\s*\+\s*|\s+e\s+/).filter(Boolean),
    gatilho: String(c.gatilho || ""), efeito: String(c.efeito || ""),
  })).filter(c => c.nome);

  f.labTracos = (Array.isArray(f.labTracos) ? f.labTracos : []).filter(t => typeof t === "string");
  f.recolhidos = (Array.isArray(f.recolhidos) ? f.recolhidos : []).filter(t => typeof t === "string");
  f.ancoras = (Array.isArray(f.ancoras) ? f.ancoras : base.ancoras).map(a => ({
    nome: String(a.nome || ""),
    acredita: String(a.acredita != null ? a.acredita : (a.cre || "")),
    faria: String(a.faria || ""),
    queimada: !!a.queimada,
  }));
  while (f.ancoras.length < 2) f.ancoras.push({ nome: "", acredita: "", faria: "", queimada: false });

  f.contatos = num(f.contatos, 0, 99, 0);
  f.confiancaTeto = num(f.confiancaTeto, 0, 20, 0);
  f.confiancaReserva = num(f.confiancaReserva, 0, 20, 0);
  f.acessos = num(f.acessos, 0, 99, 0);
  f.ressonancia = num(f.ressonancia, 0, 3, 0);
  f.bencaos = (Array.isArray(f.bencaos) ? f.bencaos : []).map(b => ({
    nome: String(b.nome || ""), pilar: String(b.pilar || ""), efeito: String(b.efeito || ""),
  })).filter(b => b.nome);

  const eq = Object.assign({}, base.equip, f.equip || {});
  f.equip = {}; SLOTS.forEach(s => { f.equip[s.chave] = String(eq[s.chave] || ""); });
  if (!f.equip.bolsos && Array.isArray(bruta.inventario) && bruta.inventario.length) {
    f.equip.bolsos = bruta.inventario.map(i => (typeof i === "string" ? i : i && i.nome) || "").filter(Boolean).join(", ");
  }

  f.xpTotal = num(antigo("xpTotal", "xp"), 0, 99999, 0);
  f.xpOutros = num(f.xpOutros, 0, 99999, 0);
  f.notas = String(f.notas || "");
  f.divida = String(f.divida || "");
  f.dividaSegunda = String(antigo("dividaSegunda", "dividaLinhas") || "");
  return f;
}

/* ------------------------------------------------------------ 3. derivados */

const fichaAtiva = () => db.fichas.find(f => f.id === db.ativa) || db.fichas[0] || null;

const arquetipoDe = f => DADOS.arquetipos.find(a => a.nome === f.arquetipo) || null;
const grauDe = f => f.graus[f.arquetipo] || { xp: 0, marcas: [] };

function nivelGrau(xpAcumulado) {
  let g = 1;
  for (let i = 0; i < GRAU_XP.length; i++) if (xpAcumulado >= GRAU_XP[i]) g = i + 1;
  return g;
}
const proximoGrau = xp => {
  const g = nivelGrau(xp);
  return g >= 8 ? null : { grau: g + 1, falta: GRAU_XP[g] - xp, em: GRAU_XP[g] };
};

/* As Marcas pertencem ao Arquétipo que as ganhou. Um corpo se desacostuma. */
const marcasDe = f => (grauDe(f).marcas || []).slice(0, Math.floor(nivelGrau(grauDe(f).xp) / 2));
const contaMarca = (f, tipo) => marcasDe(f).filter(m => m === tipo).length;

const vitMax   = f => LINHAGENS[f.linhagem].vit + contaMarca(f, "corpo");
const vitPontosDe = f => Math.min(Math.max(0, f.vitPontos), vitMax(f));
const limiarDe = f => LINHAGENS[f.linhagem].limiar + contaMarca(f, "cordao");

/* Cultura e Antecedente concedem um nível de perícia cada. O nível gratuito
   não é comprado e não pode ser gasto: ele mora na fonte, e some junto com
   ela quando o jogador troca de Antecedente. Por isso f.pericias guarda só
   o que foi comprado, e quem soma é aqui. */
const FONTES_CONCESSAO = [
  { chave: "cultura", rot: "Cultura" },
  { chave: "antecedente", rot: "Antecedente" },
];
const concedidoEm = (f, pericia) =>
  FONTES_CONCESSAO.filter(x => f.concessoes[x.chave] === pericia).length;

/* "Não fura o teto": o nível gratuito soma e para no teto do estágio. */
function periciaTotal(f, pericia) {
  const teto = estagioDe(f).tetoEsp;
  return Math.min(teto, (f.pericias[pericia] || 0) + concedidoEm(f, pericia));
}
/* Caiu numa perícia que você já treinou? O livro diz que não se perde: vira
   ponto livre, e quem realoca é o jogador. A ficha só avisa que ele existe. */
function pontosLivres(f) {
  const teto = estagioDe(f).tetoEsp;
  const vistas = new Set(FONTES_CONCESSAO.map(x => f.concessoes[x.chave]).filter(Boolean));
  let sobra = 0;
  vistas.forEach(p => {
    sobra += Math.max(0, (f.pericias[p] || 0) + concedidoEm(f, p) - teto);
  });
  return sobra;
}

const estagioDe   = f => ASCENSAO.find(a => a.nome === f.ascensao) || ASCENSAO[0];
const capacidadeDe = f => estagioDe(f).cap;

const talentosAcesos = f => f.talentos.filter(t => t.ativo);
const pesoAceso = f => talentosAcesos(f).reduce((s, t) => s + (t.xp || 0), 0);
const cargaAcesa = f => talentosAcesos(f).reduce((s, t) => s + (t.carga || 0), 0);

const corrTotal = f => f.corrRecente + f.corrAssentada + cargaAcesa(f);

function estadoCorrupcao(f) {
  const t = corrTotal(f), l = limiarDe(f);
  if (t <= 0) return { nome: "Limpo", efeito: "Nada instalado. Aproveite, porque não dura.", grave: false };
  if (t >= l) return { nome: "No Limiar", grave: true, efeito: "O Narrador determina a consequência definitiva, conforme a sua Linhagem. Você não escolhe." };
  if (t > l * 2 / 3) return { nome: "Corrompido", grave: true, efeito: "Sinais físicos graves. −1 Face em testes de Espírito, e o Narrador pode exigir testes para você manter controle." };
  if (t > l / 3) return { nome: "Distorcido", grave: false, efeito: "−1 Face em testes de Influência. Aberrações são atraídas por você." };
  return { nome: "Marcado", grave: false, efeito: "Aberrações te detectam com mais facilidade. Percepções começam a mudar." };
}

/* A Prontidão decide apenas quem começa. Depois disso ela não faz mais nada. */
function prontidaoDe(f) {
  const a = arquetipoDe(f);
  const base = a ? (f.attrs[a.atributo] || 0) : 0;
  return base + periciaTotal(f, "Movimentação");
}

/* Alfabetização não mede poder. Mede acesso à língua, e sai de Domínio. */
function alfabetizacaoDe(f) {
  const d = periciaTotal(f, "Domínio");
  if (d >= 3 && f.ressonancia >= 1) return { nome: "Escritor", nota: "Compõe sequências novas. Especialização 3 em Domínio e Ressonância 1 — e um Semblante que ratifique, porque sem interlocutor você escreveu uma carta e não endereçou." };
  if (d >= 2) return { nome: "Leitor", nota: "Identifica Sigilos, Vínculo e Pilar de qualquer Cifra sinalizada à vista, sem teste, desde que consiga ver as mãos. Aprende Catalogada em metade do tempo narrativo." };
  return { nome: "Falante", nota: "Executa o que aprendeu, com competência real e nenhuma teoria por baixo. É a esmagadora maioria de Elinia, e funciona perfeitamente bem assim." };
}

const xpDeCifra = c => (VINCULOS[c.vinculo] || VINCULOS.Baixo).xp;
const xpAutomatico = f =>
  f.talentos.reduce((s, t) => s + (t.xp || 0), 0) +
  f.cifras.reduce((s, c) => s + xpDeCifra(c), 0);
const xpLivre = f => f.xpTotal - xpAutomatico(f) - f.xpOutros;

/* Um Talento comprado nunca é perdido; o que existe é o que cabe aceso. */
const temTalento = (f, nome) => f.talentos.some(t => t.nome === nome);
const temCifra = (f, nome, pilar) => f.cifras.some(c => c.nome === nome && c.pilar === pilar);

/* ---------------------------------------------------- 4. ler e gravar */

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
  m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

function carrega() {
  let cru = null;
  try { cru = localStorage.getItem(LS_FICHAS); } catch (e) { cru = null; }

  /* A revisão anterior gravava sob outra chave. Copia antes de tocar em
     qualquer coisa: nada é apagado antes de a cópia nova existir. */
  if (!cru) {
    try {
      const velho = localStorage.getItem(LS_ANTIGO);
      if (velho) { cru = velho; localStorage.setItem(LS_FICHAS, velho); }
    } catch (e) { /* armazenamento bloqueado; segue com ficha nova */ }
  }

  if (cru) {
    try {
      const o = JSON.parse(cru);
      const lista = Array.isArray(o) ? o : (o.fichas || o.chars || []);
      db.fichas = lista.map(normaliza);
      db.ativa = o.ativa || o.activeId || (db.fichas[0] && db.fichas[0].id) || null;
      db.lixeira = Array.isArray(o.lixeira || o.trash) ? (o.lixeira || o.trash).map(normaliza) : [];
    } catch (e) { db = { fichas: [], ativa: null, lixeira: [] }; }
  }
  if (!db.fichas.length) { const f = fichaEmBranco(); db.fichas = [f]; db.ativa = f.id; }
  if (!db.fichas.some(f => f.id === db.ativa)) db.ativa = db.fichas[0].id;
}

let gravaTimer = null, ultimoBackup = 0;
function grava() {
  marcaEstado("gravando");
  clearTimeout(gravaTimer);
  gravaTimer = setTimeout(escreve, 320);
}
function escreve() {
  try {
    const bloco = JSON.stringify({ versao: 2, fichas: db.fichas, ativa: db.ativa, lixeira: db.lixeira });
    localStorage.setItem(LS_FICHAS, bloco);
    if (Date.now() - ultimoBackup > 60000) { localStorage.setItem(LS_BACKUP, bloco); ultimoBackup = Date.now(); }
    marcaEstado("gravado");
  } catch (e) {
    marcaEstado("erro");
  }
}
function marcaEstado(s) {
  const el = $("#estadoGravacao"); if (!el) return;
  el.textContent = s === "erro"
    ? "não deu para gravar — exporte um backup"
    : (s === "gravando" ? "gravando…" : "gravado");
  el.dataset.erro = s === "erro" ? "1" : "0";
}

/* caminho tipo "attrs.corpo" ou "ancoras.0.nome" */
function escreveCaminho(obj, caminho, valor) {
  const p = caminho.split(".");
  let alvo = obj;
  for (let i = 0; i < p.length - 1; i++) {
    const k = /^\d+$/.test(p[i]) ? Number(p[i]) : p[i];
    if (alvo[k] == null) alvo[k] = /^\d+$/.test(p[i + 1]) ? [] : {};
    alvo = alvo[k];
  }
  const ult = /^\d+$/.test(p[p.length - 1]) ? Number(p[p.length - 1]) : p[p.length - 1];
  alvo[ult] = valor;
}
function leCaminho(obj, caminho) {
  return caminho.split(".").reduce((o, k) => (o == null ? o : o[/^\d+$/.test(k) ? Number(k) : k]), obj);
}

/* ------------------------------------------------------------- 5. avisos */

let avisoTimer = null;
function avisa(texto, ms, rotulo, acao) {
  const cx = $("#aviso"), tx = $("#avisoTexto"), bt = $("#avisoAcao");
  tx.textContent = texto;
  clearTimeout(avisoTimer);
  if (rotulo && acao) {
    bt.hidden = false; bt.textContent = rotulo;
    bt.onclick = () => { cx.hidden = true; acao(); };
  } else { bt.hidden = true; bt.onclick = null; }
  cx.hidden = false;
  avisoTimer = setTimeout(() => { cx.hidden = true; }, ms || 4200);
}

/* ------------------------------------------------------- 6. peças de tela */

function campo(rot, caminho, valor, tipo, extra) {
  const t = tipo || "text";
  return `<label class="campo"><span class="campo__rot">${esc(rot)}</span>` +
    `<input class="ent${t === "number" ? " ent--num" : ""}" type="${t}" data-campo="${caminho}" value="${esc(valor)}" ${extra || ""}></label>`;
}
function seletor(rot, caminho, valor, opcoes, vazio) {
  const ops = (vazio ? [""] : []).concat(opcoes)
    .map(o => `<option value="${esc(o)}"${o === valor ? " selected" : ""}>${esc(o || "—")}</option>`).join("");
  return `<label class="campo"><span class="campo__rot">${esc(rot)}</span>` +
    `<select class="ent" data-campo="${caminho}">${ops}</select></label>`;
}
function area(rot, caminho, valor, linhas) {
  return `<label class="campo"><span class="campo__rot">${esc(rot)}</span>` +
    `<textarea class="ent" rows="${linhas || 3}" data-campo="${caminho}">${esc(valor)}</textarea></label>`;
}
/* Um contador serve só para o recorte não rimar: quem rasga uma pilha de
   papel à mão não rasga duas folhas igual, e metade delas sai torta no topo
   também. É decoração, e por isso sai inteira na impressão. */
let recorte = 0;
/* Em mesa, marcar um ponto é um gesto por turno. Digitar é abrir o teclado,
   apagar o que estava e conferir se ficou certo — três gestos, e o último
   ninguém faz. Então todo número pequeno vira casa que se clica, e clicar na
   última casa cheia volta uma. */
function medidor(acao, total, tipoDe, extras) {
  const o = extras || {};
  let h = `<div class="medidor${o.classe ? " " + o.classe : ""}">`;
  for (let i = 1; i <= total; i++) {
    const terco = o.tercos && (i === Math.round(total / 3) || i === Math.round(total * 2 / 3));
    h += `<button class="medidor__casa naoimprime" type="button" data-acao="${acao}" data-n="${i}"` +
      ` data-tipo="${tipoDe(i)}" data-terco="${terco ? 1 : 0}"` +
      (o.campo ? ` data-campo="${o.campo}"` : "") +
      ` aria-label="${esc(o.rot || "marcar")} ${i}">${o.numerar ? i : ""}</button>`;
  }
  return h + `</div>`;
}

/* − n + para o que não cabe numa trilha: XP e contadores longos */
function contador(rot, campo, valor, min, max, nota) {
  const botao = (d, rotulo) =>
    `<button class="passo naoimprime" type="button" data-acao="passoNum" data-campo="${campo}"` +
    ` data-d="${d}" data-min="${min}" data-max="${max}"` +
    ` aria-label="${d > 0 ? "Subir" : "Baixar"} ${esc(rot)}">${rotulo}</button>`;
  return `<div class="contador">` +
    `<span class="contador__rot">${esc(rot)}</span>` +
    `<span class="contador__ctrl">${botao(-1, "−")}<b class="contador__valor">${valor}</b>${botao(1, "+")}</span>` +
    (nota ? `<span class="contador__nota">${esc(nota)}</span>` : "") +
  `</div>`;
}

/* A chave de recolhimento sai do próprio título. Renomear um painel perde o
   estado dele uma vez e ele volta aberto, que é um preço barato por não ter
   uma segunda lista de nomes para manter em dia. */
const chaveDe = t => t.toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function painel(titulo, nota, corpo, op) {
  const o = op || {};
  const chave = chaveDe(titulo);
  const recolhido = (fichaAtiva() || {}).recolhidos && fichaAtiva().recolhidos.includes(chave);
  recorte++;
  const topoRasgado = recorte % 3 === 2;
  /* fita onde a colagem pede: não em todo painel, senão vira padrão */
  const fita = o.fita || ["", "", "so", "", "ne", "", "", "se", "", "", "no", ""][recorte % 12] || "";
  /* A folha é o papel: é ela que entorta, que pega grão e que rasga.
     O conteúdo fica reto em cima dela, porque texto em camada rotacionada
     perde o encaixe na grade de pixels e sai borrado — e uma tarja impressa
     reta sobre papel cortado torto é o que um zine é de verdade. */
  return `<section class="painel${o.prata ? " painel--prata" : ""}${o.largo ? " painel--largo" : ""}"` +
    ` data-recolhido="${recolhido ? 1 : 0}">` +
    `<span class="painel__folha" aria-hidden="true">` +
      (topoRasgado ? `<span class="rasgo rasgo--topo naoimprime"></span>` : "") +
      `<span class="rasgo rasgo--pe naoimprime"></span>` +
    `</span>` +
    (fita && !recolhido ? `<span class="fita fita--${fita} naoimprime" aria-hidden="true"></span>` : "") +
    `<div class="painel__topo"><h3 class="painel__nome" title="${esc(titulo)}">${esc(titulo)}</h3>` +
    (nota ? `<span class="painel__nota" title="${esc(nota)}">${esc(nota)}</span>` : "") +
    `<button class="painel__olho naoimprime" type="button" data-acao="recolhe" data-chave="${chave}"` +
    ` aria-expanded="${recolhido ? "false" : "true"}"` +
    ` title="${recolhido ? "Abrir" : "Recolher"} ${esc(titulo)}">${recolhido ? "▸" : "▾"}</button>` +
    `</div><div class="painel__corpo">${corpo}</div></section>`;
}

/* -------------------------------------------------------------- 7. a capa */

function desenhaCapa() {
  const f = fichaAtiva();
  const casa = AFILIACOES[f.afiliacao];
  const est = estagioDe(f);
  const pil = PILARES[f.pilar];

  document.body.dataset.casa = f.afiliacao;

  $("#capa").innerHTML =
    `<div class="capa__trama"></div><div class="capa__grao"></div>` +
    `<div class="capa__selo" aria-hidden="true"><svg viewBox="0 0 100 100">${casa.selo}</svg></div>` +
    `<div class="capa__corpo">` +
      `<div class="marca">` +
        `<span class="marca__chapa${MARCA_ARTE ? " marca__chapa--arte" : ""}">` +
          `<span class="marca__retalho" aria-hidden="true"></span>` +
          (MARCA_ARTE
            ? `<h1 class="marca__palavra marca__palavra--arte">${MARCA_ARTE}<span class="oculto">Devaneio</span></h1>`
            : `<h1 class="marca__palavra">Devane<em>i</em>o</h1>`) +
        `</span>` +
        `<p class="marca__linha">${esc(casa.linha)}</p>` +
      `</div>` +
      `<div class="capa__id">` +
        `<input class="capa__nome" data-campo="nome" value="${esc(f.nome)}" placeholder="nome do Ascendido" aria-label="Nome do Ascendido">` +
        `<div class="capa__abaixo">` +
          `<span>Linhagem <b>${esc(f.linhagem)}</b></span>` +
          `<span>Ascensão <b>${esc(f.ascensao)}</b></span>` +
          `<span>Arquétipo <b>${esc(f.arquetipo || "nenhum")}</b></span>` +
          `<span>Pilar <b>${esc(f.pilar)}</b> · ${esc(pil.semblante)}</span>` +
          `<span>Prontidão <b>${prontidaoDe(f)}</b></span>` +
        `</div>` +
      `</div>` +
      `<div class="capa__carimbos">` +
        `<span class="carimbo${casa.riscado ? " carimbo--riscado" : ""}">${esc(casa.carimbo)}</span>` +
        `<span class="carimbo">Vínculo até ${esc(est.vinculo)}</span>` +
      `</div>` +
    `</div>`;
}

/* ------------------------------------------------- 8. a faixa que não desce */

function faixaAtributos(f) {
  const teto = estagioDe(f).tetoAtr;
  let corpo = `<div class="atrs">` + ATRIBUTOS.map(a => {
    const v = f.attrs[a.chave];
    return `<div class="atr"><div class="atr__rot">${esc(a.sigla)}</div>` +
      `<b class="atr__dado">${DADO_ATRIBUTO[v]}</b>` +
      `<div class="atr__rot">${esc(a.rot)} ${v}</div>` +
      `<div class="atr__passos">` +
        `<button class="passo" type="button" data-acao="atr" data-alvo="${a.chave}" data-d="-1"${v <= 1 ? " disabled" : ""} aria-label="Baixar ${esc(a.rot)}">−</button>` +
        `<button class="passo" type="button" data-acao="atr" data-alvo="${a.chave}" data-d="1"${v >= teto ? " disabled" : ""} aria-label="Subir ${esc(a.rot)}">+</button>` +
      `</div></div>`;
  }).join("") + `</div>` +
  `<p class="margem">Teto de <b>${teto}</b> no ${esc(f.ascensao)}. O D20 só existe no Iluminado, e quem chega lá não é mais exatamente uma pessoa.</p>`;
  const acima = ATRIBUTOS.filter(x => f.attrs[x.chave] > teto);
  if (acima.length) corpo += `<p class="margem"><b>Acima do teto:</b> ${esc(acima.map(x => x.rot).join(", "))}. A ficha não confisca nada — mas no ${esc(f.ascensao)} esse dado não deveria estar na mesa.</p>`;
  return painel("Atributos", "1D do Atributo + 1D da Perícia", corpo);
}

function faixaVitalidade(f) {
  const max = vitMax(f);
  const est = VITALIDADE.find(v => v.n === f.vitNivel) || VITALIDADE[0];
  const corpo =
    `<div class="vit__degraus">` + [5, 4, 3, 2, 1].map(n => {
      const v = VITALIDADE.find(x => x.n === n) || {};
      return `<button class="degrau" type="button" data-acao="vit" data-n="${n}" ` +
        `data-cheio="${f.vitNivel >= n ? 1 : 0}" data-risco="${v.risco ? 1 : 0}" ` +
        `data-atual="${f.vitNivel === n ? 1 : 0}" title="${esc(v.nome)} — ${esc(v.pen)}">${n}</button>`;
    }).join("") + `</div>` +
    `<div class="vit__estado"><b class="vit__nome">${esc(est.nome)}</b>` +
      `<span class="vit__pen">${esc(est.pen)}</span></div>` +
    `<div class="slot__rot"><span>Pontos de Vitalidade</span><b>${vitPontosDe(f)} de ${max}</b></div>` +
    medidor("vitPts", max, i => i <= vitPontosDe(f) ? "cheio" : "vazio", { classe: "medidor--papel", rot: "Ponto de Vitalidade" }) +
    `<div class="linha-bts naoimprime"><button class="bt bt--fino" type="button" data-acao="vitCheia">encher tudo</button></div>` +
    `<p class="margem">Zerou os pontos, cai um nível e a reserva volta ao máximo. Chegou ao <b>0</b>, acabou — e não é o tipo de coisa que repouso conserta.</p>` +
    (f.vitNivel === 2 ? `<p class="margem"><b>Este é o degrau que mata gente.</b> A Face você aguenta. Não poder reagir significa que o próximo golpe entra inteiro, e o combate deste jogo não perdoa golpe que entra inteiro.</p>` : "") +
    (f.vitNivel === 1 ? `<p class="margem"><b>Inconsciente.</b> Alguém vai ter que te carregar, e quem te carrega não está atirando.</p>` : "") +
    (f.vitNivel === 0 ? `<p class="margem"><b>Fora da mesa.</b> Foi bom enquanto durou. Guarde a ficha: o Narrador tem permissão de trazer essa pessoa de volta na frente de quem sobrou, e nada disso é ressurreição.</p>` : "");
  return painel("Vitalidade", `Linhagem ${f.linhagem} · ${max} por nível`, corpo);
}

function faixaCorrupcao(f) {
  const l = limiarDe(f), rec = f.corrRecente, ass = f.corrAssentada, car = cargaAcesa(f);
  const t = rec + ass + car;
  const est = estadoCorrupcao(f);
  /* A trilha mede o Limiar inteiro, e as casas se pintam na ordem em que a
     alma entrou: Assentada no começo, Carga em cima dela, Recente por
     último. É a Recente que sobe e desce toda cena, então é ela que o
     clique move. Carga não se clica: quem manda nela é o painel de
     Talentos, e Assentada tem o próprio contador porque quase não se mexe. */
  const tipoDe = i => i <= ass ? "ass" : i <= ass + car ? "car" : i <= t ? "rec" : "vazio";
  const corpo =
    medidor("corr", l, tipoDe, { tercos: true, rot: "Corrupção" }) +
    `<div class="corr__resumo">` +
      `<b class="corr__num">${t} <span>de ${l}</span></b>` +
      `<span class="corr__estado" data-grave="${est.grave ? 1 : 0}">${esc(est.nome)}</span>` +
    `</div>` +
    `<div class="corr__legenda">` +
      `<span><i data-tipo="ass"></i>Assentada ${ass}</span>` +
      `<span><i data-tipo="car"></i>Carga ${car}</span>` +
      `<span><i data-tipo="rec"></i>Recente ${rec}</span>` +
    `</div>` +
    `<p class="margem">${esc(est.efeito)}</p>` +
    contador("Assentada", "corrAssentada", ass, 0, 99, "não sai com descanso comum") +
    `<div class="linha-bts naoimprime">` +
      `<button class="bt bt--fino" type="button" data-acao="repousoRapido">Repouso rápido</button>` +
      `<button class="bt bt--fino" type="button" data-acao="repousoCompleto">Repouso completo</button>` +
      `<button class="bt bt--fino" type="button" data-acao="repousoArvore">Árvore Prateada</button>` +
    `</div>` +
    `<p class="margem">Alma não é combustível, é acúmulo. Você não gasta: você desloca, e ela fica onde parou.</p>`;
  return painel("Corrupção", `Limiar ${l} · ${f.linhagem}`, corpo, { prata: true });
}

function faixaPericias(f) {
  const teto = estagioDe(f).tetoEsp;
  const corpo = `<div class="pers">` + [TODAS_PERICIAS].map(lista =>
    lista.map(p => {
      const comprado = f.pericias[p];
      const gratis = concedidoEm(f, p);
      const total = periciaTotal(f, p);
      const fontes = FONTES_CONCESSAO.filter(x => f.concessoes[x.chave] === p).map(x => x.rot).join(" e ");
      return `<div class="per"><span class="per__nome" title="${esc(p)}${fontes ? " — nível gratuito d" + (fontes === "Cultura" ? "a " : "o ") + fontes : ""}">${esc(p)}` +
        (gratis ? `<i class="per__gratis" title="Nível gratuito d${fontes === "Cultura" ? "a " : "o "}${esc(fontes)}">livre</i>` : "") +
        `</span>` +
        `<span class="per__dado" data-tem="${total > 0 ? 1 : 0}">${DADO_PERICIA[total]}</span>` +
        `<span class="per__passos naoimprime">` +
          `<button class="passo" type="button" data-acao="per" data-alvo="${esc(p)}" data-d="-1"${comprado <= 0 ? " disabled" : ""} aria-label="Baixar ${esc(p)}">−</button>` +
          `<button class="passo" type="button" data-acao="per" data-alvo="${esc(p)}" data-d="1"${total >= teto ? " disabled" : ""} aria-label="Subir ${esc(p)}">+</button>` +
        `</span></div>`;
    }).join("")
  ).join("") + `</div>` +
  `<p class="margem">Perícia sem Especialização funciona com o atributo sozinho. A diferença entre tentar e saber fazer é real, e é exatamente um dado. Teto <b>${teto}</b> agora; nenhuma perícia chega ao D20, nunca.</p>` +
  (TODAS_PERICIAS.some(p => f.pericias[p] > teto)
    ? `<p class="margem"><b>Acima do teto:</b> ${esc(TODAS_PERICIAS.filter(p => f.pericias[p] > teto).join(", "))}.</p>` : "") +
  (pontosLivres(f)
    ? `<p class="margem"><b>${pontosLivres(f)} ponto${pontosLivres(f) > 1 ? "s" : ""} livre${pontosLivres(f) > 1 ? "s" : ""}.</b> Um nível gratuito caiu em perícia que você já treinou. O livro é explícito: ele não se perde e não fura o teto — vira ponto livre, e você realoca onde quiser.</p>` : "");
  return painel("Perícias", `Conhecimento: ${f.conhecimento || "—"}`, corpo);
}



/* --------------------------------------------------------- 9. os painéis */

function painelDossie(f) {
  const lin = LINHAGENS[f.linhagem];
  const ant = DADOS.antecedentes.find(a => a.nome === f.antecedente);
  /* Cultura fora da lista do livro existe — o Capítulo 9 não saiu ainda.
     Um datalist parecia campo quebrado, então a lista é select de verdade e
     "Outra" abre o campo livre. */
  const outraCultura = f.culturaLivre || (!!f.cultura && !CULTURAS.includes(f.cultura));

  const corpo =
    `<div class="grade grade--2">` +
      seletor("Linhagem", "linhagem", f.linhagem, Object.keys(LINHAGENS)) +
      (outraCultura
        ? campo("Cultura (fora da lista)", "cultura", f.cultura)
        : seletor("Cultura", "cultura", f.cultura, CULTURAS.concat(["Outra…"]), true)) +
      seletor("Antecedente", "antecedente", f.antecedente, DADOS.antecedentes.map(a => a.nome), true) +
      campo("Conhecimento", "conhecimento", f.conhecimento) +
      seletor("Patrimônio", "patrimonio", f.patrimonio, PATRIMONIOS) +
      campo("Estre", "estre", f.estre) +
      campo("Jogador", "jogador", f.jogador) +
      seletor("Pilar de Afinidade", "pilar", f.pilar, NOMES_PILARES) +
    `</div>` +
    (outraCultura ? `<div class="linha-bts naoimprime"><button class="bt bt--fino bt--fantasma" type="button" data-acao="voltaLista">voltar à lista</button></div>` : "") +

    `<div class="item"><div class="item__topo"><b class="item__nome">Nível gratuito da Cultura</b>` +
      `<span class="item__tags"><span class="tag">concessão</span></span></div>` +
      `<p class="item__texto">A Cultura concede um nível de perícia e um traço passivo. O Capítulo 9 não saiu, então quem diz qual perícia é você e o Narrador — a ficha aplica e soma sozinha.</p>` +
      seletor("Perícia concedida", "concessoes.cultura", f.concessoes.cultura, TODAS_PERICIAS, true) +
    `</div>` +

    (ant
      ? `<div class="item"><div class="item__topo"><b class="item__nome">${esc(ant.habilidade)}</b>` +
        `<span class="item__tags"><span class="tag tag--casa">${esc(ant.nome)}</span>` +
        `<span class="tag">${esc(ant.pericia)}</span><span class="tag">${esc(ant.conhecimento)}</span></span></div>` +
        `<p class="item__texto">${esc(ant.efeito)}</p></div>`
      : `<p class="vazio">Sem Antecedente. Escolher um concede a perícia, o Conhecimento e a habilidade de uma vez — é o emprego que você tinha na semana em que alguém decidiu te recrutar.</p>`) +

    `<div class="item"><div class="item__topo"><b class="item__nome">${esc(f.linhagem)} no Limiar</b>` +
      `<span class="item__tags"><span class="tag tag--prata">Vitalidade ${LINHAGENS[f.linhagem].vit}</span>` +
      `<span class="tag tag--prata">Limiar ${LINHAGENS[f.linhagem].limiar}</span></span></div>` +
      `<p class="item__texto">${esc(lin.traco)}</p></div>` +

    `<p class="margem">O Antecedente não muda nunca. É a única coisa na ficha que registra que existiu uma pessoa antes do operador, junto com as Âncoras.</p>`;
  return painel("Dossiê", "o que pagava o seu aluguel", corpo);
}

function painelArquetipo(f) {
  const a = arquetipoDe(f);
  const g = grauDe(f);
  const nivel = nivelGrau(g.xp);
  const prox = proximoGrau(g.xp);
  const permitidas = Math.floor(nivel / 2);
  const marcas = g.marcas || [];

  let corpo = seletor("Arquétipo ativo", "arquetipo", f.arquetipo, DADOS.arquetipos.map(x => x.nome), true);

  if (!a) {
    corpo += `<p class="vazio">Sem Arquétipo, você ainda pode tentar tudo. Só vai pagar mais caro em cada coisa — que é exatamente o que o livro diz que um Arquétipo faz: não dá poder, dá desconto.</p>`;
    return painel("Arquétipo", "como você resolve", corpo);
  }

  corpo +=
    `<p class="margem"><b>${esc(a.familia)} · ${esc((ATRIBUTOS.find(x => x.chave === a.atributo) || {}).rot)}</b> — ${esc(a.resumo)}</p>` +
    `<div class="item"><div class="item__topo"><b class="item__nome">${esc(a.forma)}</b>` +
      `<span class="item__tags"><span class="tag">forma de operar</span><span class="tag">não ocupa Capacidade</span></span></div>` +
      `<p class="item__texto"><b>Passiva.</b> ${esc(a.passiva)}</p>` +
      `<p class="item__texto"><b>Ativa, uma vez por cena.</b> ${esc(a.ativa)}</p>` +
      `<p class="item__texto"><b>O que ele não faz.</b> ${esc(a.limite)}</p>` +
    `</div>` +
    `<div class="grau">` + [1, 2, 3, 4, 5, 6, 7, 8].map(n =>
      `<span class="grau__casa" data-feito="${nivel >= n ? 1 : 0}" data-marca="${n % 2 === 0 ? 1 : 0}" title="Grau ${n} — ${n % 2 ? "abre o patamar " + PATAMAR_DO_GRAU[n] : "Marca"} · ${GRAU_XP[n - 1]} XP">${n}</span>`
    ).join("") + `</div>` +
    `<div class="grade grade--2">` +
      contador("XP como " + a.nome, `graus.${a.nome}.xp`, g.xp, 0, 9999) +
      `<label class="campo"><span class="campo__rot">Grau</span><input class="ent ent--num" value="${nivel}" disabled></label>` +
    `</div>` +
    `<p class="margem">Patamares abertos: <b>${[1, 3, 5, 7].filter(n => nivel >= n).map(n => PATAMAR_DO_GRAU[n]).join(", ") || "nenhum"}</b>.` +
      (prox ? ` Faltam <b>${prox.falta} XP</b> para o Grau ${prox.grau}.` : ` Grau 8. Você faz isso há tempo demais, e já não lembra de ter decidido fazer.`) + `</p>`;

  if (permitidas > 0) {
    corpo += `<div class="campo"><span class="campo__rot">Marcas — ${permitidas} conquistada${permitidas > 1 ? "s" : ""}</span>`;
    for (let i = 0; i < permitidas; i++) {
      corpo += `<div class="linha-bts" style="margin:4px 0">` + Object.keys(MARCAS).map(k =>
        `<button class="bt bt--fino${marcas[i] === k ? " bt--casa" : " bt--fantasma"}" type="button" data-acao="marca" data-i="${i}" data-tipo="${k}" title="${esc(MARCAS[k].nota)}">${esc(MARCAS[k].rot)}</button>`
      ).join("") + `</div>`;
    }
    corpo += `</div><p class="margem">As Marcas pertencem a este Arquétipo. Trocar de jeito de resolver devolve o corpo ao que a Linhagem determinou. Um corpo se desacostuma.</p>`;
  }

  corpo += `<div class="linha-bts naoimprime"><button class="bt bt--casa" type="button" data-acao="abreComp" data-aba="talentos" data-filtro="${esc(a.nome)}">Ver a prateleira do ${esc(a.nome)}</button></div>`;
  return painel("Arquétipo", a.nome + " · Grau " + nivel, corpo);
}

function painelTalentos(f) {
  const cap = capacidadeDe(f), peso = pesoAceso(f);
  const estouro = peso > cap;
  const ordem = { I: 1, II: 2, III: 3, IV: 4 };
  const lista = f.talentos.slice().sort((x, y) =>
    (ordem[x.patamar] || 9) - (ordem[y.patamar] || 9) || x.nome.localeCompare(y.nome, "pt"));

  let corpo =
    `<div class="cap__barra"><div class="cap__usada" data-estouro="${estouro ? 1 : 0}" style="width:${Math.min(100, (peso / cap) * 100)}%"></div>` +
    `<div class="cap__num">Capacidade ${peso} / ${cap}</div></div>`;

  if (estouro) corpo += `<p class="margem"><b>Passou do que cabe.</b> Você comprou um armário; agora vista só o que entra. Trocar o que está aceso só acontece em Local Seguro.</p>`;
  else if (lista.length && !talentosAcesos(f).length) corpo += `<p class="margem">Tudo no armário e nada aceso. Dá para jogar assim. Dá também para atravessar o inverno sem casaco.</p>`;
  else if (cap - peso >= 6 && lista.length) corpo += `<p class="margem">Sobram <b>${cap - peso}</b> de Capacidade. Não é virtude guardar espaço: ninguém devolve Capacidade não usada no fim da operação.</p>`;

  if (!lista.length) {
    corpo += `<p class="vazio">Nenhum Talento comprado ainda. A prateleira do Arquétipo tem doze e a Geral tem vinte, e a Capacidade nunca deixa vestir tudo. É de propósito.</p>`;
  } else {
    corpo += `<ul class="itens itens--colunas">` + lista.map(t => {
      const i = f.talentos.indexOf(t);
      return `<li class="item"><div class="item__topo">` +
        `<button class="acende naoimprime" type="button" data-acao="acende" data-i="${i}" aria-pressed="${t.ativo}" aria-label="${t.ativo ? "Apagar" : "Acender"} ${esc(t.nome)}"></button>` +
        `<b class="item__nome">${esc(t.nome)}</b>` +
        `<span class="item__tags">` +
          `<span class="tag">${esc(t.patamar)} · ${t.xp}</span>` +
          `<span class="tag">${esc(t.modo)}</span>` +
          (t.carga ? `<span class="tag tag--prata">Carga ${t.carga}</span>` : "") +
          `<span class="tag${t.fonte === "Geral" ? "" : " tag--casa"}">${esc(t.fonte)}</span>` +
          (t.ativo ? `<span class="tag tag--casa">aceso</span>` : `<span class="tag">no armário</span>`) +
        `</span></div>` +
        `<p class="item__texto">${esc(t.efeito)}</p>` +
        `<div class="item__acoes naoimprime"><button class="bt bt--fino bt--fantasma bt--perigo" type="button" data-acao="tiraTalento" data-i="${i}">esquecer</button></div>` +
      `</li>`;
    }).join("") + `</ul>`;
  }

  corpo += `<div class="linha-bts naoimprime">` +
    `<button class="bt bt--casa" type="button" data-acao="abreComp" data-aba="talentos">Comprar do livro</button>` +
    `<button class="bt bt--fantasma" type="button" data-acao="apagaTudo">Apagar todos</button>` +
    `</div>`;
  return painel("Talentos", `${peso} de ${cap} aceso · ${f.talentos.length} no armário`, corpo);
}

function painelCorrentes(f) {
  const corpo =
    `<p class="margem">Não se endereçam a Pilar nenhum, então não há a quem pedir licença. Sem teste, sem Vínculo, sem Corrupção. Nenhuma serve para machucar alguém — não por proibição, é o que elas <b>são</b>.</p>` +
    `<div class="campo"><span class="campo__rot">As quatro que nunca puderam ser catalogadas</span>` +
      `<div class="item__tags" style="margin:0">` + CORRENTES_UNIVERSAIS.map(c => `<span class="tag tag--prata">${esc(c)}</span>`).join("") + `</div></div>` +
    `<div class="cartoes">` + f.correntes.map((c, i) =>
      `<div class="ancora"><div class="slot__rot"><span>Corrente ${i + 1}</span><b>${esc(c.origem || "livre")}</b></div>` +
      campo("Nome", `correntes.${i}.nome`, c.nome) +
      area("O que ela faz, em uma frase", `correntes.${i}.efeito`, c.efeito, 2) +
      `</div>`).join("") + `</div>` +
    `<p class="margem">Isso não é privilégio seu: todo mundo em Elinia tem as suas. O padeiro de Alta Velana usa três antes das nove da manhã e não acha aquilo notável.</p>`;
  return painel("Cifras Correntes", "a língua é livre", corpo, { prata: true });
}

function painelCifras(f) {
  const est = estagioDe(f);
  const aguenta = { "Vislumbre": 1, "Despertar": 2, "Despertado": 2, "Aclarado": 3, "Iluminado": 3 }[f.ascensao];
  const ordemV = { "Baixo": 1, "Médio": 2, "Alto": 3 };
  const lista = f.cifras.slice().sort((a, b) =>
    a.pilar.localeCompare(b.pilar, "pt") || ordemV[a.vinculo] - ordemV[b.vinculo] || a.nome.localeCompare(b.nome, "pt"));

  const alf = alfabetizacaoDe(f);
  let corpo =
    `<p class="margem">Dois portões, e os dois precisam estar abertos. A <b>Ascensão</b> mede o que cabe em você: hoje, até Vínculo <b>${esc(est.vinculo)}</b>. A <b>Confiança</b> mede o que entregam: 0 requisita Baixo, 2 requisita Médio, 4 requisita Alto.</p>` +
    `<p class="margem"><b>${esc(alf.nome)}.</b> ${esc(alf.nota)}</p>` +
    (f.cultura ? `<p class="margem">Seu dialeto é o de <b>${esc(f.cultura)}</b>. Replicar Cifra sinalizada em outro custa 1 Face, e a penalidade some depois de uma cena inteira de convivência. Não é dificuldade técnica. É sotaque.</p>` : "");

  if (!lista.length) {
    corpo += `<p class="vazio">Nenhuma Catalogada. Ninguém aprende sozinho: não existe frase endereçada a um Pilar circulando na rua. Organizações entregam, e foi isso que você comprou ao assinar.</p>`;
  } else {
    corpo += `<ul class="itens itens--colunas">` + lista.map(c => {
      const i = f.cifras.indexOf(c);
      const v = VINCULOS[c.vinculo];
      const alto = ordemV[c.vinculo] > aguenta;
      return `<li class="item"><div class="item__topo"><b class="item__nome">${esc(c.nome)}</b>` +
        `<span class="item__tags">` +
          `<span class="tag tag--casa">${esc(c.pilar)}</span>` +
          `<span class="tag${alto ? " tag--alerta" : " tag--prata"}">${esc(c.vinculo)}</span>` +
          (c.tipo ? `<span class="tag">${esc(c.tipo)}</span>` : "") +
          `<span class="tag">${v.xp} XP</span>` +
        `</span></div>` +
        `<p class="item__texto"><b>${esc((c.sigilos || []).join(" + "))}</b> · gatilho: ${esc(c.gatilho)} · ${esc(v.nd)}, retém ${esc(v.retem)}</p>` +
        `<p class="item__texto">${esc(c.efeito)}</p>` +
        (alto ? `<p class="item__texto"><b>Acima do que a sua Ascensão aguenta.</b> Você sabe a frase inteira. Dizer é outro assunto.</p>` : "") +
        `<div class="item__acoes naoimprime"><button class="bt bt--fino bt--fantasma bt--perigo" type="button" data-acao="tiraCifra" data-i="${i}">remover</button></div>` +
      `</li>`;
    }).join("") + `</ul>`;
  }

  corpo += `<div class="linha-bts naoimprime">` +
    `<button class="bt bt--casa" type="button" data-acao="abreComp" data-aba="cifras">Aprender do catálogo</button></div>` +
    `<p class="margem">A Cifra sempre acontece. O teste de Domínio não decide se funcionou: decide quanta alma fica presa em você depois.</p>`;
  return painel("Cifras Catalogadas", `${f.cifras.length} frases · ${alf.nome} · Domínio ${DADO_PERICIA[f.pericias["Domínio"]]}`, corpo, { prata: true });
}

function painelLabirinto(f) {
  const est = estagioDe(f);
  const alma = DADOS.tracos.alma.find(t => t.pilar === f.pilar);
  const quantos = est.lab;           /* Instável 1, Firmado 2, Consolidado 3, Absoluto 4 */
  const pessoais = Math.max(0, quantos - 1);
  const custo = { 0: "—", 1: "3 de Recente, e pode colapsar", 2: "2 de Recente", 3: "1 de Recente", 4: "nada" }[quantos];

  let corpo;
  if (quantos === 0) {
    corpo = `<p class="vazio">O Labirinto Próprio existe desde sempre, mas só é projetável a partir do <b>Despertar</b>. Por enquanto ele é só o lugar onde você mora por dentro, e ninguém entra.</p>`;
  } else {
    corpo =
      `<div class="grade grade--2">` +
        `<label class="campo"><span class="campo__rot">Estado</span><input class="ent" value="${esc(est.labirinto)}" disabled></label>` +
        `<label class="campo"><span class="campo__rot">Projetar custa</span><input class="ent" value="${esc(custo)}" disabled></label>` +
      `</div>` +
      (alma ? `<div class="item"><div class="item__topo"><b class="item__nome">${esc(alma.nome)}</b>` +
        `<span class="item__tags"><span class="tag tag--casa">${esc(alma.pilar)}</span><span class="tag tag--prata">Traço de Alma</span></span></div>` +
        `<p class="item__texto">${esc(alma.efeito)}</p></div>` : "") +
      `<div class="campo"><span class="campo__rot">Traços Pessoais — ${f.labTracos.length} de ${pessoais}</span>` +
        `<div class="item__tags" style="margin:0">` + DADOS.tracos.pessoais.map(t => {
          const tem = f.labTracos.includes(t.nome);
          return `<button class="chip naoimprime" type="button" data-acao="traco" data-nome="${esc(t.nome)}" aria-pressed="${tem}" title="${esc(t.efeito)}">${esc(t.nome)}</button>`;
        }).join("") + `</div></div>` +
      (f.labTracos.length ? `<ul class="itens itens--colunas">` + f.labTracos.map(n => {
        const t = DADOS.tracos.pessoais.find(x => x.nome === n);
        return t ? `<li class="item"><div class="item__topo"><b class="item__nome">${esc(t.nome)}</b></div><p class="item__texto">${esc(t.efeito)}</p></li>` : "";
      }).join("") + `</ul>` : "") +
      `<p class="margem">Traços valem para todo mundo dentro do raio, <b>inclusive para você</b>. O Labirinto não sabe quem é o dono. E escolher é para sempre: ninguém redecora a própria cabeça duas vezes.</p>`;
  }
  corpo += area("Como ele é por dentro", "labNota", f.labNota, 3);
  return painel("Labirinto Próprio", est.labirinto, corpo, { prata: true });
}

function painelAncoras(f) {
  const vivas = f.ancoras.filter(a => !a.queimada && a.nome).length;
  let corpo =
    `<p class="margem">Ascender não apagou a sua vida anterior. Apagou o seu direito de tê-la. Quase todo mundo assina. Quase ninguém cumpre.</p>` +
    `<div class="cartoes">` + f.ancoras.map((a, i) =>
      `<div class="ancora" data-queimada="${a.queimada ? 1 : 0}">` +
        `<div class="slot__rot"><span>Âncora ${i + 1}</span>${a.queimada ? `<b>queimada</b>` : ""}</div>` +
        campo("Quem ela é, e o que ela é para você", `ancoras.${i}.nome`, a.nome) +
        area("O que ela acredita que aconteceu com você", `ancoras.${i}.acredita`, a.acredita, 2) +
        area("Uma coisa que você faria por ela mesmo comprometendo a operação", `ancoras.${i}.faria`, a.faria, 2) +
        `<div class="ancora__fim naoimprime">` +
          `<button class="bt bt--fino bt--fantasma" type="button" data-acao="queima" data-i="${i}">${a.queimada ? "destriscar" : "queimar"}</button>` +
          (f.ancoras.length > 2 ? `<button class="bt bt--fino bt--fantasma bt--perigo" type="button" data-acao="tiraAncora" data-i="${i}">remover</button>` : "") +
        `</div>` +
      `</div>`).join("") + `</div>` +
    `<div class="linha-bts naoimprime"><button class="bt bt--fantasma" type="button" data-acao="novaAncora">+ Âncora nova</button></div>` +
    `<div class="grade grade--2">` +
      contador("Contatos neste arco", "contatos", f.contatos, 0, 9, "cada um remove 1 de Assentada") +
      `<label class="campo"><span class="campo__rot">Âncoras de pé</span><input class="ent ent--num" value="${vivas}" disabled></label>` +
    `</div>` +
    `<p class="margem">Cada Contato remove <b>1 de Assentada</b> e é a única forma de fazer isso fora de um Local Seguro. No <b>terceiro</b> dentro de um arco, eles percebem — e registros viram Dívida.</p>`;
  if (f.contatos >= 3) corpo += `<p class="margem"><b>Terceiro Contato neste arco.</b> Eles perceberam. Raramente vira punição — vira registro, e registro tem um jeito antipático de virar Dívida mais tarde.</p>`;
  if (vivas < 1) corpo += `<p class="margem"><b>Nenhuma Âncora de pé.</b> A trilha cobra três e você começou com duas. É o desenho, não é azar: quem sobe rápido chega ao topo sem nenhuma válvula, e a partir daí só existe o Olho.</p>`;
  return painel("Âncoras", `${vivas} de pé · ${f.contatos} contato${f.contatos === 1 ? "" : "s"}`, corpo, { fita: "ne" });
}

function painelAfiliacao(f) {
  const casa = AFILIACOES[f.afiliacao];
  const avulso = f.afiliacao === "Avulso";
  let corpo =
    seletor("Afiliação", "afiliacao", f.afiliacao, NOMES_AFILIACOES) +
    `<p class="margem"><b>${esc(casa.catalogo)}</b> ${esc(casa.nota)}</p>`;

  if (avulso) {
    corpo +=
      area("Indicação — nomes, e quantas vezes cada um ainda serve", "indicacoes", f.indicacoes, 4) +
      `<p class="margem">Sem Confiança, sem catálogo, sem base e sem Dívida. Nenhum Chamado, nunca, e nenhuma segunda linha escrita por alguém que você não conhece. Sobe um nível de Patrimônio e o equipamento é seu de verdade.</p>`;
  } else {
    corpo +=
      `<div class="grade grade--2">` +
        contador("Confiança — teto", "confiancaTeto", f.confiancaTeto, 0, 20, "cumprir o Chamado sobe, recusar desce") +
        contador("Reserva", "confiancaReserva", f.confiancaReserva, 0, 20, "volta ao teto a cada operação bem-sucedida") +
        contador("Acessos neste arco", "acessos", f.acessos, 0, 9, "no terceiro, eles cobram") +
        `<label class="campo"><span class="campo__rot">Requisita até</span><input class="ent" value="${f.confiancaTeto >= 4 ? "Vínculo Alto" : f.confiancaTeto >= 2 ? "Vínculo Médio" : "Vínculo Baixo"}" disabled></label>` +
      `</div>` +
      `<p class="margem">Confiança não é nível, é crédito. Um operador de teto alto com a reserva vazia tem menos poder de fogo que um novato com a reserva cheia.</p>` +
      `<div class="grade grade--2">` +
        area("A Dívida — o fato que eles guardaram", "divida", f.divida, 3) +
        area("Segunda linha — escrita quando você cumpriu o Chamado", "dividaSegunda", f.dividaSegunda, 3) +
      `</div>` +
      `<p class="margem">Cumprir sobe o teto em 1 e faz a Dívida crescer. Recusar gasta a Dívida: o teto desce, você perde Acesso pelo resto do arco, e uma Âncora sua entra na mira.</p>`;
    if (f.acessos >= 3) corpo += `<p class="margem"><b>Terceiro Acesso.</b> Eles cobram. Não costuma ser punição — costuma ser um registro, e registros viram Dívida.</p>`;
  }
  return painel("Afiliação", casa.carimbo, corpo);
}

function painelSemblante(f) {
  const p = PILARES[f.pilar];
  const marcos = ["Ele não sabe quem você é. Você conjura, ele atende, e é só isso.",
    "Ele reparou. Suas Cifras acontecem no instante em que você termina a frase, e a primeira Bênção passa a ser possível.",
    "Ele responde antes de ser chamado. Uma vez por sessão, uma Cifra daquele Pilar acontece sem você ter conjurado.",
    "Ele procura você. Não em sonho, não em sinal: aparece. E o que ele oferece não está escrito em livro nenhum."];
  const corpo =
    `<div class="grade grade--2">` +
      seletor("Pilar de Afinidade", "pilar", f.pilar, NOMES_PILARES) +
      `<label class="campo"><span class="campo__rot">Semblante</span><input class="ent" value="${esc(p.semblante)}" disabled></label>` +
    `</div>` +
    `<p class="margem"><b>${esc(p.verbo)}</b> Na Roda, o seu Pilar desfaz <b>${esc(p.desfaz)}</b> e é desfeito por <b>${esc(p.desfeito)}</b>. Vale 1 Face contra pessoa e o desempate entre Cifras. Nada além disso — contar com ela é como um afiliado do Olho morre.</p>` +
    `<div class="campo"><span class="campo__rot">Ressonância</span>` +
      `<div class="trilha">` + [0, 1, 2, 3].map(n =>
        `<button class="trilha__passo naoimprime" type="button" data-acao="ress" data-n="${n}" data-feito="${f.ressonancia > n ? 1 : 0}" data-atual="${f.ressonancia === n ? 1 : 0}">${n}</button>`
      ).join("") + `</div></div>` +
    `<p class="margem">${esc(marcos[f.ressonancia])}</p>` +
    (f.ressonancia >= 3 ? `<p class="margem">Vale lembrar que um Semblante que repara em alguém e depois vê essa pessoa virar outra coisa não fica com raiva. Fica sem interesse, que é pior.</p>` : "") +
    `<p class="margem">O jogador nunca vê este número: o Narrador anota. Está aqui porque alguém precisa anotar, e porque Ressonância decide o que você <b>consegue</b> aprender, enquanto a Afiliação decide o que alguém <b>te oferece</b>.</p>` +
    (f.bencaos.length
      ? `<ul class="itens itens--colunas">` + f.bencaos.map((b, i) =>
          `<li class="item"><div class="item__topo"><b class="item__nome">${esc(b.nome)}</b>` +
          `<span class="item__tags"><span class="tag tag--casa">${esc(b.pilar)}</span><span class="tag tag--prata">Bênção</span></span></div>` +
          `<p class="item__texto">${esc(b.efeito)}</p>` +
          `<div class="item__acoes naoimprime"><button class="bt bt--fino bt--fantasma bt--perigo" type="button" data-acao="tiraBencao" data-i="${i}">retirar</button></div></li>`
        ).join("") + `</ul>`
      : `<p class="vazio">Nenhuma Bênção. Elas não são compradas: são oferecidas dentro da ficção, em um encontro. Você pode recusar. Eles não costumam perguntar duas vezes.</p>`) +
    `<div class="linha-bts naoimprime"><button class="bt bt--casa" type="button" data-acao="abreComp" data-aba="bencaos">Ver as Bênçãos de referência</button></div>`;
  return painel("Semblante", `${f.pilar} · Ressonância ${f.ressonancia}`, corpo, { prata: true });
}

function painelEquipamento(f) {
  const corpo =
    `<div class="slots">` + SLOTS.map(s =>
      `<div><div class="slot__rot"><span>${esc(s.rot)}</span><b title="${esc(s.longa || s.nota)}">${esc(s.nota)}</b></div>` +
      `<textarea class="ent" rows="3" data-campo="equip.${s.chave}">${esc(f.equip[s.chave])}</textarea></div>`
    ).join("") + `</div>` +
    `<p class="margem">A distribuição é decidida <b>antes</b> da operação, não durante. O que estiver nas Costas exige uma Ação Padrão para sacar, e uma Ação Padrão em combate é a coisa mais cara que existe.</p>` +
    `<p class="margem">Zona de Distorção alta tira até <b>2 Faces</b> de qualquer coisa com circuito: arma de fogo, rádio, lanterna, mira, veículo. É por isso que um operador experiente leva a lâmina. A lâmina nunca hesitou.</p>`;
  return painel("Equipamento", `Patrimônio ${f.patrimonio}`, corpo);
}

function painelProgressao(f) {
  const livre = xpLivre(f), auto = xpAutomatico(f);
  const est = estagioDe(f);
  const i = NOMES_ASCENSAO.indexOf(f.ascensao);
  const prox = ASCENSAO[i + 1];
  const corpo =
    `<div class="trilha">` + ASCENSAO.map((a, n) =>
      `<button class="trilha__passo naoimprime" type="button" data-acao="asc" data-nome="${esc(a.nome)}" data-feito="${n < i ? 1 : 0}" data-atual="${n === i ? 1 : 0}" title="Capacidade ${a.cap} · teto de atributo ${a.tetoAtr} · Vínculo ${a.vinculo}">${esc(a.nome)}</button>`
    ).join("") + `</div>` +
    `<p class="margem">Capacidade <b>${est.cap}</b> · teto de atributo <b>${est.tetoAtr}</b> · teto de especialização <b>${est.tetoEsp}</b> · sustenta Vínculo <b>${est.vinculo}</b> · Labirinto <b>${est.labirinto}</b>.</p>` +
    (prox
      ? `<p class="margem">Para o <b>${esc(prox.nome)}</b>: <b>${prox.xp} XP</b>, ${prox.ancora ? "<b>uma Âncora</b>" : "nenhuma Âncora"}, e o Labirinto ${prox.nome === "Aclarado" ? "<b>Maior</b>" : prox.nome === "Iluminado" ? "não é comprado — é concedido" : "<b>Menor</b>"}. XP abre a porta. Não paga a travessia.</p>`
      : `<p class="margem">Fim da trilha. A morte, para você, é uma porta e não uma parede — o que é reconfortante até a primeira vez que alguém precisa te explicar onde você esteve.</p>`) +
    `<div class="grade grade--2">` +
      contador("XP total ganho", "xpTotal", f.xpTotal, 0, 99999) +
      `<label class="campo"><span class="campo__rot">Gasto em Talentos e Cifras</span><input class="ent ent--num" value="${auto}" disabled></label>` +
      contador("Gasto fora de Talento e Cifra", "xpOutros", f.xpOutros, 0, 99999, "atributos, perícias, Ascensão") +
      `<label class="campo"><span class="campo__rot">Livre</span><input class="ent ent--num" value="${livre}" disabled></label>` +
    `</div>` +
    (livre < 0 ? `<p class="margem"><b>Você gastou o que não tinha.</b> A ficha não impede. O Narrador impede.</p>` : "") +
    `<div class="linha-bts naoimprime">` +
      `<button class="bt bt--casa" type="button" data-acao="sessao">+6 XP de sessão</button>` +
      `<button class="bt bt--fantasma" type="button" data-acao="sessao" data-xp="4">+4</button>` +
      `<button class="bt bt--fantasma" type="button" data-acao="sessao" data-xp="2">+2</button>` +
    `</div>` +
    `<p class="margem">Terminar a sessão dá 4. Resolver ou avançar um ponto narrativo, 2. Decisão significativa com consequência real, 2. O XP entra também no contador do Arquétipo aceso, porque é ali que o Grau mora. Não existe XP por derrotar inimigo: combate não é onde o progresso acontece, é onde ele cobra.</p>`;
  return painel("Progressão", `${livre} XP livre${livre === 1 ? "" : "s"}`, corpo, { prata: true });
}

const painelNota = (t, n, c) => painel(t, n, c, { fita: "no" });
function painelNotas(f) {
  return painelNota("Anotações", "o que não cabe em campo nenhum",
    area("", "notas", f.notas, 8) +
    `<div class="linha-bts naoimprime"><button class="bt bt--fantasma" type="button" data-acao="abreComp" data-aba="regras">Regras que se esquece na mesa</button></div>`);
}

/* A ficha se lê por assunto, não por painel solto. Cinco faixas, cada uma
   com a própria régua: o que se toca a sessão inteira, as perícias, quem o
   personagem é, o que passa pela Tessera, e o que ele carrega.

   Progressão fica em Criação: o XP e a trilha de Ascensão são o registro de
   como este personagem chegou aqui, e a Ascensão queima Âncora, que está na
   mesma faixa. */
const TOPICOS = [
  {
    rot: "Importantes", nota: "o que se toca a sessão inteira", arranjo: "grade3",
    monta: f => faixaAtributos(f) + faixaVitalidade(f) + faixaCorrupcao(f),
  },
  {
    rot: "Perícias", nota: "quinze, e só estas quinze", arranjo: "largo",
    monta: f => faixaPericias(f),
  },
  {
    rot: "Criação de Personagem", nota: "de que você é feito, e quem ficou com a conta", arranjo: "fluxo",
    monta: f => painelDossie(f) + painelArquetipo(f) + painelAfiliacao(f) +
                painelAncoras(f) + painelProgressao(f),
  },
  {
    rot: "Espiritual", nota: "tudo que passa pela Tessera", arranjo: "fluxo",
    monta: f => painelCorrentes(f) + painelCifras(f) + painelSemblante(f) + painelLabirinto(f),
  },
  {
    rot: "Utensílios", nota: "o que você leva, e o que não cabe em campo nenhum", arranjo: "fluxo",
    monta: f => painelTalentos(f) + painelEquipamento(f) + painelNotas(f),
  },
];

function desenhaTopicos() {
  const f = fichaAtiva();
  recorte = 0;
  $("#topicos").innerHTML = TOPICOS.map(t =>
    `<section class="topico" aria-label="${esc(t.rot)}">` +
      `<h2 class="topico__regua">` +
        `<i class="topico__fio" aria-hidden="true"></i>` +
        `<span class="topico__nome">${esc(t.rot)}</span>` +
        `<i class="topico__fio" aria-hidden="true"></i>` +
      `</h2>` +
      `<p class="topico__nota">${esc(t.nota)}</p>` +
      `<div class="topico__corpo topico__corpo--${t.arranjo}">${t.monta(f)}</div>` +
    `</section>`).join("");
}

function desenha() {
  desenhaCapa();
  desenhaTopicos();
  desenhaGaveta();
}

/* ------------------------------------------------------------ 10. gaveta */

function desenhaGaveta() {
  const lista = $("#listaFichas");
  lista.innerHTML = db.fichas.map(f =>
    `<div class="ficha-par">` +
      `<button class="ficha-linha" type="button" data-acao="abreFicha" data-id="${f.id}" aria-current="${f.id === db.ativa}">` +
        `<span>${esc(f.nome || "sem nome")}<small>${esc(f.afiliacao)} · ${esc(f.ascensao)}</small></span>` +
      `</button>` +
      `<button class="ficha-x" type="button" data-acao="descarta" data-id="${f.id}" title="Mandar para a lixeira" aria-label="Descartar ${esc(f.nome || "sem nome")}">✕</button>` +
    `</div>`).join("");

  const cx = $("#grupoLixeira"), lx = $("#listaLixeira");
  cx.hidden = !db.lixeira.length;
  lx.innerHTML = db.lixeira.map((f, i) =>
    `<button class="ficha-linha" type="button" data-acao="restaura" data-i="${i}">` +
    `<span>${esc(f.nome || "sem nome")}<small>restaurar</small></span></button>`).join("");
}

/* --------------------------------------------------------- 11. compêndio */

const ABAS = [
  { chave: "arquetipos", rot: "Arquétipos" },
  { chave: "talentos",   rot: "Talentos" },
  { chave: "cifras",     rot: "Cifras" },
  { chave: "tracos",     rot: "Traços" },
  { chave: "bencaos",    rot: "Bênçãos" },
  { chave: "antecedentes", rot: "Antecedentes" },
  { chave: "regras",     rot: "Regras" },
];
let compAba = "talentos", compBusca = "", compFiltro = "";

function abreCompendio(aba, filtro) {
  compAba = aba || compAba;
  compFiltro = filtro || "";
  compBusca = "";
  $("#compBusca").value = "";
  $("#compendio").hidden = false;
  $("#compAbas").innerHTML = ABAS.map(a =>
    `<button class="comp__aba" type="button" role="tab" data-aba="${a.chave}" aria-selected="${a.chave === compAba}">${esc(a.rot)}</button>`).join("");
  desenhaCompendio();
}

function casaBusca(texto) {
  if (!compBusca) return true;
  return texto.toLowerCase().includes(compBusca.toLowerCase());
}

function desenhaCompendio() {
  const f = fichaAtiva();
  const el = $("#compMiolo");
  let html = "";

  if (compAba === "arquetipos") {
    html = `<div class="comp__grade">` + DADOS.arquetipos
      .filter(a => casaBusca(a.nome + a.familia + a.resumo + a.forma))
      .map(a => `<article class="comp__ficha">` +
        `<div class="item__topo"><b class="item__nome">${esc(a.nome)}</b>` +
        `<span class="item__tags"><span class="tag tag--casa">${esc(a.familia)}</span>` +
        `<span class="tag">${esc((ATRIBUTOS.find(x => x.chave === a.atributo) || {}).rot)}</span></span></div>` +
        `<p class="item__texto">${esc(a.resumo)}</p>` +
        `<p class="item__texto"><b>${esc(a.forma)}.</b> ${esc(a.passiva)}</p>` +
        `<p class="item__texto"><b>Ativa.</b> ${esc(a.ativa)}</p>` +
        `<p class="item__texto"><b>O que ele não faz.</b> ${esc(a.limite)}</p>` +
        `<div class="item__acoes">` +
          `<button class="bt bt--fino bt--casa" type="button" data-acao="usaArq" data-nome="${esc(a.nome)}">operar assim</button>` +
          `<button class="bt bt--fino bt--fantasma" type="button" data-acao="vePrateleira" data-nome="${esc(a.nome)}">prateleira</button>` +
        `</div></article>`).join("") + `</div>`;

  } else if (compAba === "talentos") {
    const arq = arquetipoDe(f);
    const fontes = ["Geral"].concat(DADOS.arquetipos.map(a => a.nome));
    const todos = DADOS.arquetipos.flatMap(a => a.prateleira).concat(DADOS.talentosGerais);
    const filtrados = todos.filter(t =>
      (!compFiltro || t.fonte === compFiltro) && casaBusca(t.nome + " " + t.efeito + " " + t.fonte));
    const nivel = arq ? nivelGrau(grauDe(f).xp) : 0;

    html = `<div class="comp__filtros">` +
      `<button class="chip" type="button" data-filtro="" aria-pressed="${!compFiltro}">tudo</button>` +
      fontes.map(x => `<button class="chip" type="button" data-filtro="${esc(x)}" aria-pressed="${compFiltro === x}">${esc(x)}</button>`).join("") +
      `</div><div class="comp__grade">` +
      filtrados.map(t => {
        const tem = temTalento(f, t.nome);
        const alheio = t.fonte !== "Geral" && t.fonte !== f.arquetipo;
        const fechado = !alheio && nivel < t.grau;
        return `<article class="comp__ficha">` +
          `<div class="item__topo"><b class="item__nome">${esc(t.nome)}</b>` +
          `<span class="item__tags"><span class="tag">${esc(t.patamar)} · ${t.xp} XP</span>` +
          `<span class="tag">${esc(t.modo)}</span>` +
          (t.carga ? `<span class="tag tag--prata">Carga ${t.carga}</span>` : "") +
          `<span class="tag${t.fonte === "Geral" ? "" : " tag--casa"}">${esc(t.fonte)}</span></span></div>` +
          `<p class="item__texto">${esc(t.efeito)}</p>` +
          (alheio ? `<p class="item__texto"><b>Prateleira de outro Arquétipo.</b> Ninguém fora do ${esc(t.fonte)} compra daqui.</p>`
            : fechado ? `<p class="item__texto"><b>Patamar ${esc(t.patamar)} fechado.</b> Exige Grau ${t.grau}; você está no ${nivel}.</p>` : "") +
          `<div class="item__acoes">` +
            (tem ? `<span class="tag tag--casa">já é seu</span>`
                 : `<button class="bt bt--fino bt--casa" type="button" data-acao="pegaTalento" data-nome="${esc(t.nome)}" data-fonte="${esc(t.fonte)}">comprar por ${t.xp}</button>`) +
          `</div></article>`;
      }).join("") + `</div>`;

  } else if (compAba === "cifras") {
    const filtradas = DADOS.cifras.filter(c =>
      (!compFiltro || c.pilar === compFiltro) && casaBusca(c.nome + " " + c.efeito + " " + c.pilar + " " + (c.sigilos || []).join(" ")));
    html = `<div class="comp__filtros">` +
      `<button class="chip" type="button" data-filtro="" aria-pressed="${!compFiltro}">os seis</button>` +
      NOMES_PILARES.map(p => `<button class="chip" type="button" data-filtro="${esc(p)}" aria-pressed="${compFiltro === p}">${esc(p)}</button>`).join("") +
      `</div><div class="comp__grade">` +
      filtradas.map(c => {
        const tem = temCifra(f, c.nome, c.pilar);
        const v = VINCULOS[c.vinculo];
        return `<article class="comp__ficha">` +
          `<div class="item__topo"><b class="item__nome">${esc(c.nome)}</b>` +
          `<span class="item__tags"><span class="tag tag--casa">${esc(c.pilar)}</span>` +
          `<span class="tag tag--prata">${esc(c.vinculo)}</span><span class="tag">${esc(c.tipo)}</span></span></div>` +
          `<p class="item__texto"><b>${esc((c.sigilos || []).join(" + "))}</b> · gatilho: ${esc(c.gatilho)}</p>` +
          `<p class="item__texto">${esc(c.efeito)}</p>` +
          `<div class="item__acoes">` +
            (tem ? `<span class="tag tag--casa">já sabe</span>`
                 : `<button class="bt bt--fino bt--casa" type="button" data-acao="pegaCifra" data-nome="${esc(c.nome)}" data-pilar="${esc(c.pilar)}">aprender · ${v.xp} XP e ${v.assentada} Assentada</button>`) +
          `</div></article>`;
      }).join("") + `</div>`;

  } else if (compAba === "tracos") {
    html = `<div class="comp__grade">` +
      DADOS.tracos.alma.filter(t => casaBusca(t.nome + t.efeito + t.pilar)).map(t =>
        `<article class="comp__ficha"><div class="item__topo"><b class="item__nome">${esc(t.nome)}</b>` +
        `<span class="item__tags"><span class="tag tag--casa">${esc(t.pilar)}</span><span class="tag tag--prata">Alma</span></span></div>` +
        `<p class="item__texto">${esc(t.efeito)}</p></article>`).join("") +
      DADOS.tracos.pessoais.filter(t => casaBusca(t.nome + t.efeito)).map(t =>
        `<article class="comp__ficha"><div class="item__topo"><b class="item__nome">${esc(t.nome)}</b>` +
        `<span class="item__tags"><span class="tag">Pessoal</span></span></div>` +
        `<p class="item__texto">${esc(t.efeito)}</p></article>`).join("") + `</div>`;

  } else if (compAba === "bencaos") {
    html = `<div class="comp__grade">` + DADOS.bencaos
      .filter(b => casaBusca(b.nome + b.efeito + b.pilar)).map(b => {
        const tem = f.bencaos.some(x => x.nome === b.nome);
        return `<article class="comp__ficha"><div class="item__topo"><b class="item__nome">${esc(b.nome)}</b>` +
          `<span class="item__tags"><span class="tag tag--casa">${esc(b.pilar)}</span></span></div>` +
          `<p class="item__texto">${esc(b.efeito)}</p>` +
          `<div class="item__acoes">` + (tem ? `<span class="tag tag--casa">recebida</span>` :
            `<button class="bt bt--fino bt--casa" type="button" data-acao="pegaBencao" data-nome="${esc(b.nome)}">aceitar</button>`) +
          `</div></article>`;
      }).join("") + `</div>` +
      `<p class="margem" style="color:var(--prata-1);border-color:var(--casa)">Estas seis servem de referência. Um Semblante em Ressonância 3 oferece o que aquele Semblante decidir oferecer àquela pessoa, e o Narrador escreve na hora.</p>`;

  } else if (compAba === "antecedentes") {
    html = `<div class="comp__grade">` + DADOS.antecedentes
      .filter(a => casaBusca(a.nome + a.resumo + a.efeito + a.pericia + a.conhecimento)).map(a =>
        `<article class="comp__ficha"><div class="item__topo"><b class="item__nome">${esc(a.nome)}</b>` +
        `<span class="item__tags"><span class="tag">${esc(a.pericia)}</span><span class="tag tag--casa">${esc(a.conhecimento)}</span></span></div>` +
        `<p class="item__texto">${esc(a.resumo)}</p>` +
        `<p class="item__texto"><b>${esc(a.habilidade)}</b> — ${esc(a.efeito)}</p>` +
        `<div class="item__acoes"><button class="bt bt--fino bt--casa" type="button" data-acao="usaAntecedente" data-nome="${esc(a.nome)}">era esse o meu emprego</button></div>` +
        `</article>`).join("") + `</div>`;

  } else {
    html = `<div class="comp__grade">` + REGRAS
      .filter(r => casaBusca(r.t + " " + r.c)).map(r =>
        `<article class="comp__ficha"><div class="item__topo"><b class="item__nome">${esc(r.t)}</b></div>` +
        `<p class="item__texto">${r.c}</p></article>`).join("") + `</div>`;
  }

  el.innerHTML = html;
  $$("#compAbas .comp__aba").forEach(b => b.setAttribute("aria-selected", b.dataset.aba === compAba));
}

/* O que a mesa esquece e procura no meio da cena. */
const REGRAS = [
  { t: "Ler o dado", c: "<b>1</b> Terrível · <b>2 a 5</b> Falha · <b>6 a 9</b> Sucesso · <b>10 ou mais</b> Sucesso Duplo. Os dois dados são lidos separados; não se somam." },
  { t: "Dificuldade", c: "1 sucesso Padrão · 2 Difícil · 3 Extremo. O ND é definido <b>antes</b> do teste, nunca depois." },
  { t: "Face", c: "A escada é D6 · D8 · D10 · D12 · D20. +1 Face sobe um passo, −1 desce. D6 é o chão: o dado que desceria abaixo dele sai do teste, e quem perde os dois falha sem rolar." },
  { t: "Vantagem e Desvantagem", c: "Vantagem: role um dado a mais, igual ao do Atributo Chave. Desvantagem: perde o dado de Perícia; se já rolava só o atributo, ele desce 1 Face. As duas se cancelam." },
  { t: "Ações", c: "Uma Ação Padrão por Foco, sem exceção. Ações Livres, quantas a mesa aceitar como razoável. Uma reação por rodada — contra três inimigos você responde a um, e os outros dois acertam." },
  { t: "Reações", c: "<b>Esquivar</b> (Movimentação): o ataque erra por completo. <b>Bloquear</b> (Fortitude): conecta, dano pela metade. <b>Revidar</b> (Briga): erra e você acerta de volta. Empate favorece o atacante." },
  { t: "Passar o Foco", c: "Sempre para o lado oposto. Aliado agiu, o próximo é inimigo. Ninguém age duas vezes na mesma rodada. Quem age escolhe o inimigo; o Narrador escolhe o aliado." },
  { t: "Sequência", c: "Declare quantos golpes <b>antes</b> de rolar. O dado de Atributo desce 1 Face por golpe além do primeiro; o de Perícia não muda. Cada sucesso é um acerto, Duplo conta dois." },
  { t: "Cobertura", c: "Simples (mesa virada, carro, batente): −1 Face contra você. Robusta (concreto, muro): −2 Faces. Nenhuma protege do que já está dentro dela com você." },
  { t: "Condições", c: "<b>Caído</b> −1 Face, corpo a corpo contra você +1 · <b>Desprevenido</b> não reage · <b>Atordoado</b> perde a Ação Padrão · <b>Imobilizado</b> não move nem esquiva · <b>Cego</b> −2 Faces no que depende de ver · <b>Provocado</b> −1 Face contra quem não provocou." },
  { t: "Teste de Domínio", c: "Espírito + Domínio. Não decide se funcionou — decide quanta alma fica. Baixo: sem ND, retém 1 só em Terrível. Médio: ND 2, retém 0/1/2. Alto: ND 3, retém 0/2/3." },
  { t: "Repouso", c: "<b>Rápido</b>: um quarto da Vitalidade e metade da Recente. <b>Completo</b> em Local Seguro: metade da Vitalidade, toda a Recente e 1 de Assentada — 2 numa Árvore Prateada. Um por dia." },
  { t: "Contato", c: "Uma cena presencial com uma Âncora remove 1 de Assentada, e é a única forma fora de um Local Seguro. Não acumula com Repouso Completo no mesmo intervalo: escolha um." },
  { t: "A Roda", c: "Pesadelo desfaz Extinção · Extinção desfaz Origem · Origem desfaz Tormento · Tormento desfaz Causalidade · Causalidade desfaz Controle · Controle desfaz Pesadelo. Gira nessa ordem e não gira ao contrário." },
  { t: "Distorção", c: "Zona elevada: −1 Face em equipamento de circuito. Zona alta: −2. Vale para arma de fogo, rádio, lanterna, mira e veículo. Não vale para lâmina, corda nem pessoa." },
  { t: "Alfabetização", c: "<b>Falante</b>: todo Ascendido. <b>Leitor</b>: Especialização 2 em Domínio — identifica Sigilos, Vínculo e Pilar sem teste. <b>Escritor</b>: Especialização 3 e Ressonância 1 — compõe sequências novas." },
  { t: "Dialeto", c: "Replicar Cifra sinalizada em dialeto que não é o seu custa −1 Face. A penalidade some depois de uma cena inteira de convivência com falantes dele. Não é dificuldade técnica. É sotaque." },
  { t: "Falhar", c: "Uma falha não é o fim da cena, é uma virada dentro dela. E existe uma coisa que a falha nunca faz: não desfaz uma Cifra. Você pode falhar em muita coisa. Nunca em ser ouvido pela própria alma." },
];

/* ------------------------------------------------------------- 12. ações */

function comFicha(fn) {
  const f = fichaAtiva();
  if (!f) return;
  fn(f);
  grava();
  desenha();
}

/* O que uma escolha concede, ela concede sozinha: perícia, Conhecimento e
   habilidade saem juntos. Trocar de Antecedente devolve a concessão antiga
   antes de aplicar a nova, senão o jogador acumula perícia de emprego que
   nunca teve. */
function vesteAntecedente(f, nome) {
  const ant = DADOS.antecedentes.find(x => x.nome === nome);
  f.antecedente = ant ? ant.nome : "";
  f.concessoes.antecedente = ant && TODAS_PERICIAS.includes(ant.pericia) ? ant.pericia : "";
  f.conhecimento = ant ? (ant.conhecimento === "indefinido" ? "" : ant.conhecimento) : "";
  return ant;
}

const ACOES = {
  atr(f, d) {
    const teto = estagioDe(f).tetoAtr;
    f.attrs[d.alvo] = num(f.attrs[d.alvo] + Number(d.d), 1, teto, 1);
  },
  per(f, d) {
    const teto = estagioDe(f).tetoEsp;
    const gratis = concedidoEm(f, d.alvo);
    /* o nível gratuito ocupa lugar no teto, então o comprado para antes */
    f.pericias[d.alvo] = num((f.pericias[d.alvo] || 0) + Number(d.d), 0, Math.max(0, teto - gratis), 0);
  },
  vit(f, d) {
    const n = Number(d.n);
    f.vitNivel = f.vitNivel === n ? Math.max(0, n - 1) : n;
    f.vitPontos = vitMax(f);
  },
  vitCheia(f) { f.vitNivel = 5; f.vitPontos = vitMax(f); },
  vitPts(f, d) {
    const alvo = Number(d.n);
    f.vitPontos = num(vitPontosDe(f) === alvo ? alvo - 1 : alvo, 0, vitMax(f), 0);
  },

  /* Clicar numa casa diz onde o total deve parar; quem se mexe para chegar
     lá é a Recente, porque Assentada e Carga não são dela. Clicar na última
     casa cheia volta uma, que é como se desconta uma Cifra que não pegou. */
  corr(f, d) {
    const alvo = Number(d.n);
    const piso = f.corrAssentada + cargaAcesa(f);
    const total = corrTotal(f);
    const querido = total === alvo ? alvo - 1 : alvo;
    f.corrRecente = Math.max(0, querido - piso);
  },

  passoNum(f, d) {
    const atual = Number(leCaminho(f, d.campo)) || 0;
    escreveCaminho(f, d.campo, num(atual + Number(d.d), Number(d.min), Number(d.max), 0));
  },

  repousoRapido(f) {
    f.vitPontos = Math.min(vitMax(f), f.vitPontos + Math.max(1, Math.floor(vitMax(f) / 4)));
    f.corrRecente = Math.floor(f.corrRecente / 2);
    avisa("Repouso rápido: um quarto da Vitalidade, metade da Recente. Assentada e Carga não se mexem.");
  },
  repousoCompleto(f) {
    f.vitPontos = Math.min(vitMax(f), f.vitPontos + Math.floor(vitMax(f) / 2));
    f.corrRecente = 0;
    f.corrAssentada = Math.max(0, f.corrAssentada - 1);
    avisa("Repouso completo em Local Seguro. É aqui, e só aqui, que você troca quais Talentos estão acesos.");
  },
  repousoArvore(f) {
    f.vitPontos = Math.min(vitMax(f), f.vitPontos + Math.floor(vitMax(f) / 2));
    f.corrRecente = 0;
    f.corrAssentada = Math.max(0, f.corrAssentada - 2);
    avisa("Árvore Prateada: 2 de Assentada. Ela também é ponto de requisição, conforme a sua Confiança.");
  },

  marca(f, d) {
    const a = f.arquetipo; if (!a) return;
    f.graus[a] = f.graus[a] || { xp: 0, marcas: [] };
    const m = f.graus[a].marcas;
    while (m.length <= Number(d.i)) m.push("");
    m[Number(d.i)] = m[Number(d.i)] === d.tipo ? "" : d.tipo;
  },

  acende(f, d) {
    const t = f.talentos[Number(d.i)]; if (!t) return;
    if (!t.ativo && pesoAceso(f) + t.xp > capacidadeDe(f)) {
      avisa(`Não cabe. ${t.nome} pesa ${t.xp} e sobram ${capacidadeDe(f) - pesoAceso(f)} de Capacidade.`);
      return;
    }
    t.ativo = !t.ativo;
  },
  apagaTudo(f) { f.talentos.forEach(t => { t.ativo = false; }); },
  tiraTalento(f, d) {
    const t = f.talentos[Number(d.i)]; if (!t) return;
    const copia = Object.assign({}, t);
    f.talentos.splice(Number(d.i), 1);
    avisa(`${copia.nome} saiu da ficha.`, 7000, "desfazer", () => comFicha(g => { g.talentos.push(copia); }));
  },
  tiraCifra(f, d) {
    const c = f.cifras[Number(d.i)]; if (!c) return;
    const copia = Object.assign({}, c);
    f.cifras.splice(Number(d.i), 1);
    avisa(`${copia.nome} saiu da ficha. A Corrupção que ela assentou não sai junto.`, 7000, "desfazer",
      () => comFicha(g => { g.cifras.push(copia); }));
  },
  tiraBencao(f, d) { f.bencaos.splice(Number(d.i), 1); },

  traco(f, d) {
    const i = f.labTracos.indexOf(d.nome);
    if (i >= 0) { f.labTracos.splice(i, 1); return; }
    const limite = Math.max(0, estagioDe(f).lab - 1);
    if (f.labTracos.length >= limite) {
      avisa(limite === 0
        ? "Traço Pessoal só a partir do Despertado. No Despertar você tem apenas o Traço de Alma."
        : `Você já escolheu ${limite}. Escolher é para sempre, e ninguém redecora a própria cabeça duas vezes.`);
      return;
    }
    f.labTracos.push(d.nome);
  },

  queima(f, d) { const a = f.ancoras[Number(d.i)]; if (a) a.queimada = !a.queimada; },
  novaAncora(f) { f.ancoras.push({ nome: "", acredita: "", faria: "", queimada: false }); },
  tiraAncora(f, d) { if (f.ancoras.length > 2) f.ancoras.splice(Number(d.i), 1); },

  ress(f, d) { f.ressonancia = num(d.n, 0, 3, 0); },
  asc(f, d) { if (NOMES_ASCENSAO.includes(d.nome)) f.ascensao = d.nome; },

  sessao(f, d) {
    const x = Number(d.xp) || 6;
    f.xpTotal += x;
    if (f.arquetipo) {
      f.graus[f.arquetipo] = f.graus[f.arquetipo] || { xp: 0, marcas: [] };
      const antes = nivelGrau(f.graus[f.arquetipo].xp);
      f.graus[f.arquetipo].xp += x;
      const dep = nivelGrau(f.graus[f.arquetipo].xp);
      if (dep > antes) {
        avisa(dep % 2
          ? `Grau ${dep} como ${f.arquetipo}: abre o patamar ${PATAMAR_DO_GRAU[dep]}. Abrir não dá Talento nenhum — dá permissão de comprar.`
          : `Grau ${dep} como ${f.arquetipo}: uma Marca. Endurecer o corpo ou alargar o cordão, e a escolha não se refaz.`, 8000);
      }
    }
  },

  usaArq(f, d) { f.arquetipo = d.nome; fechaCompendio(); },
  vePrateleira(f, d) { compFiltro = d.nome; compAba = "talentos"; abreCompendio("talentos", d.nome); },
  usaAntecedente(f, d) {
    const a = vesteAntecedente(f, d.nome); if (!a) return;
    fechaCompendio();
    avisa(`${a.nome}: perícia ${a.pericia} e Conhecimento ${a.conhecimento}, já somados. A habilidade ${a.habilidade} está no Dossiê.`, 6000);
  },
  voltaLista(f) { f.culturaLivre = false; f.cultura = ""; },

  pegaTalento(f, d) {
    const todos = DADOS.arquetipos.flatMap(a => a.prateleira).concat(DADOS.talentosGerais);
    const t = todos.find(x => x.nome === d.nome && x.fonte === d.fonte);
    if (!t || temTalento(f, t.nome)) return;
    f.talentos.push({
      nome: t.nome, fonte: t.fonte, patamar: t.patamar, xp: t.xp,
      carga: t.carga, modo: t.modo, efeito: t.efeito,
      ativo: pesoAceso(f) + t.xp <= capacidadeDe(f),
    });
    const alheio = t.fonte !== "Geral" && t.fonte !== f.arquetipo;
    avisa(`${t.nome} comprado por ${t.xp} XP.` +
      (t.carga ? ` Carga ${t.carga}: enquanto estiver aceso, ocupa Corrupção.` : "") +
      (alheio ? ` Só que esta é a prateleira do ${t.fonte}, e ninguém de fora compra dela — combine com o Narrador.` : ""));
  },
  pegaCifra(f, d) {
    const c = DADOS.cifras.find(x => x.nome === d.nome && x.pilar === d.pilar);
    if (!c || temCifra(f, c.nome, c.pilar)) return;
    const v = VINCULOS[c.vinculo];
    f.cifras.push({
      nome: c.nome, pilar: c.pilar, vinculo: c.vinculo, tipo: c.tipo,
      sigilos: c.sigilos, gatilho: c.gatilho, efeito: c.efeito,
    });
    f.corrAssentada += v.assentada;
    avisa(`${c.nome}: ${v.xp} XP e ${v.assentada} de Corrupção Assentada. Aprender custa alma, e essa não sai com repouso comum.`);
  },
  pegaBencao(f, d) {
    const b = DADOS.bencaos.find(x => x.nome === d.nome);
    if (!b || f.bencaos.some(x => x.nome === b.nome)) return;
    f.bencaos.push({ nome: b.nome, pilar: b.pilar, efeito: b.efeito });
    avisa("Aceita. Bênção não custa XP, não ocupa Capacidade — e pode ser retirada.");
  },

  recolhe(f, d) {
    const i = f.recolhidos.indexOf(d.chave);
    if (i >= 0) f.recolhidos.splice(i, 1); else f.recolhidos.push(d.chave);
  },
  abreComp(f, d) { abreCompendio(d.aba, d.filtro); },
  abreFicha(f, d) { db.ativa = d.id; },
  duplica(f) {
    const copia = normaliza(JSON.parse(JSON.stringify(f)));
    copia.id = uid();
    copia.nome = (f.nome || "sem nome") + " (cópia)";
    db.fichas.push(copia); db.ativa = copia.id;
    avisa("Cópia feita. Serve para testar outro Arquétipo sem desmontar o que já funciona.");
  },
  descarta(f, d) {
    const i = db.fichas.findIndex(x => x.id === d.id);
    if (i < 0) return;
    const v = db.fichas.splice(i, 1)[0];
    db.lixeira.unshift(v);
    if (!db.fichas.length) { const nova = fichaEmBranco(); db.fichas.push(nova); db.ativa = nova.id; }
    if (db.ativa === v.id) db.ativa = db.fichas[0].id;
    avisa(`${v.nome || "A ficha sem nome"} foi para a lixeira. Nada foi apagado.`, 8000, "desfazer", () => comFicha(() => {
      const j = db.lixeira.findIndex(x => x.id === v.id);
      if (j >= 0) { db.fichas.push(db.lixeira.splice(j, 1)[0]); db.ativa = v.id; }
    }));
  },
  restaura(f, d) {
    const v = db.lixeira.splice(Number(d.i), 1)[0];
    if (v) { db.fichas.push(v); db.ativa = v.id; }
  },
};

function fechaCompendio() { $("#compendio").hidden = true; }

/* --------------------------------------------------------- 13. os eventos */

document.addEventListener("click", ev => {
  const bt = ev.target.closest("[data-acao]");
  if (bt) {
    const acao = ACOES[bt.dataset.acao];
    if (acao) { ev.preventDefault(); comFicha(f => acao(f, bt.dataset)); return; }
  }
  const aba = ev.target.closest("#compAbas .comp__aba");
  if (aba) { compAba = aba.dataset.aba; compFiltro = ""; desenhaCompendio(); return; }
  const chip = ev.target.closest(".comp__filtros .chip");
  if (chip) { compFiltro = chip.dataset.filtro; desenhaCompendio(); return; }
});

/* Campo de texto não redesenha a tela a cada tecla: perder o cursor no meio
   de uma frase é pior do que ver um derivado defasado por meio segundo. */
document.addEventListener("input", ev => {
  const el = ev.target.closest("[data-campo]");
  if (el) {
    const f = fichaAtiva(); if (!f) return;
    const caminho = el.dataset.campo;
    let v = el.value;
    if (el.type === "number") v = num(v, Number(el.min || -9999), Number(el.max || 99999), 0);
    /* select grava e redesenha no change: escrever aqui também montaria a
       tela duas vezes por escolha, e a segunda montagem perdia o foco. */
    if (el.tagName === "SELECT") return;
    escreveCaminho(f, caminho, v);
    grava();
    atualizaDerivados();
    return;
  }
  if (ev.target.id === "compBusca") { compBusca = ev.target.value.trim(); desenhaCompendio(); }
});

/* Troca que reimprime o dossiê inteiro passa por aqui, e aí sim redesenha. */
document.addEventListener("change", ev => {
  const el = ev.target.closest("[data-campo]");
  if (!el) return;
  const caminho = el.dataset.campo;
  const ehSelect = el.tagName === "SELECT";
  /* texto e área já foram gravados no input; aqui só o que muda a tela */
  if (!ehSelect && el.type !== "number") return;

  comFicha(f => {
    if (caminho === "antecedente") {
      const a = vesteAntecedente(f, el.value);
      if (a) avisa(`${a.nome}: perícia ${a.pericia} e Conhecimento ${a.conhecimento}, somados sozinhos. A habilidade ${a.habilidade} está aqui embaixo.`, 6000);
      return;
    }
    if (caminho === "cultura" && el.value === "Outra…") { f.culturaLivre = true; f.cultura = ""; return; }

    escreveCaminho(f, caminho, el.value);
    if (caminho === "cultura") f.culturaLivre = false;
    if (caminho === "linhagem") {
      f.vitPontos = Math.min(f.vitPontos, vitMax(f));
      avisa(`${el.value}: Vitalidade ${LINHAGENS[el.value].vit}, Limiar ${LINHAGENS[el.value].limiar}. Ninguém é bom nas duas coisas ao mesmo tempo.`);
    }
    if (caminho === "arquetipo" && el.value) {
      f.graus[el.value] = f.graus[el.value] || { xp: 0, marcas: [] };
      avisa("O contador do Arquétipo anterior congelou onde estava, e volta a correr se você voltar. As Marcas dele, não: um corpo se desacostuma.", 8000);
    }
    if (caminho === "concessoes.cultura" && el.value) {
      avisa(`A Cultura passa a conceder um nível em ${el.value}. Ele soma na perícia e não pode ser gasto — mora na Cultura, e some junto se ela mudar.`, 6000);
    }
  });
});

/* Só os números derivados, sem mexer no DOM de quem está digitando. */
function atualizaDerivados() {
  const f = fichaAtiva(); if (!f) return;
  const est = estadoCorrupcao(f);
  const el = $(".corr__num");
  if (el) el.textContent = `${corrTotal(f)} / ${limiarDe(f)}`;
  const es = $(".corr__estado");
  if (es) { es.textContent = est.nome; es.dataset.grave = est.grave ? "1" : "0"; }
}

/* ------------------------------------------------- 14. gaveta e arquivos */

const ARRANJOS = ["normal", "apertado", "espacoso"];
const ROTULO_ARRANJO = { normal: "normal", apertado: "mais na tela", espacoso: "menos na tela" };

function aplicaArranjo(modo) {
  const m = ARRANJOS.includes(modo) ? modo : "normal";
  document.documentElement.dataset.arranjo = m;
  const bt = $("#btArranjo"); if (bt) bt.textContent = "Arranjo: " + ROTULO_ARRANJO[m];
  try { localStorage.setItem(LS_ARRANJO, m); } catch (e) { /* sem armazenamento, sem memória */ }
}
function aplicaGaveta(estado) {
  document.body.dataset.gaveta = estado === "fechada" ? "fechada" : "aberta";
  try { localStorage.setItem(LS_GAVETA, document.body.dataset.gaveta); } catch (e) { /* idem */ }
}

function baixa(nome, texto) {
  const b = new Blob([texto], { type: "application/json" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u; a.download = nome; a.click();
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}

function ligaGaveta() {
  $("#btNova").onclick = () => {
    const f = fichaEmBranco();
    db.fichas.push(f); db.ativa = f.id;
    grava(); desenha();
    avisa("Ficha nova. Comece pela Linhagem: ela responde as duas perguntas que nada mais responde.");
  };
  $("#btDuplica").onclick = () => comFicha(f => ACOES.duplica(f));
  $("#btAbreTudo").onclick = () => comFicha(f => {
    if (!f.recolhidos.length) { avisa("Nenhum bloco recolhido. O ▾ na tarja de cada um recolhe."); return; }
    f.recolhidos = [];
  });
  $("#btArranjo").onclick = () => {
    const i = ARRANJOS.indexOf(document.documentElement.dataset.arranjo || "normal");
    aplicaArranjo(ARRANJOS[(i + 1) % ARRANJOS.length]);
  };
  $("#btRecolhe").onclick = () => aplicaGaveta("fechada");
  $("#btLombada").onclick = () => aplicaGaveta("aberta");
  $("#btPdf").onclick = () => window.print();
  $("#btCompendio").onclick = () => abreCompendio(compAba);
  $("#btFechaComp").onclick = fechaCompendio;

  $("#btBackup").onclick = () => {
    escreve();
    const hoje = new Date().toISOString().slice(0, 10);
    baixa(`devaneio-fichas-${hoje}.json`,
      JSON.stringify({ versao: 2, fichas: db.fichas, ativa: db.ativa, lixeira: db.lixeira }, null, 1));
    avisa("Backup completo baixado. As fichas moram no navegador — leve o arquivo se trocar de máquina.");
  };

  $("#btImporta").onclick = () => $("#arquivoImporta").click();
  $("#arquivoImporta").onchange = ev => {
    const arq = ev.target.files && ev.target.files[0];
    if (!arq) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const o = JSON.parse(leitor.result);
        const lista = Array.isArray(o) ? o : (o.fichas || o.chars || []);
        if (!lista.length) { avisa("Não achei ficha nenhuma nesse arquivo."); return; }
        /* importar nunca substitui: entra do lado, com id novo */
        const novas = lista.map(x => { const f = normaliza(x); f.id = uid(); return f; });
        db.fichas = db.fichas.concat(novas);
        db.ativa = novas[0].id;
        grava(); desenha();
        avisa(`${novas.length} ficha${novas.length > 1 ? "s" : ""} importada${novas.length > 1 ? "s" : ""}. Nada foi substituído.`);
      } catch (e) { avisa("Esse arquivo não abriu como ficha do Devaneio."); }
      ev.target.value = "";
    };
    leitor.readAsText(arq);
  };

  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && !$("#compendio").hidden) fechaCompendio();
  });
  window.addEventListener("beforeunload", escreve);
}

/* ----------------------------------------------------------- 15. começar */

function inicia() {
  try { aplicaArranjo(localStorage.getItem(LS_ARRANJO)); } catch (e) { aplicaArranjo("normal"); }
  try { aplicaGaveta(localStorage.getItem(LS_GAVETA) || "fechada"); } catch (e) { aplicaGaveta("fechada"); }
  carrega();
  ligaGaveta();
  desenha();
  marcaEstado("gravado");
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicia);
else inicia();
