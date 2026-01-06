// src/components/ListaCatalogoFechado/LegendaSinalizadores.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import {
  iconFromKey,
  DEFAULT_LEGEND,
  IconKey,
  // ICON_TO_CODES_CANON, // fallback canônico (dos utils)
} from "@/utils/sinalizadorIcon";
import {
  normalizeSinalizadores,
  decorateForUI,
  type IconKey as NK,
} from "@/utils/normalizeSinalizador";

// --- SUPER-FALLBACK local (caso utils venham indefinidos por ciclo de import/build) ---
const LOCAL_ICON_TO_CODES_CANON: Partial<Record<IconKey, string[]>> = {
  star: ["111"], // Favorito (fonte de dados separada)
  bought: ["000"], // Já comprou (fonte de dados separada)
  trophy: ["001"], // Campeões
  gift: ["002"], // Com kit
  new: ["003"], // Lançamentos
  calendar: ["004"], // Pré-venda
  return: ["005"], // Retorno
  cart: ["006"], // Carrinho
  info: [],
};

const FALLBACK_DEFAULT_LEGEND: { key: IconKey; label: string }[] = [
  { key: "star", label: "Favorito" },
  { key: "trophy", label: "Campeões" },
  { key: "gift", label: "Com Kit" },
  { key: "new", label: "Lançamentos" },
  { key: "calendar", label: "Pré-venda" },
  { key: "return", label: "Retorno" },
  { key: "bought", label: "Já Comprou" },
  { key: "cart", label: "Carrinho" },
];

// -- Tipos --
type LegendItem = { key: IconKey; label: string };
type DynamicLegendItem = { key: IconKey; label: string; codes: string[] };

type Props = {
  // 1) modo “estático” (fallback/total)
  items?: LegendItem[];
  iconSize?: number;
  style?: ViewStyle;

  // 2) modo “dinâmico” (deriva dos produtos)
  produtos?: Array<{ sinalizadores?: any }>;

  // controlar exibição:
  // false (default) => dinâmico (se vazio, cai para "todos")
  // true  => sempre exibir todos (estático)
  forceAll?: boolean;

  // clique em um ícone -> aplicar filtro daquele(s) sinalizador(es)
  iconToCodesMap?: Partial<Record<IconKey, string[]>>; // pode vir vazio/undef
  onPressIcon?: (codes: string[]) => void;

  // clique no “Legendas:” -> resetar filtros aplicados
  onReset?: () => void;
};

const TITLE = "Legenda:";

// Helper SEM lançar exceção (evita "Cannot convert undefined value to object")
function isNonEmptyObject(obj: unknown): obj is Record<string, unknown> {
  if (!obj || typeof obj !== "object") return false;
  // só chamamos Object.keys se já garantimos ser objeto
  return Object.keys(obj as any).length > 0;
}

