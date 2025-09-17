// core/eventBus.ts
type Handler<T = any> = (payload?: T) => void;

const listeners = new Map<string, Set<Handler>>();

export const eventBus = {
  on<T = any>(event: string, handler: Handler<T>) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler as Handler);
    return () => listeners.get(event)?.delete(handler as Handler);
  },

  emit<T = any>(event: string, payload?: T) {
    const set = listeners.get(event);    
    if (!set) return;
    set.forEach((h) => {
      try {
        h(payload);
      } catch (e) {
        console.warn(`[eventBus] "${event}" handler error:`, e);
      }
    });
  },

  clear(event?: string) {
    if (event) listeners.delete(event);
    else listeners.clear();
  },
} as const;

export function getHoraAtualComMs() {
  const agora = new Date();

  const hora = agora.toLocaleTimeString("pt-BR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const cc = String(Math.floor(agora.getMilliseconds() / 10)).padStart(2, "0");

  return `[${hora}.${cc}]`;
}