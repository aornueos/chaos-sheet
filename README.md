# Devaneio — Ficha do Ascendido

Ficha de personagem para o RPG **Devaneio**, na revisão **0.73** do livro.

Arquivo único, sem servidor e sem dependências. As fichas ficam salvas no
navegador de quem abre a página (`localStorage`), então cada jogador tem as
suas. Use **Backup completo** para levar as fichas de um navegador ou endereço
para outro.

## O que mudou da revisão anterior

O sistema inteiro. Não é exagero de changelog.

Especializações viraram **Arquétipos**, doze deles, com prateleira própria de
doze Talentos cada e um **Grau** que não se compra: sobe sozinho conforme o XP
entra enquanto aquele Arquétipo está aceso. Entrou **Cultura**, entrou
**Patrimônio**, entrou **Antecedente** com Conhecimento e habilidade. A
Corrupção deixou de ser um número e virou três — **Recente**, **Assentada** e
**Carga** —, que contam igual contra o Limiar e saem de formas diferentes. As
Cifras passaram de noventa para **cento e vinte**, e agora trazem Sigilos,
gatilho sensorial e tipo. Apareceram o **Labirinto Próprio** com Traços, a
**Ressonância**, as **Bênçãos**, a **Confiança**, a **Dívida** e as **Âncoras**
com as três perguntas que o livro manda registrar.

As quinze perícias são outras quinze. Vinte viraram quinze, Resistência virou
**Fortitude**, e Consciência, Estabilidade, Intuição, Adestramento e Carisma
saíram do sistema.

### Fichas da versão anterior

Abrem normalmente, e nada é apagado antes de a cópia nova existir. Sobrevivem
nome, Linhagem, atributos, perícias que ainda constam no livro, Corrupção
Assentada, XP, Âncoras, Dívida, inventário (que entra no slot de Bolsos) e
anotações. **O Coletivo** virou **O Coletivo do Eco** sozinho.

Não sobrevivem as perícias que saíram do sistema, e Talentos e Cifras da
revisão velha que o livro 0.73 não lista mais. Eles continuam gravados no
arquivo de backup; simplesmente não têm onde encaixar.

## Como a ficha é montada

O arquivo que se abre precisa ser um só — é isso que faz ela funcionar num
pendrive, num anexo de e-mail e num celular sem sinal no meio de uma sessão.
Mas meio megabyte numa linha só não é manutenção, então as partes moram
separadas e a montagem é um comando:

```bash
node extrai_dados.js devaneio073.txt dados_livro.json && node monta.js && node verifica.js
```

`extrai_dados.js` lê o texto do livro em ordem de leitura — `pdftotext -enc
UTF-8`, sem `-layout` — e monta os catálogos: doze Arquétipos, cento e
quarenta e quatro Talentos de prateleira, vinte Talentos Gerais, cento e vinte
Cifras, dez Antecedentes, catorze Traços e seis Bênçãos. Ele só extrai: o que
não casar com o formato é reportado em voz alta, nunca transformado em
silêncio. Rodar sem nenhum aviso é o estado normal.

`verifica.js` é a rede de proteção estática, e ela falha com código 1. Confere
o que revisão manual não pega: ação declarada no markup sem ninguém que a
atenda, classe escrita que não existe no CSS, dois painéis colidindo na mesma
chave de recolhimento, `data-campo` gravando em campo que a ficha não tem,
corpo de texto abaixo do piso de 11px, quebra de palavra no meio, e o
contraste de cada tinta contra o **pé** do papel de cada casa — que é onde o
gradiente é mais escuro e onde o texto de estado vazio cai numa ficha cheia.

`monta.js` junta `fontes.css`, `src/estilo.css`, `src/corpo.html`,
`src/app.js`, `dados_livro.json` e a marca em `index.html`. O texto do livro
e o PDF não estão no repositório.

A marca é `logo_dev.png`. O build procura `src/marca.svg` primeiro (para
quando ela virar vetor), depois `src/marca.png`, depois o arquivo da raiz;
embute em base64 e pronto. Sem nenhum deles, a ficha cai numa manchete
datilografada e continua de pé.

