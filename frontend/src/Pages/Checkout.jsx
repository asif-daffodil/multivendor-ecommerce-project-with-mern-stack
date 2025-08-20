import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import api from '../utils/apiClient';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.totalPrice);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  // billing address (required) and shipping address (optional / can be same as billing)
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    addressLine: '',
    city: '',
    postalCode: '',
    phone: ''
  });
  const [shippingSame, setShippingSame] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    addressLine: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  const submitOrder = async () => {
    if (!items || items.length === 0) {
      Swal.fire('Cart empty', 'Please add products to your cart before ordering.', 'warning');
      return;
    }

    // validation: billing required
    if (!billingAddress.fullName || !billingAddress.addressLine || !billingAddress.city || !billingAddress.phone) {
      Swal.fire('Billing address incomplete', 'Please provide full billing name, street address, city and phone.', 'warning');
      return;
    }

    // shipping validation if not same
    if (!shippingSame) {
      if (!shippingAddress.fullName || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.phone) {
        Swal.fire('Shipping address incomplete', 'Please provide full shipping name, street address, city and phone.', 'warning');
        return;
      }
    }

    const payload = {
      items: items.map((i) => ({ product: i.id, name: i.name, qty: i.qty || 1, price: Number(i.price) })),
      total: getTotalPrice(),
      paymentMethod,
      billingAddress,
      shippingAddress: shippingSame ? billingAddress : shippingAddress,
    };

    try {
      const res = await api.post('/orders', payload);
      // Some backends return { message, order } without a `success` flag.
      if ((res?.status >= 200 && res?.status < 300) && res?.data && (res.data.order || res.data.message)) {
        Swal.fire('Order placed', res.data.message || 'Your order has been created successfully.', 'success');
        useCartStore.getState().clear();
        navigate('/dashboard');
      } else {
        Swal.fire('Error', res?.data?.message || 'Unable to create order', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err?.response?.data?.message || err.message || 'Failed to create order', 'error');
    }
  };

  // pre-fill billing address from user profile when available
  React.useEffect(() => {
    if (user?.billingAddress) {
      setBillingAddress({
        fullName: user.billingAddress.fullName || '',
        addressLine: user.billingAddress.addressLine || '',
        city: user.billingAddress.city || '',
        postalCode: user.billingAddress.postalCode || '',
        phone: user.billingAddress.phone || '',
      });
    }
  }, [user]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Please sign in to continue to checkout.</p>
        <Link to="/sign-in?next=/checkout" className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Billing / Delivery */}
        <div className="md:col-span-7">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Billing details</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter your billing address. You can use the same address for shipping.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={billingAddress.fullName} onChange={(e)=>setBillingAddress(s=>({...s, fullName: e.target.value}))} placeholder="Full name" className="p-2 border rounded" />
              <input value={billingAddress.phone} onChange={(e)=>setBillingAddress(s=>({...s, phone: e.target.value}))} placeholder="Phone" className="p-2 border rounded" />
            </div>

            <div className="mt-4">
              <input value={billingAddress.addressLine} onChange={(e)=>setBillingAddress(s=>({...s, addressLine: e.target.value}))} placeholder="Street address" className="w-full p-2 border rounded" />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input value={billingAddress.city} onChange={(e)=>setBillingAddress(s=>({...s, city: e.target.value}))} placeholder="Town / City" className="p-2 border rounded" />
              <input value={billingAddress.postalCode} onChange={(e)=>setBillingAddress(s=>({...s, postalCode: e.target.value}))} placeholder="Postcode / ZIP" className="p-2 border rounded" />
              <div className="p-2" />
            </div>

            <div className="mt-4">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={shippingSame} onChange={(e)=>setShippingSame(e.target.checked)} className="mr-2" />
                <span className="text-sm">Shipping address same as billing</span>
              </label>
            </div>

            {!shippingSame && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded">
                <h4 className="font-medium mb-2">Shipping address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input value={shippingAddress.fullName} onChange={(e)=>setShippingAddress(s=>({...s, fullName: e.target.value}))} placeholder="Full name" className="p-2 border rounded" />
                  <input value={shippingAddress.phone} onChange={(e)=>setShippingAddress(s=>({...s, phone: e.target.value}))} placeholder="Phone" className="p-2 border rounded" />
                </div>
                <div className="mt-4">
                  <input value={shippingAddress.addressLine} onChange={(e)=>setShippingAddress(s=>({...s, addressLine: e.target.value}))} placeholder="Street address" className="w-full p-2 border rounded" />
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input value={shippingAddress.city} onChange={(e)=>setShippingAddress(s=>({...s, city: e.target.value}))} placeholder="Town / City" className="p-2 border rounded" />
                  <input value={shippingAddress.postalCode} onChange={(e)=>setShippingAddress(s=>({...s, postalCode: e.target.value}))} placeholder="Postcode / ZIP" className="p-2 border rounded" />
                  <div className="p-2" />
                </div>
              </div>
            )}

            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              <p>Note: For now we accept Cash on Delivery. You can add other payment methods later.</p>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Your order</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600 dark:text-gray-300 border-b">
                  <tr>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.id} className="border-b last:border-b-0">
                      <td className="py-3">{i.name} <span className="text-xs text-gray-500">× {i.qty || 1}</span></td>
                      <td className="py-3">{'BDT '}{(Number(i.price) * (i.qty || 1)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="text-sm">
                  <tr>
                    <td className="pt-3 font-medium">Subtotal</td>
                    <td className="pt-3">{'BDT '}{getTotalPrice().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="pt-2">Shipping</td>
                    <td className="pt-2">{'BDT '}{(0).toFixed(2)}</td>
                  </tr>
                  <tr className="border-t font-bold text-lg">
                    <td className="pt-3">Total</td>
                    <td className="pt-3">{'BDT '}{getTotalPrice().toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Payment & Place order */}
        <div className="md:col-span-5">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Payment</h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border rounded">
                <input className="mt-1" type="radio" name="payment" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} />
                <div>
                  <div className="font-medium">Cash on delivery</div>
                  <div className="text-sm text-gray-600">Pay with cash upon delivery.</div>
                </div>
              </label>
            </div>

            <div className="mt-6">
              <button onClick={submitOrder} className="w-full px-4 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700">Place order</button>
            </div>

            <div className="mt-4 text-xs text-gray-500">By placing your order you agree to our terms and conditions.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
