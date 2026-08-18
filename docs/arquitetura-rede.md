# Arquitetura — mesa em rede

Como sair de um arquivo único com `localStorage` para Narrador e jogadores
na mesma mesa, sem perder o que já funciona.

## A decisão que sustenta todas as outras

**O servidor nunca entende as regras de Caos Eminente.** Ele guarda uma ficha
como um bloco de JSON opaco e sabe apenas quatro coisas: de quem é, de que
mesa é, quem pode ler e quem pode escrever.

Isso não é preguiça, é o requisito mais forte do projeto. Só nesta semana o
sistema perdeu Essência, ganhou Limiar, trocou Especializações por Arquétipos,
renomeou Carga para Ativada e removeu as Resistências. Se o banco tivesse
colunas `essencia_atual` ou `corrupcao_recente`, cada uma dessas mudanças
viraria migração de schema, deploy coordenado e fichas velhas quebradas em
produção.

Com o blob opaco, a revisão inteira que fizemos hoje teria sido um deploy de
arquivo estático. `normalize()` continua sendo o único lugar que sabe o que é
uma ficha válida, e continua rodando no cliente, onde as regras vivem.

O que o servidor precisa saber tem um nome: **identidade, posse e permissão**.
Nada disso muda quando o Narrador reescreve um capítulo.

## Papéis e a regra de visibilidade

| Papel | Vê | Escreve |
|---|---|---|
| Jogador | as próprias fichas | as próprias fichas |
| Narrador | todas as fichas da mesa dele | todas as fichas da mesa dele |

Um jogador **nunca** vê a ficha de outro jogador. Essa regra é o requisito
central e por isso ela não pode morar na interface — precisa ser imposta pelo
banco, na consulta. Se a filtragem estiver só no cliente, qualquer um abre o
DevTools e pede a lista inteira.

## Modelo de dados

```
usuario (id, nome, criado_em)

mesa    (id, nome, narrador_id → usuario, codigo_convite, criado_em)

membro  (mesa_id → mesa, usuario_id → usuario, papel)
         papel ∈ {'narrador','jogador'}
         chave primária (mesa_id, usuario_id)

ficha   (id, mesa_id → mesa, dono_id → usuario,
         dados jsonb,          -- a ficha inteira, opaca
         notas_narrador text,  -- invisível para o dono
         versao int,
         atualizado_em, atualizado_por → usuario)
```

`dados` é exatamente o objeto que hoje vai para o `localStorage`. O campo
`notas_narrador` é o único pedaço da linha que o dono da ficha não enxerga:
serve para o Narrador anotar o que está preparando para aquele personagem.

## Autorização

Com Postgres, isto é Row Level Security. É o coração do sistema e cabe em
poucas linhas:

```sql
alter table ficha enable row level security;

create policy ficha_visivel on ficha for select using (
  dono_id = auth.uid()
  or exists (
    select 1 from membro m
    where m.mesa_id = ficha.mesa_id
      and m.usuario_id = auth.uid()
      and m.papel = 'narrador'
  )
);

create policy ficha_editavel on ficha for update using (
  dono_id = auth.uid()
  or exists (
    select 1 from membro m
    where m.mesa_id = ficha.mesa_id
      and m.usuario_id = auth.uid()
      and m.papel = 'narrador'
  )
);
```

Três armadilhas que precisam de atenção explícita:

**A tabela `membro` também precisa de política.** Sem ela, um jogador lista os
outros membros e descobre `usuario_id` alheio. Ele ainda não lê a ficha, mas
não há razão para vazar o mapa.

**`notas_narrador` não é protegida por RLS.** RLS filtra linhas, não colunas.
Se o jogador tem acesso à linha, tem acesso à coluna. A proteção precisa ser
uma *view* que omite a coluna, ou uma tabela separada `nota_narrador` com
política própria. Tabela separada é mais simples de acertar.

