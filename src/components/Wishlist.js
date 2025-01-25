import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Image, Text, Flex, Heading, Button } from '@chakra-ui/react';
import { Toaster, toaster } from './ui/toaster';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import { FaHeartBroken } from 'react-icons/fa';
import '../styles/Wishlist.css';

const Wishlist = () => {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true); // New state for auth loading
    const navigate = useNavigate();

    const UseToast = (title, type) => {
        toaster.create({
          title: title,
          type: type,
        });
    };

    useEffect(() => {
        const checkAuth = async () => {
            console.log("Authenticating user", isAuthenticated);
            if (isAuthenticated) {
                navigate('/wishlist');
                await fetchWishlistItems();
            } else {
                navigate('/login');
                return;
            }
            setAuthLoading(false); // Authentication check completed
        };

        const fetchWishlistItems = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/user/wishlist/${userId}`);
                const wishlistData = response.data;
                const productDetails = await Promise.all(
                    wishlistData.map(async (productId) => {
                        const productResponse = await axios.get(`/product/${productId}`);
                        return productResponse.data;
                    })
                );
                setWishlistItems(productDetails);
            } catch (err) {
                UseToast('Failed to fetch wishlist items', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated !== undefined) {
            // Only run checkAuth if isAuthenticated has been determined
            checkAuth();
        }
    }, [isAuthenticated, userId, navigate]);

    const handleRemoveFromWishlist = async (productId) => {
        setLoading(true);
        try {
            await axios.post('/user/add-to-wishlist', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                },
            });
            setWishlistItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
            UseToast('Item removed from wishlist', 'success');
        } catch (err) {
            UseToast('Failed to remove item from wishlist', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    if (authLoading) {
        return <Loading />; // Show loading while authentication is being determined
    }

    if (loading) {
        return <Loading />;
    }


    return (
        <Box className="wishlist-container">
            <Heading as="h2" size="xl" mb={6} className='wishlist-heading'>Wishlist</Heading>
            {wishlistItems.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px" flexDirection="column">
                    <FaHeartBroken size="50px" color="gray" />
                    <Text fontSize="xl" color="gray.500" mt={4}>Your wishlist is empty</Text>
                </Flex>
            ) : (
                <>
                    {wishlistItems.map((item) => (
                        <Flex key={item.product_id} className="wishlist-item" p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                            <Image src={item.images[0]} alt={item.name} boxSize="100px" objectFit="cover" borderRadius="md" loading="lazy" />
                            <Box ml={4} flex="1">
                                <Text fontSize="xl" fontWeight="bold" onClick={() => handleProductClick(item.product_id)}>{item.name}</Text>
                                <Text fontSize="lg" color="gray.500">₹{item.price}</Text>
                                <Button
                                    mt={2}
                                    onClick={() => handleRemoveFromWishlist(item.product_id)}
                                    isLoading={loading}
                                    backgroundColor="red.500"
                                    color="white"
                                    size="sm"
                                    _hover={{ backgroundColor: 'red.700' }}
                                    transition="all 0.3s"
                                >
                                    Remove from Wishlist
                                </Button>
                            </Box>
                        </Flex>
                    ))}
                </>
            )}
        </Box>
    );
};

export default Wishlist;
