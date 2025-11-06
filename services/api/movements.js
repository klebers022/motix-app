import { api } from "./client";
import { isUuid } from "./validators";

// POST body: { motorcycleId: Guid, sectorId: Guid }
export async function createMovement({ userId, sectorId }) {
  if (!isUuid(motorcycleId) || !isUuid(sectorId)) {
    throw { message: "motorcycleId e sectorId devem ser UUID válidos." };
  }
  const { data } = await api.post("/updates", { motorcycleId, userId });
  return data;
}

export async function listMovements(params = {}) {
  const { data } = await api.get("/updates", { params });
  return data;
}
