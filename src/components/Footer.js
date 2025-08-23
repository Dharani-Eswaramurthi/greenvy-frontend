import React, { useContext, useEffect, useState, useRef } from 'react';
import '../styles/Footer.css';
import { FaHome, FaHeart, FaShoppingCart, FaClipboardList, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Button } from "../components/ui/button";
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getCroppedImg from '../utils/cropImage';
import userLogo from "../assets/user.png";

axios.defaults.baseURL = process.env.REACT_APP_BASEURL || "https://api.greenvy.store";

const Footer = () => {
    const { isAuthenticated, logout, userId } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(null);
    const [cartCount, setCartCount] = useState(0); // Add state for cart count
    const navigate = useNavigate();
    const [menuVisible, setMenuVisible] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const fetchProfileImage = async () => {
            if (userId) {
                try {
                    const response = await axios.get(`/user/profile/${userId}`);
                    const imageResponse = await fetch(response.data.profile_image);
                    const imageBlob = await imageResponse.blob();
                    const imageObjectURL = URL.createObjectURL(imageBlob);
        
                    const croppedImage = await getCroppedImg(imageObjectURL, JSON.parse(response.data.profile_image_crop));
                    setProfileImage(croppedImage);
                } catch (err) {
                    console.error('Failed to fetch profile image');
                }
            }
        };

        const fetchCartCount = async () => {
            if (isAuthenticated) {
                try {
                    const response = await axios.get(`/user/cart/${userId}`);
                    setCartCount(response.data.count);
                } catch (err) {
                    console.error('Failed to fetch cart count');
                }
            }
        };

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuVisible(false);
            }
        };

        if (isAuthenticated) {
            fetchProfileImage();
            fetchCartCount();
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAuthenticated]);

    const handleProfileClick = () => {
        setMenuVisible(true);
    };

    const handleCartClick = () => {
        navigate('/cart');
    };

    const handleAccountClick = () => {
        navigate('/account');
    };

    const handleWishlistClick = () => {
        navigate('/wishlist');
    };

    const handleOrdersClick = () => {
        navigate('/orders');
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="footer" style={{ zIndex: 10 }}>  {/* Add z-index to footer */}
            <Button className="icon" variant="ghost" as="a" href="/">
                <FaHome />
            </Button>
            {isAuthenticated ? (
                <>
                    <Button className="icon" variant="ghost" onClick={handleWishlistClick}>
                        <FaHeart />
                    </Button>
                    <Button className="icon" variant="ghost" onClick={handleCartClick}>
                        <FaShoppingCart />
                        {cartCount > 0 && <span className="footer-cart-count">{cartCount}</span>} {/* Add cart count badge */}
                    </Button>
                    
                    <div className="menu-trigger-wrapper">
                            <Button className="icon menu-trigger" variant="ghost" onClick={handleProfileClick}>
                                <img src={profileImage || userLogo} alt="Profile" className="profile-image" />
                            </Button>
                            {menuVisible && (
                                <div ref={menuRef} className="menu-content">
                                    <div className="menu-item" onClick={handleOrdersClick}>
                                        <FaClipboardList />
                                        <span>Orders</span>
                                    </div>
                                    <div className="menu-item" onClick={handleAccountClick}>
                                        <FaCog />
                                        <span>Account Settings</span>
                                    </div>
                                    <div className="menu-item" onClick={handleLogoutClick}>
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </div>
                                </div>
                            )}
                        </div>
                </>
            ) : (
                <Button className="icon" variant="ghost" as="a" href="/login">
                    Login
                </Button>
            )}
        </div>
    );
};

export default Footer;