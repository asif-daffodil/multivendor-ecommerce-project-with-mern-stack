import React from 'react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { Link, useNavigate } from 'react-router';

const Checkout = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.totalPrice);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Please sign in to continue to checkout.</p>
        <Link to="/sign-in?next=/checkout" className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go to Sign In</Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <Link to="/products" className="text-blue-600 dark:text-blue-400 hover:underline">Browse products</Link>
      </div>
    );
  }

  const submitOrder = () => {
    // Placeholder: Normally submit order to backend here
    alert('Order placed successfully (demo)!');
    navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {items.map((i) => (
            <div key={i.id + (i.variant ? JSON.stringify(i.variant) : '')} className="p-4 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{i.name}</div>
                  {i.variant && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">{i.variant.color ? `Color: ${i.variant.color}` : ''}{i.variant.color && i.variant.size ? ' • ' : ''}{i.variant.size ? `Size: ${i.variant.size}` : ''}</div>
                  )}
                </div>
                <div className="text-sm">Qty: {i.qty || 1}</div>
                <div className="font-semibold">${(Number(i.price) * (i.qty || 1)).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="p-4 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Total</div>
              <div className="text-xl font-bold">${getTotalPrice().toFixed(2)}</div>
            </div>
            <button onClick={submitOrder} className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Place order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
