// Interface para representar um destinatário
export interface Destinatario {
  codigo: string;
  representanteId: string;
  clienteId: string;
  nomeReduzido: string;
  email: string;
}

// Interface para representar um pedido
export interface Pedido {
  id: string;
  name: string;
  refer: string;
}

// Interface para representar os dados de envio da mala direta
export interface MalaDiretaRequestData {
  representanteId: string;
  assunto: string;
  texto: string;
  sendReferencia: boolean;
  sendCaixa: boolean;
  sendPulseira: boolean;
  sendResitencia: boolean;
  sendCodigoBarra: boolean;
  sendNCM: boolean;
  sendValor: boolean;
  sendPDF: boolean;
  sendExcel: boolean;
  sendEmail: boolean;
  produtos: { codigoProduto: string }[];
  clientes: { clienteId: string }[];
}

// Interface para as props do componente MalaDiretaSelecaoDestinatario
export interface MalaDiretaSelecaoDestinatarioProps {
  visible: boolean;
  onClose: () => void;
}

// Tipo para o estado do passo atual
export type StepType = "SelecionarDestinatario" | "SelecionarInfos";
