import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Image, Text, Flex, Heading, Textarea, Button, Spinner, HStack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaStar, FaUser, FaPlus, FaMinus } from 'react-icons/fa';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../styles/ProductDetail.css';
import Loading from './Loading';

const ProductDetail = () => {
    const { productId } = useParams();
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/product/${productId}`);
                setProduct(response.data);
                setSelectedImage(response.data.images ? response.data.images[0] : '');
                const reviewsResponse = await axios.get(`/product/reviews/${productId}`);
                const reviewsWithUserDetails = await Promise.all(reviewsResponse.data.map(async (review) => {
                    const userDetails = await fetchUserDetails(review.user_id);
                    return {
                        ...review,
                        user: {profile_image: userDetails.profile_image, username: userDetails.username},
                    };
                }));
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    reviews: reviewsWithUserDetails,
                }));
            } catch (err) {
                setError('Failed to fetch product details');
            } finally {
                setLoading(false);
            }
        };

        const fetchCartQuantity = async () => {
            if (isAuthenticated) {
                try {
                    const response = await axios.get(`/user/cart/${userId}`);
                    const cartItem = response.data.find(item => item.product_id === productId);
                    if (cartItem) {
                        setQuantity(cartItem.quantity);
                    }
                } catch (err) {
                    console.error('Failed to fetch cart quantity');
                }
            }
        };

        fetchProduct();
        fetchCartQuantity();
    }, [productId, isAuthenticated, userId]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleRatingClick = (rating) => {
        setRating(rating);
    };

    const handleReviewSubmit = async () => {
        if (!isAuthenticated) {
            setError('Please log in to write a review');
            return;
        }
        setLoading(true);
        try {
            const review = {
                user_id: userId,
                product_id: productId,
                rating,
                comment,
            };
            await axios.post(`/user/add-review`, review, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setRating(0);
            setComment('');
            setError('');
            // Fetch updated reviews
            const response = await axios.get(`/product/reviews/${productId}`);
            const updatedReviews = await Promise.all(response.data.map(async (review) => {
                const userDetails = await fetchUserDetails(review.user_id);
                return {
                    ...review,
                    user: {profile_image: userDetails.profile_image, username: userDetails.username},
                };
            }));
            setProduct((prevProduct) => ({
                ...prevProduct,
                reviews: updatedReviews,
            }));
        } catch (err) {
            setError('Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            setError('Please log in to add to cart');
            return;
        }
        setCartLoading(true);
        try {
            await axios.post('/user/add-to-cart', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                    quantity: 1,
                },
            });
            setQuantity(1);
            setError('');
        } catch (err) {
            setError('Failed to add to cart');
        } finally {
            setCartLoading(false);
        }
    };

    const handleIncreaseQuantity = async () => {
        setCartLoading(true);
        try {
            await axios.post('/user/add-to-cart', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity + 1,
                },
            });
            setQuantity(quantity + 1);
        } catch (err) {
            setError('Failed to update cart');
        } finally {
            setCartLoading(false);
        }
    };

    const handleDecreaseQuantity = async () => {
        if (quantity === 1) {
            setQuantity(0);
            return;
        }
        setCartLoading(true);
        try {
            await axios.post('/user/add-to-cart', null, {
                params: {
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity - 1,
                },
            });
            setQuantity(quantity - 1);
        } catch (err) {
            setError('Failed to update cart');
        } finally {
            setCartLoading(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    color={i <= rating ? '#FFD700' : '#D3D3D3'}
                    onClick={() => handleRatingClick(i)}
                    style={{ cursor: 'pointer', marginRight: '5px' }}
                />
            );
        }
        return stars;
    };

    const calculateDaysAgo = (date) => {
        const now = new Date();
        const reviewDate = new Date(date);
        const diffTime = Math.abs(now - reviewDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await axios.get(`/user/profile/${userId}`);
            return response.data;
        } catch (err) {
            console.error('Failed to fetch user details');
            return null;
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!product) {
        return <Spinner size="xl" />;
    }

    return (
        <Box className="product-detail-container">
            <Flex className="product-detail-content" flexDirection={{ base: 'column', md: 'row' }}>
                <Box className="product-images">
                    <Box display={{ base: 'block', md: 'none' }}>
                        <Carousel showThumbs={false} showStatus={false} dynamicHeight>
                            {product.images && product.images.map((image, index) => (
                                <div key={index}>
                                    <Image src={image} alt={`product-${index}`} objectFit="cover" borderRadius="md" />
                                </div>
                            ))}
                        </Carousel>
                    </Box>
                    <Box display={{ base: 'none', md: 'block' }} overflow="visible">
                        {product.images && product.images.map((image, index) => (
                            <Image
                                key={index}
                                src={image}
                                alt={`product-${index}`}
                                boxSize="100px"
                                objectFit="cover"
                                overflow="visible"
                                borderRadius="md"
                                onClick={() => handleImageClick(image)}
                                className={selectedImage === image ? 'selected' : ''}
                                transition="transform 0.2s"
                                _hover={{ transform: 'scale(1.1)', zIndex: 1 }}
                            />
                        ))}
                    </Box>
                </Box>
                <Box className="product-main-image" display={{ base: 'none', md: 'block' }}>
                    <Image src={selectedImage} alt="Selected" boxSize="400px" objectFit="cover" borderRadius="md" />
                </Box>
                <Box className="product-info">
                    <Heading as="h2" size="xl">{product.name}</Heading>
                    <Text fontSize="lg" color="gray.500">{product.price}</Text>
                    <Text mt={4}>{product.description}</Text>
                    <Flex mt={4}>
                        {renderStars(product.averageReview)}
                    </Flex>
                    {quantity === 0 ? (
                        <Button
                            mt={4}
                            onClick={handleAddToCart}
                            isLoading={cartLoading}
                            backgroundColor="#25995C"
                            color="white"
                            height="50px"
                            _hover={{ backgroundColor: '#1e7a4d' }}
                            transition="all 0.3s"
                            disabled={cartLoading}
                        >
                            {cartLoading ? 'Adding to cart...' : 'Add to Cart'}
                        </Button>
                    ) : (
                        <HStack mt={4} spacing={4} border="1px solid #25995C" borderRadius="md" transition="all 0.3s" width="fit-content">
                            <Button
                                onClick={handleDecreaseQuantity}
                                isLoading={cartLoading}
                                backgroundColor="#25995C"
                                color="white"
                                height="50px"
                                size="xs"
                                _hover={{ backgroundColor: '#1e7a4d' }}
                                transition="all 0.3s"
                                disabled={cartLoading}
                            ><FaMinus/></Button>
                            <Text paddingEnd={3} paddingStart={3}>{quantity}</Text>
                            <Button
                                onClick={handleIncreaseQuantity}
                                isLoading={cartLoading}
                                backgroundColor="#25995C"
                                color="white"
                                size="xs"
                                height="50px"
                                _hover={{ backgroundColor: '#1e7a4d' }}
                                transition="all 0.3s"
                                disabled={cartLoading}
                            ><FaPlus/></Button>
                        </HStack>
                    )}
                </Box>
            </Flex>
            <Box className="product-reviews" mt={10}>
                <Heading as="h3" size="lg">Reviews</Heading>
                {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review, index) => (
                        <Box key={index} className="review" p={4}>
                            <Flex alignItems="center">
                                {review.user && review.user.profile_image ? (
                                    <Image
                                        src={review.user.profile_image}
                                        alt={review.user.username}
                                        boxSize="40px"
                                        borderRadius="full"
                                        mr={4}
                                    />
                                ) : (
                                    <FaUser size="40px" mr={4} />
                                )}
                                <Text fontWeight="bold">{review.user ? review.user.username : 'Unknown User'}</Text>
                                <Text ml={2} color="gray.500">{calculateDaysAgo(review.date_posted)} days ago</Text>
                            </Flex>
                            <Flex mt={2}>
                                {renderStars(review.rating)}
                            </Flex>
                            <Text mt={2}>{review.comment}</Text>
                        </Box>
                    ))
                ) : (
                    <Text>No reviews yet</Text>
                )}
            </Box>
            {isAuthenticated && (
                <Box className="write-review" mt={10}>
                    <Heading as="h3" size="lg">Write a Review</Heading>
                    <Flex mt={4}>
                        {renderStars(rating)}
                    </Flex>
                    <Textarea
                        mt={4}
                        placeholder="Write your review here (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        transition="border-color 0.2s"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500' }}
                    />
                    <Button mt={4} onClick={handleReviewSubmit} isLoading={loading} disabled={rating === 0} transition="background-color 0.2s" _hover={{ backgroundColor: 'blue.600' }}>
                        Submit Review
                    </Button>
                    {error && <Text color="red.500" mt={4}>{error}</Text>}
                </Box>
            )}
        </Box>
    );
};

export default ProductDetail;
