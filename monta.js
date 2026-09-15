/* Junta as partes em index.html.

   O arquivo que se abre precisa ser um só, sem servidor e sem dependência —
   é isso que faz a ficha funcionar num pendrive, num anexo de e-mail e num
   celular sem sinal no meio de uma sessão. Mas escrever 500 KB numa linha só
   não é manutenção, então as partes moram em src/ e a montagem é aqui.

   uso:  node monta.js                                                      */

const fs = require("fs");
const p = require("path");

const raiz = __dirname;
const le = f => fs.readFileSync(p.join(raiz, f), "utf8");

const fontes = le("fontes.css");     /* Courier Prime embutida, OFL 1.1 */
const estilo = le("src/estilo.css");
const corpo  = le("src/corpo.html");
const app    = le("src/app.js");
const dados  = JSON.parse(le("dados_livro.json"));

/* A marca do autor, se existir arquivo. SVG entra inteiro — escala, pesa
   nada e aceita currentColor; bitmap entra em base64. Sem arquivo, a ficha
   cai na versão datilografada e continua de pé. */
const CAMINHOS_MARCA = ["src/marca", "logo_dev"];

function marca() {
  const svg = p.join(raiz, "src/marca.svg");
  if (fs.existsSync(svg)) {
    const corpo = fs.readFileSync(svg, "utf8")
      .replace(/<\?xml[\s\S]*?\?>/, "")
      .replace(/<!DOCTYPE[\s\S]*?>/i, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();
    return { tipo: "src/marca.svg", html: corpo };
  }
  for (const base of CAMINHOS_MARCA) {
    for (const ext of ["png", "webp", "jpg", "jpeg"]) {
      const arq = p.join(raiz, base + "." + ext);
      if (!fs.existsSync(arq)) continue;
      const tipo = ext === "jpg" ? "jpeg" : ext;
      const b64 = fs.readFileSync(arq).toString("base64");
      const uri = `url("data:image/${tipo};base64,${b64}")`;
      /* a proporção sai do cabeçalho do próprio arquivo: trocar a marca por
         outra de formato diferente não deve exigir mexer no CSS */
      const bytes = fs.readFileSync(arq);
      const proporcao = ext === "png" && bytes.length > 24
        ? `${bytes.readUInt32BE(16)} / ${bytes.readUInt32BE(20)}`
        : "3 / 1";
      /* Bitmap de marca entra como MÁSCARA, não como imagem. A arte é preta
         com fundo transparente; mascarada, ela passa a ser pintada com a
         tinta da casa — e na Mysteria, onde o papel é tela e a tinta é
         fósforo, a marca deixa de ser preto sobre preto. */
      return {
        tipo: base + "." + ext,
        html: `<span class="marca__arte" role="img" aria-label="Devaneio"></span>`,
        /* a URI vai numa variável para não ser escrita duas vezes: são 64 KB */
        css: `.marca__arte{--arte:${uri};-webkit-mask-image:var(--arte);mask-image:var(--arte);aspect-ratio:${proporcao};}`,
      };
    }
  }
  return null;
}
const marcaArte = marca();

/* "</script>" dentro de string JSON fecharia a tag antes da hora */
const seguro = s => s.replace(/<\//g, "<\\/");

const html = `<!doctype html>
<html lang="pt-BR" data-arranjo="normal">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="description" content="Ficha de personagem do RPG Devaneio, revisão 0.73. Arquivo único, sem servidor.">
<title>Devaneio — Ficha do Ascendido</title>
<style>
/* Courier Prime, de Alan Dague-Greene para Quote-Unquote Apps.
   SIL Open Font License 1.1 — https://scripts.sil.org/OFL
   Vai embutida para a ficha ter a mesma cara em qualquer máquina. */
${fontes}
${estilo}
${marcaArte && marcaArte.css ? "/* a marca do autor, recortada como máscara para pegar a tinta da casa */\n" + marcaArte.css : ""}
</style>
</head>
<body data-casa="O Olho" data-gaveta="fechada">
${corpo}
<script>
/* Catálogo do livro, extraído do PDF oficial por extrai_dados.js.
   Doze Arquétipos com doze Talentos cada, vinte Talentos Gerais,
   cento e vinte Cifras, dez Antecedentes, catorze Traços e seis Bênçãos. */
const DADOS = ${seguro(JSON.stringify(dados))};
/* Arte da marca: ${marcaArte ? "arquivo em " + marcaArte.tipo : "nenhum arquivo, a marca sai datilografada"} */
const MARCA_ARTE = ${marcaArte ? JSON.stringify(marcaArte.html) : '""'};
${app}
</script>
</body>
</html>
`;

fs.writeFileSync(p.join(raiz, "index.html"), html);

const kb = n => (n / 1024).toFixed(0) + " KB";
console.log(`index.html  ${kb(Buffer.byteLength(html))}`);
console.log(`  fontes ${kb(fontes.length)} · estilo ${kb(estilo.length)} · corpo ${kb(corpo.length)} · script ${kb(app.length)} · catálogo ${kb(JSON.stringify(dados).length)}`);
console.log("  marca: " + (marcaArte ? marcaArte.tipo : "sem arquivo, tipografada"));
console.log(`  ${dados.arquetipos.length} arquétipos · ${dados.arquetipos.reduce((s, a) => s + a.prateleira.length, 0) + dados.talentosGerais.length} talentos · ${dados.cifras.length} cifras`);
