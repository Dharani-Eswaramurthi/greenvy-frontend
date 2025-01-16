import React, { useState, useEffect, useContext, useRef } from 'react';
import { Box, Image, Text, Flex, Heading, Container, Button } from '@chakra-ui/react';
import { FaLeaf, FaShoppingCart, FaStar, FaChild, FaHeart } from 'react-icons/fa';
import { Toaster, toaster } from './ui/toaster';
import { FaRegHeart } from "react-icons/fa6";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';
import carouselImages from '../utils/imageLoader';
import CustomCarousel from '../utils/CustomCarousel';
import { FaArrowCircleRight } from "react-icons/fa";
import TextSparkle from './TextSparkle';

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
    const [scrollPositions, setScrollPositions] = useState({});
    const [maxScrollWidths, setMaxScrollWidths] = useState({});

    const scrollRefs = useRef({});

    const handleScroll = (category) => {
        const scrollContainer = scrollRefs.current[category];
        if (scrollContainer) {
            setScrollPositions((prev) => ({
                ...prev,
                [category]: scrollContainer.scrollLeft
            }));
        }
    };

    const scroll = (category, scrollOffset) => {
        const scrollContainer = scrollRefs.current[category];
        if (scrollContainer) {
            scrollContainer.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const updateScrollWidths = () => {
            Object.keys(scrollRefs.current).forEach((category) => {
                const scrollContainer = scrollRefs.current[category];
                if (scrollContainer) {
                    setMaxScrollWidths((prev) => ({
                        ...prev,
                        [category]: scrollContainer.scrollWidth - scrollContainer.clientWidth
                    }));
                }
            });
        };

        updateScrollWidths();
        window.addEventListener('resize', updateScrollWidths);

        return () => {
            window.removeEventListener('resize', updateScrollWidths);
        };
    }, []);

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
                UseToast('Failed to fetch products', 'error');
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

    const handleViewAllClick = (categoryName) => {
        navigate(`/all-products/${categoryName}`);
    };

    const renderSectionHeading = (icon, title, category) => (
        <Flex alignItems="center" mt={10} mb={5} justifyContent="space-between">
            <Flex alignItems="center">
                {icon}
                <Heading as="h2" size="xl" textAlign="left" ml={2} color='#25995C'>{title}</Heading>
            </Flex>
            <Button variant="link" onClick={() => handleViewAllClick(category)}>
                <FaAngleRight size="24px" color='#25995C' />
            </Button>
        </Flex>
    );

    const renderProductGrid = (category, categoryName) => (
        <Box position="relative" mb={{ base: '80px', md: '0' }}>  {/* Add margin-bottom for mobile view */}
           {scrollPositions[categoryName] > 0 && <Box
                position="absolute"
                left="0"
                top="0"
                bottom="0"
                width="30px"  // Reduced the width for a more subtle fade
                background="linear-gradient(to right, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0))"  // Reduced opacity for subtle effect
                zIndex="1"
                pointerEvents="none"
            />}
            {maxScrollWidths[categoryName] > 0 && scrollPositions[categoryName] < maxScrollWidths[categoryName] && <Box
                position="absolute"
                right="0"
                top="0"
                bottom="0"
                width="30px"  // Reduced the width for a more subtle fade
                background="linear-gradient(to left, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0))"  // Reduced opacity for subtle effect
                zIndex="1"
                pointerEvents="none"
            />}
            <Box
                ref={(el) => scrollRefs.current[categoryName] = el}
                display="flex"
                overflowX="auto"
                whiteSpace="nowrap"
                css={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none'
                }}
                onScroll={() => handleScroll(categoryName)}
            >
                {category.slice(0, 15).map((product, index) => (
                    <Box
                        key={index}
                        className="product-details"
                        p={4}
                        gap={10}
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="md"
                        position="relative"
                        display="inline-block"
                        flexShrink="0"
                        width="225px"
                        height="350px"
                        m={4}
                    >
                        {isAuthenticated && (
                            <Button
                                aria-label="Add to wishlist"
                                onClick={() => wishlist.includes(product.product_id) ? handleRemoveFromWishlist(product.product_id) : handleAddToWishlist(product.product_id)}
                                position="absolute"
                                bottom="10px"
                                right="10px"
                                backgroundColor="transparent"
                                color={wishlist.includes(product.product_id) ? 'red.500' : 'black'}
                                _hover={{ color: wishlist.includes(product.product_id) ? 'red.700' : 'gray.700' }}
                                transition="all 0.3s"
                            >
                                {wishlist.includes(product.product_id) ? <FaHeart /> : <FaRegHeart color='#25995C' />}
                            </Button>
                        )}
                        <Image src={product.images[0]} alt={product.name} boxSize="200px" objectFit="cover" borderRadius="md" onClick={() => handleProductClick(product.product_id)} />
                        <Text
                            fontSize="xl"
                            mt={4}
                            textAlign="left"
                            fontWeight="bold"
                            onClick={() => handleProductClick(product.product_id)}
                            noOfLines={2}
                            overflow="hidden"
                            textOverflow="ellipsis"
                            display="-webkit-box"
                            css={{
                                '-webkit-line-clamp': '2',
                                '-webkit-box-orient': 'vertical',
                                cursor: 'pointer'
                            }}
                            title={product.name}
                        >
                            {product.name}
                        </Text>
                        <Text fontSize="lg" color="gray.500" textAlign="left" display='flex' flexDirection='row' alignItems='center' justifyContent='space-between'>₹{product.price} {product.short_note && <TextSparkle>{product.short_note}</TextSparkle>}</Text>
                        <Flex className="stars" mt={2} justifyContent="flex-start">
                            {renderStarsWithHalf(product.overall_rating)}
                        </Flex>
                        {product.stock <= 10 && (
                            <Text mt={1} color="red.500" textAlign="left">Only {product.stock} left in stock</Text>
                        )}
                    </Box>
                ))}
                {category.length > 15 && <Box
                    p={4}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    flexShrink="0"
                    border={'none'}
                    width="225px"
                    height="350px"
                    m={2}
                >
                    <FaArrowCircleRight size="50px" color='#25995C' />
                    <Button onClick={() => handleViewAllClick(categoryName)} colorScheme="teal" variant="outline" border={'none'} _hover={{ backgroundColor: 'transparent' }} p={2} fontSize="xs">
                        View All
                    </Button>
                </Box>}
            </Box>
            {category.length > 1 && <Flex justifyContent="space-between" mt={4} position="absolute" top="50%" width="100%" transform="translateY(-50%)">
                <Button
                    aria-label="Scroll Left"
                    onClick={() => scroll(categoryName, -300)}
                    disabled={scrollPositions[categoryName] <= 0}
                    backgroundColor="white"
                    borderRadius='50%'
                    height='40px'  // Reduced size for mobile view
                    width='40px'   // Reduced size for mobile view
                    boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)'
                    _disabled={{ color: 'gray.300' }}
                >
                    <FaAngleLeft size="20px" color={scrollPositions[categoryName] <= 0 ? 'gray.300' : '#25995C'} />
                </Button>
                <Button
                    aria-label="Scroll Right"
                    onClick={() => scroll(categoryName, 300)}
                    disabled={scrollPositions[categoryName] >= maxScrollWidths[categoryName]}
                    backgroundColor="white"
                    borderRadius='50%'
                    height='40px'  // Reduced size for mobile view
                    width='40px'   // Reduced size for mobile view
                    boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)'
                    _disabled={{ color: 'gray.300' }}
                >
                    <FaAngleRight size="20px" color={scrollPositions[categoryName] >= maxScrollWidths[categoryName] ? 'gray.300' : '#25995C'} />
                </Button>
            </Flex>}
        </Box>
    );

    return loading ? <Loading /> : (
        <Container maxW="container.xl" px={8}>
            <CustomCarousel images={carouselImages} />
            {renderSectionHeading(<FaShoppingCart />, 'Featured Products', 'featured')}
            {products.featured.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                    <Text fontSize="xl" color="gray.500">No featured products available</Text>
                </Flex>
            ) : (
                renderProductGrid(products.featured, 'featured')
            )}
            {renderSectionHeading(<FaLeaf />, 'Groceries', 'groceries')}
            {products.groceries.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                    <Text fontSize="xl" color="gray.500">No groceries available</Text>
                </Flex>
            ) : (
                renderProductGrid(products.groceries, 'groceries')
            )}
            {renderSectionHeading(<FaLeaf />, 'Eco-Friendly Products', 'eco-friendly')}
            {products.ecoFriendly.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                    <Text fontSize="xl" color="gray.500">No eco-friendly products available</Text>
                </Flex>
            ) : (
                renderProductGrid(products.ecoFriendly, 'eco-friendly')
            )}
            {renderSectionHeading(<FaChild />, 'Toys', 'toys')}
            {products.toys.length === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                    <Text fontSize="xl" color="gray.500">No toys available</Text>
                </Flex>
            ) : (
                renderProductGrid(products.toys, 'toys')
            )}
            <Toaster />
        </Container>
    );
};

export default Home;
