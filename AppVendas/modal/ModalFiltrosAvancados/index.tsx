import React, { useEffect, useState } from "react";
import {
  ModalContainer,
  BoxContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  FilterRow,
  FilterColumn,
  FilterLabel,
  ModalFooter,
  AdditionalFilterRow,
  AdditionalFilterInput,
  AdditionalFilterGroup,
  AdditionalFilterInputMoney,
} from "./style";
import { Modal, View, Text, ScrollView } from "react-native";
import ConfirmacaoModalButton from "@/components/ConfirmacaoModalButton";
import SelectFieldComponent from "@/components/SelectFieldComponent";

import * as SQLite from "expo-sqlite";
import { Label } from "../../components/CardEditarPedidoAberto/Modais/style.modal.billing";

const db = SQLite.openDatabaseSync("user_data.db");

interface ModalFiltersProps {
  visible: boolean;
  onClose: () => void;

  onSave: (filters: any) => void;
}

interface FilterCatalogo {
  materialCaixa: string;
  tamanhoPulseira: string;
  corPulseira: string;
  materialPulseira: string;
  display: string;
  corMostrador: string;
  funcaoMecanismo: string;
  precoUnitario: number;
  quantidadeEstoquePA: number;
  tamanhoCaixa: string;
}

const ModalFiltrosAvancados: React.FC<ModalFiltersProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  // Estados para as opções de filtro
  const [materialCaixaOpts, setMaterialCaixaOpts] = useState<string[]>([]);
  const [tamanhoPulseiraOpts, setTamanhoPulseiraOpts] = useState<string[]>([]);
  const [corPulseiraOpts, setCorPulseiraOpts] = useState<string[]>([]);
  const [materialPulseiraOpts, setMaterialPulseiraOpts] = useState<string[]>([]);
  const [displayOpts, setDisplayOpts] = useState<string[]>([]);
  const [corMostradorOpts, setCorMostradorOpts] = useState<string[]>([]);
  const [funcaoMecanismoOpts, setFuncaoMecanismoOpts] = useState<string[]>([]);
  const [tamanhoCaixaOpts, setTamanhoCaixaOpts] = useState<string[]>([]);

  // Estados para os valores selecionados
  const [materialCaixaSelecionado, setMaterialCaixaSelecionado] = useState<string>("");
  const [tamanhoPulseiraSelecionado, setTamanhoPulseiraSelecionado] = useState<string>("");
  const [corPulseiraSelecionada, setCorPulseiraSelecionada] = useState<string>("");
  const [materialPulseiraSelecionado, setMaterialPulseiraSelecionado] = useState<string>("");
  const [displaySelecionado, setDisplaySelecionado] = useState<string>("");
  const [corMostradorSelecionado, setCorMostradorSelecionado] = useState<string>("");
  const [funcaoMecanismoSelecionada, setFuncaoMecanismoSelecionada] = useState<string>("");
  const [tamanhoCaixaSelecionado, setTamanhoCaixaSelecionado] = useState<string>("");

  // Estados para os ranges de preço e estoque
  const [precoMinimo, setPrecoMinimo] = useState<string>("0");
  const [precoMaximoFiltro, setPrecoMaximoFiltro] = useState<string>("");
  const [estoqueMinimo, setEstoqueMinimo] = useState<string>("0");
  const [estoqueMaximoFiltro, setEstoqueMaximoFiltro] = useState<string>("");
  const [tamanhoCaixaMinimo, setTamanhoCaixaMinimo] = useState<string>("0");
  const [tamanhoCaixaMaximoFiltro, setTamanhoCaixaMaximoFiltro] = useState<string>("");

  if (!visible) return null;

  useEffect(() => {
    fetchCatalogoData();
  }, [visible]);

  /**
   * Remove tudo que não seja dígito ou vírgula/ponto,
   * substitui vírgula por ponto, e retorna a string resultante.
   */
  function unformatCurrency(text: string): string {
    // tira qualquer letra, símbolo de moeda, espaços, exceto dígitos e , .
    const cleaned = text.replace(/[^\d,\.]/g, "");
    // se o usuário estiver usando vírgula decimal, já substitui:
    return cleaned.replace(",", ".");
  }

  const fetchCatalogoData = async () => {
    try {
      const query = `SELECT materialCaixa, tamanhoPulseira, corPulseira, materialPulseira, display, corMostrador, funcaoMecanismo, precoUnitario, quantidadeEstoquePA, tamanhoCaixa FROM Catalogo`;
      const catalogoResult = (await db.getAllAsync(query)) as FilterCatalogo[];

      // Helper para extrair, trimar, filtrar vazio e deduplicar:
      const extractUnique = (key: keyof FilterCatalogo) => {
        const all = catalogoResult
          .map((item) => (item[key] as string).trim())
          .filter((str) => str.length > 0);

        const unique = Array.from(new Set(all));

        const isNumeric = unique.every((val) => !isNaN(Number(val)));

        if (isNumeric) {
          return unique.sort((a, b) => Number(a) - Number(b));
        }

        return unique.sort((a, b) => a.localeCompare(b));
      };

      setMaterialCaixaOpts(extractUnique("materialCaixa"));
      setTamanhoPulseiraOpts(extractUnique("tamanhoPulseira"));
      setCorPulseiraOpts(extractUnique("corPulseira"));
      setMaterialPulseiraOpts(extractUnique("materialPulseira"));
      setDisplayOpts(extractUnique("display"));
      setCorMostradorOpts(extractUnique("corMostrador"));
      setFuncaoMecanismoOpts(extractUnique("funcaoMecanismo"));
      setTamanhoCaixaOpts(extractUnique("tamanhoCaixa"));

      // ranges de preço e estoque:
      const precos = catalogoResult.map((i) => i.precoUnitario);
      const estoques = catalogoResult.map((i) => i.quantidadeEstoquePA);
      const caixas = catalogoResult
        .map((i) => Number(i.tamanhoCaixa))
        .filter((n) => !isNaN(n));

      const maxPreco = Math.max(...precos);
      const maxEstoque = Math.max(...estoques);
      const maxCaixa = caixas.length ? Math.max(...caixas) : 0;

      // 2) Atualiza também os estados de range:
      setPrecoMinimo("0");
      setPrecoMaximoFiltro(maxPreco.toFixed(2));

      setEstoqueMinimo("0");
      setEstoqueMaximoFiltro(String(maxEstoque));

      setTamanhoCaixaMinimo("0");
      setTamanhoCaixaMaximoFiltro(String(maxCaixa));
    } catch (error) {
      console.error("Falha ao buscar catálogo:", error);
    }
  };

  // console.log("Material da Caixa: ", materialCaixa);

  const handleFilterSave = () => {
    const precoMin = parseFloat(precoMinimo) || 0;
    const precoMax = parseFloat(precoMaximoFiltro) || 0;
    const estoqueMin = parseInt(estoqueMinimo) || 0;
    const estoqueMax = parseInt(estoqueMaximoFiltro) || 0;
    const tamanhoCaixaMin = parseInt(tamanhoCaixaMinimo) || 0;
    const tamanhoCaixaMax = parseInt(tamanhoCaixaMaximoFiltro) || 0;

    if (precoMin > precoMax) {
      alert("O Preço Mínimo não pode ser maior que o Preço Máximo.");
      return;
    }

    if (estoqueMin > estoqueMax) {
      alert("O Estoque Mínimo não pode ser maior que o Estoque Máximo.");
      return;
    }

    if (tamanhoCaixaMin > tamanhoCaixaMax) {
      alert(
        "O Tamanho Mínimo da Caixa não pode ser maior que o Tamanho Máximo."
      );
      return;
    }

    // onSave({
    //   materialCaixa: materialCaixaSelecionado,
    //   tamanhoPulseira: tamanhoPulseiraSelecionado,
    //   corPulseira: corPulseiraSelecionada,
    //   materialPulseira: materialPulseiraSelecionado,
    //   display: displaySelecionado,
    //   corMostrador: corMostradorSelecionado,
    //   funcaoMecanismo: funcaoMecanismoSelecionada,
    //   tamanhoCaixa: tamanhoCaixaSelecionado,

    //   precoMinimo: precoMin,
    //   precoMaximo: precoMax,
    //   estoqueMinimo: estoqueMinimo ? Number(estoqueMinimo) : 0,
    //   estoqueMaximo: estoqueMaximoFiltro ? Number(estoqueMaximoFiltro) : 0,
    //   tamanhoCaixaMinimo: tamanhoCaixaMinimo ? Number(tamanhoCaixaMinimo) : 0,
    //   tamanhoCaixaMaximo: tamanhoCaixaMaximoFiltro
    //     ? Number(tamanhoCaixaMaximoFiltro)
    //     : 0,
    // });
    onSave({
      tipo: "filtrosAvancados", // ← define o tipo para identificar no backend
      nome: "Filtros Avançados",
      filtros: {
        materialCaixa: materialCaixaSelecionado,
        tamanhoPulseira: tamanhoPulseiraSelecionado,
        corPulseira: corPulseiraSelecionada,
        materialPulseira: materialPulseiraSelecionado,
        display: displaySelecionado,
        corMostrador: corMostradorSelecionado,
        funcaoMecanismo: funcaoMecanismoSelecionada,
        tamanhoCaixa: tamanhoCaixaSelecionado,

        precoMinimo: precoMin,
        precoMaximo: precoMax,
        estoqueMinimo: estoqueMinimo ? Number(estoqueMinimo) : 0,
        estoqueMaximo: estoqueMaximoFiltro ? Number(estoqueMaximoFiltro) : 0,
        tamanhoCaixaMinimo: tamanhoCaixaMinimo ? Number(tamanhoCaixaMinimo) : 0,
        tamanhoCaixaMaximo: tamanhoCaixaMaximoFiltro
          ? Number(tamanhoCaixaMaximoFiltro)
          : 0,
      },
    });

    onClose();
  };

  // helper que monta as options com default
  const buildSelectOptions = (items: string[]) => {
    // Se tiver itens, monta [Selecione… , item1, item2, …]
    if (items.length > 0) {
      return [
        { label: "Selecione…", value: "" },
        ...items.map((item) => ({ label: item, value: item })),
      ];
    }

    // Se não tiver nenhum item, mostra só essa opção desabilitada
    return [
      { label: "Sem opções disponíveis", value: "", disabled: true as any },
    ];
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <ModalContainer>
        <BoxContainer>
          <ScrollView>
            <ModalHeader>
              <ModalTitle>Filtros Avançados</ModalTitle>
            </ModalHeader>
            <ModalBody>
              {/* Filtros Avançados */}
              <FilterRow>
                <FilterColumn>
                  <FilterLabel>Material da Caixa</FilterLabel>
                  <SelectFieldComponent
                    options={buildSelectOptions(materialCaixaOpts)}
                    selectedValue={materialCaixaSelecionado}
                    onValueChange={(value) =>
                      setMaterialCaixaSelecionado(String(value))
                    }
                    height="60px"
                  />
                </FilterColumn>
                <FilterColumn>
                  <FilterLabel>Tamanho da Pulseira</FilterLabel>
                  <SelectFieldComponent
                    options={buildSelectOptions(tamanhoPulseiraOpts)}
                    selectedValue={tamanhoPulseiraSelecionado}
                    onValueChange={(value) =>
                      setTamanhoPulseiraSelecionado(String(value))
                    }
                    height="60px"
                  />
                </FilterColumn>
              </FilterRow>
              <FilterRow>
                <FilterColumn>
                  <FilterLabel>Cor da Pulseira</FilterLabel>
                  <SelectFieldComponent
                    options={buildSelectOptions(corPulseiraOpts)}
                    selectedValue={corPulseiraSelecionada}
                    onValueChange={(value) =>
                      setCorPulseiraSelecionada(String(value))
                    }
                    height="60px"
                  />
                </FilterColumn>
                <FilterColumn>
                  <FilterLabel>Material da Pulseira</FilterLabel>
                  <SelectFieldComponent
                    options={buildSelectOptions(materialPulseiraOpts)}
                    selectedValue={materialPulseiraSelecionado}
                    onValueChange={(value) =>
                      setMaterialPulseiraSelecionado(String(value))
                    }
                    height="60px"
                  />
                </FilterColumn>
              </FilterRow>
              <FilterRow>
                <FilterColumn>
                  <FilterLabel>Display</FilterLabel>
                  <SelectFieldComponent
                    options={buildSelectOptions(displayOpts)}
                    selectedValue={displaySelecionado}
                    onValueChange={(value) =>
                      setDisplaySelecionado(String(value))
                    }
                    height="60px"
                  />
                </FilterColumn>
                <FilterColumn>
                  <FilterLabel>Cor do Mostrador</FilterLabel>
                  <SelectFieldComponent
                    options={buildSelectOptions(corMostradorOpts)}
                    selectedValue={corMostradorSelecionado}
                    onValueChange={(value) =>
                      setCorMostradorSelecionado(String(value))
                    }
                    height="60px"
                  />
                </FilterColumn>
              </FilterRow>
              <FilterRow>
                <FilterColumn>
                  <FilterLabel>Função do Mecanismo</FilterLabel>
                  <SelectFieldComponent
                    options={buildSelectOptions(funcaoMecanismoOpts)}
                    selectedValue={funcaoMecanismoSelecionada}
                    onValueChange={(value) =>
                      setFuncaoMecanismoSelecionada(String(value))
                    }
                    height="60px"
                  />
                </FilterColumn>
              </FilterRow>
            </ModalBody>

            {/* Filtros Adicionais */}

            <ModalHeader>
              <ModalTitle>Filtros Adicionais</ModalTitle>
            </ModalHeader>

            <ModalBody>
              {/* Linha de Preço e Estoque */}
              <AdditionalFilterRow>
                <AdditionalFilterGroup>
                  <FilterLabel>Preço</FilterLabel>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <AdditionalFilterInputMoney
                      type="money"
                      placeholder="mínimo"
                      keyboardType="numeric"
                      value={precoMinimo}
                      onChangeText={(text) => {
                        // desmascara antes de salvar no state
                        const raw = unformatCurrency(text);

                        setPrecoMinimo(raw);
                      }}
                    />

                    <Text style={{ marginTop: 2 }}>à</Text>

                    <AdditionalFilterInputMoney
                      type="money"
                      placeholder="máximo"
                      keyboardType="numeric"
                      value={precoMaximoFiltro}
                      onChangeText={(text) => {
                        // desmascara antes de salvar no state
                        const raw = unformatCurrency(text);
                        setPrecoMaximoFiltro(raw);
                      }}
                    />
                  </View>
                </AdditionalFilterGroup>
                <AdditionalFilterGroup>
                  <FilterLabel>Quantidade de Estoque</FilterLabel>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <AdditionalFilterInput
                      placeholder="mínimo"
                      keyboardType="numeric"
                      value={estoqueMinimo}
                      onChangeText={setEstoqueMinimo}
                    />
                    <Text style={{ marginTop: 2 }}>à</Text>
                    <AdditionalFilterInput
                      placeholder="máximo"
                      keyboardType="numeric"
                      value={estoqueMaximoFiltro}
                      onChangeText={setEstoqueMaximoFiltro}
                    />
                  </View>
                </AdditionalFilterGroup>
                {/* </AdditionalFilterRow>

              <AdditionalFilterRow> */}
                <AdditionalFilterGroup>
                  <FilterLabel>Tamanho da Caixa</FilterLabel>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <AdditionalFilterInput
                      placeholder="mínimo"
                      keyboardType="numeric"
                      value={tamanhoCaixaMinimo}
                      onChangeText={setTamanhoCaixaMinimo}
                    />
                    <Text style={{ marginTop: 2 }}>à</Text>
                    <AdditionalFilterInput
                      placeholder="máximo"
                      keyboardType="numeric"
                      value={tamanhoCaixaMaximoFiltro}
                      onChangeText={setTamanhoCaixaMaximoFiltro}
                    />
                  </View>
                </AdditionalFilterGroup>
              </AdditionalFilterRow>
            </ModalBody>
            <ModalFooter>
              <ConfirmacaoModalButton
                onPress={onClose}
                text="Cancelar"
                variant="exit"
              />
              <ConfirmacaoModalButton
                onPress={handleFilterSave}
                text="Filtrar"
              />
              {/* <FilterButton onPress={handleFilter}>
              <FilterButtonText>Filtrar</FilterButtonText>
            </FilterButton> */}
            </ModalFooter>
          </ScrollView>
        </BoxContainer>
      </ModalContainer>
    </Modal>
  );
};

export default ModalFiltrosAvancados;