### Uma discrepância do livro, anotada

O Capítulo 4 diz que cada Arquétipo tem **oito** Talentos, dois por patamar, e
que a prateleira inteira custa 40 XP. As listas abaixo desse parágrafo trazem
**doze**, três por patamar, o que dá 60 XP. A ficha segue as listas, porque é
delas que os jogadores compram. Se a intenção era oito, o parágrafo está certo
e sobram quatro entradas em cada prateleira.

## Clicar, não digitar

Em mesa, marcar um ponto é um gesto por turno. Digitar é abrir o teclado,
apagar o que estava e conferir se ficou certo — três gestos, e o último
ninguém faz. Então todo número pequeno virou casa que se clica, e clicar na
última casa cheia volta uma.

A **Corrupção** é uma trilha do tamanho do Limiar, e as casas se pintam na
ordem em que a alma entrou: Assentada no começo, Carga em cima dela, Recente
por último. É a Recente que sobe e desce toda cena, então é ela que o clique
move; Carga não se clica, porque quem manda nela é o painel de Talentos; e
Assentada tem contador próprio, porque quase não se mexe. As três se
distinguem por preenchimento, trama e brilho — e continuam distintas numa
fotocópia preto e branco, que é o pior caso real.

Vitalidade, Confiança, Acessos, Contatos e XP seguem o mesmo princípio. Sobra
digitação onde ela é mesmo o gesto certo: nome, Estre, Dívida, Âncoras,
anotações.

## O "?" de cada tarja

A explicação fica **atrás de um "?"**, não em cima da mesa. O jogador precisa
dela duas vezes e depois nunca mais, e enquanto isso ela ocupava metade de
cada painel.

O corte é por natureza do texto, não por tamanho, e tem três categorias.

**Sai para o "?"** tudo que explica regra ou descreve: como o teto de atributo
funciona, por que alma é acúmulo, o que a Cultura concede, os dois portões do
Vínculo, o que a Roda faz, o que acontece com uma Âncora, o traço da sua
Linhagem no Limiar, o que cada Arquétipo é. Também os subtítulos explicativos
dentro dos painéis e as notas de rodapé dos contadores.

**Fica na mesa** o que muda com o estado desta ficha — o efeito do estado de
Corrupção agora, a penalidade do nível de Vitalidade agora, "passou do que
cabe", "terceiro Contato neste arco", "você gastou o que não tinha" — e o que
o personagem **sabe fazer**: efeito de Talento, de Cifra, de Traço, de Bênção,
a habilidade do Antecedente e a forma de operar do Arquétipo. Essas não são
explicação: são a razão de a ficha existir.

Regra do livro se consulta; estado e capacidade se leem de relance.

Aberta ou fechada é **estado de sessão**, não da ficha: é leitura de agora e
não configuração do personagem, então sobrevive ao redesenho — clicar num
stepper com a ajuda aberta não fecha a ajuda — mas não a recarregar a página.
Na gaveta há um botão que abre todas de uma vez. Na impressão não sai nenhuma:
a folha impressa é o registro do personagem, e a regra está no livro.

## Recolher

Toda tarja tem um **▾**, e a tarja é uma linha só: quem encolhe quando falta
espaço é a nota, vinte vezes mais rápido que o título — recolhido, o título é
a única coisa que sobra do painel, e não pode ser o primeiro a ser cortado. Na
faixa de cima o grid alinha ao topo em vez de esticar, senão o painel
recolhido virava um retângulo de papel em branco do tamanho do vizinho.

Recolhido, o painel vira só a própria tarja — serve
para desligar o que este personagem não usa ou o que o jogador já sabe de cor.
O estado é da ficha e não do aparelho, porque um Bastião e um Arquivista
desligam coisas diferentes, e assim ele viaja junto no backup. Na impressão
tudo volta a aparecer: recolher é gesto de mesa, e quem guarda a ficha depois
não sabe o que estava escondido.

## Disposição

### A medida da página

