import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Heading, Input, Stack, Text, Link, Spinner } from '@chakra-ui/react';
import { Toaster, toaster } from '../components/ui/toaster';
import { Checkbox } from './ui/checkbox';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import encrypt from '../utils/encrypt';
import config from '../config';

axios.defaults.baseURL = config.REACT_APP_BASEURL;

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [dateofbirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const navigate = useNavigate();

    const UseToast = (title, type) => {
        toaster.create({
            title: title,
            type: type
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!acceptedTerms) {
            UseToast('You must accept the terms, conditions, and policies to register.', 'error');
            return;
        }

        setLoading(true);
        try {
            const encrypted_password = encrypt(password);
            const response = await axios.post('/user/register', { email, gender, dateofbirth, password: encrypted_password });
            console.log(response.data);
            navigate('/verify');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Registration failed';
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
                            />
                        </Box>
                        <Checkbox 
                            checked={acceptedTerms}
                            onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                            required
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
