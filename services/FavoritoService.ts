// services/FavoritoService.ts
import { FavoritoRepository } from "@/repositories/FavoritoRepository";
import { eventBus, getHoraAtualComMs } from "@/core/eventBus";

export class FavoritoService {
  static async ensureSchema() {
    await FavoritoRepository.ensureSchema();
  }

  static async isFavorite(produtoId: string, ctx: CtxFavorito) {
    const { cpfCnpj, clienteId, representanteId } = ctx;
    return FavoritoRepository.exists(produtoId, cpfCnpj, clienteId, representanteId);
  }

  static async toggleFavorite(produtoId: string, ctx: CtxFavorito) {
    const { cpfCnpj, clienteId, representanteId } = ctx;
    const exists = await FavoritoRepository.exists(produtoId, cpfCnpj, clienteId, representanteId);
    if (exists) {
      console.log(`${getHoraAtualComMs()}[eventBus]-> ["favorito:toggled=false"]: produto[${produtoId}] cpfCnpj[${cpfCnpj}] clienteId[${clienteId}] representante[${representanteId}]`);
      await FavoritoRepository.remove(produtoId, cpfCnpj, clienteId, representanteId);
    } else {
      console.log(`${getHoraAtualComMs()}[eventBus]-> ["favorito:toggled=true"]: produto[${produtoId}] cpfCnpj[${cpfCnpj}] clienteId[${clienteId}] representante[${representanteId}]`);
      await FavoritoRepository.add(produtoId, cpfCnpj, clienteId, representanteId);
    }

    // broadcast opcional para sincronizar outras telas/widgets
    try {      
      eventBus.emit("favorito:toggled", {
        produtoId,
        isFavorite: !exists,
        cpfCnpj,
        clienteId,
        representanteId,
      });
    } catch {}

    return !exists;
  }

  static async mapForList(produtoIds: (string|number)[], ctx: CtxFavorito) {
    const { cpfCnpj, clienteId, representanteId } = ctx;
    return FavoritoRepository.mapForList(produtoIds, cpfCnpj, clienteId, representanteId);
  }
}


