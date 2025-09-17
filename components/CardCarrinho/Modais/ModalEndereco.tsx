import React, { useEffect, useState } from "react";
import { Modal, Alert, ActivityIndicator } from "react-native";
import {
  ModalContainer,
  ModalContent,
  ModalTitle,
  Row,
  InputSmall,
  ButtonRow,
  ButtonClose,
  ButtonSelect,
  ButtonText,
  ButtonTextBlue,
  InputRow,
  InputRowLast,
  InputLabelSmall,
} from "./style.modal";
import { Endereco } from "../IconesCardCarrinho";
import SelectFieldComponent from "@/components/SelectFieldComponent";
import { buscarCep } from "@/utils/buscarCep";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface ModalEnderecoProps {
  visible: boolean;
  selectedCep: string;
  ceps: Endereco[];
  onClose: () => void;
  onSelectCep: (value: string) => void;
  onConfirmEndereco: (endereco: Endereco | undefined) => void;
  enderecoInicial?: Endereco | null;
}

const ModalEndereco: React.FC<ModalEnderecoProps> = ({
  visible,
  onClose,
  selectedCep,
  onSelectCep,
  ceps,
  onConfirmEndereco,
  enderecoInicial,
}) => {
  const [isSearching, setIsSearching] = useState(false); // Para controlar a busca
  const [cepInput, setCepInput] = useState<string>(""); // Input para buscar o CEP
  const [novoEndereco, setNovoEndereco] = useState<Endereco | null>(null); // Armazena o novo endereço após busca
  const [showSearchModal, setShowSearchModal] = useState(false); // Controla a exibição do modal de busca do CEP
  const [enderecoSelecionado, setEnderecoSelecionado] =
    useState<Endereco | null>(null); // Estado para armazenar o endereço selecionado
  const [cepsTemp, setCepsTemp] = useState<Endereco[]>(ceps); // Estado para armazenar os ceps temporários

  const isOnline = useNetworkStatus(); // Hook para verificar o status da rede

  // Atualiza o endereço selecionado no início ou quando novo endereço for buscado
  useEffect(() => {
    if (!visible) return;

    const cepsFiltrados = ceps.filter(
      (cep) => cep.cep !== enderecoInicial?.cep // Remove CEPs duplicados
    );

    const cepsComInicial = enderecoInicial
      ? [enderecoInicial, ...cepsFiltrados]
      : [...cepsFiltrados];

    const todosOsCeps = [
      ...cepsComInicial,
      ...cepsTemp.filter(
        (novo) => !cepsComInicial.some((original) => original.cep === novo.cep)
      ),
    ];

    const inicial = enderecoInicial?.cep
      ? todosOsCeps.find((c) => c.cep === enderecoInicial.cep) || todosOsCeps[0]
      : todosOsCeps[0];

    setCepsTemp(todosOsCeps);
    setEnderecoSelecionado(inicial ? { ...inicial } : null);
    onSelectCep(inicial?.cep ?? "");
  }, [visible]);

  // Garantir que o endereço selecionado esteja correto quando o modal for exibido
  useEffect(() => {
    if (novoEndereco) {
      setEnderecoSelecionado(novoEndereco); // Atualiza o estado do novo endereço após a busca
    }
  }, [novoEndereco]);

  const handleSearchCep = async () => {
    if (!cepInput) {
      Alert.alert("Erro", "Por favor, insira um CEP válido.");
      return;
    }
    setIsSearching(true);
    try {
      const dadosCep = await buscarCep(cepInput); // Chama a função buscarCep

      if (dadosCep && dadosCep.uf !== ceps[0].estado) {
        Alert.alert(
          "Erro",
          "O CEP inserido não pertence ao estado do cliente."
        );
        setIsSearching(false);
        return;
      }

      if (dadosCep) {
        const novoEnderecoBuscado = {
          ...dadosCep,
          tipo: 0, // Tipo padrão
        };
        setNovoEndereco(novoEnderecoBuscado);

        // Adiciona o novo endereço temporariamente ao array de ceps
        setCepsTemp((prevCeps) => [novoEnderecoBuscado, ...prevCeps]);

        // Atualiza o CEP selecionado com o CEP da busca
        onSelectCep(dadosCep.cep); // Atualiza o selectedCep com o novo CEP
        setEnderecoSelecionado(novoEnderecoBuscado); // Atualiza o endereço selecionado com o novo endereço
        setShowSearchModal(false); // Fecha o modal de busca
      } else {
        Alert.alert("Erro", "CEP não encontrado.");
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message || "Erro ao buscar CEP.");
      } else {
        Alert.alert("Erro", "Erro ao buscar CEP.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmNewAddress = () => {
    if (!enderecoSelecionado) {
      Alert.alert("Erro", "Por favor, busque um CEP primeiro.");
      return;
    }

    const numero = enderecoSelecionado.numero || "s/n";

    const enderecoFinal = {
      ...enderecoSelecionado,
      numero,
    };

    // Debug: verificar se ele já existe na lista cepsTemp
    const jaExiste = cepsTemp.some(
      (cep) =>
        cep.cep === enderecoFinal.cep &&
        cep.numero === enderecoFinal.numero &&
        cep.complemento === enderecoFinal.complemento
    );

    if (!jaExiste) {
      setCepsTemp((prev) => {
        const novaLista = [enderecoFinal, ...prev];
        return novaLista;
      });
    }

    // Chama a função de confirmação com o novo endereço
    onConfirmEndereco(enderecoFinal);

    onClose();
  };

  return (
    <>
      {/* Modal de Seleção de Endereço */}
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <ModalContainer>
          <ModalContent>
            <ModalTitle>Seleção de Endereço - Carrinho</ModalTitle>

            {/* Dropdown usando SelectFieldComponent */}

            <SelectFieldComponent
              label="Selecionar Cep"
              selectedValue={enderecoSelecionado?.cep || selectedCep}
              options={cepsTemp.map((cep) => {
                return {
                  label: cep.cep,
                  value: cep.cep,
                };
              })}
              onValueChange={(value) => {
                const enderecoEncontrado = cepsTemp.find(
                  (cep) => cep.cep === value
                );

                onSelectCep(value);
                setEnderecoSelecionado(
                  enderecoEncontrado ? { ...enderecoEncontrado } : null
                );
              }}
              height="60px"
            />

            {/* Campos desabilitados */}
            <Row>
              <InputRow>
                <InputLabelSmall>Estado</InputLabelSmall>
                <InputSmall
                  placeholder="Estado"
                  value={enderecoSelecionado?.estado || ""}
                  editable={false}
                />
              </InputRow>
              <InputRowLast>
                <InputLabelSmall>Município</InputLabelSmall>
                <InputSmall
                  placeholder="Município"
                  value={enderecoSelecionado?.municipio || ""}
                  editable={false}
                />
              </InputRowLast>
            </Row>

            <Row>
              <InputRow>
                <InputLabelSmall>Bairro</InputLabelSmall>
                <InputSmall
                  placeholder="Bairro"
                  value={enderecoSelecionado?.bairro || ""}
                  editable={false}
                />
              </InputRow>
              <InputRowLast>
                <InputLabelSmall>Endereço</InputLabelSmall>
                <InputSmall
                  placeholder="Endereço"
                  value={enderecoSelecionado?.endereco || ""}
                  editable={false}
                />
              </InputRowLast>
            </Row>

            <Row>
              <InputRow>
                <InputLabelSmall>Número</InputLabelSmall>
                <InputSmall
                  placeholder="Insira o Número"
                  value={enderecoSelecionado?.numero || ""}
                  onChangeText={(text) =>
                    setEnderecoSelecionado((prev) =>
                      prev ? { ...prev, numero: text } : null
                    )
                  }
                />
              </InputRow>
              <InputRowLast>
                <InputLabelSmall>Complemento</InputLabelSmall>
                <InputSmall
                  placeholder="Insira o Complemento"
                  value={enderecoSelecionado?.complemento || ""}
                  onChangeText={(text) =>
                    setEnderecoSelecionado((prev) =>
                      prev ? { ...prev, complemento: text } : null
                    )
                  }
                />
              </InputRowLast>
            </Row>

            {/* Botão Pesquisar CEP */}
            <ButtonRow>
              {isOnline && (
                <ButtonClose onPress={() => setShowSearchModal(true)}>
                  <ButtonTextBlue>Pesquisar CEP</ButtonTextBlue>
                </ButtonClose>
              )}
              <ButtonClose onPress={() => onClose()}>
                <ButtonTextBlue>Cancelar</ButtonTextBlue>
              </ButtonClose>

              <ButtonSelect onPress={handleConfirmNewAddress}>
                <ButtonText>Selecionar</ButtonText>
              </ButtonSelect>
            </ButtonRow>
          </ModalContent>
        </ModalContainer>
      </Modal>

      {/* Modal de Inserir CEP */}
      <Modal
        visible={showSearchModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <ModalContainer>
          <ModalContent>
            <ModalTitle>Inserir o CEP para Busca</ModalTitle>
            <InputSmall
              placeholder="Digite o CEP"
              value={cepInput}
              onChangeText={setCepInput}
              keyboardType="number-pad"
              maxLength={8}
            />
            <ButtonRow>
              <ButtonClose onPress={() => setShowSearchModal(false)}>
                <ButtonTextBlue>Cancelar</ButtonTextBlue>
              </ButtonClose>

              <ButtonSelect onPress={isSearching ? () => {} : handleSearchCep}>
                <ButtonText>
                  {/* Buscar CEP  */}
                  {isSearching ? (
                    <ActivityIndicator color={"white"} />
                  ) : (
                    "Buscar CEP"
                  )}
                </ButtonText>
              </ButtonSelect>
            </ButtonRow>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default ModalEndereco;
