import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from 'shadcn/ui';
import { Stepper, Step } from 'shadcn/ui/stepper';
import { useNavigate } from 'react-router-dom';
import { databaseUtils } from '../lib/supabase';
import StepLabel from './StepLabel';
const OnboardingWizard = () => {
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    role: '',
    interests: '',
    aiPreferences: '',
    communicationStyle: '',
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save profile data and navigate to the dashboard
      databaseUtils.saveProfileData(profileData);
      navigate('/dashboard');
    }
  };

  return (
    <Box className="p-4">
      <Heading as="h2" size="lg" mb={4}>
        Onboarding Wizard
      </Heading>
      <Stepper activeStep={step}>
        <Step>
          <StepLabel>Profile Info</StepLabel>
        </Step>
        <Step>
          <StepLabel>AI Preferences</StepLabel>
        </Step>
        <Step>
          <StepLabel>Communication Style</StepLabel>
        </Step>
        <Step>
          <StepLabel>Review & Submit</StepLabel>
        </Step>
      </Stepper>
      {step === 0 && (
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            value={profileData.name}
            onChange={e =>
              setProfileData({ ...profileData, name: e.target.value })
            }
            placeholder="Enter your name"
          />
          <FormLabel>Role</FormLabel>
          <Select
            value={profileData.role}
            onChange={e =>
              setProfileData({ ...profileData, role: e.target.value })
            }
          >
            <option value="">Select your role</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
          </Select>
        </FormControl>
      )}
      {step === 1 && (
        <FormControl>
          <FormLabel>Interests</FormLabel>
          <Textarea
            value={profileData.interests}
            onChange={e =>
              setProfileData({ ...profileData, interests: e.target.value })
            }
            placeholder="What are your interests?"
          />
        </FormControl>
      )}
      {step === 2 && (
        <FormControl>
          <FormLabel>AI Preferences</FormLabel>
          <Textarea
            value={profileData.aiPreferences}
            onChange={e =>
              setProfileData({ ...profileData, aiPreferences: e.target.value })
            }
            placeholder="What AI features do you prefer?"
          />
        </FormControl>
      )}
      {step === 3 && (
        <FormControl>
          <FormLabel>Communication Style</FormLabel>
          <Textarea
            value={profileData.communicationStyle}
            onChange={e =>
              setProfileData({
                ...profileData,
                communicationStyle: e.target.value,
              })
            }
            placeholder="Describe your preferred communication style"
          />
        </FormControl>
      )}
      <Button onClick={handleNext} className="mt-4">
        {step < 3 ? 'Next' : 'Finish'}
      </Button>
    </Box>
  );
};

export default OnboardingWizard;
