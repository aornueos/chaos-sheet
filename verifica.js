/* Conferência estática das fontes. Não substitui olhar a tela, mas pega a
   classe de erro que só aparece quando alguém abre justamente aquele painel
   naquela largura — e essa é a que escapa de revisão manual.

   uso:  node verifica.js                                                  */

const fs = require("fs");
const p = require("path");

const raiz = __dirname;
const le = f => fs.readFileSync(p.join(raiz, f), "utf8");
const app = le("src/app.js");
const css = le("src/estilo.css");
const corpo = le("src/corpo.html");
const monta = le("monta.js");
const fonte = app + corpo + monta;

const falhas = [];
const notas = [];
const falha = m => falhas.push(m);
const nota = m => notas.push(m);

/* Template literal atrapalha toda leitura estática de markup. Trocar cada
   ${…} por um espaço deixa o que é fixo conferível e o que é montado em
   tempo de execução fora da conta — que é exatamente a divisão certa. */
const semInterpolacao = s => s.replace(/\$\{(?:[^{}]|\{[^{}]*\})*\}/g, " ");

/* ---------- 1. toda ação declarada tem quem a atenda ---------- */
const acoesUsadas = new Set([...fonte.matchAll(/data-acao="([a-zA-Z]+)"/g)].map(m => m[1]));
/* medidor() recebe o nome da ação como argumento, não como atributo fixo */
for (const m of app.matchAll(/medidor\("([a-zA-Z]+)"/g)) acoesUsadas.add(m[1]);

const blocoAcoes = app.slice(app.indexOf("const ACOES = {"), app.indexOf("function fechaCompendio"));
const acoesDefinidas = new Set([...blocoAcoes.matchAll(/^  ([a-zA-Z]+)\(f(?:, d)?\)/gm)].map(m => m[1]));

for (const a of acoesUsadas) {
  if (!acoesDefinidas.has(a)) falha(`data-acao="${a}" não tem entrada em ACOES`);
}
for (const a of acoesDefinidas) {
  if (!acoesUsadas.has(a) && !fonte.includes(`ACOES.${a}(`)) {
    falha(`ACOES.${a} está definida e nada a aciona`);
  }
}

/* ---------- 2. toda classe escrita no markup existe no CSS ---------- */
/* url(http://www.w3.org/…) casa com o padrão de classe; fora da conta */
const cssSemUrl = css.replace(/url\([^)]*\)/g, "url()");
const classesNoCss = new Set([...cssSemUrl.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));

const classesNoMarkup = new Set();
for (const m of semInterpolacao(fonte).matchAll(/class="([^"]*)"/g)) {
  for (const c of m[1].split(/\s+/)) if (c) classesNoMarkup.add(c);
}
for (const c of classesNoMarkup) {
  /* "fita--" é o que sobra de class="fita fita--": o modificador é
     montado em tempo de execução e só o prefixo dá para conferir aqui */
  if (c.endsWith("--")) { if (!classesNoCss.has(c.slice(0, -2))) falha(`classe "${c}" não tem base no CSS`); continue; }
  if (!classesNoCss.has(c)) falha(`classe "${c}" aparece no markup e não existe no CSS`);
}

/* ---------- 3. CSS que não pinta nada ----------
   Modificador montado por interpolação (fita--ne, painel--prata) não aparece
   inteiro no markup. Vale como usado se o prefixo até o "--" aparecer. */
for (const c of classesNoCss) {
  if (classesNoMarkup.has(c)) continue;
  const prefixo = c.split("--")[0];
  if (c.includes("--") && classesNoMarkup.has(prefixo)) continue;
  if (fonte.includes(c)) continue;
  nota(`classe "${c}" definida no CSS e nunca usada`);
}

