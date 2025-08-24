import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Verify from './components/Verify';
import Account from './components/Account';
import Home from './components/Home';
import NotFound from './components/NotFound';
import ProductDetail from './components/ProductDetail';
import { Provider } from "./components/ui/provider";
import { AuthProvider } from './context/AuthContext';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Checkout from './components/Checkout';
import OrderStatus from './components/OrderStatus';
import Orders from './components/Orders';
import Pagefooter from './components/Pagefooter';
import ContactUs from './components/ContactUs';
import BecomeSeller from './components/BecomeSeller';
import About from './components/About';
import SellerProfile  from './components/SellerProfile';
import ShowReviews from './components/ShowReviews';
import AllProductsPage from './components/AllProductsPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import ShippingPolicy from './components/ShippingPolicy';
import CancellationAndRefund from './components/CancellationAndRefund';
import './styles/global.css';

const App = () => {
  console.log("App component rendered", process.env.REACT_APP_EMAILJS_TEMPLATE_ID);
  return (
    <Provider>
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/verify" element={<Verify/>} />
            <Route path="/account" element={<Account/>} />
            <Route path="/" element={<Home/>} />
            <Route path="/cart" element={<Cart/>} />
            <Route path="/wishlist" element={<Wishlist/>} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/seller/:sellerId" element={<SellerProfile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-status" element={<OrderStatus />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<About />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route path="/show-reviews" element={<ShowReviews />} />
            <Route path="/all-products/:category" element={<AllProductsPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/cancellation-and-refund" element={<CancellationAndRefund />} />
            <Route path="*" element={<NotFound/>} />
            {/* Other routes can be added here */}
          </Routes>
          <Pagefooter />
          <Footer />
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default App;