**Tempo real é um segundo canal de permissão.** Assinaturas de `postgres_changes`
respeitam RLS, mas canais de broadcast não respeitam nada por padrão. O jogador
assina só os canais das fichas dele; o Narrador assina os da mesa. Errar aqui
recria exatamente o vazamento que a RLS impediu.

## Sincronização

### O formato do patch já existe no código

A ficha inteira é grande e dois editores podem estar nela ao mesmo tempo
(o jogador marcando dano, o Narrador marcando Corrupção). Mandar o blob
inteiro a cada tecla faz o último gravar por cima do outro.

A saída é mandar campo a campo — e a folha **já endereça campos por caminho**.
Cada input carrega o seu:

```html
<input data-path="attrs.corpo">
<textarea data-path="cifras.0.efeito">
<select data-path="lab.selo">
```

E o manipulador de entrada já é, na prática, um aplicador de patch:

```js
setPath(c, t.dataset.path, v);
```

Então o formato de rede é só isto:

```json
{ "ficha": "c1a2b3", "caminho": "attrs.corpo", "valor": 3, "versao": 41 }
```

Aplicar um patch que chegou do servidor é a mesma chamada de `setPath` seguida
de `updateDerived()`. O motor de sincronização já está escrito; falta o cano.

### O problema das listas

`cifras.0.efeito` deixa de significar a mesma coisa se alguém remover a Cifra
de índice 0 enquanto o outro edita. Índice não é identidade.

Cada item de lista precisa de um `id` estável, gerado pelo `uid()` que já
existe, e o caminho passa a ser:

```
cifras.#c1a2b3.efeito
```

`setPath` e `getPath` ganham um caso: segmento iniciado por `#` resolve por
busca de `id` em vez de índice. É uma mudança pequena e contida, e é
pré-requisito de tudo que envolve dois editores.

### Conflito

Contador `versao` por ficha, e resolução por campo:

- patches em caminhos diferentes aplicam os dois, sem conflito
- patches no mesmo caminho: vence o último, e o perdedor é avisado
- o cliente guarda `versao` e reenvia quem ficou para trás

Não precisa de CRDT. Uma ficha de RPG tem dois editores, não duzentos, e a
granularidade de campo já resolve quase todo encontro real.

### Offline

O modo local não pode morrer — é o produto de hoje e ele é bom. O
`localStorage` continua sendo a verdade imediata; a nuvem é a cópia
compartilhada.

O `save()` com debounce que já existe vira o ponto de enfileiramento: grava
local na hora, empilha o patch numa fila, e a fila escoa quando há rede. Sem
rede, a ficha funciona igual a hoje.

## O painel do Narrador

Uma lista dos jogadores da mesa, cada um com o resumo que decide a cena:

- Vitalidade — nível e pontos
- Corrupção — total contra o Limiar, e o estado
- Capacidade — Peso aceso contra o teto
- XP disponível

Nada disso precisa ser calculado no servidor: são as funções que já estão no
arquivo (`corrTotal`, `limiarDe`, `pesoUsado`, `xpLivre`) rodando sobre o blob
recebido. Clicar num jogador abre a mesma `renderSheet()`, com uma tarja
dizendo que quem edita é o Narrador.

## Migração em estágios

Cada estágio entrega algo e deixa a versão local funcionando.

**Estágio 0 — sem servidor nenhum.**
Ids estáveis nos itens de lista, caminhos que resolvem por id, e um `Cache`
que concentra o acesso ao `localStorage`. Nada muda para quem usa. Sem isso,
nenhum dos outros estágios é seguro.

**Estágio 1 — conta e nuvem.**
Auth, `mesa`, `ficha`, RLS. Sincronização de blob inteiro, último a gravar
vence, sobre o debounce que já existe. Painel do Narrador somente leitura.
Quem não quer conta continua jogando local.

