import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Image, Text, Flex, Heading, Spinner, HStack, Button } from '@chakra-ui/react';
import { toaster } from './ui/toaster';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';
import '../styles/SellerProfile.css';
import CustomGrid from './CustomGrid';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL || "https://api.greenvy.store";

const SellerProfile = () => {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const { sellerId } = useParams();
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const navigate = useNavigate();

    const UseToast = (title, type) => {
        toaster.create({
            title: title,
            type: type,
        });
    };

    const renderStarsWithHalf = (rating) => {
            const stars = [];
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) {
                    stars.push(<FaStar key={i} color="#FFD700" />);
                } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                    stars.push(
                        <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                            <FaStar
                                color="#FFD700"
                                style={{
                                    position: 'absolute',
                                    clipPath: `polygon(0 0, ${((rating % 1) * 100).toFixed(2)}% 0, ${((rating % 1) * 100).toFixed(2)}% 100%, 0 100%)`,
                                }}
                            />
                            <FaStar
                                color="#D3D3D3"
                                style={{
                                    clipPath: `polygon(${((rating % 1) * 100).toFixed(2)}% 0, 100% 0, 100% 100%, ${((rating % 1) * 100).toFixed(2)}% 100%)`,
                                }}
                            />
                        </div>
                    );
                } else {
                    stars.push(<FaStar key={i} color="#D3D3D3" />);
                }
            }
            return stars;
        };

    useEffect(() => {
        const fetchSellerDetails = async () => {
            try {
                const response = await axios.get(`/seller/${sellerId}`);
                setSeller(response.data);
            } catch (err) {
                console.error('Failed to fetch seller details', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSellerDetails();
    }, [sellerId]);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (isAuthenticated) {
                try {
                    const response = await axios.get(`/user/wishlist/${userId}`);
                    setWishlist(response.data);
                } catch (err) {
                    console.error('Failed to fetch wishlist');
                }
            }
        };

        fetchWishlist();
    }, [isAuthenticated, userId]);

    const handleAddToWishlist = async (productId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setWishlistLoading(true);
        try {
            await axios.post('/user/add-to-wishlist', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                },
            });
            setWishlist((prevWishlist) => [...prevWishlist, productId]);
            UseToast('Added to wishlist', 'success');
        } catch (err) {
            UseToast('Failed to add to wishlist', 'error');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setWishlistLoading(true);
        try {
            await axios.post('/user/remove-from-wishlist', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                },
            });
            setWishlist((prevWishlist) => prevWishlist.filter((id) => id !== productId));
            UseToast('Removed from wishlist', 'success');
        } catch (err) {
            UseToast('Failed to remove from wishlist', 'error');
        } finally {
            setWishlistLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!seller) {
        return <Text color="red.500">Seller not found</Text>;
    }

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <Box className="seller-profile-container">
            <Flex mb={6} alignItems="center">
                <Image src={seller.seller_image || '/default-seller.png'} alt="Seller" boxSize="100px" borderRadius="full" />
                <Box ml={4}>
                    <Heading as="h1" size="xl" mb={2}>{seller.seller_name}</Heading>
                    <HStack gap={.5} mb={3}>{renderStarsWithHalf(seller.seller_rating)}</HStack>
                    <Text fontSize="lg" color="gray.500" dangerouslySetInnerHTML={{ __html: seller.seller_description }}></Text>
                </Box>
            </Flex>
            <Heading as="h2" size="lg" mb={4}>Products</Heading>
            <CustomGrid spacing={10}>
                {seller.products.map((product, index) => (
                    <Box
                        key={index}
                        className="product-details"
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="md"
                        gap={4}
                        position="relative"
                        _hover={{ boxShadow: 'xl' }}
                        onClick={() => handleProductClick(product.product_id)}
                        cursor="pointer"
                        display="flex"
                        flexDirection="column"
                    >
                        <Image src={product.images[0]} alt={product.name} boxSize="200px" objectFit="cover" borderRadius="md" />
                        <Box p={2} textAlign="left" width="100%">
                            <Text fontSize="xl" fontWeight="bold">{product.name}</Text>
                            <Text fontSize="lg" color="gray.500">₹{product.price}</Text>
                            <HStack gap={.5} justifyContent="left">{renderStarsWithHalf(product.overall_rating)}</HStack>
                            {isAuthenticated && <Button
                                aria-label="Add to wishlist"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    wishlist.includes(product.product_id) ? handleRemoveFromWishlist(product.product_id) : handleAddToWishlist(product.product_id);
                                }} 
                                bottom="20px"
                                right="10px"
                                position="absolute"
                                backgroundColor="transparent"
                                color={wishlist.includes(product.product_id) ? 'red.500' : 'black'}
                                _hover={{ color: wishlist.includes(product.product_id) ? 'red.700' : 'gray.700' }}
                                transition="all 0.3s"
                                isLoading={wishlistLoading}
                            >
                                {wishlist.includes(product.product_id) ? <FaHeart /> : <FaRegHeart color='#25995C' />}
                            </Button>}
                        </Box>
                    </Box>
                ))}
            </CustomGrid>
        </Box>
    );
};

export default SellerProfile;
