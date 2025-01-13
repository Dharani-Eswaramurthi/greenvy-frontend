import React, { useContext, useEffect, useState } from 'react';
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

axios.defaults.baseURL = process.env.REACT_BASEURL;

const Footer = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(null);
    const navigate = useNavigate();

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

        if (isAuthenticated) {
            fetchProfileImage();
        }
    }, [isAuthenticated]);

    const handleProfileClick = () => {
        navigate('/account');
    };

    const handleCartClick = () => {
        navigate('/cart');
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
        <div className="footer">
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
                    <MenuRoot>
                        <MenuTrigger as={Button} className="icon" variant="ghost">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="profile-image" />
                            ) : (
                                <FaUser />
                            )}
                        </MenuTrigger>
                        <MenuContent className="dropdown-menu">
                            <MenuItem icon={<FaClipboardList />} onClick={handleOrdersClick}>
                                Orders
                            </MenuItem>
                            <MenuItem icon={<FaCog />} onClick={handleProfileClick}>
                                Account Settings
                            </MenuItem>
                            <MenuItem icon={<FaSignOutAlt />} onClick={handleLogoutClick}>
                                Logout
                            </MenuItem>
                        </MenuContent>
                    </MenuRoot>
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