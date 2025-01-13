import React, { useState } from 'react';
import { Box, Heading, Input, Textarea, Button, VStack, Text } from '@chakra-ui/react';
import { FaSpinner } from 'react-icons/fa';
import '../styles/BecomeSeller.css';

const BecomeSeller = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!name || !email || !businessName || !message) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            // Send the become a seller form data to the backend
            // await axios.post('/become-seller', { name, email, businessName, message });
            setSuccess('Your request has been sent successfully!');
            setName('');
            setEmail('');
            setBusinessName('');
            setMessage('');
        } catch (err) {
            setError('Failed to send your request. Please try again later.');
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
                        />
                        <Input
                            placeholder="Your Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fontSize="1rem"
                            padding="15px"
                            borderRadius="10px"
                        />
                        <Input
                            placeholder="Business Name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            fontSize="1rem"
                            padding="15px"
                            borderRadius="10px"
                        />
                        <Textarea
                            placeholder="Tell us about your business"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            fontSize="1rem"
                            padding="15px"
                            borderRadius="10px"
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
                        >
                            {loading ? <FaSpinner className="loading-icon" /> : 'Submit'}
                        </Button>
                        {error && <Text color="red.500" mt={4}>{error}</Text>}
                        {success && <Text color="green.500" mt={4}>{success}</Text>}
                    </VStack>
                </form>
            </Box>
        </Box>
    );
};

export default BecomeSeller;