A ficha trava numa largura e se centra no que sobra da gaveta; o resto é mesa.
Sem esse limite, num monitor de 1920px ou mais a capa terminava com a marca
num extremo e os carimbos no outro, e a faixa de Perícias virava uma régua de
oito colunas que o olho não acompanha de ponta a ponta.

O limite é visível: o **mesmo filete triplo da régua dos tópicos, de pé**, nas
duas margens da folha. Ele é um pseudo-elemento só, com os dois lados no mesmo
`background` — em `::before` e `::after` separados eles pintariam em ordens
diferentes, um atrás do conteúdo e outro na frente, e a fita de um painel
passaria por baixo de um filete e por cima do outro. O esmaecido das pontas
está dentro do gradiente e não numa máscara: a folha tem alguns milhares de
pixels de altura, e mascarar isso pediria uma camada composta do tamanho da
ficha inteira a cada rolagem.

A medida acompanha o arranjo, para o comprimento de linha em caracteres ficar
parecido nos três: **1150px** no apertado, **1360px** no normal, **1420px** no
espaçoso. O 1360 não é redondo por acaso — abaixo de ~1320px a faixa de três
painéis deixa o corpo dos Atributos com menos de 380px e o `@container` quebra
os quatro dados em dois de cada lado.

Abaixo de 760px a folha já ocupa a tela toda: ali o filete sai, porque seriam
22px roubados do texto para emoldurar uma margem que não existe. Na impressão
a medida também sai — quem manda na largura é o A4.

### As cinco faixas

A ficha se lê por assunto, não por painel solto. **Cinco faixas**, cada uma
aberta pela própria régua:

| Faixa | O que traz |
| --- | --- |
| **Importantes** | Atributos, Vitalidade, Corrupção — o que se toca a sessão inteira |
| **Perícias** | as quinze, tomando a linha inteira |
| **Criação de Personagem** | Dossiê, Arquétipo, Afiliação, Âncoras, Progressão |
| **Espiritual** | Cifras Correntes, Cifras Catalogadas, Semblante, Labirinto Próprio |
| **Utensílios** | Talentos, Equipamento, Anotações |

Progressão fica em Criação porque o XP e a trilha de Ascensão são o registro
de como este personagem chegou aqui — e a Ascensão queima Âncora, que está na
mesma faixa.

**Todo painel toma a faixa inteira.** Quem cresce para o lado é o conteúdo
dele: as entradas de Talento, Cifra e Bênção descem em colunas dentro do
próprio painel; os cartões de Âncora e de Corrente ficam lado a lado; e os
pares de campo abrem em quantas colunas couberem. Painel estreito empilhado
jogava tudo para baixo — numa tela larga sobrava meia folha em branco e a
ficha virava um rolo.

A exceção é **Importantes**, que abre por contagem: são exatamente três
medidores, e eles ficam no mesmo lugar em qualquer largura.

O que decide o número de colunas dentro do painel é sempre uma **largura
mínima**, nunca uma contagem — `--col-item` para lista, `--col-per` para
perícia. Assim o mesmo painel dá três colunas numa tela larga e uma no
celular, sem regra nova.

Os quatro Atributos querem quatro colunas ou duas, nunca três, e quem decide é
a largura do próprio recorte, por `@container`, não a da janela: recorte
estreito em janela larga acontece o tempo todo aqui.

### Perícias não pertencem a atributo

A fórmula é 1D do Atributo Chave mais 1D da Perícia Chave, e **qual é o
Atributo Chave quem decide é a cena**. O livro passa metade do Capítulo 4
trocando um pelo outro: Intimidação por Corpo, Percepção por Fortitude, Lógica
por Movimentação, Domínio por Fortitude. Agrupar perícia sob atributo na ficha
ensinaria o contrário do que o sistema faz, então as quinze são uma lista
solta, em ordem alfabética, repartida em colunas pela largura disponível.

## Gaveta

