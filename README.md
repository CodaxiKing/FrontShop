Entregas realizadas até o momento:

- Fluxo de autenticação com montagem de banco de dados offline
- Listagem de view com as tabs de pedidos filtrando os filtros, botões de novo pedido navegação ok, botão sicornizado navegação ok.
- Tab de view pedidos abertos: botão pesquisar que visualiza pedido em aberto está funcionando
- Ajustes feito para a camada de array de duplicado de acordo com o cliente selecionado.
- Fluxo de vitrine feito, ao selecionar um produto ele mostra os dados do produto selecionado. Mas existem pontos como carousel de itens associados e imagens de detalhes do produto que não estão ainda vindos do BFF
- Ciclo de Seleção de Cliente finalizado e salvando informações (ação de abrir carrinho). Ciclo de Seleção de Produto e adição ao carrinho.
- Carousel de Produtos Relacionados sendo exibido.
- Criação, seleção, deleção e edição de Bandeja de Produtos.

Pendencias primeiro ciclo:

- Tab de view pedidos finalizados: botão da lista não está fazendo efeito poorque não existem CNPJS associados ao cliente.
- Detalhes do pedido abertos a imagem e nome da empresa não carregou, dar uma olhada se é erro de array para ver se a posição do nome da empresa e link cdn estão carregando no objeto, ou porque a aplicação não baixou a massa por um toda. (Coloquei uma imagem de exemplo para não ficar sem imagem)

Pendencias segundo ciclo:

-
- Filtros
- Representante

Observações:

- Aplicação está sofrendo uma latencia devido o excesso de dados mesmo usando trativas asincronas.

<<<<<<< HEAD #TODO:

=======

> > > > > > > 9e1200a9bac17dae14076305ba5cb19f923af0fa Faltando:

- Finalização do Carrinho (Duplicação). (André)
- Mala Direta (Seleção do Cliente e Envio). (André - 22/01)
- Copiar e Importar Pedido.
- Selecionar Representante. (Está mockado atualmente, nenhuma lógica implementada).
- Filtros e Parâmetros.
- Implementação do novo fluxo de seleção da tabela de preços de acordo com cliente. (Hudson) <<<<<<< HEAD
- Finalizando a tela de sincronização. (Hudson) <<<<<<< HEAD ======= =======
  > > > > > > > f9b1055974ccb8687a6fd66c6d74906f1f16b8d0

# Endpoints Implementados

- Bandeja
- BandejaProduto
- CarteiraCliente
- Catalogo
- Display
- Filtro/Linha
- Frete
- PagamentoCliente
- Pedidos
- Representante
- Sinalizadores
- TabelaPreco

# Endpoints que faltam implementar

- CodigoBarraFeira
- Filtro
- Pedido (Post e Put)
  > > > > > > > 9e1200a9bac17dae14076305ba5cb19f923af0fa

Cod: 1l22wm/1x Vitrine: R$250,00 - Desconto: -250% Tabela Padrão: R$250 - Desconto: 0 Tabela Desconto Acordado 10%: R$225 - Desconto: 0 Tabela Bemol: R$250 - Desconto: 0 Tabela Promoção Verão Jan/25: R$245 - Desconto: 0

- removida pasta android, limpado cache e comitando para resolver bugs ao gerar build no eas



src/
├─ database/
│  └─ queries/
│     └─ filtros/                     # APENAS SQL
│        ├─ catalogo/
│        │  ├─ distintivos.sql.ts     # SELECT DISTINCT para Marca/Linha/Subgrupo/Origem/Gênero
│        │  ├─ sinalizadores.sql.ts   # opções + EXISTS/NOT EXISTS com json_each
│        │  ├─ bandeja.sql.ts         # opções + subselect IN
│        │  └─ bandejaVendedor.sql.ts # opções + EXISTS por representante
│        └─ tabelaPreco/
│           ├─ … (mesmas variações para TabelaPrecoProduto)
│           └─ …
├─ repositories/
│  └─ FiltroRepository.ts             # ÚNICO ponto de acesso a queries de filtro
├─ services/
│  └─ FiltroService.ts                # Orquestra; monta WHERE/params por segmento
├─ hooks/
│  ├─ filtros/
│  │  ├─ useFiltroDrawer.ts           # estado global do drawer (acumulativo)
│  │  ├─ useFiltroMarca.ts            # por segmento (quando útil)
│  │  ├─ useFiltroLinha.ts
│  │  ├─ useFiltroSubgrupo.ts
│  │  ├─ useFiltroOutros.ts           # gênero/origem/flags simples
│  │  ├─ useFiltroSinalizadores.ts
│  │  ├─ useFiltroBandeja.ts
│  │  ├─ useFiltroBandejaVendedor.ts
│  │  └─ useFiltroAvancados.ts        # recebe objeto do modal
│  └─ useAdvancedFilterApplied.ts     # OUVE eventBus "filters:applied" p/ ListaProdutos
├─ components/
│  └─ Top/Sidebar/                    # view dos filtros (drawer)
│     ├─ MarcaFilter.tsx
│     ├─ LinhaFilter.tsx
│     ├─ SubgrupoFilter.tsx
│     ├─ OutrosFilter.tsx
│     ├─ SinalizadoresFilter.tsx
│     ├─ BandejaFilter.tsx
│     ├─ BandejaVendedorFilter.tsx
│     └─ AvancadosFilter.tsx
└─ core/
   └─ eventBus.ts                     # já existe; reusaremos "filters:applied"
