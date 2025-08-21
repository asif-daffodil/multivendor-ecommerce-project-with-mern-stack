import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import useCartStore from '../store/useCartStore';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentsSuccess = () => {
  const query = useQuery();
  const val_id = query.get('val_id');
  const tran_id = query.get('tran_id') || query.get('tran_id') || query.get('tran_id');
  const amount = query.get('amount') || query.get('store_amount');
  const status = query.get('status') || 'SUCCESS';
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    // Clear local cart after successful payment
    clear();
  }, [clear]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Payment Successful</h1>
      <p className="mb-2">Status: <strong>{status}</strong></p>
      {tran_id && <p className="mb-2">Order ID: <strong>{tran_id}</strong></p>}
      {val_id && <p className="mb-2">Verification ID: <strong>{val_id}</strong></p>}
      {amount && <p className="mb-2">Amount: <strong>{amount} BDT</strong></p>}

      <div className="mt-6">
        <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded">Go to Dashboard</Link>
        <Link to="/" className="ml-3 px-4 py-2 border rounded">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default PaymentsSuccess;
