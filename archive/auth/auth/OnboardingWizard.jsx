import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseUtils } from '@/lib/supabase/client';
import { Card } from '../../../src/components/ui/card';
import { Step, Stepper } from '../../../src/components/ui/stepper';
import StepLabel from './StepLabel';
import { FormControl, FormLabel } from '../../../src/components/ui/form';
import { Input } from '../../../src/components/ui/input';
import { Textarea } from '../../../src/components/ui/textarea';
import { Select } from '../../../src/components/ui/select';
import { Button } from '../../../src/components/ui/button';
import { Header } from '@radix-ui/react-accordion';

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
    <Card className="p-4">
      <Header as="h2" size="lg" mb={4}>
        Onboarding Wizard
      </Header>
      <Stepper activeStep={step}>
        <Step>
          <StepLabel>Profile & Workspaces</StepLabel>
        </Step>
        <Step>
          <StepLabel>AI, Tools & Actions</StepLabel>
        </Step>
        <Step>
          <StepLabel>Account</StepLabel>
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
          <FormLabel>Display Name</FormLabel>
          <Input
            value={profileData.displayName}
            onChange={e =>
              setProfileData({ ...profileData, displayName: e.target.value })
            }
            placeholder="Enter your display name"
          />
          <FormLabel>Profile Context</FormLabel>
          <Textarea
            value={profileData.profileContext}
            onChange={e =>
              setProfileData({ ...profileData, profileContext: e.target.value })
            }
            placeholder="Describe your profile context"
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
          <FormLabel>AI Preferences</FormLabel>
          <Textarea
            value={profileData.aiPreferences}
            onChange={e =>
              setProfileData({ ...profileData, aiPreferences: e.target.value })
            }
            placeholder="What AI features do you prefer?"
          />
          <FormLabel>Workspace Context</FormLabel>
          <Textarea
            value={profileData.workspaceContext}
            onChange={e =>
              setProfileData({
                ...profileData,
                workspaceContext: e.target.value,
              })
            }
            placeholder="Describe your workspace context"
          />
        </FormControl>
      )}
      {step === 2 && (
        <FormControl>
          <FormLabel>Development Stack and Preferences</FormLabel>
          <Textarea
            value={profileData.developmentStack}
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
      {step === 3 && (
        <FormControl>
          <FormLabel>Review & Submit</FormLabel>
          <Textarea
            value={profileData.review}
            onChange={e =>
              setProfileData({ ...profileData, review: e.target.value })
            }
            placeholder="Review your profile data"
          />
        </FormControl>
      )}
      <Button onClick={handleNext} className="mt-4">
        {step < 3 ? 'Next' : 'Finish'}
      </Button>
    </Card>
  );
};

export default OnboardingWizard;
