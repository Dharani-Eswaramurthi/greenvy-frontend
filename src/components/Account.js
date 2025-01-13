import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Input, Stack, Text, Image, HStack, Flex, Heading, SimpleGrid, IconButton } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { FiEdit, FiTrash, FiLogOut, FiCheck, FiPlus } from 'react-icons/fi';
import { Radio, RadioGroup } from "../components/ui/radio";
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import getCroppedImg from '../utils/cropImage';
import Loading from './Loading';
import '../styles/Account.css'; // Import the CSS file
import userLogo from "../assets/user.png"

axios.defaults.baseURL = process.env.REACT_BASEURL;

Modal.setAppElement('#root'); // Ensure accessibility

const Account = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Set initial loading state to true
    const [userId, setUserId] = useState('');
    const [editField, setEditField] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [currentAddressId, setCurrentAddressId] = useState(null);
    const [addressType, setAddressType] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [fullImage, setFullImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/404');
            return;
        }
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setUserId(decodedToken.user_id);
            fetchUserProfile(decodedToken.user_id);
        }
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`/user/profile/${userId}`);
            if(response.data.profile_image){
                setFullImage(response.data.profile_image);
                setCroppedAreaPixels(JSON.parse(response.data.profile_image_crop));

                const imageResponse = await fetch(response.data.profile_image);
                const imageBlob = await imageResponse.blob();
                const imageObjectURL = URL.createObjectURL(imageBlob);

                const croppedImage = await getCroppedImg(imageObjectURL, JSON.parse(response.data.profile_image_crop));
                setProfileImage(croppedImage);
            } else {
                setProfileImage(null);
                setFullImage(null);
            }
            setUsername(response.data.username);
            setEmail(response.data.email);
            setAddresses(response.data.address || []);
        } catch (err) {
            console.log(err);
            setError('Failed to fetch user profile');
        } finally {
            setLoading(false); // Set loading to false after API call is complete
        }
    };

    const handleUpdateProfileDetails = async (field) => {
        setLoading(true);
        try {
            const updateData = {};
            if (field === 'username') {
                updateData.username = username;
            } else if (field === 'email') {
                updateData.email = email;
            }
            await axios.post(`/user/update-profile-details/${userId}`, updateData);
            setError('');
            setEditField(null);
        } catch (err) {
            setError('Failed to update profile details');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProfileImage = async (e) => {
        const file = e.target.files[0];
        setFullImage(file); // Set fullImage to the uploaded file
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleEditProfileImage = () => {
        setImageSrc(fullImage);
        setIsCropModalOpen(true);
    };

    const handleDeleteProfileImage = async () => {
        setLoading(true);
        try {
            await axios.post(`/user/delete-profile-image/${userId}`);
            setProfileImage(null);
            setFullImage(null);
            setError('');
        } catch (err) {
            setError('Failed to delete profile image');
        } finally {
            setLoading(false);
        }
    };

    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSaveCroppedImage = async () => {
        setLoading(true);
        try {

            const formData = new FormData();
            if(typeof fullImage === 'string') {
            formData.append('profile_image_crop', JSON.stringify(croppedAreaPixels));
            } else {
                formData.append('profile_image_crop', JSON.stringify(croppedAreaPixels));
                formData.append('profile_image', fullImage);
            }

            const response = await axios.post(`/user/upload-profile-image/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFullImage(response.data.profile_image_url);
            setCroppedAreaPixels(JSON.parse(response.data.profile_image_crop));

            const imageResponse = await fetch(response.data.profile_image_url);
            const imageBlob = await imageResponse.blob();
            const imageObjectURL = URL.createObjectURL(imageBlob);

            const croppedImageref = await getCroppedImg(imageObjectURL, JSON.parse(response.data.profile_image_crop));
            setProfileImage(croppedImageref);
            setError('');
            setIsCropModalOpen(false);
        } catch (err) {
            setError('Failed to upload profile image');
        } finally {
            setLoading(false);
        }
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
        } else {
            setCurrentAddressId(null);
            setAddressType('Home');
            setAddressLine1('');
            setAddressLine2('');
            setCity('');
            setPincode('');
            setState('');
            setCountry('');
        }
        setIsAddressModalOpen(true);
    };

    const handleCloseAddressModal = () => {
        setIsAddressModalOpen(false);
    };

    const handleSaveAddress = async () => {
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
            };
            await axios.post(`/user/update-profile-details/add-or-update-address/${userId}`, address);
            fetchUserProfile(userId);
            setError('');
            setIsAddressModalOpen(false);
        } catch (err) {
            setError('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        const confirmed = window.confirm('Are you sure you want to delete this address?');
        if (!confirmed) return;

        setLoading(true);
        try {
            await axios.post(`/user/update-profile-details/delete-address/${userId}`, null, {
                params: { addressId }
            });
            fetchUserProfile(userId);
            setError('');
        } catch (err) {
            setError('Failed to delete address');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated){
        navigate('/404');
        return;
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <div style={{ paddingLeft: '4rem', paddingRight: '4rem' }}>
            <Stack spacing={4} p={4} className="settings-container">
                <Heading as="h1" size="xl" mb={6} className="settings-heading">Account Settings</Heading>

                <Flex mb={6}>
                    <Box className="settings-profile-image" mr={4}>
                        {profileImage ? (
                            <>
                                <Image src={profileImage} alt="Profile" boxSize="100px" />
                                <HStack>
                                    <Button className="settings-icon-button" onClick={handleEditProfileImage}>
                                        <FiEdit />
                                    </Button>
                                    <Button className="settings-icon-button" onClick={handleDeleteProfileImage}>
                                        <FiTrash />
                                    </Button>
                                </HStack>
                            </>
                        ) : (
                            <Image src={userLogo} alt="Profile" boxSize="100px"/>
                        )}
                        <label htmlFor="profileImageUpload">Upload Image</label>
                        <Input id="profileImageUpload" type="file" onChange={handleUploadProfileImage} />
                    </Box>
                    <Box ml={4}>
                        <Text className="settings-label">Username</Text>
                        {editField === 'username' ? (
                            <HStack alignItems="center" position="relative">
                                <Input className="settings-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                                <Button
                                    className="settings-icon-button"
                                    onClick={() => handleUpdateProfileDetails('username')}
                                    position="absolute"
                                    top="0"
                                    right="0"
                                    borderRadius="0 5px 5px 0"
                                >
                                    <FiCheck />
                                </Button>
                            </HStack>
                        ) : (
                            <HStack alignItems="center">
                                <Text width='fit-content'>{username}</Text>
                                <Button className="settings-icon-button" onClick={() => setEditField('username')}>
                                    <FiEdit />
                                </Button>
                            </HStack>
                        )}
                        <Text className="settings-label">Email</Text>
                        {editField === 'email' ? (
                        <HStack alignItems="center" position="relative">
                            <Input className="settings-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <Button
                                className="settings-icon-button"
                                onClick={() => handleUpdateProfileDetails('email')}
                                position="absolute"
                                top="0"
                                right="0"
                                borderRadius="0 5px 5px 0"
                            >
                                <FiCheck />
                            </Button>
                        </HStack>
                    ) : (
                        <HStack alignItems="center">
                            <Text width='fit-content'>{email}</Text>
                            <Button className="settings-icon-button" onClick={() => setEditField('email')}>
                                <FiEdit />
                            </Button>
                        </HStack>
                    )}
                    </Box>
                </Flex>

                <Box width="100%">
                    <Text className='settings-label'>Addresses</Text>
                    <SimpleGrid columns={[1, 2, 3, 4]} spacing={10} gap='20px'>
                        {addresses.map(address => (
                            <Box key={address.addressId} className="address-box">
                                <Text><b>{address.address_type}</b></Text>
                                <Text>{address.address_line1}</Text>
                                <Text>{address.address_line2}</Text>
                                <Text>{address.city}</Text>
                                <Text>{address.pincode}</Text>
                                <Text>{address.state}</Text>
                                <Text>{address.country}</Text>
                                <div className="address-actions">
                                    <Button className="settings-icon-button" onClick={() => handleOpenAddressModal(address.addressId)}>
                                        <FiEdit />
                                    </Button>
                                    <Button className="settings-icon-button" onClick={() => handleDeleteAddress(address.addressId)}>
                                        <FiTrash />
                                    </Button>
                                </div>
                            </Box>
                        ))}
                        <Box
                            className="address-box"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            onClick={() => handleOpenAddressModal()}
                            border="1px dashed #25995C"
                        >
                            <FiPlus color='#25995C' size="24px" />
                        </Box>
                    </SimpleGrid>
                </Box>

                {error && <Text className="settings-error">{error}</Text>}

            </Stack>

            {isAddressModalOpen && (
                <div className="custom-modal">
                    <div className="custom-modal-content">
                        <span className="custom-modal-close" onClick={handleCloseAddressModal}>&times;</span>
                        <h2>{currentAddressId ? 'Edit Address' : 'Add Address'}</h2>
                        <Box width="100%">
                            <Text className="settings-label">Address Type</Text>
                            <RadioGroup defaultValue="Home" onChange={(e) => setAddressType(e.target.value)}>
                                <HStack gap="6">
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
                        <Button className="settings-button" onClick={handleSaveAddress} disabled={loading}>
                            {loading ? <Loading /> : 'Save'}
                        </Button>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isCropModalOpen}
                onRequestClose={() => setIsCropModalOpen(false)}
                contentLabel="Crop Image"
                className="crop-modal"
                overlayClassName="crop-modal-overlay"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000 // Ensure it appears above other content
                    },
                    content: {
                        position: 'relative',
                        inset: 'auto',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        backgroundColor: 'white',
                        margin: 'auto' // Center the modal
                    }
                }}
            >
                <div className="crop-container">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                    />
                </div>
                <Button className="settings-button" onClick={handleSaveCroppedImage} disabled={loading}>
                    {loading ? <Loading /> : 'Save'}
                </Button>
            </Modal>
        </div>
    );
};

export default Account;
