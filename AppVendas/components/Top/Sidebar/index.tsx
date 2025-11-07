// components/Top/Sidebar/index.tsx
import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from "react-native";
import {
  Container,
  Overlay,
  Header,
  SearchInput,
  Footer,
  FooterText,
  OpenFilterButton,
} from "./style";
import { DropdownSection } from "@/components/DropdownSection";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Checkbox, RadioButton } from "react-native-paper";
import ParametrosModal from "@/modal/ModalParametros";

import * as SQLite from "expo-sqlite";
import { BandejaItem } from "@/context/interfaces/BandejaItem";
import { BandejaVendedorItem } from "@/context/interfaces/BandejaVendedorItem";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import AuthContext from "@/context/AuthContext";
import { useClientInfoContext } from "@/context/ClientInfoContext";

import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import ModalFiltrosAvançados from "@/modal/ModalFiltrosAvancados";
import Button from "@/components/Button";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import { useFiltroContext } from "@/context/FiltroContext";

// ⬇util que cola UI → FiltroService.compile → eventBus
import {
  applyFiltersFromUI,
  clearFilters,
} from "@/utils/filters/buildSegments";

const db = SQLite.openDatabaseSync("user_data.db");

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  filtrosSelecionados: FiltrosAvancados;
  setFiltrosSelecionados: React.Dispatch<React.SetStateAction<FiltrosAvancados>>;
}

interface MarcaCatalogo {
  codigoMarca: string;
  descricaoMarca: string;
}
interface TipoProduto {
  codigoTipoProduto: string;
  descricaoTipoProduto: string;
}
interface SubGrupo {
  codigoSubGrupo: string;
  descricaoSubGrupo: string;
}
interface LinhaProduto {
  codigoLinha: string;
  descricaoLinha: string;
}

type ModoSinalizador = "incluir" | "excluir";

export interface FiltrosAvancados {
  sinalizadores?: string[];
  modoSinalizadores?: ModoSinalizador;
  outros?: string[];
  marcas?: string[];
  tipos?: string[];
  subGrupos?: string[];
  linhas?: string[];
  bandejas?: string[]; // ⬅️ novo: participa do compile
}

