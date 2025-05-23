import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/greenvy-logo.png';
import { FaShoppingCart, FaHeart, FaSearch, FaTimes, FaCog, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import { Button } from "../components/ui/button";
import { Input } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import getCroppedImg from '../utils/cropImage';
import userLogo from "../assets/user.png";

const Header = () => {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const { isAuthenticated, logout, userId } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(null);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef();

    useEffect(() => {
        const fetchProfileImage = async () => {
            if (userId) {
                try {
                    const response = await axios.get(`/user/profile/${userId}`);
                    const imageUrl = response.data.profile_image;
                    if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
                        const imageResponse = await fetch(imageUrl);
                        const imageBlob = await imageResponse.blob();
                        const imageObjectURL = URL.createObjectURL(imageBlob);
                        const croppedImage = await getCroppedImg(imageObjectURL, JSON.parse(response.data.profile_image_crop));
                        setProfileImage(croppedImage);
                    }
                } catch (err) {
                    console.error('Failed to fetch profile image');
                }
            }
        };

        const fetchCartItemCount = async () => {
            if (userId) {
                try {
                    const response = await axios.get(`/user/cart/${userId}`);
                    setCartItemCount(response.data.length);
                } catch (err) {
                    console.error('Failed to fetch cart items');
                }
            }
        };

        if (isAuthenticated) {
            fetchProfileImage();
            fetchCartItemCount();
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAuthenticated]);

    const handleSearchClick = () => {
        setShowSearchModal(true);
    };

    const handleCloseModal = () => {
        setShowSearchModal(false);
    };

    const handleProfileClick = () => {
        setMenuVisible(!menuVisible);
    };

    const handleCartClick = () => {
        navigate('/cart');
    };

    const handleAccountClick = () => {
        navigate('/account');
    };

    const handleOrdersClick = () => {
        navigate('/orders');
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleWishlistClick = () => {
        navigate('/wishlist');
    };

    return (
        <div className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="logo" onClick={handleLogoClick}>
                <img src={logo} alt="logo" />
            </div>
            <div className="right-side">
                <Button className="icon search" variant="ghost" onClick={handleSearchClick}>
                    <FaSearch />
                </Button>
                {isAuthenticated ? (
                    <>
                        <Button className="icon wishlist" variant="ghost" onClick={handleWishlistClick}>
                            <FaHeart />
                        </Button>
                        <Button className="icon cart" variant="ghost" onClick={handleCartClick}>
                            <FaShoppingCart />
                            {cartItemCount > 0 && (
                                <span className="cart-count">{cartItemCount}</span>
                            )}
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
                    <Button className="icon login" variant="ghost" as="a" href="/login">
                        Login
                    </Button>
                )}
            </div>

            {showSearchModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <Input placeholder="Search..." className="search-box" autoFocus />
                        <button className="modal-close" onClick={handleCloseModal}>
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
