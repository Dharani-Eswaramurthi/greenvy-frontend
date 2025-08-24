import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Heading, Input, Stack, Text, Link, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from "../components/ui/toaster";
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';
import encrypt from '../utils/encrypt';

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_BASEURL || "https://api.greenvy.store";

// Add request interceptor for debugging
axios.interceptors.request.use(
  (requestConfig) => {
    console.log('API Request:', {
      url: requestConfig.url,
      method: requestConfig.method,
      baseURL: requestConfig.baseURL,
      data: requestConfig.data
    });
    return requestConfig;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    return Promise.reject(error);
  }
);

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
        
        if (loading) return;
        
        // Validate inputs
        if (!email || !password) {
            UseToast('Please fill in all fields', 'error');
            return;
        }

        // Validate configuration
        if (!process.env.REACT_APP_BASEURL) {
            UseToast('Configuration error: Missing API URL', 'error');
            return;
        }

        setLoading(true);
        
        try {
            console.log('Starting login process...');
            console.log('Config:', {
                baseURL: process.env.REACT_APP_BASEURL || "https://api.greenvy.store",
                hasSecretKey: !!process.env.REACT_APP_SECRET_KEY,
                hasIV: !!process.env.REACT_APP_IV
            });

            const encrypted_password = encrypt(password);
            console.log('Password encrypted successfully');
            
            const response = await axios.post('/user/login', { 
                email, 
                password: encrypted_password 
            });
            
            console.log('Login response received:', response.data);
            
            if (response.data && response.data.token) {
                login(response.data.token);
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 100);
            } else {
                UseToast('Invalid response from server', 'error');
            }
        } catch (err) {
            console.error('Login error details:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                config: err.config
            });
            
            let errorMessage = 'Login failed';
            
            if (err.response) {
                // Server responded with error
                errorMessage = err.response.data?.detail || `Server error: ${err.response.status}`;
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = 'Network error: No response from server';
            } else {
                // Something else happened
                errorMessage = err.message || 'Unknown error occurred';
            }
            
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
