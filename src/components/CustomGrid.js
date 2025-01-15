import React from 'react';
import { Box } from '@chakra-ui/react';

const CustomGrid = ({ children, spacing }) => {
    return (
        <Box display="flex" flexWrap="wrap" mx={`-${spacing / 2}px`}>
            {React.Children.map(children, (child) => (
                <Box
                    width={{ base: '100%', md: 'calc(25% - 20px)' }}
                    px={`${spacing / 2}px`}
                    mb={`${spacing * 2}px`}
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    height='fit-content'
                >
                    {child}
                </Box>
            ))}
        </Box>
    );
};

export default CustomGrid;
