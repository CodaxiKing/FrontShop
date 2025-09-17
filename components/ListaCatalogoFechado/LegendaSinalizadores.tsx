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
} from "@/utils/sinalizadorIcon";
import {
  normalizeSinalizadores,
  decorateForUI,
  type IconKey as NK,
} from "@/utils/normalizeSinalizador";

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
  // no modo estático (sem "codes" vindos dos produtos) usamos esse mapa
  // para resolver IconKey -> códigos dos sinalizadores.
  iconToCodesMap?: Partial<Record<IconKey, string[]>>;
  onPressIcon?: (codes: string[]) => void;

  // clique no “Legendas:” -> resetar filtros aplicados
  onReset?: () => void;
};

const TITLE = "Legenda:";

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
  const defaultLabelByKey = useMemo(() => {
    const m = new Map<IconKey, string>();
    for (const it of DEFAULT_LEGEND) m.set(it.key, it.label);
    return m;
  }, []);

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

    return Array.from(acc.entries()).map(([key, v]) => ({
      key,
      label: v.label,
      codes: Array.from(v.codes),
    }));
  }, [produtos, defaultLabelByKey]);

  // regra:
  // - forceAll = true -> sempre todos (items)
  // - senão, usa dinâmico; se vazio/nulo, cai para todos
  const renderItems: Array<LegendItem | DynamicLegendItem> = useMemo(() => {
    if (forceAll) return items;
    return dynamicItems && dynamicItems.length > 0 ? dynamicItems : items;
  }, [forceAll, dynamicItems, items]);

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

        // se veio do dinâmico, já tem "codes"; se veio do estático, tenta resolver via iconToCodesMap
        const dynCodes = Array.isArray((it as any).codes)
          ? ((it as any).codes as string[])
          : undefined;
        const codes =
          dynCodes && dynCodes.length > 0
            ? dynCodes
            : iconToCodesMap?.[key] || [];

        const Wrapper = onPressIcon && codes.length ? TouchableOpacity : View;
        const onPress =
          onPressIcon && codes.length ? () => onPressIcon!(codes) : undefined;

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
