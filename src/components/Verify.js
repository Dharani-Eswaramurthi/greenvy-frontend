import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Heading, Input, Stack, Text, Link, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from "../components/ui/toaster";
import { Link as RouterLink } from 'react-router-dom';
import '../styles/Auth.css';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL || "https://api.greenvy.store";

const Verify = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        UseToast("Registration has been successful. Please verify using OTP to login.", "success");
    }, []);

    const UseToast = (title, type) => {
        toaster.create({
            title: title,
            type: type
        });
    };

    const handleVerify = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/user/verify?mail_or_phone=${email}&otp=${otp}`);
            UseToast("Verification successful. You have successfully verified your email.", "success");
            navigate('/login');
            // Handle successful verification (e.g., redirect to login)
            console.log(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Verification failed';
            UseToast("Your mail cannot be verified. Please try again.", "error");
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
                    </Box>
                    <Button className="auth-button" onClick={handleVerify} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Verify'}
                    </Button>
                    <Text className="auth-text">
                        Already verified? <Link as={RouterLink} className="auth-link" to="/login">Login</Link>
                    </Text>
                </Stack>
            </Box>
            <Toaster />
        </div>
    );
};

export default Verify;