const Sidebar: React.FC<SidebarProps> = ({
  isVisible,
  onClose,
  filtrosSelecionados,
  setFiltrosSelecionados,
}) => {
  const [sinalizadoresMap, setSinalizadoresMap] = useState<
    { label: string; value: string }[]
  >([]);

  const [parametrosModalVisible, setParametrosModalVisible] = useState(false);
  const [bandejaModalVisible, setBandejaModalVisible] = useState(false);
  const [bandejas, setBandejas] = useState<BandejaItem[]>([]);
  const [bandejasVendedor, setBandejasVendedor] = useState<BandejaVendedorItem[]>(
    []
  );

  const [filtrosAtuais, setFiltrosAtuais] =
    useState<FiltrosAvancados>(filtrosSelecionados);

  const [filtrosModalVisible, setFiltrosModalVisible] = useState(false);
  const [marcas, setMarcas] = useState<MarcaCatalogo[]>([]);
  const [tipos, setTipos] = useState<TipoProduto[]>([]);
  const [subGrupos, setSubGrupos] = useState<SubGrupo[]>([]);
  const [linhas, setLinhas] = useState<LinhaProduto[]>([]);
  const [outros, setOutros] = useState<any[]>([]);

  const [filtrosAvancadosTemp, setFiltrosAvancadosTemp] = useState<any | null>(null);

  // estados dos filtros (checkboxes)
  const [checkedSinalizadores, setCheckedSinalizadores] = useState<string[]>([]);
  const [modoSinalizadores, setModoSinalizadores] = useState<"incluir" | "excluir">("incluir");
  const [checkedOutrosItems, setCheckedOutrosItems] = useState<string[]>([]);
  const [checkedMarcas, setCheckedMarcas] = useState<string[]>([]);
  const [checkedTipos, setCheckedTipos] = useState<string[]>([]);
  const [checkedSubGrupos, setCheckedSubGrupos] = useState<string[]>([]);
  const [checkedLinhas, setCheckedLinhas] = useState<string[]>([]);
  const [checkedBandejas, setCheckedBandejas] = useState<string[]>([]); // ⬅️ novo

  const [searchQuery, setSearchQuery] = useState("");

  const {
    limparFiltrosSidebar,
    acionarLimparFiltrosCatalogo,
    resetarLimparFiltrosCatalogo,
    resetarLimparFiltrosSidebar,
  } = useFiltroContext();

  const route = useRoute<RouteProp<RootStackParamList, any>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { userData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  // ⚙️ contexts (iguais ao CatalogoFechado)
  const {
    selectedTabelaPrecoContext,
    selectedClientContext,
    clienteIdContext,
    cpfCnpjContext,
  } = useClientInfoContext();

  const selectedTabelaPreco = useMemo(() => {
    const ctx = selectedTabelaPrecoContext as any;
    const param = (route.params as any)?.selectedTabelaPreco as any;
    return (
      (ctx && typeof ctx === "object" ? String(ctx.value) : ctx ? String(ctx) : "") ||
      (param && typeof param === "object" ? String(param.value) : param ? String(param) : "") ||
      "999999"
    );
  }, [selectedTabelaPrecoContext, (route.params as any)?.selectedTabelaPreco]);

  const codigoCliente = String(selectedClientContext?.codigoCliente ?? "");

  // Camera
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [scanningMode, setScanningMode] = useState<"barcode">("barcode");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingScan, setIsLoadingScan] = useState(false);
  const [scanFeedback, setScanFeedback] = useState("");
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🧹 sync com props
  useEffect(() => {
    setFiltrosAtuais(filtrosSelecionados);
  }, [filtrosSelecionados]);

  useEffect(() => {
    if (isVisible) {
      fetchBandejas();
      fetchBandejasVendedor();
      fetchMarcas();
      fetchSubGrupos();
      fetchLinhas();
      fetchSinalizadores();
      fetchOutros();

      // restaura seleção
      setCheckedLinhas(filtrosSelecionados.linhas || []);
      setCheckedMarcas(filtrosSelecionados.marcas || []);
      setCheckedSubGrupos(filtrosSelecionados.subGrupos || []);
      setCheckedOutrosItems(filtrosSelecionados.outros || []);
      setCheckedSinalizadores(filtrosSelecionados.sinalizadores || []);
      setCheckedBandejas(filtrosSelecionados.bandejas || []);
    }
  }, [isVisible]);

  // animação de slide
  const sidebarAnim = useRef(
    new Animated.Value(-Dimensions.get("window").width)
  ).current;

  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: isVisible ? 0 : -Dimensions.get("window").width,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isVisible, sidebarAnim]);

  // cleanup
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);

  // limpar via contexto
  useEffect(() => {
    if (limparFiltrosSidebar) {
      setCheckedLinhas([]);
      setCheckedMarcas([]);
      setCheckedSubGrupos([]);
      setCheckedOutrosItems([]);
      setCheckedSinalizadores([]);
      setCheckedBandejas([]);
      navigation.setParams({
        cpfCnpj: cpfCnpjContext,
        clienteId: clienteIdContext,
        filtroTipo: undefined,
        filtroNome: undefined,
        marcas: undefined,
        linhas: undefined,
        subGrupos: undefined,
        outros: undefined,
        sinalizadores: undefined,
        modoSinalizadores: undefined,
      } as any);
      resetarLimparFiltrosSidebar();
    }
  }, [limparFiltrosSidebar]);

  // câmera
  const handleOpenCamera = () => {
    if (!cameraPermission) requestCameraPermission();
    if (cameraPermission && !cameraPermission.granted) {
      Alert.alert(
        "Permissão de Câmera",
        "Precisamos da permissão para acessar a câmera.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Permitir", onPress: () => requestCameraPermission() },
        ],
        { cancelable: false }
      );
      return;
    }
    if (cameraPermission?.granted) {
      setCameraPermissionGranted(true);
      setIsCameraVisible(true);
    } else {
      setCameraPermissionError(true);
    }
    if (cameraPermissionError) {
      Alert.alert(
        "Erro",
        "Falha ao acessar a câmera. Verifique as permissões.",
        [{ text: "OK", onPress: () => setCameraPermissionError(false) }],
        { cancelable: false }
      );
    }
  };

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (!isScanning) return;
    setIsScanning(false);
    setIsLoadingScan(true);
    setScanFeedback(`Código lido: ${data}`);

    const paramsBase = {
      cpfCnpj: (route.params as any)?.cpfCnpj || cpfCnpjContext,
      clienteId: (route.params as any)?.clienteId || clienteIdContext || "",
      filtroTipo: "codigoBarra",
      filtroCodigo: data,
      filtroNome: `Código de Barras: ${data}`,
    };

    setTimeout(() => {
      if (route.name === "CatalogoFechado" || route.name === "Catalogo" || route.name === "EditarPedidoCatalogoFechado") {
        navigation.setParams(paramsBase as any);
      } else {
        navigation.navigate("CatalogoFechado", paramsBase as any);
      }
      setIsLoadingScan(false);
      setTimeout(() => {
        setIsCameraVisible(false);
        setScanFeedback("");
        onClose();
      }, 1000);
    }, 1500);

    scanTimeoutRef.current = setTimeout(() => setIsScanning(true), 2000);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const novoParams = {
      cpfCnpj: (route.params as any)?.cpfCnpj || cpfCnpjContext,
      clienteId: (route.params as any)?.clienteId || clienteIdContext || "",
      filtroTipo: "buscaGeral",
      filtroNome: searchQuery,
    };
    if (route.name === "CatalogoFechado" || route.name === "Catalogo" || route.name === "EditarPedidoCatalogoFechado") {
      navigation.setParams(novoParams as any);
    } else {
      navigation.navigate("CatalogoFechado", novoParams as any);
    }
    setSearchQuery("");
    onClose();
  };

  // fetches
  const fetchBandejas = async () => {
    try {
      const query = `SELECT * FROM Bandeja`;
      const rows = (await db.getAllAsync(query)) as BandejaItem[];
      setBandejas(rows);
    } catch {
      Alert.alert("Erro", "Falha ao carregar as bandejas.");
    }
  };
  const fetchBandejasVendedor = async () => {
    try {
      if (representanteId !== undefined) {
        const query = `SELECT * FROM BandejaVendedor WHERE representanteId = ?`;
        const rows = (await db.getAllAsync(query, [representanteId])) as BandejaVendedorItem[];
        setBandejasVendedor(rows);
      } else {
        Alert.alert("Erro", "representanteId não está definido.");
      }
    } catch {
      Alert.alert("Erro", "Falha ao carregar as bandejas.");
    }
  };
  const fetchMarcas = async () => {
    try {
      const query = `SELECT codigoMarca, descricaoMarca FROM Catalogo GROUP BY codigoMarca ORDER BY descricaoMarca ASC`;
      const rows = (await db.getAllAsync(query)) as MarcaCatalogo[];
      setMarcas(rows);
    } catch {
      Alert.alert("Erro", "Falha ao carregar as marcas.");
    }
  };
  const fetchSubGrupos = async () => {
    try {
      const query = `SELECT codigoSubGrupo, descricaoSubGrupo FROM Catalogo GROUP BY codigoSubGrupo ORDER BY descricaoSubGrupo ASC`;
      const rows = (await db.getAllAsync(query)) as SubGrupo[];
      setSubGrupos(rows);
    } catch {
      Alert.alert("Erro", "Falha ao carregar os subgrupos.");
    }
  };
  const fetchLinhas = async () => {
    try {
      const query = `SELECT codigoLinha, descricaoLinha FROM Catalogo GROUP BY codigoLinha ORDER BY descricaoLinha ASC`;
      const rows = (await db.getAllAsync(query)) as LinhaProduto[];
      setLinhas(rows);
    } catch {
      Alert.alert("Erro", "Falha ao carregar as linhas.");
    }
  };
  const fetchSinalizadores = async () => {
  try {
    const rows: Array<{ codigo: string | null; descricao: string | null }> =
      await db.getAllAsync(
        `SELECT DISTINCT
           json_extract(j.value, '$.codigo')    AS codigo,
           json_extract(j.value, '$.descricao') AS descricao
         FROM Catalogo
         JOIN json_each(Catalogo.sinalizadores) AS j
         WHERE json_extract(j.value, '$.codigo') IS NOT NULL
           AND json_extract(j.value, '$.descricao') IS NOT NULL
         ORDER BY descricao;`
      );

    const map = rows
      .map((r) => ({
        label: String(r.descricao ?? "").replace(/_/g, " ").trim(),
        // garante zero-padding de 3 dígitos, caso necessário
        value: String(r.codigo ?? "").trim().padStart(3, "0"),
      }))
      .filter((o) => o.label && o.value);

    // adiciona o pseudo-sinalizador "JÁ COMPROU"
    const EXTRA = { label: "JÁ COMPROU", value: "000" as const };
    const hasExtra = map.some((o) => o.value === EXTRA.value);
    setSinalizadoresMap(hasExtra ? map : [...map, EXTRA]);
  } catch (error) {
    Alert.alert("Erro", "Não foi possível carregar os sinalizadores.");
    console.error("fetchSinalizadores:", error);
  }
};

  const fetchOutros = async () => {
    try {
      const query = `SELECT Genero as genero, codigoOrigem FROM Catalogo;`;
      const rows = (await db.getAllAsync(query)) as any[];
      const labelsSet = new Set<string>();
      for (const item of rows) {
        const genero = item.genero?.trim().toUpperCase();
        const codigoOrigem = item.codigoOrigem;
        if (["MASCULINO", "FEMININO", "UNISSEX"].includes(genero)) labelsSet.add(genero);
        if (codigoOrigem === "000005" || codigoOrigem === "000006") labelsSet.add("IMPORTADO");
        if (codigoOrigem === "000007") labelsSet.add("NACIONAL");
      }
      const outrosFinal = Array.from(labelsSet).map((label) => ({ label }));
      setOutros(outrosFinal);
    } catch {
      Alert.alert("Erro", "Falha ao carregar filtros 'Outros'.");
    }
  };

  // renderers
  const renderMarcas = () => (
    <View>
      {marcas.map((m) => (
        <View key={m.codigoMarca} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Checkbox
            status={checkedMarcas.includes(m.codigoMarca) ? "checked" : "unchecked"}
            onPress={() =>
              setCheckedMarcas((prev) =>
                prev.includes(m.codigoMarca) ? prev.filter((x) => x !== m.codigoMarca) : [...prev, m.codigoMarca]
              )
            }
            color="#007BFF"
          />
          <Text style={{ marginLeft: 5 }}>{m.descricaoMarca.replace(/_/g, " ")}</Text>
        </View>
      ))}
    </View>
  );
  const renderSubGrupos = () => (
    <View>
      {subGrupos.map((s) => (
        <View key={s.codigoSubGrupo} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Checkbox
            status={checkedSubGrupos.includes(s.codigoSubGrupo) ? "checked" : "unchecked"}
            onPress={() =>
              setCheckedSubGrupos((prev) =>
                prev.includes(s.codigoSubGrupo)
                  ? prev.filter((x) => x !== s.codigoSubGrupo)
                  : [...prev, s.codigoSubGrupo]
              )
            }
            color="#007BFF"
          />
          <Text style={{ marginLeft: 5 }}>{s.descricaoSubGrupo.replace(/_/g, " ")}</Text>
        </View>
      ))}
    </View>
  );
  const renderLinhas = () => (
    <View>
      {linhas.map((l) => (
        <View key={l.codigoLinha} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Checkbox
            status={checkedLinhas.includes(l.codigoLinha) ? "checked" : "unchecked"}
            onPress={() =>
              setCheckedLinhas((prev) =>
                prev.includes(l.codigoLinha) ? prev.filter((x) => x !== l.codigoLinha) : [...prev, l.codigoLinha]
              )
            }
            color="#007BFF"
          />
          <Text style={{ marginLeft: 5 }}>{l.descricaoLinha.replace(/_/g, " ")}</Text>
        </View>
      ))}
    </View>
  );
  const renderBandejas = () => {
    const all = [
      ...bandejas.map((b) => ({ codigo: b.codigo, nome: b.nome })),
      ...bandejasVendedor.map((b) => ({ codigo: b.codigo, nome: b.nome })),
    ];
    const seen = new Set<string>();
    const unique = all.filter((b) => {
      const k = String(b.codigo);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return (
      <View>
        {unique.map((b) => (
          <View key={b.codigo} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Checkbox
              status={checkedBandejas.includes(b.codigo) ? "checked" : "unchecked"}
              onPress={() =>
                setCheckedBandejas((prev) =>
                  prev.includes(b.codigo) ? prev.filter((x) => x !== b.codigo) : [...prev, b.codigo]
                )
              }
              color="#007BFF"
            />
            <Text style={{ marginLeft: 5 }}>{b.nome.replace(/_/g, " ")}</Text>
          </View>
        ))}
      </View>
    );
  };
  const renderSinalizadores = () => (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <RadioButton
          value="incluir"
          status={modoSinalizadores === "incluir" ? "checked" : "unchecked"}
          onPress={() => setModoSinalizadores("incluir")}
          color="#007BFF"
        />
        <Text style={{ marginRight: 20 }}>Incluir</Text>

        <RadioButton
          value="excluir"
          status={modoSinalizadores === "excluir" ? "checked" : "unchecked"}
          onPress={() => setModoSinalizadores("excluir")}
          color="#007BFF"
        />
        <Text>Excluir</Text>
      </View>

      {sinalizadoresMap.map((s) => (
        <View key={s.value} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Checkbox
            status={checkedSinalizadores.includes(s.value) ? "checked" : "unchecked"}
            onPress={() =>
              setCheckedSinalizadores((prev) =>
                prev.includes(s.value) ? prev.filter((v) => v !== s.value) : [...prev, s.value]
              )
            }
            color="#007BFF"
          />
          <Text style={{ marginLeft: 5 }}>{s.label.replace(/_/g, " ")}</Text>
        </View>
      ))}
    </View>
  );
  const renderOutros = () => (
    <View>
      {outros.map((o: any, idx: number) => (
        <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Checkbox
            status={checkedOutrosItems.includes(o.label) ? "checked" : "unchecked"}
            onPress={() =>
              setCheckedOutrosItems((prev) =>
                prev.includes(o.label) ? prev.filter((x) => x !== o.label) : [...prev, o.label]
              )
            }
            color="#007BFF"
          />
          <Text style={{ marginLeft: 5 }}>{o.label.replace(/_/g, " ")}</Text>
        </View>
      ))}
    </View>
  );

  const handleSaveModalFiltrosAvancados = (filtrosAvancados: any) => {
    setFiltrosAvancadosTemp(filtrosAvancados);
  };

  // Aplicar filtros → util dispara eventBus + compile
  const handleAplicarTodosOsFiltros = () => {
    const payload = {
      ui: {
        marca: checkedMarcas,
        linha: checkedLinhas,
        subgrupo: checkedSubGrupos,
        outros: checkedOutrosItems,
        bandeja: checkedBandejas,
        sinalizadoresMode: modoSinalizadores === "excluir" ? "exclude" : "include",
        sinalizadores: checkedSinalizadores,
        // no futuro: ...filtrosAvancadosTemp?.filtros,
      },
      ctx: {
        tabelaPreco: selectedTabelaPreco,
        codigoCliente,                     // já comprou
        cpfCnpj: cpfCnpjContext,     // favorito
        clienteId: clienteIdContext, // favorito
        representanteId: representanteId // favorito
      },
    };

    applyFiltersFromUI(payload);

    setFiltrosAtuais({
      linhas: checkedLinhas,
      marcas: checkedMarcas,
      subGrupos: checkedSubGrupos,
      outros: checkedOutrosItems,
      sinalizadores: checkedSinalizadores,
      modoSinalizadores,
      bandejas: checkedBandejas,
    });
    setFiltrosSelecionados({
      linhas: checkedLinhas,
      marcas: checkedMarcas,
      subGrupos: checkedSubGrupos,
      outros: checkedOutrosItems,
      sinalizadores: checkedSinalizadores,
      modoSinalizadores,
      bandejas: checkedBandejas,
    });

    onClose();
  };

  const handleLimparFiltros = () => {
    setCheckedLinhas([]);
    setCheckedMarcas([]);
    setCheckedTipos([]);
    setCheckedSubGrupos([]);
    setCheckedOutrosItems([]);
    setCheckedSinalizadores([]);
    setCheckedBandejas([]);
    setModoSinalizadores("incluir");

    // limpa do lado do catálogo (contexto) e o where aplicado
    acionarLimparFiltrosCatalogo();
    clearFilters();

    setFiltrosSelecionados({
      linhas: [],
      marcas: [],
      subGrupos: [],
      outros: [],
      sinalizadores: [],
      bandejas: [],
    });
    setFiltrosAtuais({
      linhas: [],
      marcas: [],
      subGrupos: [],
      outros: [],
      sinalizadores: [],
      bandejas: [],
      modoSinalizadores: "incluir",
    });

    navigation.setParams({
      filtroTipo: undefined,
      filtroCodigo: undefined,
      filtroNome: undefined,
      filtros: undefined,
      filtrosNome: undefined,
      precoMinimo: undefined,
      precoMaximo: undefined,
      estoqueMinimo: undefined,
      estoqueMaximo: undefined,
      tamanhoCaixaMinimo: undefined,
      tamanhoCaixaMaximo: undefined,
      materialCaixa: undefined,
      tamanhoPulseira: undefined,
      corPulseira: undefined,
      materialPulseira: undefined,
      display: undefined,
      corMostrador: undefined,
      funcaoMecanismo: undefined,
      modoSinalizadores: undefined,
      filtroSinalizadores: undefined,
    } as any);

    Alert.alert("Filtros Limpos", "Todos os filtros foram limpos com sucesso.");
  };

  if (!isVisible) return null;

  return (
    <>
      {isVisible && (
        <TouchableWithoutFeedback onPress={onClose}>
          <Overlay>
            <Container
              style={{ transform: [{ translateX: sidebarAnim }] }}
              onStartShouldSetResponder={() => true}
            >
              {/* Header com campo de busca */}
              <Header>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f9f9f9",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderWidth: 1,
                    borderColor: "#ddd",
                  }}
                >
                  <Ionicons name="search" size={20} color="#000" style={{ marginRight: 8 }} />
                  <SearchInput
                    placeholder="Buscar"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                  />
                </View>
                <TouchableOpacity onPress={handleOpenCamera}>
                  <MaterialCommunityIcons name="line-scan" size={36} color="black" />
                </TouchableOpacity>
              </Header>

              <ScrollView>
                <DropdownSection
                  title="Marca"
                  customContent={renderMarcas()}
                  icon={<Ionicons name="home" size={20} color="#333" />}
                />

                <DropdownSection
                  title="Outros"
                  icon={<Ionicons name="ellipsis-horizontal-sharp" size={20} color="black" />}
                  customContent={renderOutros()}
                />

                <DropdownSection
                  title="Subgrupo"
                  icon={<Ionicons name="grid" size={20} color="#333" />}
                  customContent={renderSubGrupos()}
                />

                <DropdownSection
                  title="Linha"
                  icon={<Ionicons name="layers" size={20} color="#333" />}
                  customContent={renderLinhas()}
                />

                {/* Bandejas (checkbox, une Bandeja e BandejaVendedor) */}
                <DropdownSection
                  title="Bandejas"
                  icon={<Ionicons name="cube" size={20} color="#333" />}
                  customContent={renderBandejas()}
                />

                <DropdownSection
                  title="Sinalizadores"
                  icon={<Ionicons name="alert-circle-outline" size={20} color="#000" />}
                  customContent={renderSinalizadores()}
                />

                {/* Botão Aplicar Filtros */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#007BFF",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 20,
                    alignItems: "center",
                    alignSelf: "center",
                    width: "80%",
                  }}
                  onPress={handleAplicarTodosOsFiltros}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                    Aplicar Filtros
                  </Text>
                </TouchableOpacity>

                {/* Botão Limpar Filtros */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 12,
                    borderRadius: 8,
                    borderColor: "#007aff",
                    borderWidth: 2,
                    marginTop: 20,
                    alignItems: "center",
                    alignSelf: "center",
                    width: "80%",
                  }}
                  onPress={handleLimparFiltros}
                >
                  <Text style={{ color: "#007aff", fontWeight: "bold", fontSize: 16 }}>
                    Limpar Filtros
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              <Footer>
                <TouchableOpacity onPress={() => setParametrosModalVisible(true)}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="settings-outline" size={24} color="#333" />
                    <FooterText style={{ marginLeft: 10 }}>Parâmetros</FooterText>
                  </View>
                </TouchableOpacity>
              </Footer>
            </Container>
          </Overlay>
        </TouchableWithoutFeedback>
      )}

      {parametrosModalVisible && (
        <ParametrosModal
          visible={parametrosModalVisible}
          onClose={() => setParametrosModalVisible(false)}
        />
      )}

      {filtrosModalVisible && (
        <ModalFiltrosAvançados
          visible={filtrosModalVisible}
          onClose={() => setFiltrosModalVisible(false)}
          onSave={handleSaveModalFiltrosAvancados}
        />
      )}

      {isCameraVisible && (
        <Modal visible={isCameraVisible} animationType="fade">
          <View style={styles.cameraContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsCameraVisible(false)}
              >
                <MaterialIcons name="close" size={28} color="#fff" />
                <Text style={{ color: "#fff" }}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.topOverlay} />

            {scanFeedback || isLoadingScan ? (
              <View style={styles.feedbackAboveCamera}>
                <Text style={styles.feedbackText}>
                  {isLoadingScan ? "Processando..." : scanFeedback}
                </Text>
              </View>
            ) : (
              <View style={styles.feedbackAboveCamera}>
                <Text style={styles.feedbackText}></Text>
              </View>
            )}

            <View style={styles.middleRow}>
              <View style={styles.sideOverlay} />

              <CameraView
                style={styles.cameraBox}
                type={cameraType}
                barCodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc", "qr"] }}
                onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
              >
                <View style={styles.feedbackContainer}>
                  {!scanFeedback && (
                    <Text style={styles.feedbackText}>Aponte o código de barras aqui</Text>
                  )}
                </View>
              </CameraView>

              <View style={styles.sideOverlay} />
            </View>

            <View style={styles.scanButtonContainer}>
              <TouchableOpacity
                onPress={() => setIsScanning(true)}
                style={styles.scanButton}
              >
                <Text style={styles.scanButtonText}>Ler Código de Barras</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomOverlay} />
          </View>
        </Modal>
      )}
    </>
  );
};

export default Sidebar;

const OVERLAY_COLOR = "rgba(0, 0, 0, 0.6)";
const FRAME_SIZE = 650;

const styles = StyleSheet.create({
  cameraBox: {
    width: "80%",
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1abc9c",
    overflow: "hidden",
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
  },
  feedbackAboveCamera: {
    alignItems: "center",
    marginBottom: 8,
  },
  feedbackText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  header: {
    position: "absolute",
    top: 60,
    right: 50,
    zIndex: 999,
  },
  closeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  topOverlay: { flex: 1, backgroundColor: OVERLAY_COLOR },
  middleRow: { flexDirection: "row" },
  scanButtonContainer: { marginTop: 20, alignItems: "center", justifyContent: "center" },
  scanButton: {
    width: "80%",
    height: 60,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1abc9c",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  sideOverlay: { flex: 1, backgroundColor: OVERLAY_COLOR },
  bottomOverlay: { flex: 1, backgroundColor: OVERLAY_COLOR },
});