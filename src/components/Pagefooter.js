import React from 'react';
import { Box, Text, Flex, Link, VStack, HStack } from '@chakra-ui/react';
import { FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/Pagefooter.css';

const Pagefooter = () => {
    return (
        <>
            <hr style={{ borderColor: 'gray.300', borderWidth: '1px', margin: '0' }} />
            <div style={{ paddingLeft: "2rem" , marginTop: '2rem' }}>
            <Box className="inpage-footer" p={4}>
                <Flex flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center">
                    <HStack spacing={10} className="quick-links">
                        <VStack align="flex-start" spacing={2} textAlign="left">
                            <Text fontWeight="bold">Quick Links</Text>
                            <Link href="/" color="black">Home</Link>
                            <Link href="/about" color="black">About Us</Link>
                            <Link href="/contact" color="black">Contact Us</Link>
                            <Link href="/become-seller" color="black">Become a Seller</Link>
                            {/* <Link href="/privacy" color="black">Privacy Policy</Link> */}
                        </VStack>
                        <VStack align="flex-start" spacing={2} textAlign="left">
                            <Text fontWeight="bold">Contact Us</Text>
                            <HStack>
                                <FaPhone />
                                <Link href="tel:9655612306" color="black">9655612306</Link>
                            </HStack>
                            <HStack>
                                <FaEnvelope />
                                <Link href="mailto:contact@greenvy.store" color="black">contact@greenvy.store</Link>
                            </HStack>
                            <HStack>
                                <FaMapMarkerAlt />
                                <Text>Coimbatore, Tamilnadu, India</Text>
                            </HStack>
                        </VStack>
                        <Box mt={4} textAlign="center">
                            <a href="https://www.producthunt.com/posts/greenvy-store?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-greenvy-store" target="_blank" rel="noreferrer">
                                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=818067&theme=neutral&t=1737823599645" alt="Greenvy.store - An eco-friendly ecommerce | Product Hunt" style={{ width: '250px', height: '54px' }} width="250" height="54" />
                            </a>
                        </Box>
                    </HStack>
                    <Flex mt={{ base: 1, md: 0 }} className="social-media" justifyContent="center" width="100%">
                        <Link href="https://www.linkedin.com/company/greenvy-store/" isExternal mx={2}>
                            <FaLinkedin size="24px" />
                        </Link>
                    </Flex>
                </Flex>
                <Text mt={4}>2025 Greenvy.store. All rights yet to be reserved.</Text>
            </Box>
            </div>
        </>
    );
};

export default Pagefooter;