/* ---------- 4. chaves de recolhimento únicas ---------- */
const chave = t => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const titulos = [...app.matchAll(/painel(?:Nota)?\("([^"]+)"/g)].map(m => m[1]);
const chaves = {};
for (const t of titulos) {
  const k = chave(t);
  if (chaves[k] && chaves[k] !== t) falha(`painéis "${chaves[k]}" e "${t}" colidem na chave "${k}"`);
  chaves[k] = t;
}

/* ---------- 5. quebra de palavra no meio ----------
   anywhere corta no meio da palavra. Numa trilha de cinco estágios isso vira
   "VISLUMB / RE", que é pior do que a linha estourar. */
for (const m of cssSemUrl.matchAll(/([^{}]+)\{[^}]*overflow-wrap:\s*anywhere[^}]*\}/g)) {
  falha(`overflow-wrap:anywhere em "${m[1].trim().split("\n").pop().trim()}" — parte palavra no meio`);
}

/* ---------- 6. data-campo que a ficha não conhece ---------- */
const branco = app.slice(app.indexOf("function fichaEmBranco()"), app.indexOf("function normaliza"));
for (const m of fonte.matchAll(/data-campo="([^"$]+)"/g)) {
  const raizCampo = m[1].split(".")[0];
  if (!new RegExp(`\\b${raizCampo}\\s*:`).test(branco)) {
    falha(`data-campo="${m[1]}" grava em "${raizCampo}", que não existe na ficha em branco`);
  }
}

/* ---------- 7. piso de corpo de texto ----------
   Só a declaração de fonte conta; deslocamento de sombra e borda também
   trazem px e não são corpo de letra. */
for (const m of cssSemUrl.matchAll(/font:[^;{}]*?\b(\d+)px\//g)) {
  if (Number(m[1]) < 11) falha(`corpo de ${m[1]}px — o piso do projeto é 11px`);
}
for (const m of cssSemUrl.matchAll(/font-size:\s*(\d+)px/g)) {
  if (Number(m[1]) < 11) falha(`font-size de ${m[1]}px — o piso do projeto é 11px`);
}

/* ---------- 8. contraste do texto de leitura em cada casa ----------
   O papel é um gradiente e o pé dele é mais escuro que o topo: medir a tinta
   contra --papel mente. O pior caso é --papel-3, que é onde o texto de estado
   vazio cai numa ficha cheia. */
const hex = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
const lum = c => {
  const s = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};
const contraste = (a, b) => {
  const l1 = lum(hex(a)), l2 = lum(hex(b));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

const PISO = 4.5;
const raizCss = cssSemUrl.slice(cssSemUrl.indexOf(":root{"), cssSemUrl.indexOf("[data-arranjo"));
const varDe = (bloco, nome) => {
  const m = bloco.match(new RegExp("--" + nome + ":\\s*(#[0-9a-fA-F]{6})"));
  return m ? m[1] : null;
};

for (const m of cssSemUrl.matchAll(/\[data-casa="([^"]+)"\]\{([^}]*)\}/g)) {
  const casa = m[1], bloco = m[2];
  const cor = n => varDe(bloco, n) || varDe(raizCss, n);
  const pares = [["tinta", "papel-3"], ["tinta-2", "papel-3"], ["tinta-3", "papel-3"], ["papel", "tinta"]];
  for (const [a, b] of pares) {
    const ca = cor(a), cb = cor(b);
    if (!ca || !cb) continue;
    const n = contraste(ca, cb);
    if (n < PISO) falha(`${casa}: --${a} sobre --${b} mede ${n.toFixed(2)}:1, abaixo de ${PISO}`);
  }
}

/* ---------- saída ---------- */
console.log(`ações ${acoesDefinidas.size} · classes no markup ${classesNoMarkup.size} · painéis ${Object.keys(chaves).length}`);
if (falhas.length) {
  console.log(`\n${falhas.length} FALHA(S):`);
  falhas.forEach(f => console.log("  x " + f));
} else console.log("\nsem falhas");
if (notas.length) {
  console.log(`\n${notas.length} observação(ões):`);
  notas.forEach(n => console.log("  . " + n));
}
process.exit(falhas.length ? 1 : 0);
