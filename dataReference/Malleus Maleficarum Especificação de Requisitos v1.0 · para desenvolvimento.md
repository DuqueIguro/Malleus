# Malleus Maleficarum: Especificação de Requisitos v1.0 · para desenvolvimento

Esta especificação define o site da campanha Malleus Maleficarum para desenvolvimento. Cada regra indica a fonte: o livro Ordem Paranormal v1.0, o PDF *Malleus Maleficarum* (regras da casa) ou o Escudo do Mestre v7 (protótipo atual). Itens marcados como **PADRÃO** são propostas que ainda não foram confirmadas pelo mestre.

## 1. Visão geral e fontes das regras

O site tem duas partes: a área do mestre, que substitui o Escudo do Mestre, e a área do jogador, com a ficha e o rolador. Os dados ficam no Supabase, e a autenticação é feita por e-mail e senha.

| Fonte | Versão | Usada para | Observação |
| --- | --- | --- | --- |
| Ordem Paranormal, livro base | v1.0 (PDF) | Atributos, perícias, NEX, rolagem numeral | Só mecânica. Não reproduzir texto do livro. |
| Malleus Maleficarum, regras da casa | PDF anexado | Crença, ritos, moedas, patrimônio, rolagem simbólica, Gentio | Fonte principal das regras da campanha |
| Escudo do Mestre | v7 (HTML) | Estado do Véu, oráculo, faces dos dados. Rituais: criação autoral do mestre | Protótipo atual. Itens não citados no PDF precisam de confirmação. |

Se uma regra aparecer em mais de uma fonte, vale a do PDF da casa. Se não aparecer no PDF, vale o Escudo, e o item é marcado para confirmação.

## 2. Atores e permissões

Há dois papéis. O papel é definido no cadastro e não muda sem ação do mestre.

| Recurso | Mestre | Jogador |
| --- | --- | --- |
| Cadastro de contas e convites | Cria, convida, remove, redefine senha | Não acessa |
| Ficha do próprio personagem | Lê e edita | Lê e edita |
| Ficha de outro jogador | Lê e edita | Sem acesso |
| Escudo do Mestre (penitentes, Véu, grimório, púlpito) | Lê e edita | Sem acesso |
| Rolador e histórico de rolagens | Vê tudo | Vê as rolagens visíveis à mesa |
| Rolagem marcada como secreta | Vê | Sem acesso |
| Diário de sessões | Lê e edita | Lê |

Regra de implementação: as permissões são aplicadas no banco (Row Level Security). A interface apenas oculta o que o banco já bloqueia.

## 3. Requisitos funcionais

### RF01 Autenticação

Login por e-mail e senha pelo Supabase Auth. Os e-mails são fictícios: servem para identificar a conta e guardar o token de sessão. Não há confirmação por e-mail e não há cadastro aberto.

- Aceite: o mestre cria a conta e define a senha inicial no painel do Supabase.
- Aceite: um usuário sem conta não consegue ler nenhuma tabela.
- Aceite: a sessão persiste no navegador até logout ou expiração.

### RF02 Permissões

Aplicadas no banco por Row Level Security, conforme a tabela da seção 2.

- Aceite: uma requisição direta à API com a chave pública e o token de um jogador não retorna fichas de outros jogadores.

### RF03 Convites

O mestre convida e remove jogadores. Não há múltiplas campanhas.

- Aceite: remover um jogador revoga o acesso dele, mas mantém o histórico das fichas sem dono ativo.

### RF04 Fichas

Campos: nome, jogador, NEX (Mácula), classe, origem, atributos, perícias, PV, PC, PE e SAN (só Gentio), condições, inventário, habilidades, rituais, anotações. Preenchimento manual a partir do RPGpedia.

- Aceite: alterar um campo de base recalcula os derivados sem recarregar a página.

### RF05 Cálculos automáticos

PC máximo, PV, limites e derivados são recalculados a cada alteração de Presença, classe ou NEX. Fórmulas na seção 4.

