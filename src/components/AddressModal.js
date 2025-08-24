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
    setIsAddressModalOpen,
    fetchUserProfile,
    userId,
    currentAddressId,
    addressType,
    setAddressType,
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    city,
    setCity,
    pincode,
    setPincode,
    state,
    setState,
    country,
    setCountry,
    loading,
    setLoading,
    phoneNumber,
    setPhoneNumber
}) => {

    if (!isOpen) return null;

    const UseToast = (title, type) => {
        toaster.create({
          title: title,
          type: type,
        });
      };



    const handleSaveAddress = async () => {
        if (!addressType || !addressLine1 || !city || !pincode || !state || !country) {
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
                phone_number: phoneNumber
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
                    <RadioGroup value={addressType} onChange={(e) => setAddressType(e.target.value)}>
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
                    <Text className="settings-label">Phonenumber</Text>
                    <Input className="settings-input" type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </Box>
                <Button className="settings-button" onClick={handleSaveAddress} disabled={loading}>
                    {loading ? <Loading /> : 'Save'}
                </Button>
            </div>
        </div>
    );
};

export default AddressModal;
