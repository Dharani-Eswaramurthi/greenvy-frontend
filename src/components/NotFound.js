import React from 'react';
import { Box, Heading, Button, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import notFoundImage from '../assets/404.png'; // Add the path to your 404 PNG image

const NotFound = () => {
    return (
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '81vh' }} textAlign="center" py={10} px={6}>
            <Image src={notFoundImage} alt="404 Not Found" mb={4} />
            <Heading as="h2" size="2xl" mb={4} color="#25995C">
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
            </Heading>
            <Button backgroundColor="#25995C" color="white" _hover={{ backgroundColor: '#1e7a4d' }} as={Link} to="/">
                Go to Home
            </Button>
        </Box>
    );
};

export default NotFound;
