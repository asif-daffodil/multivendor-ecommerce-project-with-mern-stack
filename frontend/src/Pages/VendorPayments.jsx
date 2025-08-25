import React, { useEffect, useState } from 'react';
import api from '../utils/apiClient';
import DashboardSidebar from '../Components/DashboardSidebar';

const vendorLinks = [
  { to: '/dashboard/vendor/orders', label: 'Orders' },
  { to: '/dashboard/vendor/products', label: 'Products' },
  { to: '/dashboard/vendor/payments', label: 'Payments' },
  { to: '/dashboard/vendor/service-charges', label: 'Service Charges' },
];

export default function VendorPayments() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/payments/vendor/summary');
      setSummary(res.data);
    } catch (e) { setError(e?.response?.data?.message || 'Failed to load payments summary'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="flex min-h-screen bg-green-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DashboardSidebar links={vendorLinks} color="green" />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Payments</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {loading ? <div>Loading...</div> : (
          summary ? (
            <div className="space-y-3 max-w-md bg-white dark:bg-gray-800 p-4 rounded shadow">
              <div className="flex justify-between"><div>Gross Sales</div><div>BDT {Number(summary.grossSales||0).toFixed(2)}</div></div>
              <div className="flex justify-between"><div>Service Charges</div><div>BDT {Number(summary.serviceCharges||0).toFixed(2)}</div></div>
              <div className="flex justify-between font-semibold"><div>Net Payable</div><div>BDT {Number(summary.netPayable||0).toFixed(2)}</div></div>
              <div className="flex justify-between"><div>Paid Amount</div><div>BDT {Number(summary.paidAmount||0).toFixed(2)}</div></div>
              <div className="flex justify-between text-red-600 font-medium"><div>Due</div><div>BDT {Number(summary.due||0).toFixed(2)}</div></div>
            </div>
          ) : <div>No summary available</div>
        )}
      </main>
    </div>
  );
}
