import React, { useState, useEffect, useContext } from 'react';
import { Box, Image, Text, Flex, Button, Container, Heading } from '@chakra-ui/react';
import { FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
import { FaRegHeart } from "react-icons/fa6";
import { FaCaretRight } from "react-icons/fa6";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';
import '../styles/AllProductsPage.css';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL || "https://api.greenvy.store";

const AllProductsPage = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/products/${category}`);
                setProducts(response.data);

                if (isAuthenticated) {
                    const wishlistResponse = await axios.get(`/user/wishlist/${userId}`);
                    setWishlist(wishlistResponse.data);
                }

                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch products');
                setLoading(false);
            }
        };
        fetchProducts();
    }, [category, isAuthenticated, userId]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleAddToWishlist = async (productId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await axios.post('/user/add-to-wishlist', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                },
            });
            setWishlist((prevWishlist) => [...prevWishlist, productId]);
        } catch (err) {
            console.error('Failed to add item to wishlist');
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await axios.post('/user/remove-from-wishlist', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                },
            });
            setWishlist((prevWishlist) => prevWishlist.filter((id) => id !== productId));
        } catch (err) {
            console.error('Failed to remove item from wishlist');
        }
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

    if (loading) {
        return <Loading />;
    }

    return (
        <Container maxW="container.xl" py={10}>
            {/* make the first letter of category to upper */}
            <Flex flexDirection="row" alignItems='center' mb={5}>
                <Heading as="h1" size="xl" className='settings-heading'>All Products</Heading>
                <FaCaretRight color='#25995C' style={{ margin: '0 8px', marginBottom: '20px' }} />
                <Heading as="h1" size="xl" className='settings-heading'>{category.charAt(0).toUpperCase() + category.slice(1)}</Heading>
            </Flex>
            <Flex flexDirection="column" className="all-products-page">
                {products.map((product, index) => (
                    <Box
                        key={index}
                        className="product-details-box"
                        p={3}
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="md"
                        mb={5}
                    >
                        <Flex width="100%" flexDirection='row' justifyContent="space-between" alignItems="center">
                            <Flex flexDirection='row' alignItems="center" justifyContent='space-between' flex="1">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    boxSize="100px"
                                    objectFit="cover"
                                    borderRadius="md"
                                    onClick={() => handleProductClick(product.product_id)}
                                    cursor="pointer"
                                />
                                <Box ml={{ base: 2, md: 5 }} flex="1">
                                    <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" onClick={() => handleProductClick(product.product_id)} cursor="pointer">
                                        {product.name}
                                    </Text>
                                    <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.500">₹{product.price}</Text>
                                    <Flex className="stars" mt={2}>
                                        {renderStarsWithHalf(product.overall_rating)}
                                    </Flex>
                                    {product.stock <= 10 && (
                                        <Text mt={1} color="red.500">Only {product.stock} left in stock</Text>
                                    )}
                                </Box>
                            </Flex>
                            <Flex flexDirection="column" alignItems="center" mt={{ base: 5, md: 0 }} ml={{ md: 5 }}>
                                {isAuthenticated && <Button
                                    aria-label="Add to wishlist"
                                    onClick={() => wishlist.includes(product.product_id) ? handleRemoveFromWishlist(product.product_id) : handleAddToWishlist(product.product_id)}
                                    backgroundColor="transparent"
                                    color={wishlist.includes(product.product_id) ? 'red.500' : 'black'}
                                    _hover={{ color: wishlist.includes(product.product_id) ? 'red.700' : 'gray.700' }}
                                    transition="all 0.3s"
                                    mb={2}
                                >
                                    {wishlist.includes(product.product_id) ? <FaHeart /> : <FaRegHeart color='#25995C' />}
                                </Button>}
                            </Flex>
                        </Flex>
                    </Box>
                ))}
            </Flex>
        </Container>
    );
};

export default AllProductsPage;