- Aceite: os exemplos da seção 4 produzem exatamente os valores indicados.

### RF06 Rolador

Rolagem numeral (d20) e simbólica (S, A, P), com descarte e retenção, bônus de treinamento, margem de crítico, moedas, oráculo de decisão e histórico. Cada rolagem tem visibilidade: mesa ou só mestre.

- Aceite: o descarte nunca deixa menos de 1 dado mantido.
- Aceite: a rolagem secreta não aparece para jogadores em nenhuma tela.

### RF07 Regras da casa

As regras do PDF *Malleus Maleficarum* são implementadas em um módulo do código, sem edição pelo site. Ver seção 4.

### RF08 Escudo do Mestre

Penitentes (iniciativa, PV, PC, SAN, NEX, condições), púlpito (sermões com teleprompter e velocidade ajustável), estado do Véu com efeitos nos rituais, tabelas de doutrina e ritos, grimório com anotações e rituais, registro de feitos.

- Aceite: o estado do Véu altera automaticamente o custo de rituais exibido na ficha.

### RF09 Migração

Transcrição manual das fichas do RPGpedia. O formulário calcula os derivados enquanto o usuário digita.

### RF10 Diário de sessões

Registro cronológico por sessão, com vínculo opcional a personagens e anotações.

## 4. Regras de cálculo

Cada regra traz a fonte e um exemplo. Os exemplos são casos de teste: a implementação deve reproduzir os valores exatos.

### 4.1 Crença (PC)

- PC base por classe: Combatente 6, Especialista 8, Ocultista 10. Incremento por passo de NEX: 3, 4 e 5. Fonte: regras da casa.
- PC máximo = Base + Presença + piso(NEX ÷ 5) × (Incremento + Presença).
- O PC atual fica entre 0 e o máximo. Um ajuste que passe do limite é cortado.
- Ao subir o NEX, o máximo sobe e o atual ganha a mesma diferença.
- PC igual a 0 ativa o estado Crise de Fé (alerta visual). A Apostasia fica a cargo do mestre.
- Habilidades que custariam PE, e dano mental ou perda de SAN, debitam PC.
- Exemplo: Combatente, Presença 2, NEX 20%. Máximo = 6 + 2 + 4 × (3 + 2) = 28.

### 4.2 Interlúdio e Ritos (Religião)

O sistema recebe o total do teste de Religião e calcula o efeito. Requer Religião treinada.

- **Dedicar Sua Fé:** PC temporário = piso(total ÷ 10) × 5, válido até o fim do dia. Exemplo: total 24 gera 10.
- **Benção, Abençoar Ser (DT 15):** se total ≥ 15, PV temporário = 5 + 3 × piso((total − 15) ÷ 5). Exemplos: 20 gera 8; 25 gera 11.
- **Benção, Abençoar Objeto:** RD igual ao total, aplicada ao primeiro dano sofrido. Depois, a bênção se dissipa.
- **Compartilhar a Palavra (DT 25):** aliados presentes recebem o PC temporário do orador. Máximo de aliados = 2 × Presença.
- **Rito de Iniciação (DT 30):** a origem vira Abençoado. Ver 4.6 para o Gentio.
- **Abençoado, Crença Reforçada:** +1 em bônus numéricos e restaurações de Dedicar Sua Fé e Ritos que afetem o próprio personagem.
- **Abençoado, Sorte Divina:** uma vez por cena, sacrifica 1d4 PC para rerolar um teste. Se a nova rolagem for sucesso ou melhor, o PC volta.

### 4.3 Rolagem numeral

- Dados = valor do atributo, em d20. Atributo 0 rola 2d20 e usa o menor.
- Resultado = maior dado + bônus de treinamento (Destreinado 0, Treinado 5, Veterano 10, Expert 15).
- Crítico se o dado usado ≥ margem configurada (19 ou 20).
- Desastre se o dado usado for 1. Fonte: Escudo v7. Não consta no PDF: confirmar.

