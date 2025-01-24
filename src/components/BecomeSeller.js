import React, { useState } from 'react';
import { Box, Heading, Input, Textarea, Button, VStack, Text } from '@chakra-ui/react';
import { Toaster, toaster } from './ui/toaster';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import '../styles/BecomeSeller.css';

const BecomeSeller = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const UseToast = (title, type) => {
        toaster.create({
          title: title,
          type: type,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!name || !email || !businessName || !message) {
            UseToast('All fields are required', 'error');
            setLoading(false);
            return;
        }

        try {
            // Send the become a seller form data to the backend
            const response = await axios.post('/become-seller', null, { name, email, businessName, message });
            if (response.status !== 200) {
                throw new Error('Failed to send your request. Please try again later.');
            }
             if (response.status === 200) {
                UseToast('Your request has been sent successfully!', 'success');
                setName('');
                setEmail('');
                setBusinessName('');
                setMessage('');
            }
        } catch (err) {
            UseToast('Failed to send your request. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="contact-container">
            <Box className="contact-info">
                <Heading as="h2" size="xl" mb={4}>Become a Seller</Heading>
                <Text>Fill out the form below to become a seller on Greenvy.store</Text>
            </Box>
            <Box className="contact-form">
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align={{ base: "center", md: "start" }}>
                        <Input
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fontSize="1rem"
                            padding="15px"
                            borderRadius="10px"
                            transition="all 0.3s ease"
                            _hover={{ borderColor: "#25995C" }}
                            _focus={{ borderColor: "#25995C", boxShadow: "0 0 5px rgba(37, 153, 92, 0.5)" }}
                        />
                        <Input
                            placeholder="Your Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fontSize="1rem"
                            padding="15px"
                            borderRadius="10px"
                            transition="all 0.3s ease"
                            _hover={{ borderColor: "#25995C" }}
                            _focus={{ borderColor: "#25995C", boxShadow: "0 0 5px rgba(37, 153, 92, 0.5)" }}
                        />
                        <Input
                            placeholder="Business Name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            fontSize="1rem"
                            padding="15px"
                            borderRadius="10px"
                            transition="all 0.3s ease"
                            _hover={{ borderColor: "#25995C" }}
                            _focus={{ borderColor: "#25995C", boxShadow: "0 0 5px rgba(37, 153, 92, 0.5)" }}
                        />
                        <Textarea
                            placeholder="Tell us about your business"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            fontSize="1rem"
                            padding="15px"
                            borderRadius="10px"
                            transition="all 0.3s ease"
                            _hover={{ borderColor: "#25995C" }}
                            _focus={{ borderColor: "#25995C", boxShadow: "0 0 5px rgba(37, 153, 92, 0.5)" }}
                        />
                        <Button
                            type="submit"
                            isLoading={loading}
                            fontSize="0.8rem"
                            padding="20px 25px"
                            backgroundColor="#25995C"
                            borderColor="#25995C"
                            borderRadius="20px"
                            transition="all 0.3s ease"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            _hover={{ backgroundColor: "#1e7d4e" }}
                        >
                            {loading ? <FaSpinner className="loading-icon" /> : 'Submit'}
                        </Button>
                    </VStack>
                </form>
            </Box>
            <Toaster />
        </Box>
    );
};

export default BecomeSeller;
