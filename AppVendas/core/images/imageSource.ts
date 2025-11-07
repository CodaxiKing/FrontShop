// src/core/images/imageSource.ts
import { ImageSourcePropType } from "react-native";

// o placeholder fica encapsulado aqui (as views não importam nada dele)
const PLACEHOLDER = require("../../assets/images/sem-imagem.png");

export type ProdutoLike = {
  imagemLocal?: string | null;     // caminho local persistido (file://, /data..., content://)
  imagens?: any[] | string | null; // legado (mantemos a assinatura, mas NÃO faremos fallback remoto)
  productImage?: string | null;    // legado: se for local (file://) usamos; se remoto, ignoramos
};

function isLocalPath(p?: string | null): p is string {
  return !!p && (
    p.startsWith("file://") ||
    p.startsWith("/") ||
    p.startsWith("content://")
  );
}

/**
 * Sempre prioriza imagem local. Se não houver, retorna o placeholder interno.
 * Não há fallback para URL remota — política do app.
 */
export function getProdutoImageSource(prod: ProdutoLike): ImageSourcePropType {
  // 1) caminho oficial salvo no banco
  if (isLocalPath(prod.imagemLocal)) {
    return { uri: prod.imagemLocal };
  }

  // 2) compatibilidade: algumas telas ainda passam `productImage`;
  //    se for local, usamos; se for remoto, ignoramos
  if (isLocalPath(prod.productImage)) {
    return { uri: prod.productImage! };
  }

  // 3) nada local -> placeholder
  return PLACEHOLDER;
}