### 4.4 Rolagem simbólica

- Dados = valor do atributo. Tipo pelo treinamento: Destreinado d4, Treinado d6, Veterano d10, Expert d12.
- Atributo 0 rola 1d4, sem relação com o treinamento.
- Descarte: até max(0, Atributo − 2) dados. Retenção mínima: 1 dado (padrão; ver seção 8).
- Resultado: soma dos símbolos S, A e P dos dados mantidos. Não há bônus numérico.
- Rerolagem por habilidade: troca a face de um dado mantido, uma vez por ponto de rerolagem.

Símbolos por face (– = face vazia). Fonte: Escudo v7. Confirmar com os dados físicos ou com o livro.

| Dado | Faces |
| --- | --- |
| d4 | –, S, A, P |
| d6 | –, SA P, PA, -, S |
| d10 | –, –, P, PA, PA, S, SS, SA, SAP, SSP |
| d12 | –, –, P, PA, PA, S, SS, SA, SAP, SSP, SAAP, PP |

### 4.5 Estado do Véu

Fonte: Escudo v7. Não consta no PDF: confirmar. Custos de rituais e efeitos automáticos.

| Estado | Custo extra de ritual | Efeito automático |
| --- | --- | --- |
| Intacta | +0 PC | Nenhum |
| Danificada | +1 PC | Nenhum. Sussurros de Mágoa no descanso são descritivos. |
| Fracassada | +2 PC | Nenhum. Vontade contra medo −2 é descritivo. |
| Rompida | +3 PC | Cada rodada, todos os personagens perdem 1 PC |

### 4.6 Gentio e conversão

- O Gentio não tem PC. Mantém PV, SAN e PE.
- Progressão de SAN e PE por NEX: pendente (seção 8).
- Rito de Iniciação: remove SAN e PE, cria PC com a classe escolhida e o NEX atual, e muda a origem para Abençoado.

### 4.7 Mácula (NEX)

- Valor de 0 a 99, em passos de 5.
- Estágios: 0 alma pura; 5 a 45 sussurros; 50 ponto de inflexão; 55 a 99 afinidade manifesta. Fonte: regras da casa.
- Cada passo recalcula o PC máximo (4.1).

### 4.8 Patrimônio inicial

- Nobreza: 15 × Presença × max(1, Idade − 18) em MO.
- Plebe: 10 × Presença × max(1, Idade − 18) em MP.
- Idade mínima: 18. Exemplo: nobre de 30 anos com Presença 2 gera 360 MO. Plebe no mesmo caso gera 240 MP.

### 4.9 Moedas e carga

- Escala: 1 MP = 100 MC; 1 MO = 100 MP (10.000 MC); 1 MPl = 1000 MO.
- Espaços de inventário = piso(total de moedas ÷ 50). Abaixo de 50 moedas, o peso é desprezível.

### 4.10 Oráculo e cara ou coroa

- Oráculo de decisão, sorteio proporcional ao peso. Fonte: Escudo v7.

| Resultado | Peso |
| --- | --- |
| Sim, e... | 1 |
| Sim | 2 |
| Sim, mas... | 2 |
| Não, mas... | 2 |
| Não | 2 |
| Não, e... | 1 |

- Cara ou coroa: 50% para cada lado.

## 5. Modelo de dados

Sugestão inicial para o Supabase (Postgres). Nomes podem mudar, mas as relações e as regras de acesso devem ser mantidas. Toda tabela tem `id`, `criado_em` e `atualizado_em`.

