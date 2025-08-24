import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Heading, Input, Stack, Text, Link, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from "../components/ui/toaster";
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';
import encrypt from '../utils/encrypt';
import config from '../config';

axios.defaults.baseURL = config.REACT_APP_BASEURL;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const UseToast = useCallback((title, type) => {
        try {
            toaster.create({
                title: title,
                type: type,
                duration: 2000,
            });
        } catch (error) {
            console.error('Toast error:', error);
        }
    }, []);

    useEffect(() => {
        if (location.state?.fromResetPassword) {
            UseToast('Password reset successful. Please login.', 'success');
        }
    }, [location.state, UseToast]);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (loading) return; // Prevent multiple submissions
        
        setLoading(true);
        try {
            const encrypted_password = encrypt(password);
            const response = await axios.post('/user/login', { 
                email, 
                password: encrypted_password 
            });
            
            // Check if component is still mounted before proceeding
            if (response.data && response.data.token) {
                login(response.data.token);
                // Use setTimeout to ensure state updates complete before navigation
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 100);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Login failed';
            UseToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <Box className="auth-container">
                <Heading className="auth-heading">Login</Heading>
                <form onSubmit={handleLogin}>
                    <Stack spacing={4}>
                        <Box>
                            <label className="auth-label" htmlFor="email">Email</label>
                            <Input 
                                className="auth-input" 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                disabled={loading}
                            />
                        </Box>
                        <Box>
                            <label className="auth-label" htmlFor="password">Password</label>
                            <Input 
                                className="auth-input" 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </Box>
                        <Button 
                            type="submit"
                            className="auth-button" 
                            disabled={loading}
                        >
                            {loading ? <Spinner size="sm" /> : 'Login'}
                        </Button>
                        <Text className="auth-text">
                            Don't have an account? <Link as={RouterLink} className="auth-link" to="/register">Register</Link>
                        </Text>
                        <Text className="auth-text">
                            Forgot your password? <Link as={RouterLink} className="auth-link" to="/forgot-password">Reset Password</Link>
                        </Text>
                    </Stack>
                </form>
            </Box>
            <Toaster />
        </div>
    );
};

export default Login;
