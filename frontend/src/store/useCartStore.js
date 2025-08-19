import { create } from 'zustand';

const loadCart = () => {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try { localStorage.setItem('cart', JSON.stringify(items)); } catch { /* ignore */ }
};

const useCartStore = create((set, get) => ({
  items: loadCart(),
  addItem: (item) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + (item.qty || 1) };
    } else {
      items.push({ ...item, qty: item.qty || 1 });
    }
    saveCart(items);
    set({ items });
  },
  setQty: (id, qty) => {
    let items = [...get().items];
    items = items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
    saveCart(items);
    set({ items });
  },
  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    saveCart(items);
    set({ items });
  },
  clear: () => { saveCart([]); set({ items: [] }); },
  totalCount: () => get().items.reduce((s, i) => s + (i.qty || 1), 0),
  totalPrice: () => get().items.reduce((s, i) => s + (Number(i.price || 0) * (i.qty || 1)), 0),
}));

export default useCartStore;
