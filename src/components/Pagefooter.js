import React from 'react';
import { Box, Text, Flex, Link, VStack, HStack } from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
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
                                <Link href="mailto:dharani96556@gmail.com" color="black">dharani96556@gmail.com</Link>
                            </HStack>
                            <HStack>
                                <FaMapMarkerAlt />
                                <Text>Coimbatore, Tamilnadu, India</Text>
                            </HStack>
                        </VStack>
                    </HStack>
                    <Flex mt={{ base: 1, md: 0 }} className="social-media" justifyContent="center" width="100%">
                        <Link href="https://www.facebook.com" isExternal mx={2}>
                            <FaFacebook size="24px" />
                        </Link>
                        <Link href="https://www.twitter.com" isExternal mx={2}>
                            <FaTwitter size="24px" />
                        </Link>
                        <Link href="https://www.instagram.com" isExternal mx={2}>
                            <FaInstagram size="24px" />
                        </Link>
                    </Flex>
                </Flex>
                <Text mt={4}>&copy; 2023 Greenvy.store. All rights reserved.</Text>
            </Box>
            </div>
        </>
    );
};

export default Pagefooter;
