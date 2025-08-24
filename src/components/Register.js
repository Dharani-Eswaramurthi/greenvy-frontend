import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Box, Button, Heading, Input, Stack, Text, Link, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from '../components/ui/toaster';
import { Checkbox } from './ui/checkbox';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import encrypt from '../utils/encrypt';

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_BASEURL || "https://api.greenvy.store";

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [dateofbirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const navigate = useNavigate();

    const UseToast = useCallback((title, type) => {
        try {
            toaster.create({
                title: title,
                type: type
            });
        } catch (error) {
            console.error('Toast error:', error);
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (loading) return;
        
        if (!acceptedTerms) {
            UseToast('You must accept the terms, conditions, and policies to register.', 'error');
            return;
        }

        // Validate inputs
        if (!email || !password || !dateofbirth || !gender) {
            UseToast('Please fill in all required fields', 'error');
            return;
        }

        // Validate configuration
        if (!process.env.REACT_APP_BASEURL) {
            process.env.REACT_APP_BASEURL = "https://api.greenvy.store"
        }

        setLoading(true);
        
        try {
            console.log('Starting registration process...');
            console.log('Config:', {
                baseURL: process.env.REACT_APP_BASEURL || "https://api.greenvy.store",
                hasSecretKey: !!process.env.REACT_APP_SECRET_KEY,
                hasIV: !!process.env.REACT_APP_IV
            });

            const encrypted_password = encrypt(password);
            console.log('Password encrypted successfully');
            
            const response = await axios.post('/user/register', { 
                email, 
                gender, 
                dateofbirth, 
                password: encrypted_password 
            });
            
            console.log('Registration response received:', response.data);
            
            if (response.data) {
                setTimeout(() => {
                    navigate('/verify', { replace: true });
                }, 100);
            } else {
                UseToast('Invalid response from server', 'error');
            }
        } catch (err) {
            console.error('Registration error details:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                config: err.config
            });
            
            let errorMessage = 'Registration failed';
            
            if (err.response) {
                errorMessage = err.response.data?.detail || `Server error: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = 'Network error: No response from server';
            } else {
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
                <Heading className="auth-heading">Register</Heading>
                <form onSubmit={handleRegister}>
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
                            <label className='auth-label' htmlFor='dateofbirth'>Date of Birth</label>
                            <Input 
                                className='auth-input' 
                                id='dateofbirth' 
                                type='date' 
                                value={dateofbirth} 
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required
                                autoComplete="bday"
                                disabled={loading}
                            />
                        </Box>
                        <Box>
                            <label className='auth-label' htmlFor='gender'>Gender</label>
                            <select 
                                className='auth-input' 
                                id='gender' 
                                value={gender} 
                                onChange={(e) => setGender(e.target.value)}
                                required
                                autoComplete="sex"
                                disabled={loading}
                            >
                                <option value=''>Select Gender</option>
                                <option value='male'>Male</option>
                                <option value='female'>Female</option>
                                <option value='other'>Other</option>
                            </select>
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
                                minLength={6}
                                autoComplete="new-password"
                                disabled={loading}
                            />
                        </Box>
                        <Checkbox 
                            checked={acceptedTerms}
                            onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                            required
                            disabled={loading}
                        >
                            By checking this, I accept the <Link as={RouterLink} to="/terms-and-conditions" className="auth-link">terms</Link>, <Link as={RouterLink} to="/privacy-policy" className="auth-link">conditions</Link>, and <Link as={RouterLink} to="/shipping-policy" className="auth-link">policies</Link>.
                        </Checkbox>
                        <Button 
                            type="submit"
                            className="auth-button" 
                            disabled={loading}
                        >
                            {loading ? <Spinner size="sm" /> : 'Register'}
                        </Button>
                        <Text className="auth-text">
                            Already have an account? <Link as={RouterLink} className="auth-link" to="/login">Login</Link>
                        </Text>
                    </Stack>
                </form>
            </Box>
            <Toaster />
        </div>
    );
};

export default Register;
