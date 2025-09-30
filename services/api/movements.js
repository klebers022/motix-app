import { api } from "./client";
import { isUuid } from "./validators";

// POST body: { motorcycleId: Guid, sectorId: Guid }
export async function createMovement({ motorcycleId, sectorId }) {
  if (!isUuid(motorcycleId) || !isUuid(sectorId)) {
    throw { message: "motorcycleId e sectorId devem ser UUID válidos." };
  }
  const { data } = await api.post("/movements", { motorcycleId, sectorId });
  return data; // esperado: registro do movimento
}

export async function listMovements(params = {}) {
  const { data } = await api.get("/movements", { params });
  return data;
}
