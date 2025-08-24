import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Heading, Input, Stack, Text, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from "../components/ui/toaster";
import '../styles/Auth.css';
import encrypt from '../utils/encrypt';
import config from '../config';

axios.defaults.baseURL = config.REACT_APP_BASEURL;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
        let isMounted = true;
        
        const checkToken = async () => {
            try {
                const formData = new FormData();
                formData.append('token', token);
                await axios.post('/user/check-token', formData);
                
                if (isMounted) {
                    setTokenValid(true);
                }
            } catch (err) {
                if (isMounted) {
                    const errorMessage = err.response?.data?.detail || 'Invalid or expired token';
                    setError(errorMessage);
                    setTokenValid(false);
                }
            }
        };
        
        if (token) {
            checkToken();
        }
        
        return () => {
            isMounted = false;
        };
    }, [token]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (loading) return; // Prevent multiple submissions
        
        if (newPassword !== confirmPassword) {
            UseToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const encrypted_password = encrypt(newPassword);
            const formData = new FormData();
            formData.append('token', token);
            formData.append('new_password', encrypted_password);

            await axios.post('/user/reset-password', formData);
            UseToast('Password reset successfully.', 'success');
            
            // Use setTimeout to ensure state updates complete before navigation
            setTimeout(() => {
                navigate('/login', { 
                    state: { fromResetPassword: true },
                    replace: true 
                });
            }, 100);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Failed to reset password';
            UseToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <Box className="auth-container">
                <Heading className="auth-heading">Reset Password</Heading>
                {tokenValid ? (
                    <form onSubmit={handleResetPassword}>
                        <Stack spacing={4}>
                            <Box>
                                <label className="auth-label" htmlFor="newPassword">New Password</label>
                                <Input 
                                    className="auth-input" 
                                    id="newPassword" 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                            </Box>
                            <Box>
                                <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                                <Input 
                                    className="auth-input" 
                                    id="confirmPassword" 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                            </Box>
                            <Button 
                                type="submit"
                                className="auth-button" 
                                disabled={loading}
                            >
                                {loading ? <Spinner size="sm" /> : 'Reset Password'}
                            </Button>
                        </Stack>
                    </form>
                ) : (
                    <Text className="auth-text" color="red.500">{error}</Text>
                )}
            </Box>
            <Toaster />
        </div>
    );
};

export default ResetPassword;
