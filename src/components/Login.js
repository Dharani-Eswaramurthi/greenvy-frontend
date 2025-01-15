import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Heading, Input, Stack, Text, Link, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from "../components/ui/toaster";
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';
import encrypt from '../utils/encrypt';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const UseToast = (title, type) => {
        toaster.create({
            title: title,
            type: type,
            duration: 2000,
        });
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const encrypted_password = encrypt(password);
            const response = await axios.post('/user/login', { email, password: encrypted_password });
            login(response.data.token);
            UseToast("Login successful. Welcome back!", "success");
            // navigate to '/' after 2 seconds
            setTimeout(() => {
                navigate('/');
            }
            , 2000);
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
                <Stack spacing={4}>
                    <Box>
                        <label className="auth-label" htmlFor="email">Email</label>
                        <Input className="auth-input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Box>
                    <Box>
                        <label className="auth-label" htmlFor="password">Password</label>
                        <Input className="auth-input" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </Box>
                    <Button className="auth-button" onClick={handleLogin} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Login'}
                    </Button>
                    <Text className="auth-text">
                        Don't have an account? <Link as={RouterLink} className="auth-link" to="/register">Register</Link>
                    </Text>
                </Stack>
            </Box>
            <Toaster />
        </div>
    );
};

export default Login;