| Entidade | Campos principais | Relações e observações |
| --- | --- | --- |
| usuario | email (fictício), papel (mestre ou jogador) | Vinculado à conta de autenticação |
| personagem | nome, tipo (jogador, gentio, penitente), jogador\_id, origem, classe, nex, presenca, atributos, pv, pv\_max, pc, pc\_max, pe, san | Um jogador pode ter mais de um personagem. Campos de PC e SAN são exclusivos por tipo. |
| pericia\_personagem | personagem\_id, pericia, treinamento | Treinamento: destreinado, treinado, veterano, expert |
| condicao\_personagem | personagem\_id, condicao | Condições: Abalado, Sangrando, Vulnerável, Cego, Perturbado, Enfeitiçado |
| item\_inventario | personagem\_id, nome, espaco, moedas (MC) | Moedas guardadas em MC para evitar conversão com arredondamento |
| ritual | nome, circulo, custo\_pc, elemento, efeito | Catálogo de rituais autorais do mestre. Conteúdo inicial vem do Escudo v7 |
| estado\_veu | estado (intacta, danificada, fracassada, rompida) | Registro único. Atualizado pelo mestre |
| rolagem | personagem\_id, tipo, modo, dados, descartes, resultado, visibilidade | Histórico. Visibilidade: mesa ou mestre |
| sermao | titulo, texto, pasta\_id | Pastas por sermão |
| anotacao | titulo, texto, pasta\_id, personagem\_id (opcional) | Pastas por anotação |
| sessao | data, titulo, resumo | Diário. Vínculo com personagens por tabela de junção |

Regra de acesso: as políticas de RLS seguem a tabela da seção 2. Campos secretos de personagens e anotações ficam só para o mestre.

## 6. Requisitos não funcionais

- **RNF01 Segurança:** a chave de serviço do Supabase nunca vai para o navegador. Só a chave pública e o token do usuário são usados no front-end.
- **RNF02 Privacidade:** coletar somente e-mail e dados de jogo. Permitir a remoção da conta e de todos os dados vinculados. Seguir princípios básicos da LGPD.
- **RNF03 Desktop e celular:** o mesmo conjunto de funções nas duas telas, com layout responsivo. Ficha e rolador funcionam em telas de 360 px de largura (PADRÃO).
- **RNF04 Desempenho:** cálculos derivados em menos de 100 ms, sem recarregar a página.
- **RNF05 Manutenibilidade:** regras da casa em um módulo isolado, com testes automatizados para os exemplos da seção 4.
- **RNF06 Custo zero:** a arquitetura cabe nos limites do plano gratuito do Supabase.
- **RNF07 Disponibilidade:** o projeto gratuito pausa após inatividade. Documentar o procedimento de reativação para o mestre.

## 7. Restrições, riscos e fora do escopo

### Restrições

- Supabase gratuito: limites de armazenamento, de requisições e de usuários. Dimensionar para uma mesa de até 6 pessoas (PADRÃO).
- Sem exportação do RPGpedia: toda ficha é digitada à mão.
- Regras protegidas de Ordem Paranormal: o site implementa mecânicas, não reproduz texto do livro.

### Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Projeto gratuito pausado antes de uma sessão | Jogadores sem acesso | Rotina de reativação com 48 h de antecedência (PADRÃO, RNF07) |
| Fichas digitadas com erro | Cálculos derivados errados | Testes dos exemplos da seção 4; revisão cruzada com o RPGpedia |
| Estimativa de migração subestimada | Atraso no prazo | Migrar uma ficha piloto antes de estimar o restante |
| Regras da casa mudam durante o desenvolvimento | Retrabalho no módulo de regras | Módulo isolado (RNF05) e versão da regra registrada |

### Fora do escopo da versão 1

- Múltiplas campanhas.
- Edição de regras pelo site.
- Fichas de NPCs e de facções (ideia futura, sem requisito).
- Importação automática do RPGpedia.
- Som ambiente e efeitos sonoros (decisão na seção 8).

## 8. Decisões pendentes

Se o mestre não responder, vale o padrão indicado. A decisão deve ser registrada aqui antes do desenvolvimento do módulo afetado.

