import { store } from "./utils.js";
const KEY = "asl_orders_v1";
export const getOrder = (ref) => store.get(KEY, {})[ref] || null;
export function saveOrder(order) {
  const all = store.get(KEY, {});
  all[order.ref] = order;
  // Keep the 20 most recent orders on this device.
  const keep = Object.values(all).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  return store.set(KEY, Object.fromEntries(keep.map((o) => [o.ref, o])));
}
