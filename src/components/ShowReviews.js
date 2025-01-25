import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Image, Text, Flex, Heading } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import '../styles/ShowReviews.css';
import { FaStar } from 'react-icons/fa';

axios.defaults.baseURL = process.env.REACT_APP_BASEURL;

const ShowReviews = () => {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchUserReviews = async () => {
            try {
                const response = await axios.get(`/user/reviews/${userId}`);
                setReviews(response.data);
            } catch (err) {
                console.error('Failed to fetch user reviews', err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            navigate('/show-reviews');
            return;
        } else {
            navigate('/login');
            return;
        }

        fetchUserReviews();
    }, [isAuthenticated, userId, navigate]);

    if (loading) {
        return <Loading />;
    }

    if (!reviews.length) {
        return <Text color="red.500">No reviews found</Text>;
    }

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    color={i <= rating ? '#FFD700' : '#D3D3D3'}
                />
            );
        }
        return stars;
    };

    const handleReviewClick = (productId) => {
        navigate(`/product/${productId}`, { state: { scrollToReview: true } });
    };

    return (
        <Box className="reviews-container">
            <Heading as="h2" size="xl" mb={6} className='settings-heading'>My Reviews</Heading>
            {reviews.map((review, index) => (
                <Flex
                    key={index}
                    className="review-item"
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    mb={4}
                    onClick={() => handleReviewClick(review.product_id)}
                    cursor="pointer"
                >
                    <Image src={review.product_image} alt={review.product_name} boxSize="100px" objectFit="cover" borderRadius="md" />
                    <Box ml={4} flex="1" display='flex' flexDirection='column' justifyContent='space-between'>
                        <Text fontSize="xl" fontWeight="bold">{review.product_name}</Text>
                        <Flex mt={2} as='h3' mb={2}>
                            {renderStars(review.rating)}
                        </Flex>
                        <Text>{review.comment}</Text>
                    </Box>
                </Flex>
            ))}
        </Box>
    );
};

export default ShowReviews;
