import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import SuccessTick from './SuccessTick';
import '../styles/OrderStatus.css';
import FailedCross from './FailedCross';

const OrderStatus = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { status, message } = location.state || { status: 'failed', message: 'Something went wrong!' };

    return (
        <Box className="order-status-container">
            {status === 'success' ? (
                <>
                    <SuccessTick />
                    <Heading as="h2" size="xl" mt={4}>Order Placed Successfully!</Heading>
                    <Text mt={2}>{message}</Text>
                </>
            ) : (
                <>
                    <FailedCross />
                    <Heading as="h2" size="xl" mt={4} color="red.500">Order Failed</Heading>
                    <Text mt={2}>{message}</Text>
                </>
            )}
            <Button mt={6} onClick={() => navigate('/')} backgroundColor="#25995C" color="white" _hover={{ backgroundColor: '#1e7a4d' }} transition="all 0.3s">
                Go to Home
            </Button>
        </Box>
    );
};

export default OrderStatus;
