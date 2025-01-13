import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Heading, Input, Stack, Text, Link, Spinner } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import '../styles/Auth.css';

axios.defaults.baseURL = process.env.REACT_BASEURL;

const Verify = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/user/verify?email=${email}&otp=${otp}`);
            // Handle successful verification (e.g., redirect to login)
            console.log(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Verification failed';
            setError(Array.isArray(errorMessage) ? errorMessage.map(e => e.msg).join(', ') : errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <Box className="auth-container">
                <Heading className="auth-heading">Verify Email</Heading>
                <Stack spacing={4}>
                    <Box>
                        <label className="auth-label" htmlFor="email">Email</label>
                        <Input className="auth-input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Box>
                    <Box>
                        <label className="auth-label" htmlFor="otp">OTP</label>
                        <Input className="auth-input" id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        {error && <Text className="auth-error">{error}</Text>}
                    </Box>
                    <Button className="auth-button" onClick={handleVerify} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Verify'}
                    </Button>
                    <Text className="auth-text">
                        Already verified? <Link as={RouterLink} className="auth-link" to="/login">Login</Link>
                    </Text>
                </Stack>
            </Box>
        </div>
    );
};

export default Verify;
