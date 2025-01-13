import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Text, Flex, Heading, Button, Stack, Image, HStack } from '@chakra-ui/react';
import { Radio, RadioGroup } from './ui/radio';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { FiEdit, FiTrash } from 'react-icons/fi';
import AddressModal from './AddressModal';
import Loading from './Loading';
import '../styles/Checkout.css';

const Checkout = () => {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [currentAddressId, setCurrentAddressId] = useState(null);
    const [addressType, setAddressType] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
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

        const fetchAddresses = async () => {
            try {
                const response = await axios.get(`/user/profile/${userId}`);
                setAddresses(response.data.address || []);
                setSelectedAddressId(response.data.address[0]?.addressId); 
            } catch (err) {
                setError('Failed to fetch addresses');
            }
        };

        fetchCartItems();
        fetchAddresses();
    }, [isAuthenticated, userId, navigate]);

    const handleOpenAddressModal = (addressId = null) => {
        if (addressId !== null) {
            const address = addresses.find(addr => addr.addressId === addressId);
            setCurrentAddressId(addressId);
            setAddressType(address.address_type);
            setAddressLine1(address.address_line1);
            setAddressLine2(address.address_line2);
            setCity(address.city);
            setPincode(address.pincode);
            setState(address.state);
            setCountry(address.country);
        } else {
            setCurrentAddressId(null);
            setAddressType('Home');
            setAddressLine1('');
            setAddressLine2('');
            setCity('');
            setPincode('');
            setState('');
            setCountry('');
        }
        setIsAddressModalOpen(true);
    };

    const handleCloseAddressModal = () => {
        setIsAddressModalOpen(false);
    };

    const handleSaveAddress = async () => {
        setLoading(true);
        try {
            const address = {
                addressId: currentAddressId,
                address_type: addressType,
                address_line1: addressLine1,
                address_line2: addressLine2,
                city,
                pincode,
                state,
                country,
            };
            await axios.post(`/user/update-profile-details/add-or-update-address/${userId}`, address);
            fetchUserProfile(userId);
            setError('');
            setIsAddressModalOpen(false);
        } catch (err) {
            setError('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        const confirmed = window.confirm('Are you sure you want to delete this address?');
        if (!confirmed) return;

        setLoading(true);
        try {
            await axios.post(`/user/update-profile-details/delete-address/${userId}`, null, {
                params: { addressId }
            });
            fetchUserProfile(userId);
            setError('');
        } catch (err) {
            setError('Failed to delete address');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddressId) {
            setError('Please select an address');
            return;
        }

        setLoading(true);
        try {
            // Prepare the order data for the backend
            const orderData = {
                user_id: userId,
                cart_items: cartItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
                address_id: selectedAddressId,
                total_amount: calculateTotal(),
            };

            // Create the order and get the Razorpay payment details
            const response = await axios.post('/user/place-order', orderData);
            const { order_id, payment_id, amount, currency } = response.data;

            // Razorpay payment options
            const options = {
                key: process.env.RZRPAYKEYID,
                amount: amount * 100, // in paise
                currency: currency,
                name: 'greenvy',
                description: 'Order Payment',
                order_id: payment_id,
                handler: async function (response) {
                    // Payment success callback
                    try {
                        await axios.post('/user/payment-success', { 
                            order_id: response.razorpay_order_id, 
                            payment_id: response.razorpay_payment_id, 
                            signature: response.razorpay_signature 
                        });
                        // Empty the user's cart
                        await axios.post(`/user/empty-cart/${userId}`);
                        navigate('/order-status', { state: { status: 'success', message: 'Your order has been placed successfully!' } });
                    } catch (err) {
                        const response = await axios.post('/user/payment-failed', { 
                            order_id: response.razorpay_order_id 
                        });
                        setError(response.data.message);
                        navigate('/order-status', { state: { status: 'failed', message: 'Payment verification failed. Please try again.' } });
                    }
                },
                prefill: {
                    name: 'User Name', // Prefill with user name
                    email: 'user@example.com', // Prefill with user email
                    contact: '9999999999', // Prefill with user contact
                },
                notes: {
                    address: 'User Address',
                },
                theme: {
                    color: '#3399cc',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                navigate('/order-status', { state: { status: 'failed', message: 'Payment failed: ' + response.error.description } });
            });
            rzp.open();
        } catch (err) {
            setError('Failed to proceed to checkout');
        } finally {
            setLoading(false);
        }
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

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`/user/profile/${userId}`);
            setAddresses(response.data.address || []);
        } catch (err) {
            console.log(err);
            setError('Failed to fetch user profile');
        }
    };

    return (
        <Box className="checkout-container">
            <Heading as="h2" size="xl" mb={6}>Checkout</Heading>
            <Box className="checkout-section">
                <Heading as="h3" size="lg" mb={4}>Select Address</Heading>
                <RadioGroup value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.value)}>
                    {addresses.map((address) => (
                        <Box key={address.addressId} className="address-box" p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                            <Radio value={address.addressId}>
                                <Text><b>{address.address_type}</b></Text>
                                <Text>{address.address_line1}</Text>
                                <Text>{address.address_line2}</Text>
                                <Text>{address.city}</Text>
                                <Text>{address.pincode}</Text>
                                <Text>{address.state}</Text>
                                <Text>{address.country}</Text>
                            </Radio>
                            <HStack spacing={2} mt={2}>
                                <Button className="settings-icon-button" onClick={() => handleOpenAddressModal(address.addressId)}>
                                    <FiEdit />
                                </Button>
                                <Button className="settings-icon-button" onClick={() => handleDeleteAddress(address.addressId)}>
                                    <FiTrash />
                                </Button>
                            </HStack>
                        </Box>
                    ))}
                </RadioGroup>
                <Button onClick={() => handleOpenAddressModal()} backgroundColor="#25995C" color="white" _hover={{ backgroundColor: '#1e7a4d' }} transition="all 0.3s">
                    Add Address
                </Button>
            </Box>
            <Box className="checkout-section">
                <Heading as="h3" size="lg" mb={4}>Order Summary</Heading>
                {cartItems.map((item) => (
                    <Flex key={item.product_id} className="cart-item" p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                        <Image src={item.images[0]} alt={item.name} boxSize="100px" objectFit="cover" borderRadius="md" loading="lazy" />
                        <Box ml={4} flex="1">
                            <Text fontSize="xl" fontWeight="bold">{item.name}</Text>
                            <Text fontSize="lg" color="gray.500">₹{item.price} x {item.quantity} = ₹{((item.price || 0) * item.quantity).toFixed(2)}</Text>
                        </Box>
                    </Flex>
                ))}
                <Flex justifyContent="space-between" alignItems="center" mt={6}>
                    <Text fontSize="2xl" fontWeight="bold">Total:</Text>
                    <Text fontSize="2xl" fontWeight="bold">₹{calculateTotal()}</Text>
                </Flex>
            </Box>
            <Button
                mt={6}
                onClick={handleCheckout}
                backgroundColor="#25995C"
                color="white"
                _hover={{ backgroundColor: '#1e7a4d' }}
                transition="all 0.3s"
                disabled={!selectedAddressId}
            >
                Pay Now
            </Button>
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={handleCloseAddressModal}
                setError={setError}
                setIsAddressModalOpen={setIsAddressModalOpen}
                fetchUserProfile={fetchUserProfile}
                userId={userId}
                currentAddressId={currentAddressId}
                addressType={addressType}
                setAddressType={setAddressType}
                addressLine1={addressLine1}
                setAddressLine1={setAddressLine1}
                addressLine2={addressLine2}
                setAddressLine2={setAddressLine2}
                city={city}
                setCity={setCity}
                pincode={pincode}
                setPincode={setPincode}
                state={state}
                setState={setState}
                country={country}
                setCountry={setCountry}
                loading={loading}
                setLoading={setLoading}
            />
        </Box>
    );
};

export default Checkout;
