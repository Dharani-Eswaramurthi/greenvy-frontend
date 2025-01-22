import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Box, Image, Text, Flex, Heading, Textarea, Button, Spinner, HStack, IconButton } from '@chakra-ui/react';
import { Toaster, toaster } from './ui/toaster';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaStar, FaUser, FaPlus, FaMinus, FaEllipsisH, FaEdit, FaTrash, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../styles/ProductDetail.css';
import Loading from './Loading';
import UserLogo from '../assets/user.png';
import ConfirmationModal from './ConfirmationModal';

const ProductDetail = () => {
    const { productId } = useParams();
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [editingReview, setEditingReview] = useState(null);
    const [menuVisible, setMenuVisible] = useState(null);
    const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
    const [writeRating, setWriteRating] = useState(0);
    const [writeComment, setWriteComment] = useState('');
    const [wishlist, setWishlist] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const reviewsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const UseToast = (title, type) => {
        toaster.create({
          title: title,
          type: type,
        });
    };

    useEffect(() => {
        console.log("Auth", isAuthenticated)
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
                const sellerResponse = await axios.get(`/seller/${response.data.seller_id}`);
                setSeller(sellerResponse.data);
            } catch (err) {
                UseToast('Failed to fetch product details', 'error');
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

    useEffect(() => {
        if (location.state?.scrollToReview && location.state.reviewId) {
            const reviewElement = document.getElementById(location.state.reviewId);
            if (reviewElement) {
                reviewElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location.state]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleRatingClick = (rating) => {
        setWriteRating(rating);
    };

    const handleEditRatingClick = (rating) => {
        setRating(rating);
    };

    const handleReviewSubmit = async () => {
        if (!isAuthenticated) {
            UseToast('Please log in to write a review', 'error');
            return;
        }
        setLoading(true);
        try {
            const review = {
                user_id: userId,
                product_id: productId,
                rating: writeRating,
                comment: writeComment,
            };
            await axios.post(`/user/add-review`, review, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setWriteRating(0);
            setWriteComment('');
            UseToast('Hey! Thanks for the review.', 'success');
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
            UseToast('Reviews updated successfully', 'success');
        } catch (err) {
            UseToast('Failed to submit review', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setRating(review.rating);
        setComment(review.comment);
        setIsEditPopupVisible(true);
        setTimeout(() => {
            document.querySelector('.edit-review-popup').classList.add('visible');
        }, 10);
    };

    const handleCloseEditPopup = () => {
        document.querySelector('.edit-review-popup').classList.remove('visible');
        setTimeout(() => {
            setIsEditPopupVisible(false);
            setEditingReview(null);
            setRating(0);
            setComment('');
        }, 300);
    };

    const handleUpdateReview = async () => {
        if (!isAuthenticated) {
            UseToast('Please log in to edit a review', 'error');
            return;
        }
        setLoading(true);
        try {
            const updatedReview = {
                rating,
                comment,
            };
            await axios.post(`/user/edit-review/${editingReview.review_id}`, updatedReview, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setEditingReview(null);
            setRating(0);
            setComment('');
            UseToast('Review updated successfully', 'success');
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
            UseToast('Failed to update review', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!isAuthenticated) {
            UseToast('Please log in to delete a review', 'error');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`/user/delete-review/${reviewId}`);
            UseToast('Review deleted successfully', 'success');
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
            UseToast('Failed to delete review', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            UseToast('Please log in to add to cart', 'error');
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
            UseToast('Added to cart', 'success');
        } catch (err) {
            UseToast('Failed to add to cart', 'error');
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
            UseToast('Added to cart', 'success');
            setQuantity(quantity + 1);
        } catch (err) {
            UseToast('Failed to update cart', 'error');
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
            UseToast('Updated cart', 'success');
        } catch (err) {
            UseToast('Failed to update cart', 'error');
        } finally {
            setCartLoading(false);
        }
    };

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

    const renderStars = (rating, onClick) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    color={i <= rating ? '#FFD700' : '#D3D3D3'}
                    onClick={() => onClick(i)}
                    style={{ cursor: 'pointer', marginRight: '5px' }}
                />
            );
        }
        return stars;
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

    const openConfirmationModal = (reviewId) => {
        setReviewToDelete(reviewId);
        setShowConfirmationModal(true);
    };

    const closeConfirmationModal = () => {
        setReviewToDelete(null);
        setShowConfirmationModal(false);
    };

    const handleMenuClick = (reviewId) => {
        setMenuVisible(menuVisible === reviewId ? null : reviewId);
    };

    const handleClickOutside = (event) => {
        if (!event.target.closest('.custom-menu-content')) {
            setMenuVisible(null);
        }
    };

    const handleSellerClick = () => {
        navigate(`/seller/${seller.seller_id}`);
    };
    

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    <Heading as="h3" size="xl">{product.name}</Heading>
                    <Text fontSize="lg" color="gray.500">₹ {product.price}</Text>
                    <Text mt={4} whiteSpace="pre-line" dangerouslySetInnerHTML={{ __html: product.description }}></Text>
                    <Flex mt={4} as="h3">
                        {renderStarsWithHalf(product.overall_rating)}
                    </Flex>
                    {product.stock <= 10 && (
                        <Text mt={1} color="red.500" textAlign="left">Only {product.stock} left in stock</Text>
                    )}
                    <Flex mt={4} alignItems="center">
                        {quantity === 0 && product.stock !== 0 && isAuthenticated ? (
                            <Button
                                onClick={handleAddToCart}
                                isLoading={cartLoading}
                                backgroundColor="#25995C"
                                color="white"
                                className='quants-button'
                                height="50px"
                                _hover={{ backgroundColor: '#1e7a4d' }}
                                transition="all 0.3s"
                                disabled={cartLoading}
                            >
                                {cartLoading ? 'Adding to cart...' : 'Add to Cart'}
                            </Button>
                        ) : product.stock !== 0 && isAuthenticated ? (
                            <HStack spacing={4} border="1px solid #25995C" borderRadius="md" transition="all 0.3s" width="fit-content" className='quants-button'>
                                <Button
                                    onClick={handleDecreaseQuantity}
                                    isLoading={cartLoading}
                                    backgroundColor="#25995C"
                                    color="white"
                                    height={{ base: '40px', md: '50px' }}
                                    size="xs"
                                    _hover={{ backgroundColor: '#1e7a4d' }}
                                    transition="all 0.3s"
                                    disabled={cartLoading}
                                ><FaMinus/></Button>
                                <Text paddingLeft={{ base: '10px', md: '20px' }} paddingRight={{ base: '10px', md: '20px' }}>{quantity}</Text>
                                <Button
                                    onClick={handleIncreaseQuantity}
                                    isLoading={cartLoading}
                                    backgroundColor="#25995C"
                                    color="white"
                                    size="xs"
                                    height={{ base: '40px', md: '50px' }}
                                    _hover={{ backgroundColor: '#1e7a4d' }}
                                    transition="all 0.3s"
                                    disabled={cartLoading || quantity === product.stock}
                                ><FaPlus/></Button>
                            </HStack>
                        ) : isAuthenticated ? (
                            <Text>Out of Stock</Text>
                        ): (
                            <></>
                        )}
                        {isAuthenticated && <Button
                            aria-label="Add to wishlist"
                            ml={10}
                            onClick={() => wishlist.includes(product.product_id) ? handleRemoveFromWishlist(product.product_id) : handleAddToWishlist(product.product_id)}
                            backgroundColor="transparent"
                            size="fit-content"
                            display="inline-block"
                            color={wishlist.includes(product.product_id) ? 'red.500' : 'black'}
                            _hover={{ color: wishlist.includes(product.product_id) ? 'red.700' : 'gray.700' }}
                            transition="all 0.3s"
                            isLoading={wishlistLoading}
                        >
                            {wishlist.includes(product.product_id) ? <FaHeart className='icon-resize' /> : <FaRegHeart className='icon-resize' color='#25995C'/>}
                        </Button>}
                    </Flex>
                    {quantity > 0 && <Button backgroundColor="#25995C"
                                    color="white"
                                    mt={4}
                                    height={{ base: '40px', md: '50px' }}
                                    _hover={{ backgroundColor: '#1e7a4d' }} onClick={() => navigate("/cart")}>Go to Cart</Button>}
                </Box>
            </Flex>
            <Box className="product-reviews" mt={10} ref={reviewsRef}>
            {seller && (
                <><hr />
                <Box className="seller-info" mt={4} mb={4} onClick={handleSellerClick} style={{ cursor: 'pointer' }}>
                    <Flex alignItems="center" mt={4}>
                        <Image src={seller.seller_image || UserLogo } alt="Seller" boxSize="50px" borderRadius="full" />
                        <Box ml={4}>
                            <Text as="h3" fontWeight="bold">{seller.seller_name}</Text>
                            <Flex mt={2}>
                                {renderStarsWithHalf(seller.seller_rating)}
                            </Flex>
                        </Box>
                    </Flex>
                </Box>
                <hr/>
                </>
            )}
                <Heading as="h3" size="lg">Reviews</Heading>
                {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review, index) => (
                        <Box key={index} id={review.review_id} className="review" p={4}>
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
                                    <Image src={UserLogo} alt="User" boxSize="40px" borderRadius="full" mr={4} />
                                )}
                                <Text fontWeight="bold">{review.user ? review.user.username : 'Unknown User'}</Text>
                                <Text ml={2} color="gray.500">{calculateDaysAgo(review.date_posted)} days ago</Text>
                                {review.user_id === userId && (
                                    <div className="custom-menu-trigger-wrapper">
                                        <Button
                                            aria-label="Options"
                                            variant="outline"
                                            size="xs"
                                            borderColor= 'transparent'
                                            ml={4}
                                            backgroundColor="transparent"
                                            color='#25995C'
                                            _hover={{ backgroundColor: 'transparent' }}
                                            onClick={() => handleMenuClick(review.review_id)}
                                        ><FaEllipsisH /></Button>
                                        {menuVisible === review.review_id && (
                                            <div className="custom-menu-content">
                                                <div className="custom-menu-item" onClick={() => handleEditReview(review)}>
                                                    <FaEdit color='#25995C' />
                                                    <span>Edit</span>
                                                </div>
                                                <div className="custom-menu-item" onClick={() => openConfirmationModal(review.review_id)}>
                                                    <FaTrash color='#25995C' />
                                                    <span>Delete</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Flex>
                            <Flex mt={2}>
                                {renderStars(review.rating, handleEditRatingClick)}
                            </Flex>
                            <Text mt={2}>{review.comment}</Text>
                        </Box>
                    ))
                ) : (
                    <Text>No reviews yet</Text>
                )}
            </Box>
            {showConfirmationModal && (
                <ConfirmationModal
                    message="Are you sure you want to delete this review?"
                    button1={{ label: 'Yes', onClick: () => handleDeleteReview(reviewToDelete) }}
                    button2={{ label: 'No', onClick: closeConfirmationModal }}
                    onClose={closeConfirmationModal}
                />
            )}
            {isAuthenticated && (
                <Box className="write-review" mt={10}>
                    <Heading as="h3" size="lg">Write a Review</Heading>
                    <Flex mt={4}>
                        {renderStars(writeRating, handleRatingClick)}
                    </Flex>
                    <Textarea
                        mt={4}
                        placeholder="Write your review here (optional)..."
                        value={writeComment}
                        onChange={(e) => setWriteComment(e.target.value)}
                    />
                    <Button
                        mt={4}
                        onClick={handleReviewSubmit}
                        isLoading={loading}
                        disabled={writeRating === 0}
                    >
                        Submit Review
                    </Button>
                </Box>
            )}
            {isEditPopupVisible && (
                <>
                    <Box className="edit-review-popup">
                        <Heading as="h3" size="lg">Edit Review</Heading>
                        <Flex mt={4}>
                            {renderStars(rating, handleEditRatingClick)}
                        </Flex>
                        <Textarea
                            mt={4}
                            placeholder="Edit your review here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <Flex mt={4}>
                            <Button
                                onClick={handleUpdateReview}
                                isLoading={loading}
                                disabled={rating === 0}
                            >
                                Update Review
                            </Button>
                            <Button
                                className="close-button"
                                onClick={handleCloseEditPopup}
                            >
                                Cancel
                            </Button>
                        </Flex>
                    </Box>
                    <Box className="edit-review-overlay" onClick={handleCloseEditPopup}></Box>
                </>
            )}
        </Box>
    );
};

export default ProductDetail;
