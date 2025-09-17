// services/CarrinhoService.ts
import { eventBus } from "@/core/eventBus";
import { CarrinhoRepository, LojaProduto, NovoProduto } from "@/repositories/CarrinhoRepository";

function parseProdutosJson(produtosStr?: string): LojaProduto[] {
  if (!produtosStr || !String(produtosStr).trim()) return [];
  try { const parsed = JSON.parse(produtosStr); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}

function stringify(obj: any) {
  try { return JSON.stringify(obj); } catch { return "[]"; }
}

export const CarrinhoService = {
  async carregarQuantidadeProduto(
    codigo: string,
    cpfCnpj: string,
    clienteId: string,
    representanteId: string
  ): Promise<number> {
    const pedido = await CarrinhoRepository.buscarPedido(cpfCnpj, clienteId, representanteId);
    if (!pedido) return 0;

    const lojas = parseProdutosJson(pedido.produtos);
    let qtd = 0;
    lojas.forEach((loja) => {
      if (loja.cpfCnpj !== cpfCnpj) return;
      const p = loja.produtos.find((x) => x.codigo === codigo);
      if (p) qtd = p.quantidade;
    });
    return qtd;
  },

  // carrega mapa de quantidades de uma vez
  async carregarMapaQuantidades(
    cpfCnpj: string,
    clienteId: string,
    representanteId: string
  ): Promise<Record<string, number>> {
    const pedido = await CarrinhoRepository.buscarPedido(cpfCnpj, clienteId, representanteId);
    if (!pedido) return {};

    const lojas = parseProdutosJson(pedido.produtos);
    const map: Record<string, number> = {};
    lojas.forEach((loja) => {
      if (loja.cpfCnpj !== cpfCnpj) return;
      loja.produtos.forEach((p) => { map[p.codigo] = p.quantidade; });
    });
    return map;
  },

  async atualizarProdutoNoCarrinho(params: {
    codigo: string;
    quantidade: number;
    nomeEcommerce: string;
    precoUnitario: number;
    precoUnitarioComIPI: number;
    imagem: any;
    cpfCnpj: string;
    clienteId: string;
    representanteId: string;
    representanteCreateId: string;
    selectedTabelaPreco: any;
    selectedClient: {
      cpfCnpj: string;
      clienteId: string;
      razaoSocial: string;
      enderecoCompleto: string;
      enderecos?: any[];
    };
    percentualDesconto?: number;
    dataPrevistaPA?: string | null;
    descricaoSubGrupo?: string;
  }) {
    const {
      codigo, quantidade, nomeEcommerce, precoUnitario, precoUnitarioComIPI, imagem,
      cpfCnpj, clienteId, representanteId, representanteCreateId,
      selectedTabelaPreco, selectedClient,
      percentualDesconto, dataPrevistaPA, descricaoSubGrupo,
    } = params;

    const pedido = await CarrinhoRepository.buscarPedido(cpfCnpj, clienteId, representanteId);

    const novoProduto: NovoProduto = {
      codigo,
      nomeEcommerce,
      quantidade,
      precoUnitario,
      precoUnitarioComIPI,
      tipo: "R",
      imagem,
      percentualDesconto,
      dataPrevistaPA: dataPrevistaPA || null,
      descricaoSubGrupo,
    };

    // criar pedido se novo
    if (!pedido) {
      if (quantidade <= 0) return;

      const lojas = [
        { cpfCnpjPai: cpfCnpj, razaoSocial: selectedClient.razaoSocial, nomeReduzido: selectedClient.razaoSocial },
      ];
      const produtosLojas: LojaProduto[] = [{ cpfCnpj, produtos: [novoProduto] }];

      const enderecosCliente: any[] = selectedClient?.enderecos || [];
      const endereco: any = enderecosCliente[0] || {};

      await CarrinhoRepository.criarPedido({
        clienteId: selectedClient.clienteId,
        razaoSocial: selectedClient.razaoSocial,
        cpfCnpj: selectedClient.cpfCnpj,
        enderecoEntrega: selectedClient.enderecoCompleto,
        numeroEntrega: "",
        cepEntrega: endereco.cep || "",
        bairroEntrega: endereco.bairro || "",
        complementoEntrega: endereco.complemento || "",
        estadoEntrega: endereco.estado || "",
        municipioEntrega: endereco.municipio || "",
        lojasJson: stringify(lojas),
        produtosJson: stringify(produtosLojas),
        quantidadeItens: 1,
        quantidadePecas: quantidade,
        valorTotal: precoUnitario * quantidade,
        tabelaDePrecoId: stringify(selectedTabelaPreco?.value ?? ""),
        nomeEcommerce,
        representanteId,
        representanteCreateId,
      });
      return;
    }

    // atualizar pedido existente
    const lojasExistentes = parseProdutosJson(pedido.produtos);
    let loja = lojasExistentes.find((l) => l.cpfCnpj === cpfCnpj);
    if (!loja) {
      loja = { cpfCnpj, produtos: [] };
      lojasExistentes.push(loja);
    }

    if (quantidade <= 0) {
      loja.produtos = loja.produtos.filter((p) => p.codigo !== codigo);
    } else {
      const idx = loja.produtos.findIndex((p) => p.codigo === codigo);
      if (idx >= 0) loja.produtos[idx].quantidade = quantidade;
      else loja.produtos.push(novoProduto);
    }

    const unique = new Set<string>();
    let totalPieces = 0;
    lojasExistentes.forEach((l) =>
      l.produtos.forEach((p) => {
        unique.add(p.codigo);
        totalPieces += p.quantidade;
      })
    );

    const vazio = lojasExistentes.every((l) => l.produtos.length === 0);
    if (vazio) {
      await CarrinhoRepository.apagarPedidoById(pedido.id);      
      return;
    }

    await CarrinhoRepository.atualizarProdutosEContadores({
      id: pedido.id,
      representanteId,
      produtosJson: stringify(lojasExistentes),
      nomeEcommerce,
      quantidadeItens: unique.size,
      quantidadePecas: totalPieces,
      tabelaDePrecoId: stringify(selectedTabelaPreco?.value ?? ""),
      razaoSocial: selectedClient.razaoSocial,
    });
  },

  async removerProdutoDoCarrinho(
    codigo: string,
    cpfCnpj: string,
    clienteId: string,
    representanteId: string
  ) {
    const pedido = await CarrinhoRepository.buscarPedido(cpfCnpj, clienteId, representanteId);
    if (!pedido) return;

    const lojas = parseProdutosJson(pedido.produtos);

    console.log(`REMOVE CARRINHO -> [${lojas}]`)

    lojas.forEach((loja) => {
      loja.produtos = loja.produtos.filter((p) => p.codigo !== codigo);
    });

    const unique = new Set<string>();
    let totalPieces = 0;
    lojas.forEach((l) =>
      l.produtos.forEach((p) => {
        unique.add(p.codigo);
        totalPieces += p.quantidade;
      })
    );

    const vazio = lojas.every((l) => l.produtos.length === 0);
    if (vazio) {
      await CarrinhoRepository.apagarPedidoById(pedido.id);    
      return;
    }

    await CarrinhoRepository.atualizarProdutosEContadoresLight({
      id: pedido.id,
      representanteId,
      produtosJson: stringify(lojas),
      quantidadeItens: unique.size,
      quantidadePecas: totalPieces,
    });
  },

  async getCount(representanteId: string): Promise<number> {
    return CarrinhoRepository.getCountByRepresentante(representanteId);
  },

  async listByRepresentante(representanteId: string) {
    return CarrinhoRepository.listByRepresentante(representanteId);
  },

  async debugDump(representanteId: string) {
    return CarrinhoRepository.debugDump(representanteId);
  },

  async removerProdutoDoCarrinhoIsNull() {
    return CarrinhoRepository.apagarPedidoRepresentanteIsNull();
  },

   async removerTodosProdutoDoCarrinho() {
    return CarrinhoRepository.apagarTodosPedido();
  },
  
  
  
};
