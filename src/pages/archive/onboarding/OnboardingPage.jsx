// import React from 'react';
// import { useOpenAI } from '@/hooks/use-openai';
// import { useNavigate } from 'react-router-dom';
// import { ApiKeyInput } from '@/components/shared/ApiKeyInput';
// import { Button } from '@/components/ui/button';
// import { ArrowRight } from 'lucide-react';

// export function OnboardingPage() {
//   const { apiKey, isInitialized } = useOpenAI();
//   const navigate = useNavigate();

//   React.useEffect(() => {
//     if (apiKey && isInitialized) {
//       navigate('/dashboard');
//     }
//   }, [apiKey, isInitialized, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="max-w-md w-full space-y-8 p-8">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold">Welcome</h1>
//           <p className="mt-2 text-muted-foreground">
//             Let's get you set up with your OpenAI API key
//           </p>
//         </div>

//         <ApiKeyInput />

//         {apiKey && isInitialized && (
//           <Button
//             className="w-full gap-2"
//             onClick={() => navigate('/dashboard')}
//           >
//             Continue to Dashboard
//             <ArrowRight className="w-4 h-4" />
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default OnboardingPage; 