**Estágio 2 — patches e tempo real.**
Caminhos por `data-path`, assinatura por canal, Narrador editando ao vivo.

**Estágio 3 — histórico e presença.**
A tabela de patches vira registro de auditoria: quem mudou o quê e quando,
com desfazer para o Narrador. Marcador de quem está com a ficha aberta.

## Decisões tomadas

**Entrada por link com código de convite.** O Narrador gera um link
`.../#/entrar/K7M2P9`. Quem abre é criado como usuário anônimo no banco —
sem e-mail, sem senha — e o código é resgatado na hora, inserindo a linha em
`membro`. É a solução mais simples possível para uma mesa privada e fechada, e
mesmo assim existe um `auth.uid()` de verdade por trás, que é o que a RLS
precisa para funcionar.

O código é um dado, não uma credencial: quem tem o link entra na mesa, mas
entrar na mesa não dá acesso a ficha nenhuma além da própria. A separação
continua sendo feita pela política do banco.

**O modo local continua existindo.** Abrir o arquivo sem conta nenhuma segue
funcionando como hoje, com as fichas no navegador. A conta é o que permite o
Narrador enxergar, não o que permite jogar.

**Plataforma: Supabase.** Entrega auth anônima, Postgres, RLS e tempo real sem
servidor para manter, e a política escrita acima é literalmente o arquivo de
migração. Trocar depois por Postgres próprio custa reescrever a camada de
acesso, e nada do modelo de dados.

### O risco do login anônimo, escrito antes de doer

A sessão anônima vive no navegador. Limpar dados do site, trocar de aparelho ou
usar aba anônima significa perder o vínculo com o personagem — o banco continua
com a ficha, mas ninguém consegue provar que ela é sua.

Três defesas, e vale ter as três:

1. **O Narrador consegue reatribuir uma ficha a outro usuário.** É a rede de
   segurança que resolve o caso real: o jogador entra de novo pelo link, e o
   Narrador aponta a ficha antiga para o novo `uid`.
2. **A exportação `.json` que já existe vira backup de verdade.** Um arquivo na
   máquina do jogador não depende de sessão nenhuma.
3. **Oferecer vínculo por e-mail depois.** Supabase permite promover uma conta
   anônima para uma com e-mail sem trocar o `uid`. Quem quiser garantia, liga;
   quem não quiser, segue sem.

## Estágio 0 — feito

Concluído sem servidor e sem mudança visível:

- **Id estável em cada item de lista.** Cifras, Talentos e Inventário passam a
  ter `id` gerado no `normalize()`. Fichas antigas ganham id ao abrir, e ids já
  existentes não são regerados.
- **Caminhos por id.** `setPath` e `getPath` aceitam `cifras.#c1a2.efeito` além
  de `cifras.2.efeito`, e `caminhoCanonico()` traduz um no outro na fronteira
  com a rede. A interface segue emitindo índice, que é o que ela tem à mão ao
  desenhar a lista; nenhum template precisou mudar.
- **`Cache`**, o único ponto do arquivo que fala com `localStorage` para dado de
  ficha. A preferência de efeitos continua indo direto, porque é preferência de
  aparelho e não acompanha o jogador.

O `setPath` passou a devolver `false` quando o caminho não existe mais, em vez
de estourar: patch que chega para uma Cifra que a outra ponta apagou precisa
cair fora sem derrubar a folha.

### Por que isso não é burocracia

Com três Cifras na ficha, apagar a primeira faz `cifras.1.efeito` passar a
apontar para outra Cifra. Dois editores e um índice significam texto escrito na
linha errada, em silêncio. Com id, o caminho continua apontando para a mesma
Cifra ou para nada.

## Próximo passo — Estágio 1

Auth anônima, `mesa`, `membro`, `ficha` e a RLS. Sincronização de ficha inteira,
último a gravar vence, sobre o debounce que já existe. Painel do Narrador
somente leitura. O modo local segue intocado o tempo todo.
