/**
 * Helper para normalizar a prop productImage, seja string (URL), objeto com URI, ou local require (número).
 */
export function getImageSource(img?: string | number | { uri: string }) {
  // console.log("getImageSource", img);
  // Caso seja undefined ou null ou 32
  if (!img || img === 32) {
    return require("@/assets/images/sem-imagem.png");
  }

  // Se for um objeto com propriedade uri
  if (typeof img === "object" && img !== null && "uri" in img) {
    // Verifica se a URI é válida
    if (!img.uri || img.uri === "") {
      return require("@/assets/images/sem-imagem.png");
    }
    return img;
  }

  // Se for uma string
  if (typeof img === "string") {
    try {
      // Tenta verificar se é uma string JSON
      const parsed = JSON.parse(img);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].imagemUrl) {
        return { uri: parsed[0].imagemUrl || "" };
      }
      // Se for um objeto com imagemUrl
      if (parsed && parsed.imagemUrl) {
        return { uri: parsed.imagemUrl || "" };
      }
      // Caso contrário, trata como URL direta
      return { uri: img };
    } catch (e) {
      // Não é JSON, trata como URL direta
      return { uri: img };
    }
  }

  // Se for um número (require local)
  return img;
}