const LegendaSinalizadores: React.FC<Props> = ({
  items = DEFAULT_LEGEND,
  iconSize = 18,
  style,
  produtos,
  forceAll = false,
  iconToCodesMap,
  onPressIcon,
  onReset,
}) => {
  // Itens base (se DEFAULT_LEGEND ou items vierem indefinidos, usa fallback local)
  const safeItems = useMemo<LegendItem[]>(() => {
    const base = Array.isArray(items) && items.length ? items : DEFAULT_LEGEND;
    if (Array.isArray(base) && base.length) return base;
    if (__DEV__)
      console.debug(
        "[Legenda] DEFAULT_LEGEND indisponível; usando FALLBACK_DEFAULT_LEGEND"
      );
    return FALLBACK_DEFAULT_LEGEND;
  }, [items]);

  // Labels padrão para usar durante o dinâmico
  const defaultLabelByKey = useMemo(() => {
    const m = new Map<IconKey, string>();
    for (const it of safeItems) m.set(it.key, it.label);
    return m;
  }, [safeItems]);

  // constrói itens dinâmicos com base nos produtos da página
  const dynamicItems: DynamicLegendItem[] | null = useMemo(() => {
    if (!Array.isArray(produtos) || produtos.length === 0) return null;

    const acc = new Map<IconKey, { label: string; codes: Set<string> }>();

    for (const p of produtos) {
      const norm = normalizeSinalizadores(p?.sinalizadores);
      const deco = decorateForUI(norm);

      for (const s of deco) {
        const key = String(s.icon).trim() as NK as IconKey;
        const code = String(s.codigo ?? "").trim();
        const label =
          defaultLabelByKey.get(key) ||
          String(s.descricao ?? s.label ?? key).trim();

        const found = acc.get(key) ?? { label, codes: new Set<string>() };
        if (code) found.codes.add(code);
        acc.set(key, found);
      }
    }

    const out = Array.from(acc.entries()).map(([key, v]) => ({
      key,
      label: v.label,
      codes: Array.from(v.codes),
    }));

    if (__DEV__) console.debug("[Legenda] dynamicItems =", out);
    return out;
  }, [produtos, defaultLabelByKey]);

  // regra de itens a renderizar:
  // - forceAll = true -> sempre todos (estático)
  // - senão, usa dinâmico; se vazio/nulo, cai para estático
  const renderItems: Array<LegendItem | DynamicLegendItem> = useMemo(() => {
    if (forceAll) return safeItems;
    return dynamicItems && dynamicItems.length > 0 ? dynamicItems : safeItems;
  }, [forceAll, dynamicItems, safeItems]);

  // Mapa mesclado por prioridade (garante fallback por-CHAVE):
  // LOCAL  <-  CANÔNICO(utils)  <-  iconToCodesMap (remoto)
  const mergedMap = useMemo<Partial<Record<IconKey, string[]>>>(() => {
    const canonic = isNonEmptyObject(LOCAL_ICON_TO_CODES_CANON)
      ? (LOCAL_ICON_TO_CODES_CANON as any)
      : {};
    const remote = isNonEmptyObject(iconToCodesMap)
      ? (iconToCodesMap as any)
      : {};
    const merged = { ...LOCAL_ICON_TO_CODES_CANON, ...canonic, ...remote };
    if (__DEV__) {
      const dbg = {
        hasRemote: isNonEmptyObject(iconToCodesMap),
        keysRemote: isNonEmptyObject(iconToCodesMap) ? Object.keys(remote) : [],
      };
      console.debug("[Legenda] mergedMap pronto", dbg);
    }
    return merged;
  }, [iconToCodesMap]);

  return (
    <View style={[styles.container, style]}>
      {/* TÍTULO CLICÁVEL -> RESET */}
      <TouchableOpacity
        style={styles.badgeTitle}
        activeOpacity={0.8}
        onPress={onReset}
      >
        <Text style={styles.textTitle}>{TITLE}</Text>
      </TouchableOpacity>

      {renderItems.map((it) => {
        const key = (it as any).key as IconKey;
        const label = (it as any).label as string;

        // se veio do dinâmico, já tem "codes"; se veio do estático, resolve por chave no mergedMap
        const dynCodes = Array.isArray((it as any).codes)
          ? ((it as any).codes as string[])
          : undefined;

        const isStatic = !dynCodes || dynCodes.length === 0;
        const codes = isStatic ? mergedMap[key] ?? [] : dynCodes;

        const clickable =
          !!onPressIcon && Array.isArray(codes) && codes.length > 0;
        const Wrapper: any = clickable ? TouchableOpacity : View;
        const onPress = clickable ? () => onPressIcon!(codes) : undefined;

        // if (__DEV__) {
        //   console.debug(
        //     `🎈 [Legenda] item key=${key} label="${label}" codes=`,
        //     codes,
        //     "static=",
        //     isStatic,
        //     "clickable=",
        //     clickable
        //   );
        // }

        return (
          <Wrapper
            key={key}
            style={styles.badge}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <View style={{ marginRight: 6 }}>{iconFromKey(key, iconSize)}</View>
            <Text style={styles.text}>{label}</Text>
          </Wrapper>
        );
      })}
    </View>
  );
};

export default React.memo(LegendaSinalizadores);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 5,
    marginHorizontal: 12,
    marginTop: 0,
    marginBottom: 0,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  badgeTitle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 0,
  },
  text: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  textTitle: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
});
