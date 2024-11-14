import React, { useState } from 'react';
import { Button } from 'shadcn/ui/button';
import { Modal } from 'shadcn/ui/modal';
import { Heading, Text, Container, Flex, Box, VStack, HStack } from 'shadcn/ui';
import AuthModal from '../components/AuthModal';

const LandingPage = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  return (
    <Box className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex items-center">
      <Container>
        <Flex
          direction={['column', 'row']}
          align="center"
          justify="space-between"
        >
          {/* Hero Content */}
          <VStack spacing={6} align="start" maxW="500px" color="white">
            <Heading as="h1" size="3xl" mb={4}>
              AI Companion Platform
            </Heading>
            <Text fontSize="xl" mb={6}>
              Unlock the power of AI with personalized assistants tailored to
              your unique needs.
            </Text>
            <HStack spacing={4}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
              >
                Login
              </Button>
            </HStack>
          </VStack>

          {/* Illustration/Graphic */}
          <Box className="relative w-full md:w-1/2 h-500">
            {/* Add an AI/Tech illustration or animation */}
            <svg viewBox="0 0 200 200">
              {/* Complex AI-themed SVG illustration */}
            </svg>
          </Box>
        </Flex>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />
      </Container>
    </Box>
  );
};

export default LandingPage;
