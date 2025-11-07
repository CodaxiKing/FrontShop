// utils/globalErrorHandler.ts
import { LogBox, Platform } from "react-native";

type RemoteSender = (payload: Record<string, any>) => Promise<void> | void;

interface InitOptions {
  ignoreWarnings?: string[];
  sendToRemote?: RemoteSender; // opcional: enviar para Sentry, API própria, etc.
  tagApp?: string;             // ex.: "AppVendaMobileT"
}

const DEFAULT_IGNORES = [
  // corte ruídos conhecidos; adicione/retire à vontade
  //"VirtualizedLists should never be nested",
  //"source.uri should not be an empty string",
];

function nowISO() {
  return new Date().toISOString();
}

function safeString(v: any) {
  if (v == null) return String(v);
  if (typeof v === "string") return v;
  if (v instanceof Error) return v.message;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function baseEnvelope(extra: Record<string, any> = {}) {
  return {
    ts: nowISO(),
    platform: Platform.OS,
    ...extra,
  };
}

export function initGlobalErrorHandling(opts: InitOptions = {}) {
  const { ignoreWarnings = [], sendToRemote, tagApp = "App" } = opts;

  // 1) Silenciar warnings chatos (mantém o restante visível)
  LogBox.ignoreLogs([...DEFAULT_IGNORES, ...ignoreWarnings]);

  // 2) Handler global de exceções JS não tratadas
  const globalHandler = (error: any, isFatal?: boolean) => {
    const payload = baseEnvelope({
      type: "JS_EXCEPTION",
      tag: tagApp,
      isFatal: !!isFatal,
      message: error?.message ?? safeString(error),
      stack: error?.stack ?? undefined,
    });
    // Visível no console do Expo/dev
    // eslint-disable-next-line no-console
    console.error("[GLOBAL-ERROR]", payload.message, payload.stack || "");

    // Opcional: envie pra um backend / Sentry
    try {
      sendToRemote?.(payload);
    } catch {}
  };

  // RN expõe ErrorUtils em tempo de execução
  try {
    (ErrorUtils as any).setGlobalHandler(globalHandler);
  } catch {
    // nada
  }

  // 3) Promessas não tratadas
  const unhandledRejection = (reason: any) => {
    const payload = baseEnvelope({
      type: "UNHANDLED_REJECTION",
      tag: tagApp,
      message: reason?.message ?? safeString(reason),
      stack: reason?.stack ?? undefined,
    });
    // eslint-disable-next-line no-console
    console.error("[PROMISE-NÃO-TRATADA]", payload.message, payload.stack || "");
    try {
      sendToRemote?.(payload);
    } catch {}
  };

  try {
    // RN moderno (Hermes) costuma suportar
    // @ts-ignore
    if (typeof globalThis.addEventListener === "function") {
      // @ts-ignore
      globalThis.addEventListener("unhandledrejection", (e: any) => {
        unhandledRejection(e?.reason ?? e);
      });
    } else if (typeof (global as any).onunhandledrejection !== "undefined") {
      (global as any).onunhandledrejection = (e: any) =>
        unhandledRejection(e?.reason ?? e);
    }
  } catch {
    // nada
  }

  // 4) Redirecionar console.error para centralizar
  const originalConsoleError = console.error.bind(console);
  console.error = (...args: any[]) => {
    originalConsoleError(...args);
    try {
      const payload = baseEnvelope({
        type: "CONSOLE_ERROR",
        tag: tagApp,
        message: args.map(safeString).join(" | "),
      });
      sendToRemote?.(payload);
    } catch {}
  };

  // 5) Helper opcional: log manual (breadcrumbs)
  (global as any).__logBreadcrumb = (label: string, data?: any) => {
    const payload = baseEnvelope({
      type: "BREADCRUMB",
      tag: tagApp,
      label,
      data: data ?? null,
    });
    // eslint-disable-next-line no-console
    console.log("[BREADCRUMB]", label, safeString(data));
    try {
      sendToRemote?.(payload);
    } catch {}
  };
}

/**
 * Use em qualquer lugar para criar breadcrumbs manuais:
 *   logBreadcrumb("Entrou no CatalogoFechado", { tabelaPreco, pagina });
 */
export function logBreadcrumb(label: string, data?: any) {
  try {
    // @ts-ignore
    (global as any).__logBreadcrumb?.(label, data);
  } catch {
    // fallback
    // eslint-disable-next-line no-console
    console.log("[BREADCRUMB]", label, safeString(data));
  }
}


export function getHoraAtualComMs() {
  const agora = new Date();
  return `${agora.toLocaleTimeString("pt-BR", { hour12: false })}.${agora.getMilliseconds()}`;
}