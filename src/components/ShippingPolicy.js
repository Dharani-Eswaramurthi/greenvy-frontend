import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const ShippingPolicy = () => {
    return (
        <Box p={8}>
            <Heading as="h1" size="xl" mb={4}>Shipping Policy</Heading>
            <Text mb={4}>
                For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only. For domestic buyers, orders are shipped through registered domestic courier companies and/or speed post only.
            </Text>
            <Text mb={4}>
                Orders are shipped within 1-2 days or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms. Greenvy Team is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 1-2 days from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
            </Text>
            <Text mb={4}>
                Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration. For any issues in utilizing our services you may contact our helpdesk on 9655612306 or contact@greenvy.store.
            </Text>
        </Box>
    );
};

export default ShippingPolicy;
