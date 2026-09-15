/* Lê o texto do livro 0.73 em ordem de leitura (pdftotext -enc UTF-8, sem -layout)
   e monta os catálogos que a ficha consome. Só extrai: o que não casar é
   reportado em voz alta, nunca transformado em silêncio.

   uso:  node extrai_dados.js devaneio073.txt dados_livro.json            */

const fs = require("fs");
const ENTRADA = process.argv[2] || "devaneio073.txt";
const SAIDA = process.argv[3] || "dados_livro.json";

const cru = fs.readFileSync(ENTRADA, "utf8").split("\n").map(l => l.replace(/\r$/, ""));

/* número de página solto e linha vazia não são conteúdo */
const util = l => l.trim() && !/^\d{1,3}$/.test(l.trim());
const limpa = s => String(s).replace(/\s+/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
const junta = (ini, fim) => limpa(cru.slice(ini, fim).filter(util).join(" "));

const avisos = [];
const aviso = m => { avisos.push(m); };

/* índice da primeira linha que é exatamente `texto`, a partir de `de` */
function linhaExata(texto, de = 0) {
  for (let i = de; i < cru.length; i++) if (cru[i].trim() === texto) return i;
  return -1;
}
function linhaRe(re, de = 0) {
  for (let i = de; i < cru.length; i++) if (re.test(cru[i].trim())) return i;
  return -1;
}

/* ------------------------------------------------------------------
   Talentos: "Nome. Ativo|Passivo. [Carga N.] efeito e condição."
   Um patamar inteiro vira uma string só antes de ser fatiado, porque o
   PDF quebra entrada no meio da página e junta três numa linha na outra.
   ------------------------------------------------------------------ */
const RE_TALENTO = /(^|\s)([A-ZÀ-ÚÂ-Û][\p{L}\p{M}'’ ]{1,44})\.\s+(Ativo|Passivo)\.\s+/gu;

function fatiaTalentos(texto, contexto) {
  const marcas = [];
  for (const m of texto.matchAll(RE_TALENTO)) {
    marcas.push({ nome: limpa(m[2]), modo: m[3], ini: m.index + m[1].length, corpo: m.index + m[0].length });
  }
  if (!marcas.length) aviso(`nenhum talento em ${contexto}`);
  return marcas.map((m, i) => {
    let resto = limpa(texto.slice(m.corpo, i + 1 < marcas.length ? marcas[i + 1].ini : texto.length));
    let carga = 0;
    const c = resto.match(/^Carga (\d+)\.\s*/);
    if (c) { carga = Number(c[1]); resto = resto.slice(c[0].length); }
    const corr = resto.match(/^Custa (\d+) de Corrupção Recente\.\s*/);
    let corrupcao = 0;
    if (corr) { corrupcao = Number(corr[1]); resto = resto.slice(corr[0].length); }
    return { nome: m.nome, modo: m.modo, carga, corrupcao, efeito: resto };
  });
}

/* ------------------------------------------------------------------
   Arquétipos
   ------------------------------------------------------------------ */
const FAMILIAS = [
  { familia: "Baluarte", atributo: "corpo", nomes: ["Bastião", "Batedor", "Ligeiro"] },
  { familia: "Prospector", atributo: "raciocinio", nomes: ["Sentinela", "Pesquisador", "Espião"] },
  { familia: "Canalizador", atributo: "espirito", nomes: ["Arquivista", "Invocador", "Intérprete"] },
  { familia: "Regente", atributo: "influencia", nomes: ["Manipulador", "Estrategista", "Agitador"] },
];
const PATAMARES = [
  { grau: 1, algarismo: "I", xp: 2 },
  { grau: 3, algarismo: "II", xp: 4 },
  { grau: 5, algarismo: "III", xp: 6 },
  { grau: 7, algarismo: "IV", xp: 8 },
];

function arquetipos() {
  const cap4 = linhaExata("Capítulo 4, Arquétipos");
  const cap5 = linhaExata("Capítulo 5, Progressão");
  if (cap4 < 0 || cap5 < 0) throw new Error("capítulo 4 ou 5 não encontrado");

  const ordem = FAMILIAS.flatMap(f => f.nomes.map(n => ({ ...f, nome: n })));
  const marcos = ordem.map(a => {
    const i = linhaExata(a.nome, cap4);
    if (i < 0) throw new Error(`arquétipo ${a.nome} não encontrado`);
    return { ...a, linha: i };
  }).sort((a, b) => a.linha - b.linha);

  return marcos.map((a, k) => {
    const fim = k + 1 < marcos.length ? marcos[k + 1].linha : cap5;
    const iForma = linhaRe(/^Forma de operar:/, a.linha);
    if (iForma < 0 || iForma > fim) throw new Error(`forma de operar de ${a.nome}`);

    const resumo = junta(a.linha + 1, iForma);
    const forma = cru[iForma].replace(/^Forma de operar:\s*/, "").replace(/\.$/, "").trim();

    const iPat = PATAMARES.map(p => linhaExata("Patamar " + p.algarismo, iForma));
    iPat.forEach((i, n) => { if (i < 0 || i > fim) throw new Error(`patamar ${PATAMARES[n].algarismo} de ${a.nome}`); });

    const miolo = junta(iForma + 1, iPat[0]);
    const passiva = (miolo.match(/Passiva\.\s*(.*?)\s*Ativa, uma vez por cena\./s) || [])[1] || "";
    const ativa = (miolo.match(/Ativa, uma vez por cena\.\s*(.*?)\s*O que ele não faz\./s) || [])[1] || "";
    const limite = (miolo.match(/O que ele não faz\.\s*(.*)$/s) || [])[1] || "";
    if (!passiva || !ativa || !limite) aviso(`forma de operar incompleta em ${a.nome}`);

    const prateleira = [];
    PATAMARES.forEach((p, n) => {
      const ini = iPat[n] + 1;
      const fimPat = n + 1 < iPat.length ? iPat[n + 1] : fim;
      for (const t of fatiaTalentos(junta(ini, fimPat), `${a.nome} patamar ${p.algarismo}`)) {
        prateleira.push({ ...t, patamar: p.algarismo, grau: p.grau, xp: p.xp, fonte: a.nome });
      }
    });
    if (prateleira.length !== 12) aviso(`${a.nome} tem ${prateleira.length} talentos, esperados 12`);

    return {
      nome: a.nome, familia: a.familia, atributo: a.atributo,
      resumo, forma, passiva, ativa, limite, prateleira,
    };
  });
}

/* ------------------------------------------------------------------
   Talentos Gerais
   ------------------------------------------------------------------ */
function talentosGerais() {
  const marcas = PATAMARES.map(p => ({
    ...p, linha: linhaExata(`Patamar ${p.algarismo}, ${p.xp} XP`),
  }));
  marcas.forEach(m => { if (m.linha < 0) throw new Error(`talentos gerais: patamar ${m.algarismo}`); });
  const fim = linhaExata("Capítulo 6, Cenas");

  const out = [];
  marcas.forEach((p, n) => {
    const ate = n + 1 < marcas.length ? marcas[n + 1].linha : fim;
    let texto = junta(p.linha + 1, ate);
    /* o último bloco termina em prosa de fechamento do capítulo */
    texto = texto.replace(/\s*Repare no que a prateleira Geral está dizendo\..*$/s, "");
    for (const t of fatiaTalentos(texto, `Gerais patamar ${p.algarismo}`)) {
      out.push({ ...t, patamar: p.algarismo, grau: p.grau, xp: p.xp, fonte: "Geral" });
    }
  });
  if (out.length !== 20) aviso(`talentos gerais: ${out.length}, esperados 20`);
  return out;
}

/* ------------------------------------------------------------------
   Cifras: "Nome. Ativa|Sustentada|Passiva|Reação. Sigilos. Gatilho: x. efeito"
   ------------------------------------------------------------------ */
const RE_CIFRA = /(^|\s)([A-ZÀ-ÚÂ-Û][\p{L}\p{M}'’ ]{1,44})\.\s+(Ativa|Sustentada|Passiva|Reação)\.\s+/gu;
const PILARES = ["Origem", "Extinção", "Controle", "Pesadelo", "Tormento", "Causalidade"];
const VINCULOS = ["Baixo", "Médio", "Alto"];

function cifras() {
  const inicio = PILARES.map(p => {
    const i = linhaExata("Cifras de " + p);
    if (i < 0) throw new Error(`lista de cifras de ${p}`);
    return i;
  });
  const fimTudo = linhaExata("Criando Cifras");

  const out = [];
  PILARES.forEach((pilar, k) => {
    const fimPilar = k + 1 < inicio.length ? inicio[k + 1] : fimTudo;
    const iVin = VINCULOS.map(v => linhaExata("Vínculo " + v, inicio[k]));
    iVin.forEach((i, n) => { if (i < 0 || i > fimPilar) throw new Error(`${pilar}: vínculo ${VINCULOS[n]}`); });

    const vistos = new Set();
    VINCULOS.forEach((vinculo, n) => {
      const ate = n + 1 < iVin.length ? iVin[n + 1] : fimPilar;
      let texto = junta(iVin[n] + 1, ate);
      texto = texto.replace(/\s*Cifras de [A-ZÀ-Ú].*$/s, "");

      const marcas = [];
      for (const m of texto.matchAll(RE_CIFRA)) {
        marcas.push({ nome: limpa(m[2]), tipo: m[3], ini: m.index + m[1].length, corpo: m.index + m[0].length });
      }
      if (!marcas.length) aviso(`${pilar} ${vinculo}: nenhuma cifra`);

      marcas.forEach((m, i) => {
        const resto = limpa(texto.slice(m.corpo, i + 1 < marcas.length ? marcas[i + 1].ini : texto.length));
        const g = resto.match(/^(.*?)\.\s*Gatilho:\s*([^.]+)\.\s*(.*)$/s);
        if (!g) { aviso(`${pilar} ${vinculo} / ${m.nome}: sem gatilho`); return; }
        /* o PDF repete a entrada que cai na virada de página */
        const chave = m.nome.toLowerCase();
        if (vistos.has(chave)) return;
        vistos.add(chave);
        out.push({
          nome: m.nome, pilar, vinculo, tipo: m.tipo,
          sigilos: limpa(g[1]).split(/\s+e\s+/).map(s => limpa(s)),
          gatilho: limpa(g[2]).replace(/^./, c => c.toUpperCase()),
          efeito: limpa(g[3]),
        });
      });
    });
    const n = out.filter(c => c.pilar === pilar).length;
    if (n !== 20) aviso(`${pilar}: ${n} cifras, esperadas 20`);
  });
  return out;
}

/* ------------------------------------------------------------------
   Antecedentes: prosa, depois "Perícia: X. Conhecimento: Y." e a habilidade
   ------------------------------------------------------------------ */
const NOMES_ANTECEDENTE = ["Guia de Luz", "Colhedor", "Acadêmico", "Operário", "Clínico",
  "Uniformizado", "Corretor", "Palco", "Atravessador", "Sem Registro"];

function antecedentes() {
  const ini = linhaExata("Antes de Ascender, você trabalhava.");
  const fim = linhaExata("Capítulo 4, Arquétipos");
  if (ini < 0 || fim < 0) throw new Error("seção de antecedentes");

  const marcos = NOMES_ANTECEDENTE.map(n => {
    const i = linhaExata(n, ini);
    if (i < 0 || i > fim) throw new Error(`antecedente ${n}`);
    return { nome: n, linha: i };
  }).sort((a, b) => a.linha - b.linha);

  return marcos.map((a, k) => {
    const ate = k + 1 < marcos.length ? marcos[k + 1].linha : fim;
    const texto = junta(a.linha + 1, ate);
    const m = texto.match(/^(.*?)\s*Perícia:\s*([^.]+)\.\s*Conhecimento:\s*([^.]+)\.\s*(.*)$/s);
    if (!m) { aviso(`antecedente ${a.nome} sem perícia/conhecimento`); return { nome: a.nome, resumo: texto }; }
    const hab = m[4].match(/^([A-ZÀ-Ú][^.]{1,40})\.\s*(.*)$/s);
    return {
      nome: a.nome,
      resumo: limpa(m[1]),
      pericia: limpa(m[2]),
      conhecimento: limpa(m[3]),
      habilidade: hab ? limpa(hab[1]) : "",
      efeito: hab ? limpa(hab[2]) : limpa(m[4]),
    };
  });
}

/* ------------------------------------------------------------------
   Traços do Labirinto e Bênçãos
   ------------------------------------------------------------------ */
function tracos() {
  const iAlma = linhaExata("Traços de Alma");
  const iPess = linhaExata("Traços Pessoais");
  const iFim = linhaExata("Escolhendo", iPess);
  if (iAlma < 0 || iPess < 0 || iFim < 0) throw new Error("seção de traços");

  /* Efeito de Traço começa frase em maiúscula o tempo todo ("Ação Padrão",
     "Domínio", "Ponto de Vitalidade"), então abrir o corte por "Palavra."
     genérica fatia no lugar errado. Corta pelos nomes que o livro lista. */
  function fatiaPorNomes(texto, nomes, comPilar) {
    const cortes = nomes.map(n => {
      const i = texto.indexOf(n + ". ");
      if (i < 0) aviso(`traço ${n} não encontrado`);
      return { nome: n, i };
    }).filter(c => c.i >= 0);
    return cortes.map((c, k) => {
      let resto = limpa(texto.slice(c.i + c.nome.length + 1, k + 1 < cortes.length ? cortes[k + 1].i : texto.length));
      let pilar = "";
      if (comPilar) {
        const p = resto.match(new RegExp(`^(${PILARES.join("|")})\\.\\s*`));
        if (p) { pilar = p[1]; resto = resto.slice(p[0].length); }
        else aviso(`traço de alma ${c.nome} sem Pilar`);
      }
      return { nome: c.nome, pilar, efeito: resto };
    });
  }

  const NOMES_ALMA = ["O Útero", "O Fim da Frase", "A Cláusula", "A Sala do Fundo",
    "A Euforia", "A Moeda no Ar"];

  /* Os Pessoais não trazem Pilar para ancorar o corte, e o efeito de vários
     começa uma frase em maiúscula ("Ação Padrão", "Domínio"). Corta pelos
     nomes que o livro lista, na ordem em que ele lista. */
  const NOMES_PESSOAIS = ["Silêncio de Fora", "Sem Portas", "Testemunha", "Peso",
    "Chão Que Lembra", "Fundação", "Névoa", "Eco"];
  const textoPessoais = junta(iPess + 1, iFim);

  const alma = fatiaPorNomes(junta(iAlma + 1, iPess), NOMES_ALMA, true);
  const pessoais = fatiaPorNomes(textoPessoais, NOMES_PESSOAIS, false);
  if (alma.length !== 6) aviso(`traços de alma: ${alma.length}, esperados 6`);
  if (pessoais.length !== 8) aviso(`traços pessoais: ${pessoais.length}, esperados 8`);
  return { alma, pessoais };
}

function bencaos() {
  const ini = linhaExata("Seis servem de referência, uma por Pilar. Elas não são a lista completa: um Semblante em Ressonância 3 oferece o que aquele Semblante específico decidir oferecer àquela pessoa específica, e o Narrador escreve na hora.");
  const fim = linhaExata("Lista de Cifras");
  if (ini < 0 || fim < 0) throw new Error("seção de bênçãos");
  const texto = junta(ini + 1, fim);
  const re = /(^|\s)([A-ZÀ-ÚÂ-Û][\p{L}\p{M}'’ ]{1,40})\.\s+(Origem|Extinção|Controle|Pesadelo|Tormento|Causalidade)\.\s+/gu;
  const marcas = [];
  for (const m of texto.matchAll(re)) marcas.push({ nome: limpa(m[2]), pilar: m[3], ini: m.index + m[1].length, corpo: m.index + m[0].length });
  const out = marcas.map((m, i) => ({
    nome: m.nome, pilar: m.pilar,
    efeito: limpa(texto.slice(m.corpo, i + 1 < marcas.length ? marcas[i + 1].ini : texto.length)),
  }));
  if (out.length !== 6) aviso(`bênçãos: ${out.length}, esperadas 6`);
  return out;
}

/* ------------------------------------------------------------------ */
const arq = arquetipos();
const dados = {
  versao: "0.73",
  arquetipos: arq,
  talentosGerais: talentosGerais(),
  cifras: cifras(),
  antecedentes: antecedentes(),
  tracos: tracos(),
  bencaos: bencaos(),
};

fs.writeFileSync(SAIDA, JSON.stringify(dados));

const nTal = arq.reduce((s, a) => s + a.prateleira.length, 0);
console.log(`arquétipos ${arq.length} | talentos de prateleira ${nTal} | gerais ${dados.talentosGerais.length}`);
console.log(`cifras ${dados.cifras.length} | antecedentes ${dados.antecedentes.length} | traços ${dados.tracos.alma.length}+${dados.tracos.pessoais.length} | bênçãos ${dados.bencaos.length}`);
console.log(`${SAIDA}: ${(fs.statSync(SAIDA).size / 1024).toFixed(1)} KB`);
if (avisos.length) { console.log("\navisos:"); avisos.forEach(a => console.log("  - " + a)); }
else console.log("\nsem avisos");
