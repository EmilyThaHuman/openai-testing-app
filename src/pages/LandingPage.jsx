import React, { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button'; // Importing Button from shadcn/ui
import { Code2, LibraryIcon, Sparkles } from 'lucide-react';
import { GitHubIcon } from '@/assets/humanIcons';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Hero Content */}
          <div className="flex flex-col items-start space-y-6 max-w-md text-white">
            <h1 className="text-5xl font-bold mb-4">ReedAi Api Playground</h1>
            <p className="text-xl mb-6">
              Save time and money on failed api integrations. Use ReedAi to
              generate and test your api integrations before you deploy them.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => {
                  navigate('/auth/register');
                  // setAuthMode('signup');
                  // setAuthModalOpen(true);
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  navigate('/auth/login');
                  // setAuthMode('login');
                  // setAuthModalOpen(true);
                }}
              >
                Login
              </Button>
            </div>
          </div>

          {/* Illustration/Graphic */}
          <div className="relative w-full md:w-1/2 h-96">
            {/* Add an AI/Tech illustration or animation */}
            <svg viewBox="0 0 200 200">
              {/* Complex AI-themed SVG illustration */}
            </svg>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-col items-center space-y-6 max-w-md text-white">
          <h2 className="text-3xl font-bold mb-4">Unique Features</h2>
        </div>
        <div className="flex flex-col items-center space-y-6 max-w-md text-white">
          <h3 className="text-2xl font-bold mb-4">
            <LibraryIcon className="w-6 h-6" /> Prompt Library
          </h3>
          <p className="text-lg mb-6">
            Use our prompt library to get started quickly or create your own
            prompts.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-6 max-w-md text-white">
          <h3 className="text-2xl font-bold mb-4">
            <Code2 className="w-6 h-6" /> Sophisticated Code Generation
          </h3>
          <p className="text-lg mb-6">
            Our code generation is powered by advanced AI models that have been
            trained and sequenced with extensive tool call utilites to generate
            complex and sophisticated code.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-6 max-w-md text-white">
          <h3 className="text-2xl font-bold mb-4">
            <Sparkles className="w-6 h-6" /> Advanced Prompting
          </h3>
          <p className="text-lg mb-6">
            Our prompt library is designed to be used with our advanced
            prompting system to generate complex and sophisticated code.
          </p>
        </div>

        {/* Footer with GitHub Link */}
        <footer className="bg-transparent py-4">
          <div className="container mx-auto px-4 text-center">
            <a
              href="https://github.com/EmilyThaHuman"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-white hover:text-gray-300"
            >
              <GitHubIcon className="w-5 h-5 mr-2" />
              <span>View my GitHub Profile</span>
            </a>
          </div>
        </footer>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    </div>
  );
};

export default LandingPage;
