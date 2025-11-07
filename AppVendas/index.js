import { registerRootComponent } from "expo";
import App from "./App";

// importa e inicializa handlers globais
import { initGlobalErrorHandling } from "./utils/globalErrorHandler";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

// opcional: envia para backend/Sentry
async function sendToRemote(payload) {
  // exemplo básico:
  // await fetch("https://sua-api/logs", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
}

initGlobalErrorHandling({
  tagApp: "AppVendaMobileT",
  sendToRemote,
  ignoreWarnings: [
    // adicione warnings a ignorar globalmente
    //"VirtualizedLists should never be nested",
    //"source.uri should not be an empty string",
  ],
});

// Componente raiz com boundary de erros de renderização
function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// garante que tanto no Expo Go quanto no build nativo funcione
registerRootComponent(Root);
