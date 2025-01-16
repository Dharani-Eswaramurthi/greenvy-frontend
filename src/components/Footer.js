import React, { useContext, useEffect, useState, useRef } from 'react';
import '../styles/Footer.css';
import { FaHome, FaHeart, FaShoppingCart, FaUser, FaClipboardList, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Button } from "../components/ui/button";
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getCroppedImg from '../utils/cropImage';
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "../components/ui/menu";
import userLogo from "../assets/user.png";

axios.defaults.baseURL = process.env.REACT_APP_BASEURL;

const Footer = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(null);
    const navigate = useNavigate();
    const [menuVisible, setMenuVisible] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const fetchProfileImage = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                try {
                    const response = await axios.get(`/user/profile/${decodedToken.user_id}`);
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


        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuVisible(false);
            }
        };

        if (isAuthenticated) {
            fetchProfileImage();
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