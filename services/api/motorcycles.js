import { api } from "./client";
import { isUuid } from "./validators";

export async function createMotorcycle({ sectorId }) {
  if (!isUuid(motorcycleId) || !isUuid(sectorId)) {
    throw { message: "motorcycleId e sectorId devem ser UUID válidos." };
  }
  const { data } = await api.post("/motorcycles", { sectorId });
  return data;
}

export async function listMotorcycles() {
  const { data } = await api.get("/motorcycles");
  const list = Array.isArray(data?.items)
    ? data.items.map((it) => it?.data ?? it)
    : Array.isArray(data)
    ? data
    : [];
  return list;
}
