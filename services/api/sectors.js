// services/api/sectors.js
import { api } from "./client";

// Se sua API retorna { items: [{data}], ... }, desembrulhamos:
const unwrap = (payload) =>
  Array.isArray(payload?.items) ? payload.items.map(it => it?.data ?? it)
  : Array.isArray(payload) ? payload
  : [];

export async function listSectors() {
  const { data } = await api.get("/Sectors"); // ajuste se sua rota for /sectors
  return unwrap(data); // => [{ id, code }, ...]
}

export async function createSector({ code }) {
  const { data } = await api.post("/Sectors", { code });
  return data;
}

export async function getSectorById(id) {
  const { data } = await api.get(`/Sectors/${id}`);
  return data?.data ?? data;
}

export async function deleteSector(id) {
  await api.delete(`/Sectors/${id}`);
  return true;
}
