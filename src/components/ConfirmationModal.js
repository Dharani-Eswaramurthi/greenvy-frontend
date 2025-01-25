import React, { useState, useEffect } from 'react';
import { Box, Button, Text, Flex } from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ message, button1, button2, onClose }) => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsPopupVisible(true);
        }, 100); // Delay to ensure the initial render is complete
    }, []);

    const handleClose = () => {
        setIsPopupVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Match the CSS transition duration
    };

    return (
        <Box className="confirmation-modal-page">
            <Box className="confirmation-modal-overlay" onClick={handleClose}>
                <Box className={`confirmation-modal-content ${isPopupVisible ? 'fade-in' : 'fade-out'}`} onClick={(e) => e.stopPropagation()}>
                    <Flex justifyContent="space-between" alignItems="center">
                        <Text className="confirmation-modal-message">{message}</Text>
                        <Button className="confirmation-modal-close" onClick={handleClose}>
                            <FaTimes />
                        </Button>
                    </Flex>
                    <Flex className="confirmation-modal-buttons" justifyContent="flex-end">
                        <Button className="confirmation-modal-button" onClick={button1.onClick} backgroundColor="#25995C" color="white">
                            {button1.label}
                        </Button>
                        <Button className="confirmation-modal-button" onClick={button2.onClick} backgroundColor="white" color="#25995C" border="1px solid #25995C">
                            {button2.label}
                        </Button>
                    </Flex>
                </Box>
            </Box>
            {isPopupVisible && <Box className="confirmation-blur-background" />}
        </Box>
    );
};

export default ConfirmationModal;
