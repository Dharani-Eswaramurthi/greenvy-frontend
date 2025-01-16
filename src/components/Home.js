import React, { useState, useEffect, useContext } from 'react';
import { Box, Image, Text, Flex, SimpleGrid, Heading, Container, Button } from '@chakra-ui/react';
import { FaLeaf, FaShoppingCart, FaStar, FaChild, FaHeart } from 'react-icons/fa';
import { Toaster, toaster } from './ui/toaster';
import { FaRegHeart } from "react-icons/fa6";
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';
import carouselImages from '../utils/imageLoader';
import CustomCarousel from '../utils/CustomCarousel';
import CustomGrid from './CustomGrid';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL;

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [products, setProducts] = useState({
        featured: [],
        groceries: [],
        ecoFriendly: [],
        toys: []
    });
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const UseToast = (title, type) => {
        toaster.create({
          title: title,
          type: type,
        });
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const featuredResponse = await axios.get('/products/featured');
                const groceriesResponse = await axios.get('/products/groceries');
                const ecoFriendlyResponse = await axios.get('/products/eco-friendly');
                const toysResponse = await axios.get('/products/toys');

                setProducts({
                    featured: featuredResponse.data,
                    groceries: groceriesResponse.data,
                    ecoFriendly: ecoFriendlyResponse.data,
                    toys: toysResponse.data
                });

                if (isAuthenticated) {
                    const wishlistResponse = await axios.get(`/user/wishlist/${userId}`);
                    setWishlist(wishlistResponse.data);
                }

                setLoading(false);
            } catch (err) {
                UseToast('Failed to fetch products');
                setLoading(false);
            }
        };
        fetchProducts();
    }, [isAuthenticated, userId]);

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

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<span key={i}>&#9733;</span>); // Filled star
            } else {
                stars.push(<span key={i}>&#9734;</span>); // Empty star
            }
        }
        return stars;
    };

    const renderProductGrid = (category) => (
        <CustomGrid spacing={10} className="product-grid">
            {category.map((product, index) => (
                <Box
                    key={index}
                    className="product-details"
                    p={5}
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="md"
                    position="relative"
                    _hover={{ boxShadow: 'xl' }}
                >
                    {isAuthenticated && <Button
                        aria-label="Add to wishlist"
                        onClick={() => wishlist.includes(product.product_id) ? handleRemoveFromWishlist(product.product_id) : handleAddToWishlist(product.product_id)}
                        position="absolute"
                        bottom="10px"
                        right="10px"
                        backgroundColor="transparent"
                        color={wishlist.includes(product.product_id) ? 'red.500' : 'black'}
                        _hover={{ color: wishlist.includes(product.product_id) ? 'red.700' : 'gray.700' }}
                        transition="all 0.3s"
                    >{wishlist.includes(product.product_id) ? <FaHeart /> : <FaRegHeart color='#25995C' />}</Button>}
                    <Image src={product.images[0]} alt={product.name} boxSize="200px" objectFit="cover" borderRadius="md" onClick={() => handleProductClick(product.product_id)} />
                    <Text fontSize="xl" mt={4} textAlign="left" fontWeight="bold" onClick={() => handleProductClick(product.product_id)}>{product.name}</Text>
                    <Text fontSize="lg" color="gray.500" textAlign="left">₹{product.price}</Text>
                    <Flex className="stars" mt={2} justifyContent="flex-start">
                        {renderStarsWithHalf(product.overall_rating)}
                    </Flex>
                    {product.stock <= 10 && (
                        <Text mt={1} color="red.500" textAlign="left">Only {product.stock} left in stock</Text>
                    )}
                </Box>
            ))}
        </CustomGrid>
    );

    if (loading) {
        return (
            <Loading />
        );
    }

    return (
        <Container maxW="container.xl" py={10}>
            <CustomCarousel images={carouselImages} />

            <Flex alignItems="center" mt={10} mb={5}>
                <FaStar style={{ marginRight: '8px' }} />
                <Heading as="h2" size="xl" textAlign="left">Featured Products</Heading>
            </Flex>
            {products.featured.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                    <Text fontSize="xl" color="gray.500">No featured products available</Text>
                </Flex>
            ) : (
                renderProductGrid(products.featured)
            )}

            <Flex alignItems="center" mt={10} mb={5}>
                <FaShoppingCart style={{ marginRight: '8px' }} />
                <Heading as="h2" size="xl" textAlign="left">Groceries</Heading>
            </Flex>
            {products.groceries.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                    <Text fontSize="xl" color="gray.500">No groceries available</Text>
                </Flex>
            ) : (
                renderProductGrid(products.groceries)
            )}

            <Flex alignItems="center" mt={10} mb={5}>
                <FaLeaf style={{ marginRight: '8px' }} />
                <Heading as="h2" size="xl" textAlign="left">Eco Friendly Utilities</Heading>
            </Flex>
            {products.ecoFriendly.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                    <Text fontSize="xl" color="gray.500">No eco-friendly utilities available</Text>
                </Flex>
            ) : (
                renderProductGrid(products.ecoFriendly)
            )}

            <Flex alignItems="center" mt={10} mb={5}>
                <FaChild style={{ marginRight: '8px' }} />
                <Heading as="h2" size="xl" textAlign="left">Toys</Heading>
            </Flex>
            {products.toys.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                    <Text fontSize="xl" color="gray.500">No toys available</Text>
                </Flex>
            ) : (
                renderProductGrid(products.toys)
            )}
        </Container>
    );
};

export default Home;
