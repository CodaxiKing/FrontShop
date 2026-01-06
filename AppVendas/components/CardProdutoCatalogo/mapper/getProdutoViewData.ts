// components/CardProdutoCatalogo/mapper/getProdutoViewData.ts
import { CatalogoItem } from "@/context/interfaces/CatalogoItem";
import { formatCurrency } from "@/utils/formatCurrency";
import { normalizeSinalizadores } from "@/utils/normalizeSinalizador";

export type FavoritoDeps = {
  isFavoriteById?: (id: string | number) => boolean;
  toggleFavoriteById?: (id: string | number) => Promise<boolean> | void;
};

export type ProdutoViewData = {
  produtoId: string;
  codigo: string;
  nome: string;
  precoUnitario: number;
  precoComIPI: number;
  percentualDesconto: number;
  descricaoComercial: string;
  nomeEcommerce: string;
  productImage?: string;
  imagemLocal?: string | null; // [IMAGENS][PATCH]
  imagens?: string[]; // [IMAGENS][PATCH]
  inventoryQtd: number;
  sinalizadores: any[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  formatCurrency: typeof formatCurrency;
};

type ExtraDeps = {
  isJaComprou?: (codigoProduto: string) => boolean;
};

export function getProdutoData(
  produto: CatalogoItem,
  fav?: FavoritoDeps,
  extra?: ExtraDeps
): ProdutoViewData {
  const produtoId = String((produto as any)?.id ?? produto?.codigo ?? "");
  const codigo = String(produto?.codigo ?? "—");
  const precoUnitario = Number(produto?.precoUnitario) || 0;
  const precoComIPI = Number(produto?.precoComIPI) || 0;
  const percentualDesconto = Number(produto?.percentualDesconto) || 0;
  const descricaoComercial = String(produto?.descricaoComercial ?? "");
  const nomeEcommerce = String(produto?.nomeEcommerce ?? "");
  const nome = nomeEcommerce || descricaoComercial;

  // sinalizadores
  let sinalizadores: Array<{ codigo: string; descricao: string }> = [];
  if (
    typeof (produto as any)?.sinalizadores === "string" &&
    (produto as any).sinalizadores.length > 0
  ) {
    try {
      const norm = normalizeSinalizadores((produto as any).sinalizadores);
      if (Array.isArray(norm)) {
        sinalizadores = norm
          .map((s: any) => ({
            codigo: String(s?.codigo ?? ""),
            descricao: String(s?.descricao ?? ""),
          }))
          .filter((s) => s.codigo);
      }
    } catch {}
  }

  if (extra?.isJaComprou && extra.isJaComprou(codigo)) {
    const exists = sinalizadores.some((s) => s.codigo === "000");
    if (!exists) {
      sinalizadores.push({ codigo: "000", descricao: "JÁ COMPROU" });
    }
  }

  // [IMAGENS][PATCH] leitura de campos relacionados a imagens
  const imagemLocal: string | null =
    (produto as any)?.imagemLocal ?? null;

  const imagens: string[] | undefined = Array.isArray((produto as any)?.imagens)
    ? (produto as any).imagens.map((i: any) => i?.imagemUrl ?? "").filter((s: string) => !!s)
    : undefined;

  const mainImage =
    (typeof (produto as any)?.productImage === "string" &&
      (produto as any).productImage.trim()) ||
    (Array.isArray(imagens) && imagens.length > 0 ? imagens[0] : undefined);

  const inventoryQtd = Number((produto as any)?.quantidadeEstoquePA) || 0;

  const isFavorite =
    produtoId && fav?.isFavoriteById ? !!fav.isFavoriteById(produtoId) : false;

  const onToggleFavorite =
    produtoId && fav?.toggleFavoriteById
      ? () => fav.toggleFavoriteById!(produtoId)
      : () => {};

  return {
    produtoId,
    codigo,
    nome,
    precoUnitario,
    precoComIPI,
    percentualDesconto,
    descricaoComercial,
    nomeEcommerce,
    productImage: mainImage,
    imagemLocal, // [IMAGENS][PATCH]
    imagens, // [IMAGENS][PATCH]
    inventoryQtd,
    sinalizadores,
    isFavorite,
    onToggleFavorite,
    formatCurrency,
  };
}
