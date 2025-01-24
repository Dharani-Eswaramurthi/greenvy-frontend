import React, { useState } from 'react';
import { Box, Input, Button, Textarea, Heading, Text, VStack, HStack } from '@chakra-ui/react';
import { Toaster, toaster } from '../components/ui/toaster';
import { FaEnvelope, FaPhone, FaHome, FaSpinner } from 'react-icons/fa';
import emailjs from 'emailjs-com';
import '../styles/ContactUs.css';
import PlantIcon from '../utils/PlantIcon';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const UseToast = (title, type) => {
    toaster.create({
      title: title,
      type: type,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const templateParams = {
      type: "Contact",
      template: `Contact name: ${name}\nContact email: ${email}\nContact message: ${message}`
    };
    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_USER_ID
      );
      UseToast("Your seed is now sowed! We'll get back to you with its progress!", 'success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      UseToast("An error occurred. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="contact-container" fontFamily="Vijaya">
      <Box className="contact-info">
        <Heading as="h2" size="xl" mb={4}>Contact Us</Heading>
        <VStack align={{ base: "center", md: "start" }}>
          <HStack>
            <a href="mailto:contact@greenvy.store" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', gap: '20px' }}>
            <FaEnvelope />contact@greenvy.store</a>
          </HStack>
          <HStack gap="20px">
          <a href="tel:+919655612306" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', gap: '20px' }}>
            <FaPhone />+91 96556 12306</a>
          </HStack>
          <HStack justifyContent="center" gap="20px" fontSize='1.5rem'>
            <FaHome />Coimbatore, Tamil Nadu, India
          </HStack>
          <Text>We are here to help you with any questions or concerns you may have about our eco-friendly and sustainable products. Feel free to reach out to us!</Text>
        </VStack>
      </Box>
      <Box className="contact-form">
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align={{ base: "center", md: "start" }}>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fontFamily="Vijaya"
              fontSize="1.5rem"
              padding="15px"
              borderRadius="10px"
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fontFamily="Vijaya"
              fontSize="1.5rem"
              padding="15px"
              borderRadius="10px"
            />
            <Textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              fontFamily="Vijaya"
              fontSize="1.5rem"
              padding="15px"
              borderRadius="10px"
            />
            <Button
              type="submit"
              isLoading={loading}
              fontFamily="Vijaya"
              fontSize="1.2rem"
              padding="20px 25px"
              backgroundColor="#4CAF50"
              borderColor="#4CAF50"
              borderRadius="20px"
              transition="all 0.3s ease"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {loading ? <FaSpinner className="loading-icon" /> : <><PlantIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} color="#ffffff" /> Plant Your Seed</>}
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default Contact;
