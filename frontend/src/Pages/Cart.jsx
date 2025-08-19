import React from 'react';
import useCartStore from '../store/useCartStore';
import { Link, useNavigate } from 'react-router';

const Cart = () => {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotalPrice = useCartStore((s) => s.totalPrice);

  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-300">
          Your cart is empty. <Link to="/products" className="text-blue-600 dark:text-blue-400 hover:underline">Browse products</Link>.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((i) => (
      <div key={i.id} className="flex items-center justify-between p-4 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div>
                <div className="font-medium">{i.name}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{'$'}{i.price}</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={i.qty} onChange={(e)=>setQty(i.id, Number(e.target.value))} className="w-20 p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                <button onClick={()=>removeItem(i.id)} className="px-3 py-1 bg-red-600 text-white rounded">Remove</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-lg font-semibold">Total</div>
      <div className="text-xl font-bold">{'$'}{getTotalPrice().toFixed(2)}</div>
          </div>
          <div className="flex justify-end">
            <button className="px-5 py-2 bg-green-600 text-white rounded" onClick={()=>navigate('/checkout')}>Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
