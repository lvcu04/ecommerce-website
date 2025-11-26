import { create } from 'zustand';
import { authFetch } from '@/app/utils/authFetch';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface CartState {
  totalItems: number;
  fetchCartCount: (router: AppRouterInstance) => Promise<void>;
  setTotalItems: (count: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  totalItems: 0,
  setTotalItems: (count) => set({ totalItems: count }),
  fetchCartCount: async (router: AppRouterInstance) => {
    try {
      const res = await authFetch('/api/cart', {}, router);
      if (res && res.ok) {
        const data = await res.json();
        // Tính tổng quantity. Định nghĩa kiểu cụ thể cho item thay vì để mặc định là any
        const count = Array.isArray(data) 
          ? data.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0)
          : 0;
        set({ totalItems: count });
      }
    } catch (error) {
      console.error('Failed to fetch cart count', error);
    }
  },
}));