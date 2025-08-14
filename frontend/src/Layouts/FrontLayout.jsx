import React from 'react';
import Header from '../Components/FrontCompo/Header';
import Footer from '../Components/FrontCompo/Footer';
import { Outlet } from 'react-router';

const FrontLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
};

export default FrontLayout;