Recolhida por padrão, em qualquer largura. No desktop vira uma lombada de 54px
com o nome descendo na vertical; no celular, uma linha só no alto. A lista de
fichas se consulta uma vez por sessão e não vale 264px de folha o tempo todo.
O estado fica gravado por aparelho, e o aviso de gravação continua à vista
mesmo recolhida — esconder o erro junto com os botões seria esconder o erro.

Descartar manda para a lixeira com desfazer. Importar nunca substitui: entra do
lado, com id novo.

## Arranjo

Botão na gaveta, três posições: **normal**, **mais na tela** e **menos na
tela**. Muda espaçamento, corpo de texto e quantas colunas abrem. A escolha
fica gravada por aparelho.

Nenhum componente sabe que isso existe: o botão troca um atributo na raiz, e
todo o resto lê `--gap`, `--pad-*`, `--medida` e as larguras mínimas de coluna.

## Direção de arte

Fanzine gótico ocultista com estrutura **Art Déco**, e a estética é
protagonista. A regra é de três materiais, e só três.

**Papel** é o mundo ordinário: atributos, perícias, equipamento, dinheiro.
Tinta preta sobre papel osso, o que qualquer pessoa de Elinia entenderia se
olhasse por cima do seu ombro.

**Prata** é o mundo espiritual. Corrupção, Cifras, Labirinto, Ascensão,
Ressonância — tudo que passa pela Tessera sai metálico, e a prata é a única
coisa na página que não pertence a Afiliação nenhuma. Ela é trilho, moldura e
brilho, e nunca vira fundo de texto de leitura. A marca `DEVANEIO` é cromada
pelo mesmo motivo: é o nome das duas metades.

**A tinta da casa** é a Afiliação. Uma por dossiê. Preenche, sublinha e
carimba, mas também nunca vira corpo de texto — é assim que as nove casas
trocam de cor sem que nenhuma perca contraste.

A mesa é preta. Os painéis são recortes de papel colados sobre ela — tortos,
rasgados à mão, alguns presos com fita, e nenhum no mesmo ângulo do vizinho.

### Onde o Déco entra

Na estrutura, e não na superfície. **A geometria manda no layout, a sujeira
manda na textura** — é esse o acordo entre Déco e zine, e é o que impede um de
virar enfeite do outro.

A régua de cada faixa é filete triplo — fino, grosso, fino —, com a ponta
descendo em **degrau de zigurate** e um losango de tinta da casa de cada lado
do nome. Os painéis ganham **cantoneira** em dois cantos opostos, não moldura
nos quatro: fechar a caixa brigaria com o recorte de tesoura, e dois cantos
bastam para o olho completar o retângulo. Etiqueta, botão e carimbo têm o
**canto chanfrado**, que é a assinatura mais barata e mais reconhecível do
período.

**Quem entorta é o papel, não o texto.** A folha é um elemento próprio por
baixo do painel: é ela que gira, pega grão e rasga, e o conteúdo fica reto em
cima dela. Texto dentro de uma camada rotacionada perde o encaixe na grade de
pixels e sai borrado — em Courier, que já tem haste fina, sai ilegível. A
mesma isolação vale para a mistura da sujeira: `isolation: isolate` na folha
impede que o `overlay` arraste o painel inteiro para uma camada composta e
leve junto o antisserrilhado subpixel do texto. E uma tarja impressa reta
sobre papel cortado torto é mais zine que o contrário.

### A sujeira

Um zine não é impresso, é fotocopiado, e normalmente é fotocópia de
fotocópia. Três camadas dão isso, e todas moram **embaixo** do conteúdo: o
papel é xerox velha, o que está escrito nele saiu da máquina hoje.

**Grão**, ruído fino de toner. **Mancha**, a nuvem lenta que faz duas folhas
nunca saírem com o mesmo tom. **Risco**, as faixas verticais que o rolo
arrasta. As duas primeiras são `feTurbulence` num SVG embutido — é a única
forma de ter ruído irregular sem carregar um PNG de textura.

A mistura é `overlay`, não `multiply`. Multiply só escurece, e a folha
inteira virava concreto; overlay é neutro no cinza médio do ruído, então
escurece onde o toner pegou e clareia onde faltou, que é literalmente o que
uma copiadora ruim faz com o papel.

