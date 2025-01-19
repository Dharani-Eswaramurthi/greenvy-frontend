import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Heading, Input, Stack, Text, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from "../components/ui/toaster";
import '../styles/Auth.css';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL;

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const UseToast = (title, type) => {
        toaster.create({
            title: title,
            type: type,
            duration: 2000,
        });
    };

    const handleForgotPassword = async () => {
        setLoading(true);
        try {
            await axios.post('/user/forgot-password', { email });
            UseToast('Password reset link sent to your email.', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Failed to send password reset link';
            UseToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <Box className="auth-container">
                <Heading className="auth-heading">Forgot Password</Heading>
                <Stack spacing={4}>
                    <Box>
                        <label className="auth-label" htmlFor="email">Email</label>
                        <Input className="auth-input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Box>
                    <Button className="auth-button" onClick={handleForgotPassword} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
                    </Button>
                </Stack>
            </Box>
            <Toaster />
        </div>
    );
};

export default ForgotPassword;
