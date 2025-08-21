import React from 'react';
import Header from '../Components/FrontCompo/Header';
import Footer from '../Components/FrontCompo/Footer';
import { Outlet } from 'react-router';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useGatewayRedirect() {
    const navigate = useNavigate();
    useEffect(() => {
        try {
            const q = new URLSearchParams(window.location.search);
            // SSLCommerz uses val_id / tran_id / status
            if (q.get('val_id') || q.get('tran_id') || q.get('status')) {
                // navigate to SPA route preserving the querystring
                const qs = q.toString();
                navigate(`/payments/ssl/success?${qs}`, { replace: true });
            }
        } catch {
            // ignore
        }
    }, [navigate]);
}

const FrontLayout = () => {
    useGatewayRedirect();
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default FrontLayout;