**Duas tintas, uma passada cada, e a segunda nunca cai onde deveria.** A
chapa da casa sai por baixo e por fora do preto, deslocada três pixels. É o
erro de registro de qualquer gráfica de esquina, e é a assinatura do zine.

As manchetes são tarja de papel preto cortada com tesoura, não retângulo de
diagramação, e o recorte muda de painel para painel. O rasgo da base é
elemento de verdade e não pseudo-elemento, porque `::before` e `::after` são
dois e havia três candidatos brigando por eles.

Nada disso sobrevive à impressão: no papel a encenação inteira desliga.

O tom mudou junto. O núcleo do mundo continua sendo perda, mas a página trata
perda como a vida trata: com piada do lado. O texto de apoio responde ao
estado da ficha, e responde falando — no degrau 2 de Vitalidade, no terceiro
Contato do arco, quando a Capacidade estoura, quando sobra XP demais parado.

Uma cor não é papel nem tinta nem casa: **`--realce`**, o "este é o atual" da
régua de Vitalidade. Ela precisa ser a mais forte do conjunto, e o que é forte
depende do fundo: escura em papel claro, clara em tela de fósforo. Sem essa
variável a Mysteria pintava o nível atual mais escuro que os vazios, e a régua
passava a ler ao contrário.

Todo texto de leitura passa de 4,5:1 nas nove casas; o pior caso mede 5,09:1,
medido contra o pé do papel — que é onde o gradiente é mais escuro.

## As nove casas

Trocar a Afiliação reimprime o dossiê inteiro: papel, tinta, trama, selo,
carimbo e as palavras do cabeçalho.

| Afiliação | Gráfica |
| --- | --- |
| O Olho | Noir: preto e branco de filme, chevron, tarja de censura, prata fria |
| A Penumbra | Gótico tribal: ausência de cor, rabisco pesado, a coroa escondida |
| Os Acorrentados | Oração: ouro velho sobre vellum, raios de mandorla, serifa e letra bonita |
| Guardiões da Árvore | Herbário quase élfico: verde de folha, magenta de orquídea, linha fina |
| O Coletivo do Eco | Zine de última hora: papel-jornal, retícula grossa, vermelho berrante, letra recortada |
| A Frente | Estêncil militar: verde-oliva, grade de chapa, caixa-alta espaçada |
| Mysteria | CRT de MS-DOS: aqui o papel é tela e a tinta é fósforo. É a única casa que inverte o material, e inverte de propósito |
| Sociedade dos Ceifadores | Corvos: preto de pena com brilho de óleo, hachura de barbas |
| Avulso | Nenhuma gráfica cuida deste: o zine cru, mais sujo e mais torto |

Toda a gráfica vive no CSS, em `[data-casa="…"]`. O script só escreve o
atributo na raiz, escolhe as palavras do cabeçalho e desenha o selo, então
acrescentar uma casa é escrever um bloco de variáveis — não um componente
novo.

A trama de fundo da capa é fundo de fundo: só se nota quando se procura. A
força dela é **um número**, `--trama-op`, e vale para as nove casas — o alfa
de dentro de cada gradiente está normalizado em 1 justamente para que esse
número signifique a mesma coisa em todas.

## A marca

A manchete da capa não flutua no preto: é um **retalho de papel rasgado**,
colado torto, com a marca impressa em cima dele. Quando existe arquivo, a cruz
desenhada some: a arte traz a própria.

E a marca entra como **máscara, não como imagem**. O PNG é arte preta sobre
fundo transparente; mascarando, quem pinta passa a ser a tinta da casa. Isso
resolve o caso que uma imagem não resolveria: na Mysteria o papel é tela e a
tinta é fósforo, e um logotipo preto ali era preto sobre preto. Agora ele sai
verde, junto com todo o resto. A proporção vem do cabeçalho do próprio
arquivo, então trocar a marca por outra de formato diferente não pede CSS
novo.

## Tipografia

