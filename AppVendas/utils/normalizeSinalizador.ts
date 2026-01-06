// utils/normalizeSinalizador.ts
export type Sinalizador = { codigo: string; descricao: string };

// Ícones/labels canônicos da UI (não trazemos JSX aqui para não acoplar com React)
export type IconKey =
  | "star"
  | "trophy"
  | "gift"
  | "new"
  | "calendar"
  | "return"
  | "bought"
  | "cart"
  | "question";

export const MAP_SINALIZADORES: Record<
  string,
  { rotulo: string; icon: IconKey }
> = {
  "001": { rotulo: "CAMPEÕES", icon: "trophy" },
  "002": { rotulo: "COM KIT", icon: "gift" },
  "003": { rotulo: "NOVO", icon: "new" },
  "004": { rotulo: "AGENDA", icon: "calendar" },
  "005": { rotulo: "RETORNO", icon: "return" },
  "006": { rotulo: "CARRINHO", icon: "cart" },
  "000": { rotulo: "JA COMPROU", icon: "bought" },
  "111": { rotulo: "FAVORITO", icon: "star" },
};

// Se quiser priorizar a ordem de exibição:
const PRIORIDADE: string[] = ["001", "003", "002", "004", "005", "006"];

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// Aceita objeto parcial e completa descricao
function isSinalizadorLike(
  x: any
): x is Partial<Sinalizador> & { codigo: string } {
  return x && typeof x.codigo === "string";
}

function coerceSinalizador(x: any): Sinalizador | null {
  if (!isSinalizadorLike(x)) return null;
  return {
    codigo: x.codigo,
    descricao: typeof x.descricao === "string" ? x.descricao : "",
  };
}

function dedupeByCodigo(arr: Sinalizador[]): Sinalizador[] {
  const seen = new Set<string>();
  const out: Sinalizador[] = [];
  for (const s of arr) {
    if (!seen.has(s.codigo)) {
      seen.add(s.codigo);
      out.push(s);
    }
  }
  return out;
}

function sortByPrioridade(arr: Sinalizador[]): Sinalizador[] {
  // Mantém ordem de entrada, mas aplica prioridade quando existir
  return [...arr].sort((a, b) => {
    const ia = PRIORIDADE.indexOf(a.codigo);
    const ib = PRIORIDADE.indexOf(b.codigo);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

/**
 * Normaliza "sinalizadores" para array de Sinalizador.
 * Aceita:
 *  - Array de objetos ({codigo, descricao?})
 *  - Array de strings de código (["001", "002"])
 *  - String JSON (array ou objeto único)
 *  - String "001,002"
 *  - Objeto único
 *  - null/undefined/""/"[]"
 * Faz: coerção de descricao, deduplicação e ordenação por prioridade (opcional).
 */
export function normalizeSinalizadores(
  input: unknown,
  opts?: { ordenarPorPrioridade?: boolean }
): Sinalizador[] {
  let arr: Sinalizador[] = [];

  if (Array.isArray(input)) {
    // Array pode ser de objetos ou de códigos
    arr = input
      .map((x) =>
        typeof x === "string"
          ? { codigo: x, descricao: "" }
          : coerceSinalizador(x)
      )
      .filter((x): x is Sinalizador => !!x);
  } else if (typeof input === "string") {
    const s = input.trim();
    if (!s || s === "[]") return [];

    // tenta JSON
    const parsed = parseJsonSafe<any>(s);
    if (parsed) {
      if (Array.isArray(parsed)) {
        arr = parsed
          .map((x) =>
            typeof x === "string"
              ? { codigo: x, descricao: "" }
              : coerceSinalizador(x)
          )
          .filter((x): x is Sinalizador => !!x);
      } else {
        const unico =
          typeof parsed === "string"
            ? { codigo: parsed, descricao: "" }
            : coerceSinalizador(parsed);
        arr = unico ? [unico] : [];
      }
    } else {
      // fallback: "001,002"
      if (s.includes(",")) {
        arr = s
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((codigo) => ({ codigo, descricao: "" }));
      } else {
        // fallback: string de um único código
        arr = [{ codigo: s, descricao: "" }];
      }
    }
  } else if (input && typeof input === "object") {
    const unico = coerceSinalizador(input);
    arr = unico ? [unico] : [];
  } else {
    arr = [];
  }

  // dedup + order opcional
  arr = dedupeByCodigo(arr);
  if (opts?.ordenarPorPrioridade) arr = sortByPrioridade(arr);
  return arr;
}

/** Enriquecimento para UI (não retorna JSX) */
export type SinalizadorDecorado = Sinalizador & {
  rotulo: string;
  icon: IconKey;
};

export function decorateForUI(list: Sinalizador[]): SinalizadorDecorado[] {
  return list.map((s) => {
    const meta = MAP_SINALIZADORES[s.codigo];
    return {
      ...s,
      rotulo: meta?.rotulo ?? (s.descricao || s.codigo),
      icon: meta?.icon ?? "question",
    };
  });
}

/** Serializa de forma consistente para gravar no banco/API */
export function serializeSinalizadores(list: Sinalizador[]): string {
  // sempre array [{codigo, descricao}]
  return JSON.stringify(
    list.map((s) => ({ codigo: s.codigo, descricao: s.descricao ?? "" }))
  );
}

export const mockSinalizadoresDecor: SinalizadorDecorado[] = [
  {
    codigo: "000",
    descricao: "JA COMPROU",
    rotulo: "JA COMPROU",
    icon: "bought",
  },
  { codigo: "001", descricao: "CAMPEOES", rotulo: "CAMPEÕES", icon: "trophy" },
  { codigo: "002", descricao: "COM KIT", rotulo: "COM KIT", icon: "gift" },
  { codigo: "003", descricao: "Produto Novo", rotulo: "NOVO", icon: "new" },
  { codigo: "004", descricao: "Agenda", rotulo: "AGENDA", icon: "calendar" },
  { codigo: "005", descricao: "Retorno", rotulo: "RETORNO", icon: "return" },
  { codigo: "006", descricao: "Carrinho", rotulo: "CARRINHO", icon: "cart" },
  { codigo: "111", descricao: "FAVORITO", rotulo: "FAVORITO", icon: "star" },
];

// normalização defensiva: aceita array, string única, CSV, e "003 • Descrição"
export const normalizeCodes = (val: any): string[] => {
  const arr = Array.isArray(val) ? val : val != null ? [val] : [];
  const out = Array.from(
    new Set(
      arr
        .flatMap((x) => String(x).split(","))
        .map((s) => s.split("•")[0])
        .map((s) => s.replace(/['"]/g, "").trim())
        .filter(Boolean)
    )
  );

  // 🔥 preserva sempre os especiais se vieram no input
  if (arr.some((v) => String(v).trim() === "000") && !out.includes("000")) {
    out.push("000");
  }
  if (arr.some((v) => String(v).trim() === "111") && !out.includes("111")) {
    out.push("111");
  }

  return out;
};
