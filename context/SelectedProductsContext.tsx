// SelectedProductsContext.tsx
import React, { createContext, useState, useContext } from "react";

export interface SelectedProduct {
  codigo: string;
  nomeEcommerce: string;
  precoUnitario: number;
  productImage: { uri: string } | number;
  quantidade: number;
  descricaoSubgrupo: string;
  dataPrevistaPA?: string;
  // Adicione outros campos se necessário
}

interface SelectedProductsContextType {
  selectedProducts: SelectedProduct[];
  addProduct: (product: SelectedProduct) => void;
  removeProduct: (codigo: string) => void;
  toggleProduct: (product: SelectedProduct) => void;
}

const SelectedProductsContext = createContext<SelectedProductsContextType>({
  selectedProducts: [],
  addProduct: () => {},
  removeProduct: () => {},
  toggleProduct: () => {},
});

export const SelectedProductsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  const addProduct = (product: SelectedProduct) => {
    setSelectedProducts((prev) => {
      // Se o produto já existir, você pode atualizar a quantidade ou simplesmente ignorar
      if (!prev.some((p) => p.codigo === product.codigo)) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const removeProduct = (codigo: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.codigo !== codigo));
  };

  const toggleProduct = (p: SelectedProduct) => {
    setSelectedProducts((prev) =>
      prev.some((x) => x.codigo === p.codigo)
        ? prev.filter((x) => x.codigo !== p.codigo)
        : [...prev, p]
    );
  };

  return (
    <SelectedProductsContext.Provider
      value={{ selectedProducts, addProduct, removeProduct, toggleProduct }}
    >
      {children}
    </SelectedProductsContext.Provider>
  );
};

export const useSelectedProducts = () => useContext(SelectedProductsContext);
