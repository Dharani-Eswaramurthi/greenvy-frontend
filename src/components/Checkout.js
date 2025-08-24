import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Text, Flex, Heading, Button, Stack, Image, HStack, Input, useDisclosure } from '@chakra-ui/react';
import { Radio, RadioGroup } from './ui/radio';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave, FaInfoCircle, FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { FiEdit, FiTrash } from 'react-icons/fi';
import AddressModal from './AddressModal';
import Loading from './Loading';
import ConfirmationModal from './ConfirmationModal';
import '../styles/Checkout.css';
import { Toaster, toaster } from "../components/ui/toaster";

const Checkout = () => {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [radioValue, setRadioValue] = useState(null);
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
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');
    const [otp, setOtp] = useState('');
    const [orderId, setOrderId] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [additionalCost, setAdditionalCost] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [userData, setUserData] = useState(null);
    const [isFreeDeliveryModalOpen, setIsFreeDeliveryModalOpen] = useState(false);
    const [showInfoPopup, setShowInfoPopup] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
    const navigate = useNavigate();
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const UseToast = (title, type) => {
        toaster.create({
            title: title,
            type: type,
            duration: 2000,
        });
    };

    useEffect(() => {
        const fetchCartItems = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/user/cart/${userId}`);
                const cartData = response.data;
                console.log("Raw cart data from API:", cartData);
                
                const productDetails = await Promise.all(
                    cartData.map(async (item) => {
                        const productResponse = await axios.get(`/product/${item.product_id}`);
                        const productWithQuantity = {
                            ...productResponse.data,
                            quantity: item.quantity,
                        };
                        console.log("Product with quantity:", productWithQuantity);
                        return productWithQuantity;
                    })
                );
                console.log("Final cart items:", productDetails);
                setCartItems(productDetails);
                
                // Calculate initial totals
                const initialSubtotal = calculateSubtotal(productDetails);
                setSubtotal(initialSubtotal);
            } catch (err) {
                console.error("Error fetching cart items:", err);
                UseToast('Failed to fetch cart items', 'error');
            } finally {
                setLoading(false);
            }
        };

        const fetchAddresses = async () => {
            try {
                const response = await axios.get(`/user/profile/${userId}`);
                setAddresses(response.data.address || []);
                setUserData(response.data); // Store user data for Razorpay
                if (response.data.address && response.data.address.length > 0) {
                    setSelectedAddressId(response.data.address[0]?.addressId); 
                    setRadioValue(response.data.address[0]?.addressId);
                }
            } catch (err) {
                UseToast('Failed to fetch addresses', 'error');
            }
        };

        if (isAuthenticated) {
            fetchCartItems();
            fetchAddresses();
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, userId, navigate]);

    useEffect(() => {
        setTimeout(() => {
            setIsPopupVisible(true);
        }, 1000);
    }, []);

    // Handle initial address selection after cart items are loaded
    useEffect(() => {
        if (selectedAddressId && cartItems.length > 0 && subtotal > 0) {
            const currentSubtotal = calculateSubtotal(cartItems);
            console.log("Initial address selection with subtotal:", currentSubtotal);
            
            // Calculate additional cost for the selected address
            const calculateInitialCost = async () => {
                try {
                    const cost_response = await axios.post('/user/additional-cost', null, {
                        params: {
                            user_id: userId,
                            address_id: selectedAddressId,
                            total_cost: currentSubtotal
                        }
                    });
                    const { total_additional_cost } = cost_response.data;
                    setAdditionalCost(total_additional_cost || 0);
                    
                    if (total_additional_cost === 0) {
                        setIsFreeDeliveryModalOpen(true);
                    }
                } catch (err) {
                    console.error("Error calculating initial additional cost:", err);
                }
            };
            
            calculateInitialCost();
        }
    }, [selectedAddressId, cartItems, subtotal, userId]);

    // Cart modification functions
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
            
            // Recalculate totals after cart update
            const updatedItems = quantity === 0 
                ? cartItems.filter((item) => item.product_id !== productId)
                : cartItems.map((item) => item.product_id === productId ? { ...item, quantity: quantity } : item);
            
            const newSubtotal = calculateSubtotal(updatedItems);
            setSubtotal(newSubtotal);
            
            // Recalculate additional costs if address is selected
            if (selectedAddressId) {
                console.log("Recalculating additional costs with subtotal:", newSubtotal);
                const cost_response = await axios.post('/user/additional-cost', null, {
                    params: {
                        user_id: userId,
                        address_id: selectedAddressId,
                        total_cost: newSubtotal
                    }
                });
                const { total_additional_cost } = cost_response.data;
                setAdditionalCost(total_additional_cost || 0);
            }
            
            UseToast('Cart updated successfully', 'success');
        } catch (err) {
            UseToast('Failed to update cart', 'error');
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
            UseToast('Item moved to wishlist', 'success');
        } catch (err) {
            UseToast('Failed to move item to wishlist', 'error');
        }
    };

    const handleOpenAddressModal = (addressId = null) => {
        if (addressId !== null) {
            const address = addresses.find(addr => addr.addressId === addressId);
            if (address) {
                setCurrentAddressId(addressId);
                setAddressType(address.address_type);
                setAddressLine1(address.address_line1);
                setAddressLine2(address.address_line2);
                setCity(address.city);
                setPincode(address.pincode);
                setState(address.state);
                setCountry(address.country);
                setPhoneNumber(address.phoneNumber);
            }
        } else {
            setCurrentAddressId(null);
            setAddressType('Home');
            setAddressLine1('');
            setAddressLine2('');
            setCity('');
            setPincode('');
            setState('');
            setCountry('');
            setPhoneNumber('');
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

    const calculateSubtotal = (items) => {
        if (!items || items.length === 0) {
            console.log("No items to calculate subtotal");
            return 0;
        }
        
        const total = items.reduce((total, item) => {
            const minQty = item.min_quantity || 1;
            const itemTotal = (item.price || 0) * (item.quantity * minQty);
            console.log(`Item: ${item.name}, Price: ${item.price}, Qty: ${item.quantity}, Min Qty: ${minQty}, Item Total: ${itemTotal}`);
            return total + itemTotal;
        }, 0);
        
        console.log("Calculated subtotal:", total);
        return total;
    };

    const handleCheckout = async () => {
        console.log("Selected Address ID: ", selectedAddressId);
        if (!selectedAddressId) {
            UseToast('Please select an address', 'error');
            return;
        }

        if (cartItems.length === 0) {
            UseToast('Your cart is empty', 'error');
            return;
        }

        setLoading(true);
        try {
            // Prepare the order data for the backend
            const orderData = {
                user_id: userId,
                cart_items: cartItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
                address_id: selectedAddressId,
                total_amount: parseFloat(calculateGrandTotal()),
                payment_type: paymentMode,
            };

            if (paymentMode === 'online') {
                console.log("Payment Mode: ", paymentMode);
                console.log("Window Razorpay:", typeof window.Razorpay);
                console.log("Environment variables:", {
                    REACT_APP_RAZORPAY_KEY_ID: process.env.REACT_APP_RAZORPAY_KEY_ID,
                    NODE_ENV: process.env.NODE_ENV
                });
                
                // Check if Razorpay is available
                if (typeof window.Razorpay === 'undefined') {
                    UseToast('Razorpay is not loaded. Please refresh the page.', 'error');
                    return;
                }

                // Check if user data is available
                if (!userData) {
                    UseToast('User data not available. Please refresh the page.', 'error');
                    return;
                }

                // Create the order and get the Razorpay payment details
                const response = await axios.post('/user/place-order', orderData);
                const { order_id, payment_id, amount, currency, address_id } = response.data;

                console.log("Razorpay Key:", process.env.REACT_APP_RAZORPAY_KEY_ID);
                console.log("Payment Response:", response.data);

                // Validate required data
                if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
                    UseToast('Razorpay key is not configured.', 'error');
                    return;
                }

                if (!payment_id || !amount || !currency) {
                    UseToast('Invalid payment details received from server.', 'error');
                    return;
                }

                // Get selected address for Razorpay
                const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);

                console.log("UserData for Razorpay", userData)

                let address_resp = await axios.get(`/user/address/${userId}/${address_id}`)
                address_resp = address_resp.data;
                
                // Razorpay payment options
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                    amount: amount,
                    currency: currency,
                    name: 'greenvy',
                    description: 'Order Payment',
                    order_id: payment_id,
                    handler: async function (response) {
                        console.log("Payment success:", response);
                        // Payment success callback
                        try {
                            await axios.post('/user/payment-success', { 
                                order_id: response.razorpay_order_id, 
                                payment_id: response.razorpay_payment_id, 
                                signature: response.razorpay_signature 
                            });
                            // Empty the user's cart after successful payment
                            await axios.post(`/user/empty-cart/${userId}`);
                            navigate('/order-status', { state: { status: 'success', message: 'Your order has been placed successfully!' } });
                        } catch (err) {
                            console.error("Payment verification error:", err);
                            await axios.post('/user/payment-failed', { 
                                order_id: response.razorpay_order_id 
                            });
                            UseToast('Payment verification failed. Please try again.', 'error');
                            navigate('/order-status', { state: { status: 'failed', message: 'Payment verification failed. Please try again.' } });
                        }
                    },
                    prefill: {
                        name: userData?.username || 'User',
                        email: userData?.email || '',
                        contact: address_resp['phone_number'],
                    },
                    notes: {
                        address: selectedAddress ? `${selectedAddress.address_line1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}` : 'User Address',
                    },
                    theme: {
                        color: '#3399cc',
                    },
                    modal: {
                        ondismiss: function() {
                            console.log("Payment modal dismissed");
                            UseToast('Payment cancelled by user', 'info');
                        }
                    }
                };

                try {
                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', function (response) {
                        console.log("Payment failed:", response);
                        navigate('/order-status', { state: { status: 'failed', message: 'Payment failed: ' + response.error.description } });
                    });
                    
                    console.log("Opening Razorpay modal...");
                    rzp.open();
                } catch (error) {
                    console.error("Razorpay initialization error:", error);
                    UseToast('Failed to initialize payment gateway', 'error');
                }
            } else {
                // Handle Cash on Delivery
                const response = await axios.post('/user/place-order', orderData);
                setOrderId(response.data.order_id);
                // Empty the user's cart after successful order placement
                await axios.post(`/user/empty-cart/${userId}`);
                navigate('/order-status', { state: { status: 'success', message: 'Your order has been placed successfully!' } });
                UseToast('Order placed successfully!', 'success');
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

    const handleAddressIdChange = async(e) => {
        setSelectedAddressId(e.target.value);
        setRadioValue(e.target.value);
        console.log("Selected Address ID: ", e.target.value);
        
        // Calculate additional cost using current cart items
        const currentSubtotal = calculateSubtotal(cartItems);
        console.log("Current subtotal for API call:", currentSubtotal);
        
        const cost_response = await axios.post('/user/additional-cost', null, {
            params: {
                user_id: userId,
                address_id: e.target.value,
                total_cost: currentSubtotal
            }
        });
        const { total_additional_cost } = cost_response.data;
        setAdditionalCost(total_additional_cost || 0);
        
        if (total_additional_cost === 0) {
            setIsFreeDeliveryModalOpen(true);
        }
    };

    const calculateGrandTotal = () => {
        return (subtotal + additionalCost).toFixed(2);
    };

    if (loading) {
        return <Loading />;
    }

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`/user/profile/${userId}`);
            setAddresses(response.data.address || []);
            setUserData(response.data); // Update user data when profile is refreshed
        } catch (err) {
            UseToast('Failed to fetch user profile', 'error');
        }
    };

    const handleCloseInfoPopup = () => {
        setIsPopupVisible(false);
        setTimeout(() => {
            setShowInfoPopup(false);
            onClose();
        }, 300);
    };

    return (
        <Box className="checkout-container">
            {showInfoPopup && (
                <Box className={`info-popup ${isPopupVisible ? 'fade-in' : 'fade-out'}`}>
                    <Flex justifyContent="space-between" alignItems="center">
                        <Text className="info-popup-title">
                            <FaInfoCircle /> Our Eco-Friendly Service!
                        </Text>
                        <Button onClick={handleCloseInfoPopup} className="info-popup-close">
                            <FaTimes />
                        </Button>
                    </Flex>
                    <Text className="info-popup-content">
                        🎁 <strong>Free Compostable Garbage Bag!</strong> 🎁<br />
                        With every order, we provide a free compostable garbage bag to help you manage waste sustainably.
                    </Text>
                    <Text className="info-popup-content">
                        ♻️ <strong>Recycle with Us!</strong> ♻️<br />
                        We collect plastic waste from you to recycle and reduce environmental impact. Help us make a difference by providing your plastic waste during delivery.
                    </Text>
                </Box>
            )}
            <Heading as="h2" size="xl" mb={6}>Checkout</Heading>
            <Box className="checkout-section">
                <Heading as="h3" size="lg" mb={4}>Select Address</Heading>
                <RadioGroup value={radioValue} onChange={(e) => handleAddressIdChange(e)}>
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
                                <Text>{address.phone_number}</Text>
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
                {cartItems.length === 0 ? (
                    <Text fontSize="lg" color="gray.500" textAlign="center" py={8}>
                        Your cart is empty. Please add some items to proceed with checkout.
                    </Text>
                ) : (
                    cartItems.map((item) => (
                        <Flex key={item.product_id} className="cart-item" p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                            <Image src={item.images[0]} alt={item.name} boxSize="100px" objectFit="cover" borderRadius="md" loading="lazy" />
                            <Box ml={4} flex="1">
                                <Text fontSize="xl" fontWeight="bold">{item.name}</Text>
                                <Text fontSize="lg" color="gray.500">₹{item.price} x {item.quantity * (item.min_quantity || 1)} = ₹{((item.price || 0) * (item.quantity * (item.min_quantity || 1))).toFixed(2)}</Text>
                                
                                {/* Quantity controls */}
                                <Flex justifyContent="flex-start" alignItems="left" mt={2} width="fit-content">
                                    <HStack spacing={4} alignItems="left">
                                        <HStack border='1px solid #25995C' borderRadius="5px">
                                            <Button
                                                onClick={() => handleDecreaseQuantity(item.product_id, item.quantity)}
                                                isLoading={loading}
                                                className="quantity-button"
                                                size="sm"
                                                _hover={{ backgroundColor: '#1e7a4d' }}
                                                transition="all 0.3s"
                                            >
                                                <FaMinus />
                                            </Button>
                                            <Text paddingLeft="10px" paddingRight="10px">{item.quantity}</Text>
                                            <Button
                                                onClick={() => handleIncreaseQuantity(item.product_id, item.quantity)}
                                                isLoading={loading}
                                                className="quantity-button"
                                                size="sm"
                                                _hover={{ backgroundColor: '#1e7a4d' }}
                                                transition="all 0.3s"
                                            >
                                                <FaPlus />
                                            </Button>
                                        </HStack>
                                        <Text>x {item.min_quantity || 1}</Text>
                                        <Button
                                            onClick={() => handleRemoveItem(item.product_id)}
                                            isLoading={loading}
                                            className="remove-button"
                                            size="sm"
                                            _hover={{ backgroundColor: 'red.700' }}
                                            transition="all 0.3s"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </HStack>
                                </Flex>
                            </Box>
                        </Flex>
                    ))
                )}
                <Flex justifyContent="space-between" alignItems="center" mt={6}>
                    <Text fontSize="2xl" fontWeight="bold">Subtotal:</Text>
                    <Text fontSize="2xl" fontWeight="bold">₹{parseFloat(subtotal).toFixed(2)}</Text>
                </Flex>
                {selectedAddressId && subtotal > 0 ? (
                    <>
                        {additionalCost > 0 && (
                            <Flex justifyContent="space-between" alignItems="center" mt={2}>
                                <Text fontSize="lg" fontWeight="bold">Additional Cost (Shipping + GST):</Text>
                                <Text fontSize="lg" fontWeight="bold">₹{parseFloat(additionalCost).toFixed(2)}</Text>
                            </Flex>
                        )}
                        <Flex justifyContent="space-between" alignItems="center" mt={2}>
                            <Text fontSize="2xl" fontWeight="bold">Grand Total:</Text>
                            <Text fontSize="2xl" fontWeight="bold">₹{calculateGrandTotal()}</Text>
                        </Flex>
                    </>
                ) : (
                    <Text fontSize="lg" fontWeight="bold" mt={2} color='red'>Please select an address to calculate shipping and taxes.</Text>
                )}
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
                    disabled={!selectedAddressId || !paymentMode || subtotal === 0 || cartItems.length === 0}
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
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                loading={loading}
                setLoading={setLoading}
            />
            {showModal && (
                <ConfirmationModal
                    message="Do you want to remove this item from the cart or move it to the wishlist?"
                    button1={{ label: 'Remove', onClick: handleConfirmRemove }}
                    button2={{ label: 'Move to Wishlist', onClick: handleMoveToWishlist }}
                    onClose={() => setShowModal(false)}
                />
            )}
            {isFreeDeliveryModalOpen && (
                <div className="custom-modal">
                    <div className="custom-modal-content">
                        <span className="custom-modal-close" onClick={() => setIsFreeDeliveryModalOpen(false)}>&times;</span>
                        <h2 style={{ color: '#25995C' }}><b>Hooray!</b></h2>
                        <Box width="100%">
                            <Text>You are eligible for free delivery!</Text>
                        </Box>
                        <Button className="settings-button" onClick={() => setIsFreeDeliveryModalOpen(false)}>
                            OK
                        </Button>
                    </div>
                </div>
            )}
            <Toaster />
        </Box>
    );
};

export default Checkout;