**Duas vozes, e cada uma no seu lugar.**

Datilografada é a voz certa para um dossiê e é péssima para ler parágrafo:
Courier tem haste fina, largura fixa e conta pouca letra por linha. Em cima de
papel com grão, o efeito de uma Cifra vira esforço. Então **mono** ficou com o
que é dado — rótulo, número, dado, campo, etiqueta, carimbo, nome de Talento —
e uma **serifa de leitura** ficou com o que é frase: efeito de Talento, efeito
de Cifra, marginália, estado vazio. Zine mistura fonte; ficha de mesa precisa
ser lida.

Courier Prime vai embutida no arquivo sob a
[SIL Open Font License 1.1](https://scripts.sil.org/OFL), para que a parte
datilografada tenha a mesma aparência em qualquer máquina. A serifa e a
condensada das manchetes são de sistema, com pilha de substitutas.

Rótulo é **12px** (`--fs-mini`) em qualquer arranjo, e o piso absoluto, que
vale para etiqueta e casa numerada, é **11px** — `verifica.js` reprova o que
descer disso. O rastreamento das caps miúdas é um número só, `--tr`, parado em
**.08em**: passando disso a palavra se desmancha em letras soltas e o olho
perde o contorno dela. A
retícula de meio-tom que cobre o papel fica em **11%** — acima disso ela deixa
de ser grão de fotocópia, passa a comer os finos da letra e, numa folha
inteira, acinzenta a página vista de longe.

Nas manchetes entra uma condensada pesada de sistema (Impact e seus
substitutos); os Acorrentados trocam ela por uma serifa, também de sistema.
Nenhuma das duas vai embutida: onde não existirem, a pilha cai para a
substituta e o zine continua de pé.

## Impressão

`Exportar em PDF` chama a impressão do navegador. No papel a ficha volta a ser
inteiramente datilografada e em preto — um documento que sai diferente em cada
impressora não serve como documento. A cor da casa vira contorno, a prata vira
linha preta, e cheio vira trama em vez de chapado, para o número dentro da
barra de Corrupção continuar legível numa fotocópia.

As variáveis da casa moram em `[data-casa="…"]`, que é mais específico que
`:root`; sem casar essa especificidade, a folha saía da impressora com a tinta
da Afiliação em cinza chapado. O bloco de impressão desliga a casa em
`:root, body[data-casa]`.

## O que a escolha concede

Escolher não é preencher duas vezes. **Antecedente** concede a perícia, o
Conhecimento e a habilidade de uma vez só, no instante em que é escolhido — e
trocar de Antecedente devolve a concessão antiga antes de aplicar a nova,
senão o personagem acumula perícia de emprego que nunca teve. **Cultura**
concede um nível de perícia, mas o Capítulo 9 não saiu e o livro não diz qual:
quem diz é o jogador, num campo ao lado, e a ficha soma sozinha.

O nível gratuito não é comprado e não pode ser gasto. `pericias` guarda só o
que foi comprado; o total é calculado, e por isso o nível some junto com a
fonte quando ela muda. Ele soma no dado, ocupa lugar no teto do estágio (o
botão de comprar para antes) e aparece marcado como **livre** ao lado do nome
da perícia. Caindo numa perícia que já tinha sido treinada, o livro é
explícito: não se perde e não fura o teto — vira ponto livre, e a ficha avisa
que ele existe para o jogador realocar.

## O que a ficha não faz

Não é juíza. Ela avisa quando um atributo passou do teto do estágio, quando um
Talento não cabe na Capacidade, quando uma Cifra está acima do que a sua
Ascensão aguenta e quando o XP livre ficou negativo — e em nenhum desses casos
ela impede. Quem impede é o Narrador.

Os Capítulos 8 e 9 do livro (Patrimônio por 1D12, equipamento, Culturas e as
fichas de cada Afiliação) ainda não existem. Cultura é campo livre com sugestão
dos lugares que o livro cita, Patrimônio é uma escolha entre os cinco degraus, e
os quatro slots do corpo vêm do Capítulo 6.
