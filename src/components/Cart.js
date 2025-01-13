import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Image, Text, Flex, Heading, Button, HStack } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import Loading from './Loading';
import ConfirmationModal from './ConfirmationModal';
import '../styles/Cart.css';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL;

const Cart = () => {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/404');
            return;
        }

        const fetchCartItems = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/user/cart/${userId}`);
                const cartData = response.data;
                const productDetails = await Promise.all(
                    cartData.map(async (item) => {
                        const productResponse = await axios.get(`/product/${item.product_id}`);
                        return {
                            ...productResponse.data,
                            quantity: item.quantity,
                        };
                    })
                );
                setCartItems(productDetails);
                setError('');
            } catch (err) {
                setError('Failed to fetch cart items');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchCartItems();
        }
    }, [isAuthenticated, userId, navigate]);

    const updateCart = async (productId, quantity) => {
        setLoading(true);
        try {
            await axios.post('/user/add-to-cart', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity,
                },
            });
            if (quantity === 0) {
                setCartItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
            } else {
                setCartItems((prevItems) =>
                    prevItems.map((item) =>
                        item.product_id === productId ? { ...item, quantity: quantity } : item
                    )
                );
            }
            setError('');
        } catch (err) {
            setError('Failed to update cart');
        } finally {
            setLoading(false);
        }
    };

    const handleIncreaseQuantity = (productId, currentQuantity) => {
        updateCart(productId, currentQuantity + 1);
    };

    const handleDecreaseQuantity = (productId, currentQuantity) => {
        if (currentQuantity > 1) {
            updateCart(productId, currentQuantity - 1);
        } else {
            setSelectedProductId(productId);
            setShowModal(true);
        }
    };

    const handleRemoveItem = async (productId) => {
        setSelectedProductId(productId);
        setShowModal(true);
    };

    const handleConfirmRemove = async () => {
        setShowModal(false);
        updateCart(selectedProductId, 0);
    };

    const handleMoveToWishlist = async () => {
        setShowModal(false);
        try {
            await axios.post('/user/add-to-wishlist', null, {
                params: {
                    user_id: userId,
                    product_id: selectedProductId,
                },
            });
            updateCart(selectedProductId, 0);
        } catch (err) {
            setError('Failed to move item to wishlist');
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0).toFixed(2);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Text color="red.500">{error}</Text>;
    }

    if (!isAuthenticated){
        navigate('/404');
        return;
    }

    return (
        <Box className="cart-container">
            <Heading as="h2" size="xl" mb={6} className='cart-heading'>Shopping Cart</Heading>
            {cartItems.length === 0 ? (
                <Flex direction="column" align="center" justify="center" height="50vh">
                    <FaShoppingCart size="50px" color="gray" />
                    <Text mt={4} fontSize="xl" color="gray.500">Your cart is empty</Text>
                </Flex>
            ) : (
                <>
                    {cartItems.map((item) => (
                        <Flex key={item.product_id} borderBottom="1px solid #e2e8f0" p="10px 0" transition="box-shadow 0.2s" position="relative" flexWrap="nowrap" mb={4}>
                            <Image src={item.images[0]} alt={item.name} className="cart-item-img" />
                            <Box flex="1" ml={4}>
                                <Text className="cart-item-name">{item.name}</Text>
                                <Flex justifyContent="flex-start" alignItems="left" mt={2} width='fit-content'>
                                    <HStack spacing={4} alignItems="left">
                                        <HStack border='1px solid #25995C'>
                                            <Button
                                                onClick={() => handleDecreaseQuantity(item.product_id, item.quantity)}
                                                isLoading={loading}
                                                className="quantity-button"
                                                size={{ base: "xs", md: "md" }}
                                                _hover={{ backgroundColor: '#1e7a4d' }}
                                                transition="all 0.3s"
                                            ><FaMinus /></Button>
                                            <Text px={3} className='quantity-number'>{item.quantity}</Text>
                                            <Button
                                                onClick={() => handleIncreaseQuantity(item.product_id, item.quantity)}
                                                isLoading={loading}
                                                className="quantity-button"
                                                size={{ base: "xs", md: "md" }}
                                                _hover={{ backgroundColor: '#1e7a4d' }}
                                                transition="all 0.3s"
                                            ><FaPlus /></Button>
                                        </HStack>
                                        <Button
                                            onClick={() => handleRemoveItem(item.product_id)}
                                            isLoading={loading}
                                            className="remove-button"
                                            size={{ base: "xs", md: "md" }}
                                            _hover={{ backgroundColor: 'red.700' }}
                                            transition="all 0.3s"
                                        ><FaTrash /></Button>
                                    </HStack>
                                </Flex>
                            </Box>
                            <Text className="total-price">₹{item.price} x {item.quantity} = ₹{((item.price || 0) * item.quantity).toFixed(2)}</Text>
                        </Flex>
                    ))}
                    <Flex justifyContent="space-between" alignItems="center" mt={6}>
                        <Text fontSize="2xl" fontWeight="bold">Total:</Text>
                        <Text fontSize="2xl" fontWeight="bold">₹{calculateTotal()}</Text>
                    </Flex>
                    <Button mt={6} onClick={handleCheckout} className="checkout-button" _hover={{ backgroundColor: '#1e7a4d' }} transition="all 0.3s">
                        Proceed to Checkout
                    </Button>
                </>
            )}
            {showModal && (
                <ConfirmationModal
                    message="Do you want to remove this item from the cart or move it to the wishlist?"
                    button1={{ label: 'Remove', onClick: handleConfirmRemove }}
                    button2={{ label: 'Move to Wishlist', onClick: handleMoveToWishlist }}
                    onClose={() => setShowModal(false)}
                />
            )}
        </Box>
    );
};

export default Cart;
