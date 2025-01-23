import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Text, Flex, Heading, Button, Stack, Image, HStack, Input } from '@chakra-ui/react';
import { Radio, RadioGroup } from './ui/radio';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { FiEdit, FiTrash } from 'react-icons/fi';
import AddressModal from './AddressModal';
import Loading from './Loading';
import '../styles/Checkout.css';
import { Toaster, toaster } from "../components/ui/toaster";

const Checkout = () => {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [currentAddressId, setCurrentAddressId] = useState(null);
    const [addressType, setAddressType] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');
    const [otp, setOtp] = useState('');
    const [orderId, setOrderId] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    const UseToast = (title, type) => {
        toaster.create({
            title: title,
            type: type,
            duration: 2000,
        });
    };

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
            } catch (err) {
                UseToast('Failed to fetch cart items', 'error');
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
                UseToast('Failed to fetch addresses', 'error');
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
            UseToast('Address saved successfully', 'success');
            setIsAddressModalOpen(false);
        } catch (err) {
            UseToast('Failed to save address', 'error');
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
            UseToast('Address deleted successfully', 'success');
        } catch (err) {
            UseToast('Failed to delete address', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddressId) {
            UseToast('Please select an address', 'error');
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
                payment_type: paymentMode,
            };

            if (paymentMode === 'online') {
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
                            UseToast(response.data.message, 'error');
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
            } else {
                // Handle Cash on Delivery
                const response = await axios.post('/user/place-order', orderData);
                setOrderId(response.data.order_id);
                navigate('/order-status', { state: { status: 'success', message: 'Your order has been placed successfully!' } });
                UseToast('OTP sent to your email.', 'success');
            }
        } catch (err) {
            UseToast('Failed to proceed to checkout', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            await axios.post('/user/verify-payment-otp', { order_id: orderId, otp });
            await axios.post(`/user/empty-cart/${userId}`);
            navigate('/order-status', { state: { status: 'success', message: 'Your order has been placed successfully!' } });
        } catch (err) {
            UseToast('Failed to verify OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity * item.min_quantity), 0).toFixed(2);
    };

    if (loading) {
        return <Loading />;
    }

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`/user/profile/${userId}`);
            setAddresses(response.data.address || []);
        } catch (err) {
            UseToast('Failed to fetch user profile', 'error');
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
                            <Text fontSize="lg" color="gray.500">₹{item.price} x {item.quantity * item.min_quantity} = ₹{((item.price || 0) * (item.quantity * item.min_quantity)).toFixed(2)}</Text>
                        </Box>
                    </Flex>
                ))}
                <Flex justifyContent="space-between" alignItems="center" mt={6}>
                    <Text fontSize="2xl" fontWeight="bold">Total:</Text>
                    <Text fontSize="2xl" fontWeight="bold">₹{calculateTotal()}</Text>
                </Flex>
            </Box>
            <Box className="checkout-section">
                <Heading as="h3" size="lg" mb={4}>Payment Method</Heading>
                <RadioGroup value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <Stack direction="row" spacing={5}>
                        <Radio value="online">
                            <FaCreditCard /> Online Payment
                        </Radio>
                        <Radio value="cash">
                            <FaMoneyBillWave /> Cash on Delivery
                        </Radio>
                    </Stack>
                </RadioGroup>
            </Box>
            {otpSent ? (
                <Box className="checkout-section">
                    <Heading as="h3" size="lg" mb={4}>Enter OTP</Heading>
                    <Input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        fontSize="1rem"
                        padding="15px"
                        borderRadius="10px"
                        transition="all 0.3s ease"
                        _hover={{ borderColor: "#25995C" }}
                        _focus={{ borderColor: "#25995C", boxShadow: "0 0 5px rgba(37, 153, 92, 0.5)" }}
                    />
                    <Button
                        mt={6}
                        onClick={handleVerifyOtp}
                        backgroundColor="#25995C"
                        color="white"
                        _hover={{ backgroundColor: '#1e7a4d' }}
                        transition="all 0.3s"
                    >
                        Verify OTP
                    </Button>
                </Box>
            ) : (
                <Button
                    mt={6}
                    onClick={handleCheckout}
                    backgroundColor="#25995C"
                    color="white"
                    _hover={{ backgroundColor: '#1e7a4d' }}
                    transition="all 0.3s"
                    disabled={!selectedAddressId && !paymentMode}
                >
                    Place Order
                </Button>
            )}
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={handleCloseAddressModal}
                setIsAddressModalOpen={setIsAddressModalOpen}
                fetchUserProfile={fetchUserProfile}
                userId={userId}
                currentAddressId={currentAddressId}
                setCurrentAddressId={setCurrentAddressId}
                addresses={addresses}
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
            <Toaster />
        </Box>
    );
};

export default Checkout;
