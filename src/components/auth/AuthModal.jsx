import React, { useState } from 'react';
import { Modal } from 'shadcn/ui/modal';
import { Button, Input, FormControl, FormLabel, Text } from 'shadcn/ui';
import { authMiddleware } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        await authMiddleware.signUp(email, password);
        navigate('/onboarding/profile');
      } else {
        await authMiddleware.signIn(email, password);
        navigate('/dashboard');
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        {mode === 'login' ? 'Login' : 'Sign Up'}
      </Modal.Header>
      <Modal.Body>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </FormControl>
        <Button 
          variant="primary" 
          onClick={handleAuth}
          isLoading={loading}
        >
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </Button>
        <Text>
          {mode === 'login'
            ? "Don't have an account? "
            : "Already have an account? "}
          <Button 
            variant="link" 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </Button>
        </Text>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;