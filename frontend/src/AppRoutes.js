import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DesignsPage from './pages/Designs/DesignsPage';
import ProductPage from './pages/Product/ProductPage';
import Cart from './pages/Cart/Cart';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import { TestPage } from './pages/test/TestPage';
import ContactPage from './pages/Contacts/ContactsPage';
import CustomDesignPage from './pages/CustomPage/CustomPage';
import AddDesignPage from './pages/admin/designs/addDesign';
import { useAuth } from './hooks/useAuth';
import OrderDetailsPage from './pages/order/orderPage';
import OrdersPage from './pages/order/ordersPage';

export default function AppRoutes() {
  const { user } = useAuth();
  console.log("user", user)
  return (
    <Routes>
        <Route path="/" element={<DesignsPage/>}/>
        <Route path="/DesignsPage" element={<DesignsPage/>}/>
        <Route path="/search/:searchTerm" element={<DesignsPage/>}/>
        <Route path="/tag/:tag" element={<DesignsPage/>}/>
        <Route path="/food/:id" element={<ProductPage/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/Register" element={<RegisterPage/>}/>
        <Route path="/HomePage" element={<HomePage/>}/>
        <Route path="/ContactsPage" element={<ContactPage/>}/>
        <Route path="/CustomPage" element={<CustomDesignPage/>}/>
        <Route path="/TestPage" element = {<TestPage/>}/>
        {user?.isAdmin && <Route path="/add-design" element={<AddDesignPage />} />}
        <Route path = "/orders" element = {<OrdersPage/>}/>
        <Route path = "/order-details" element = {<OrderDetailsPage/>}/>

        
    </Routes>
  );
}
