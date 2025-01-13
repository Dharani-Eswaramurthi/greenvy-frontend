import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Heading, Text, Stack, Flex, Image, Button } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Group } from "@chakra-ui/react";
import { FaTimes } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal';
import Loading from './Loading';
import {
  StepsCompletedContent,
  StepsContent,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
  StepsRoot,
} from "../components/ui/steps";
import '../styles/Orders.css';

const Orders = () => {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/404');
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/user/orders/${userId}`);
                const ordersWithProductDetails = await Promise.all(response.data.map(async (order) => {
                    const cartItemsWithDetails = await Promise.all(order.cart_items.map(async (item) => {
                        const productResponse = await axios.get(`/product/${item.product_id}`);
                        return {
                            ...item,
                            product: productResponse.data,
                        };
                    }));
                    return {
                        ...order,
                        cart_items: cartItemsWithDetails,
                    };
                }));
                setOrders(ordersWithProductDetails);
                setError('');
            } catch (err) {
                setError('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, userId, navigate]);

    const getOrderStatusSteps = (status) => {
        const steps = [
            { label: 'Order Placed', description: 'Your order has been placed.' },
            { label: 'In Transit', description: 'Your order is on the way.' },
            { label: 'Out for Delivery', description: 'Your order is out for delivery.' },
            { label: 'Delivered', description: 'Your order has been delivered.' },
        ];

        const currentStep = steps.findIndex(step => step.label === status);
        return { steps, currentStep: currentStep === -1 ? 0 : currentStep };
    };

    const handleCancelOrder = async (orderId) => {
        setLoading(true);
        try {
            await axios.post(`/user/cancel-order/${orderId}`);
            setOrders(orders.map(order => order.order_id === orderId ? { ...order, order_status: 'Cancelled' } : order));
            setError('');
        } catch (err) {
            setError('Failed to cancel order');
        } finally {
            setLoading(false);
            setShowConfirmationModal(false);
        }
    };

    const openConfirmationModal = (orderId) => {
        setOrderToCancel(orderId);
        setShowConfirmationModal(true);
    };

    const closeConfirmationModal = () => {
        setShowConfirmationModal(false);
        setOrderToCancel(null);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Text color="red.500">{error}</Text>;
    }

    return (
        <div className='parent-orders'>
        <Box className="orders-container" p={4}>
            <Heading as="h2" size="xl" mb={6} className='orders-heading'>My Orders</Heading>
            {orders.length === 0 ? (
                <Text>No orders found</Text>
            ) : (
                <Stack spacing={8}>
                    {orders.map((order) => {
                        const { steps, currentStep } = getOrderStatusSteps(order.order_status);
                        const isDefinedStatus = steps.some(step => step.label === order.order_status);
                        return (
                            <Box key={order.order_id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
                                <Heading as="h3" size="md" mb={4}>Order ID: {order.order_id}</Heading>
                                <Stack spacing={4}>
                                    {order.cart_items.map((item, index) => (
                                        <Flex key={index} justifyContent="space-between" alignItems="center" flexDirection={{ base: 'column', md: 'row' }}>
                                            <Image src={item.product.images[0]} alt={item.product.name} boxSize="100px" objectFit="cover" borderRadius="md" />
                                            <Box ml={{ base: 0, md: 4 }} mt={{ base: 4, md: 0 }} textAlign={{ base: 'center', md: 'left' }}>
                                                <Text fontWeight="bold">{item.product.name}</Text>
                                                <Text>Quantity: {item.quantity}</Text>
                                                <Text>Price: ₹{item.product.price}</Text>
                                            </Box>
                                        </Flex>
                                    ))}
                                </Stack>
                                <Text fontWeight="bold" fontSize="lg" mt={4}>Total Amount: ₹{order.total_amount}</Text>
                                {isDefinedStatus ? (
                                    <>
                                        {/* Mobile view */}
                                        <Box display={{ base: 'block', md: 'none' }}>
                                            <StepsRoot step={currentStep} count={steps.length - 1} colorPalette={'green'} size={{ base: 'xs', md: 'md' }}>
                                                <StepsList>
                                                    {steps.map((step, index) => (
                                                        index < steps.length - 1 &&
                                                        <StepsItem key={index} index={index} title={step.label} />
                                                    ))}
                                                </StepsList>
                                            </StepsRoot>
                                            <StepsRoot step={currentStep} count={steps.length - 1} colorPalette={'green'} size={{ base: 'xs', md: 'md' }}>
                                                <StepsList>
                                                    {steps.map((step, index) => (
                                                        index === steps.length - 1 &&
                                                        <StepsItem key={index} index={index} title={step.label} />
                                                    ))}
                                                </StepsList>
                                                {steps.map((step, index) => (
                                                    <StepsContent key={index} index={index}>
                                                        <Text fontWeight="bold">{step.label}</Text>
                                                        <Text>{step.description}</Text>
                                                    </StepsContent>
                                                ))}
                                            </StepsRoot>
                                        </Box>
                                        {/* Desktop view */}
                                        <Box display={{ base: 'none', md: 'block' }}>
                                            <StepsRoot step={currentStep} count={steps.length - 1} colorPalette={'green'} size={{ base: 'xs', md: 'md' }}>
                                                <StepsList>
                                                    {steps.map((step, index) => (
                                                        <StepsItem key={index} index={index} title={step.label} />
                                                    ))}
                                                </StepsList>
                                                {steps.map((step, index) => (
                                                    <StepsContent key={index} index={index}>
                                                        <Text fontWeight="bold">{step.label}</Text>
                                                        <Text>{step.description}</Text>
                                                    </StepsContent>
                                                ))}
                                            </StepsRoot>
                                        </Box>
                                    </>
                                ) : (
                                    <Flex alignItems="center" mt={4}>
                                        <FaTimes color="red" />
                                        <Text ml={2} fontWeight="bold">{order.order_status}</Text>
                                    </Flex>
                                )}
                                {order.order_status !== 'Cancelled' && (
                                    <Button mt={4} colorScheme="red" onClick={() => openConfirmationModal(order.order_id)}>
                                        Cancel Order
                                    </Button>
                                )}
                            </Box>
                        );
                    })}
                </Stack>
            )}
            {showConfirmationModal && (
                <ConfirmationModal
                    message="Are you sure you want to cancel this order?"
                    button1={{ label: 'Yes', onClick: () => handleCancelOrder(orderToCancel) }}
                    button2={{ label: 'No', onClick: closeConfirmationModal }}
                    onClose={closeConfirmationModal}
                />
            )}
        </Box>
        </div>
    );
};

export default Orders;
