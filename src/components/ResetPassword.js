import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Heading, Input, Stack, Text, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from "../components/ui/toaster";
import '../styles/Auth.css';
import encrypt from '../utils/encrypt';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const UseToast = (title, type) => {
        toaster.create({
            title: title,
            type: type,
            duration: 2000,
        });
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            UseToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const encrypted_password = encrypt(newPassword);
            await axios.post('/user/reset-password', encrypted_password, {
                params: {
                    token: token,
                    new_password: encrypted_password
                }
            });
            UseToast('Password reset successfully.', 'success');
            navigate('/login');
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
                <Stack spacing={4}>
                    <Box>
                        <label className="auth-label" htmlFor="newPassword">New Password</label>
                        <Input className="auth-input" id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </Box>
                    <Box>
                        <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                        <Input className="auth-input" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </Box>
                    <Button className="auth-button" onClick={handleResetPassword} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Reset Password'}
                    </Button>
                </Stack>
            </Box>
            <Toaster />
        </div>
    );
};

export default ResetPassword;
