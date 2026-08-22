# Devaneio — Ficha do Ascendido

Ficha de personagem para o RPG **Devaneio**, na revisão de sistema que
trouxe Linhagem, Corrupção, Arquétipos e Capacidade.

Arquivo único, sem servidor e sem dependências. As fichas ficam salvas
no navegador de quem abre a página (localStorage), então cada jogador
tem as suas. Use **Backup Completo** para levar as fichas de um
navegador ou endereço para outro.

## Recursos

- Múltiplas fichas, com Vitalidade e Limiar vindos da Linhagem
- Corrupção como recurso único — Assentada e Carga somadas contra o Limiar
- Capacidade por estágio de Ascensão — cinco degraus, de Vislumbre a Iluminado — com Talentos que se acendem e apagam
- XP com gasto automático: cada Talento e cada Cifra desconta o próprio custo
- Compêndio dos doze Arquétipos, das prateleiras de Talentos de cada um e da
  prateleira aberta dos Talentos Gerais, que qualquer Ascendido compra
- Cifras Correntes separadas das Catalogadas: sem Vínculo, sem XP e sem Corrupção
- Exportação em PDF preto e branco, A4 paisagem
- Lixeira com desfazer, backup completo e importação que nunca substitui

## Fichas da versão anterior

Abrem normalmente. A Especialização escolhida vira o Arquétipo de mesmo nome,
a Corrupção que existia entra como Assentada, e os Talentos que ainda constam
no livro recuperam Peso e Carga sozinhos. As Cifras herdam o custo em XP do
próprio Vínculo. Essência, Resistência Física e Resistência Espiritual não são
convertidas: saíram do sistema.

O jogo se chamava **Caos Eminente**, e as fichas gravadas sob aquele nome mudam
de lugar sozinhas na primeira vez que a página abre. Nada precisa ser
reimportado, e nada é apagado antes de a cópia nova existir.

## Custo das Cifras em XP

Correntes não custam nada: não são endereçadas a Pilar nenhum, então não há
interlocutor a convencer. Catalogadas custam pelo Vínculo: **Baixo 2, Médio 4, Alto 8**. O campo é editável
linha a linha para os casos fora da tabela. Para mudar o padrão, ajuste `xp`
em `VINCULOS`, no topo do script.

## Ordem dos painéis

A folha é uma sequência só, repartida em três colunas de fluxo: o navegador
escolhe onde cortar de acordo com a altura, para que nenhuma coluna fique com
4500px ao lado de outra com 900px. Por isso um painel não pertence a uma
coluna — ele muda de coluna quando a ficha cresce, quando a janela muda de
largura ou quando a estilização muda as alturas.

O que é garantido é a **ordem de leitura**, e ela é a ordem do arquivo: quem
você é, como você está, o que você gasta, o que você pode e o que te prende.
Vitalidade e Corrupção são a mesma pergunta feita de dois lados, então vêm uma
atrás da outra e são proibidas de cair em colunas diferentes.

## Direção de arte

Fanzine gótico ocultista. A regra é a do zine de verdade: **duas tintas**.
Papel osso e tinta preta, mais **uma tinta especial** que muda conforme a
Afiliação. Nada além disso entra — o que parece cor é trama, meio-tom ou
impressão fora de registro.

A mesa é preta. Os painéis são recortes de papel colados sobre ela, tortos,
rasgados na base e presos com fita crepe. O cabeçalho é a capa: fundo preto,
manchete chapada em condensada, selo da casa por trás e carimbo de borracha
por cima.

Texto de leitura é sempre tinta sobre papel, ou papel sobre preto. A tinta
especial preenche, sublinha e carimba, mas nunca vira corpo de texto — é
assim que as nove casas trocam de cor sem que nenhuma perca contraste.

## As nove casas

Trocar a Afiliação reimprime o dossiê inteiro: papel, tinta, trama, selo,
carimbo e as palavras do cabeçalho.

| Afiliação | Gráfica |
| --- | --- |
| O Olho | Noir: preto e branco de filme, luz de persiana, prata fria, sombra dura |
| A Penumbra | Tribal: ocre de terra queimada, galões, zigue-zague e fileira de pontos |
| Os Acorrentados | Cristã: ouro de vela, cruz e elo, filete duplo de missal |
| O Coletivo | Jornalística: papel-jornal, filete de coluna, retícula, vermelho de última hora |
| A Frente | Militar: verde-oliva, estêncil com as pontes da chapa, tarja de censura |
| Mysteria | CRT de MS-DOS: só fósforo verde, varredura, barra de sincronia e cursor piscando |
| Sociedade dos Ceifadores | Corvos: preto de pena com brilho de óleo, hachura de barbas |
| Guardiões da Árvore | Herbário: magenta de orquídea, desenho botânico a bico de pena |
| Avulso | Nenhuma gráfica cuida deste: o zine cru, mais sujo e mais torto |

Toda a gráfica vive no CSS, em `[data-afiliacao="…"]`. O script só escreve o
atributo na raiz e escolhe as palavras do cabeçalho, então acrescentar uma
casa é escrever um bloco de variáveis — não um componente novo.

## Tipografia

Courier Prime embutida no arquivo sob a
[SIL Open Font License 1.1](https://scripts.sil.org/OFL),
para que a ficha tenha a mesma aparência em qualquer máquina.

Nas manchetes entra uma condensada pesada de sistema (Impact e seus
substitutos). Ela não vai embutida: onde não existir, a pilha cai para outra
condensada e o zine continua de pé. No PDF a ficha volta a ser inteiramente
datilografada, porque um documento que sai diferente em cada computador não
serve como documento.