| # | Decisão | Padrão adotado | Afeta |
| --- | --- | --- | --- |
| D1 | Progressão de PC: "a cada novo avanço de NEX" | A cada 5% de NEX | 4.1 |
| D2 | Mínimo de dados mantidos no descarte: "1 a 2" | 1 dado | 4.4 |
| D3 | Progressão de SAN e PE do Gentio por NEX | Segue o livro. Classe escolhida no cadastro | 4.6 |
| D4 | Versão do livro de referência | v1.0 | Seção 1 |
| D5 | Quantidade de classes, origens e poderes do livro na ficha | Só o que a mesa usa. Cadastro livre para o restante | RF04 |
| D6 | Atmosfera: vitral, som, relógio litúrgico | Vitrais e luz de vela mantidos, desligáveis. Relógio litúrgico mantido. Som fora da versão 1 | RF08 |
| D7 | Efeitos do Estado do Véu | Custo de ritual e perda de PC por rodada automáticos. Demais efeitos descritivos | 4.5 |
| D8 | Faces dos dados simbólicos | Tabela do Escudo v7 | 4.4 |
| D9 | Desastre em rolagem numeral (dado 1) | Mantido, como no Escudo v7 | 4.3 |
| D10 | Conteúdo dos rituais e das tabelas de doutrina | Conteúdo inicial do Escudo v7. Rituais são autorais do mestre e revisados por ele antes da carga | Modelo de dados |
| D11 | Limites de desempenho e de largura de tela | 100 ms e 360 px (RNF03, RNF04) | Seção 6 |

Para cada decisão respondida, atualizar a tabela, a seção afetada e a versão do documento.

## 9. Identidade visual e interface

A estética é de uma igreja católica medieval: pedra, madeira escura, luz de vela e vitrais. Os requisitos abaixo são PADRÃO até a aprovação das referências visuais do mestre.

- **RV01 Atmosfera:** fundo escuro em tons de pedra. Luz de vela e feixes de luz que atravessam vitrais, com brilho sutil e lento.
- **RV02 Vitrais:** painéis decorativos com molduras de chumbo, no cabeçalho ou no fundo. Desligáveis pelo usuário.
- **RV03 Ornamentos:** molduras douradas, cruz e textura de pergaminho para sermões e anotações longas. Sem ornamentos que atrapalhem a leitura da ficha.
- **RV04 Tipografia:** fonte serifada para o corpo do texto e fonte com estilo gótico apenas para títulos.
- **RV05 Legibilidade:** contraste mínimo de 4,5:1 para texto (WCAG AA), em computador e celular.
- **RV06 Movimento:** os efeitos respeitam a preferência de movimento reduzido do sistema e podem ser desligados na própria tela.
- **RV07 Sons:** fora da versão 1 (ver D6).

## 10. Glossário

| Termo | Significado no sistema |
| --- | --- |
| PV | Pontos de vida. Integridade do corpo. |
| PC | Pontos de Crença. Substituem SAN e PE nas regras da casa. |
| PE | Pontos de esforço. Só existe para o Gentio. |
| SAN | Sanidade. Só existe para o Gentio. |
| NEX / Mácula | Porcentagem de exposição ao paranormal, de 0 a 99, em passos de 5. |
| Gentio | Personagem sem fé. Não tem PC. |
| Abençoado | Origem de quem passou pelo Rito de Iniciação. |
| Véu | Barreira espiritual. Seus estados afetam os rituais (4.5). |
| Crise de Fé | Estado com PC igual a 0. Alerta visual. |
| Apostasia | Risco narrativo da Crise de Fé. Sem automação. |
| DT | Dificuldade do teste. |
| Rolagem numeral | Rolagem de d20 contra DT ou defesa (4.3). |
| Rolagem simbólica | Rolagem de dados com símbolos S, A e P (4.4). |
| Descarte | Remoção de dados antes do resultado final. |
| Retenção | Número mínimo de dados que devem permanecer após o descarte. |
| S, A, P | Símbolos de Sucesso, Adaptação e Pressão. |
| Mesa | Grupo de jogadores e o mestre, na mesma campanha. |
