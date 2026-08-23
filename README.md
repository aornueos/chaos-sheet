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
- Compêndio das noventa Cifras por Pilar — quinze em cada, sete de Vínculo Baixo,
  cinco de Médio e três de Alto — com Sigilos, gatilho e o efeito por inteiro
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

## Ativa ou Passiva

Uma Cifra **Ativa** resolve no momento em que é conjurada e acaba. Uma **Passiva**
se instala e continua funcionando sozinha pelo tempo indicado. As duas custam Ação
Padrão, as duas exigem teste de Domínio e as duas retêm Corrupção conforme o
Vínculo: a diferença é só quanto tempo a Cifra fica de pé.

Cifra gravada antes deste capítulo abre com o campo em branco, para o jogador
dizer qual é, em vez de a ficha chutar por ele.

## Custo das Cifras em XP

Correntes não custam nada: não são endereçadas a Pilar nenhum, então não há
interlocutor a convencer. Catalogadas custam pelo Vínculo: **Baixo 2, Médio 4, Alto 8**. O campo é editável
linha a linha para os casos fora da tabela. Para mudar o padrão, ajuste `xp`
em `VINCULOS`, no topo do script.

## Disposição

**Atributos, Vitalidade, Corrupção e Perícias ficam sempre no alto**, numa
grade própria acima do resto. É o que se toca a sessão inteira, e não entra no
fluxo: em qualquer largura e em qualquer arranjo está no mesmo lugar. Perícias
toma a linha inteira e reparte os quatro grupos em colunas, em vez de virar uma
tira alta e estreita.

O resto desce em colunas de fluxo, onde o navegador escolhe o corte pela
altura para que nenhuma coluna fique com 4500px ao lado de outra com 900px.
Ali um painel muda mesmo de coluna conforme a ficha cresce; o que é garantido
é a ordem de leitura: o que você gasta, o que você pode e o que te prende.

## Gaveta

Recolhida por padrão, em qualquer largura. No desktop vira uma lombada de 54px
com o nome descendo na vertical; no celular, uma linha só no alto. A lista de
fichas se consulta uma vez por sessão e não vale 242px de folha o tempo todo.
O estado fica gravado por aparelho, e o aviso de gravação continua à vista
mesmo recolhida — esconder o erro junto com os botões seria esconder o erro.

## Arranjo

Botão na gaveta, três posições: **normal**, **mais na tela** e **menos na
tela**. Muda espaçamento, corpo de texto e quantas colunas abrem — em tudo,
inclusive nas Perícias e na faixa de cima. A escolha fica gravada por aparelho.

Nenhum componente sabe que isso existe: o botão troca um atributo na raiz, e
todo o resto lê `--gap`, `--pad-*` e as larguras mínimas de coluna. As colunas
são declaradas por **largura mínima**, não por contagem, então o navegador abre
quantas couberem e nunca espreme uma perícia até o nome sumir.

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

Todo texto da ficha passa de 4,5:1 nas nove casas; o pior caso mede 5,6:1.
Onde a caixa aperta e o texto corta — a nota do título, o nome da perícia no
arranjo apertado — o conteúdo inteiro fica no `title`, para não se perder.

## As nove casas

Trocar a Afiliação reimprime o dossiê inteiro: papel, tinta, trama, selo,
carimbo e as palavras do cabeçalho.

| Afiliação | Gráfica |
| --- | --- |
| O Olho | Noir: preto e branco de filme, luz de persiana, prata fria, sombra dura |
| A Penumbra | Tribal: ocre de terra queimada, galões, zigue-zague e fileira de pontos |
| Os Acorrentados | Ferro e elo: bronze oxidado, malha de corrente, braçadeira rebitada |
| O Coletivo | Jornalística: papel-jornal, filete de coluna, retícula, vermelho de última hora |
| A Frente | Militar: verde-oliva, estêncil com as pontes da chapa, tarja de censura |
| Mysteria | CRT de MS-DOS: só fósforo verde, varredura, barra de sincronia e cursor piscando |
| Sociedade dos Ceifadores | Corvos: preto de pena com brilho de óleo, hachura de barbas |
| Guardiões da Árvore | Herbário: magenta de orquídea, desenho botânico a bico de pena |
| Avulso | Nenhuma gráfica cuida deste: o zine cru, mais sujo e mais torto |

Toda a gráfica vive no CSS, em `[data-afiliacao="…"]`. O script só escreve o
atributo na raiz e escolhe as palavras do cabeçalho, então acrescentar uma
casa é escrever um bloco de variáveis — não um componente novo.

A trama de fundo da capa é fundo de fundo: só se nota quando se procura.
A força dela é **um número no `:root`**, `--fac-tex-op`, e vale para as nove
casas — o alfa de dentro de cada gradiente está normalizado em 1 justamente
para que esse número signifique a mesma coisa em todas.

## Tipografia

Courier Prime embutida no arquivo sob a
[SIL Open Font License 1.1](https://scripts.sil.org/OFL),
para que a ficha tenha a mesma aparência em qualquer máquina.

Nas manchetes entra uma condensada pesada de sistema (Impact e seus
substitutos). Ela não vai embutida: onde não existir, a pilha cai para outra
condensada e o zine continua de pé. No PDF a ficha volta a ser inteiramente
datilografada, porque um documento que sai diferente em cada computador não
serve como documento.
