// export const BASE_URL = "https://technosbffdev.homologa.click"; // Ambiente de Desenvolvimento
export const BASE_URL = "https://technosbff.homologa.click"; // Ambiente de Homologação
// export const BASE_URL = "https://technosbffpre.homologa.click"; // Ambiente de Pre (Pré-Produção)

// Label do Ambiente de Sincronização que fica no componente Menu e LabelComponent
const AMBIENTE_SINCRONIZACAO = {
  dev: "Dev",
  pre: "Pre",
  homologacao: "Homologação",
};

function getAmbienteSincronizacao() {
  let ambiente = "";

  if (BASE_URL.includes("dev")) {
    ambiente = AMBIENTE_SINCRONIZACAO.dev;
  } else if (BASE_URL.includes("pre")) {
    ambiente = AMBIENTE_SINCRONIZACAO.pre;
  } else {
    ambiente = AMBIENTE_SINCRONIZACAO.homologacao;
  }

  return ambiente;
}

function getAppVersion() {
  let APP_VERSION = "";

  const MINOR_NNUMBER = 11; // Versão do App, deve ser incrementada a cada nova versão.

  if (BASE_URL.includes("dev")) {
    APP_VERSION = `dev v2.0.0.${MINOR_NNUMBER}`;
  } else {
    APP_VERSION = `v2.0.0.${MINOR_NNUMBER}`;
  }

  return APP_VERSION;
}

// const STATUS_APLICACAO_ONLINE = isConnected ? true : false;
const STATUS_APLICACAO_ONLINE = true;

// Quantidade de Itens por Cada Requisição dos Cards na tela de Sincronização.
// default é 100.
const REQUEST_PAGE_SIZE = 100;

export const CONFIGS = {
  BASE_URL,
  STATUS_APLICACAO_ONLINE,
  APP_VERSION: getAppVersion(),
  AMBIENTE_SINCRONIZACAO: getAmbienteSincronizacao(),
  REQUEST_PAGE_SIZE,
};
