import React, { useState } from 'react';
import { Box, Text, Input, Button, HStack } from '@chakra-ui/react';
import { Radio, RadioGroup } from './ui/radio';
import '../styles/AddressModal.css';
import {Toaster, toaster} from "../components/ui/toaster";
import axios from 'axios';
import Loading from './Loading';

const AddressModal = ({
    isOpen,
    onClose,
    setCurrentAddressId,
    addresses,
    setIsAddressModalOpen,
    fetchUserProfile,
    userId,
    currentAddressId,
    loading,
    setLoading
}) => {
    const [addressType, setAddressType] = useState('Home');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    if (!isOpen) return null;

    const UseToast = (title, type) => {
        toaster.create({
          title: title,
          type: type,
        });
      };

    const handleOpenAddressModal = (addressId = null) => {
        if (addressId !== null) {
            const address = addresses.find(addr => addr.addressId === addressId);
            setCurrentAddressId(addressId);
            setAddressType(address.address_type);
            setAddressLine1(address.address_line1);
            setAddressLine2(address.address_line2);
            setCity(address.city);
            setPincode(address.pincode);
            setState(address.state);
            setCountry(address.country);
            setPhoneNumber(address.phoneNumber.replace('+91', ''));
        } else {
            setCurrentAddressId(null);
            setAddressType('Home');
            setAddressLine1('');
            setAddressLine2('');
            setCity('');
            setPincode('');
            setState('');
            setCountry('');
            setPhoneNumber('');
        }
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async () => {
        if (!addressType || !addressLine1 || !city || !pincode || !state || !country || !phoneNumber) {
            UseToast('All fields are required', 'error');
            return;
        }
        setLoading(true);
        try {
            const address = {
                addressId: currentAddressId,
                address_type: addressType,
                address_line1: addressLine1,
                address_line2: addressLine2,
                city,
                pincode,
                state,
                country,
                phoneNumber: `+91${phoneNumber}`,
            };
            await axios.post(`/user/update-profile-details/add-or-update-address/${userId}`, address);
            fetchUserProfile(userId);
            UseToast('Address saved successfully', 'success');
            setIsAddressModalOpen(false);
        } catch (err) {
            UseToast('Failed to save address', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="custom-modal">
            <div className="custom-modal-content">
                <span className="custom-modal-close" onClick={onClose}>&times;</span>
                <h2 style={{ color: '#25995C' }}><b>{currentAddressId ? 'Edit Address' : 'Add Address'}</b></h2>
                <Box width="100%" >
                    <Text className="settings-label">Address Type</Text>
                    <RadioGroup defaultValue="Home" onChange={(e) => setAddressType(e.target.value)}>
                        <HStack gap="6" mb='10px'>
                            <Radio value="Home">Home</Radio>
                            <Radio value="Work">Work</Radio>
                        </HStack>
                    </RadioGroup>
                </Box>
                <Box width="100%">
                    <Text className="settings-label">Address Line 1</Text>
                    <Input className="settings-input" type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
                </Box>
                <Box width="100%">
                    <Text className="settings-label">Address Line 2</Text>
                    <Input className="settings-input" type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                </Box>
                <Box width="100%">
                    <Text className="settings-label">City</Text>
                    <Input className="settings-input" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                </Box>
                <Box width="100%">
                    <Text className="settings-label">Pincode</Text>
                    <Input className="settings-input" type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </Box>
                <Box width="100%">
                    <Text className="settings-label">State</Text>
                    <Input className="settings-input" type="text" value={state} onChange={(e) => setState(e.target.value)} />
                </Box>
                <Box width="100%">
                    <Text className="settings-label">Country</Text>
                    <Input className="settings-input" type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
                </Box>
                <Box width="100%">
                    <Text className="settings-label">Phone Number</Text>
                    <Input className="settings-input" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </Box>
                <Button className="settings-button" onClick={handleSaveAddress} disabled={loading}>
                    {loading ? <Loading /> : 'Save'}
                </Button>
            </div>
        </div>
    );
};

export default AddressModal;
