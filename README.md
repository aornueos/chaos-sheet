# Caos Eminente — Ficha do Ascendido

Ficha de personagem para o RPG **Caos Eminente**, na revisão de sistema que
trouxe Linhagem, Corrupção, Arquétipos e Capacidade.

Arquivo único, sem servidor e sem dependências. As fichas ficam salvas
no navegador de quem abre a página (localStorage), então cada jogador
tem as suas. Use **Backup Completo** para levar as fichas de um
navegador ou endereço para outro.

## Recursos

- Múltiplas fichas, com Vitalidade e Limiar vindos da Linhagem
- Corrupção como recurso único — Assentada e Ativada somadas contra o Limiar
- Capacidade por estágio de Ascensão, com Talentos que se acendem e apagam
- XP com gasto automático: cada Talento e cada Cifra desconta o próprio custo
- Compêndio dos doze Arquétipos e das prateleiras de Talentos de cada um
- Exportação em PDF preto e branco, A4 paisagem
- Lixeira com desfazer, backup completo e importação que nunca substitui

## Fichas da versão anterior

Abrem normalmente. A Especialização escolhida vira o Arquétipo de mesmo nome,
a Corrupção que existia entra como Assentada, e os Talentos que ainda constam
no livro recuperam Peso e Ativada sozinhos. As Cifras herdam o custo em XP do
próprio Vínculo. Essência, Resistência Física e Resistência Espiritual não são
convertidas: saíram do sistema.

## Custo das Cifras em XP

Aprender custa pelo Vínculo: **Baixo 2, Médio 4, Alto 8**. O campo é editável
linha a linha para os casos fora da tabela. Para mudar o padrão, ajuste `xp`
em `VINCULOS`, no topo do script.

## Tipografia

Courier Prime embutida no arquivo sob a
[SIL Open Font License 1.1](https://scripts.sil.org/OFL),
para que a ficha tenha a mesma aparência em qualquer máquina.
