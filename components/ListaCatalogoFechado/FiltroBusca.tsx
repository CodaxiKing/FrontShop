// components/ListaCatalogoFechado/FiltroBusca.tsx
import React, { useState, useEffect, useCallback } from "react";
import InputFieldComponent from "@/components/InputFieldComponent";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface FiltroBuscaProps {
  onChangeSearch: (valor: string) => void;
  // Permite refletir valor externo (ex.: leitura do código de barras pelo scanner)
  value?: string;
}

const FiltroBusca: React.FC<FiltroBuscaProps> = ({ onChangeSearch, value }) => {
  const [texto, setTexto] = useState(value ?? "");
  const textoDebounced = useDebouncedValue(texto, 500); // debounce de 500ms

  // Sincroniza quando o valor externo muda (ex.: scanner aplica termo)
  useEffect(() => {
    const external = (value ?? "").trim();
    if (external !== texto) {
      setTexto(external);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Ao limpar, dispara reset imediato (sem esperar debounce)
  const handleChangeText = useCallback(
    (next: string) => {
      setTexto(next);
      if (next.trim() === "") {
        onChangeSearch("");
      }
    },
    [onChangeSearch]
  );

  // Dispara debounced quando há texto
  useEffect(() => {
    if (textoDebounced.trim() !== "") {
      onChangeSearch(textoDebounced);
    }
  }, [textoDebounced, onChangeSearch]);

  return (
    <InputFieldComponent
      value={texto}
      onChangeText={handleChangeText}
      placeholder="Buscar produto..."
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
};

export default React.memo(FiltroBusca);
