import React from 'react';
import Header from '../Components/FrontCompo/Header';
import Footer from '../Components/FrontCompo/Footer';
import { Outlet } from 'react-router';

const FrontLayout = () => {
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