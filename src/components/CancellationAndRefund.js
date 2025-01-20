import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const CancellationAndRefund = () => {
    return (
        <Box p={8}>
            <Heading as="h1" size="xl" mb={4}>Cancellation and Refund Policy</Heading>
            <Text mb={4}>
                Greenvy Team believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
            </Text>
            <Text mb={4}>
                Cancellations will be considered only if the request is made within 1-2 days of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
            </Text>
            <Text mb={4}>
                Greenvy Team does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
            </Text>
            <Text mb={4}>
                In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 1-2 days of receipt of the products.
            </Text>
            <Text mb={4}>
                In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 1-2 days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
            </Text>
            <Text mb={4}>
                In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
            </Text>
            <Text mb={4}>
                In case of any Refunds approved by the Greenvy Team, it’ll take 3-5 days for the refund to be processed to the end customer.
            </Text>
            <Text mb={4}>
                This cancellation and refund policy is from Razorpay and may be revised in the future.
            </Text>
        </Box>
    );
};

export default CancellationAndRefund;
