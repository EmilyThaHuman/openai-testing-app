import { Button } from '@/components/ui/button';
import { DotPattern } from '@/components/ui/DotPattern';
import { PromptsMarquee } from '@/components/ui/PromptsMarquee';
import { Navigation } from '@/layout/Navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FaBolt,
  FaCode,
  FaRobot,
  FaTools,
  FaGithub,
  FaPlay,
  FaSignInAlt,
} from 'react-icons/fa';
import { useRef } from 'react';
import { CONVERTED_PROMPTS_LIBRARY } from '@/lib/constants/prompts';
import { AppIcon } from '@/components/ui/AppIcon';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Filter and transform prompts data
  const prompts = Object.entries(CONVERTED_PROMPTS_LIBRARY)
    .filter(([_, value]) => value && value.task)
    .map(([key, value]) => ({
      icon: value.icon || '📝',
      title: value.title || key,
      description: value.task
        ? value.task.length > 100
          ? `${value.task.substring(0, 100)}...`
          : value.task
        : 'No description available',
    }));

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/open-canvas');
    } else {
      navigate('/auth/register');
    }
  };

  const handleTryPlayground = () => {
    if (isAuthenticated) {
      navigate('/open-canvas');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div
      className="min-h-screen bg-background relative w-full overflow-x-hidden"
      style={{ position: 'relative' }}
      ref={containerRef}
    >
      <Navigation />

      <DotPattern className="opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />

      <main className="relative">
        <motion.div
          className="relative z-10 pt-32 pb-16 px-4 text-center"
          style={{ opacity, scale, y }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Container for all content except marquee */}
          <div className="max-w-7xl mx-auto">
            {/* Hero section */}
            <motion.div
              className="flex flex-col items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AppIcon size="xl" className="mb-6" />
              <motion.span
                className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm"
                whileHover={{ scale: 1.05, backgroundColor: 'var(--primary)' }}
                transition={{ duration: 0.2 }}
              >
                <FaBolt className="mr-2" />
                Visualize API Integrations
              </motion.span>
            </motion.div>

            <motion.h1
              className="text-[clamp(2.5rem,8vw,5rem)] leading-[1.1] font-bold mb-8 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Test OpenAI APIs
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                with Confidence
              </span>
            </motion.h1>

            <motion.div
              className="max-w-3xl mx-auto space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <p className="text-xl text-muted-foreground">
                Interactive playground for testing and visualizing OpenAI API
                endpoints.
              </p>
              <p className="text-lg font-medium text-primary">
                Real-time responses, data visualization, and intuitive UI
              </p>
              <p className="text-muted-foreground">
                Perfect for developers building AI-powered applications.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <RainbowButton
                onClick={handleTryPlayground}
                className="flex items-center gap-2"
              >
                <FaPlay className="text-xl" />
                Try API Playground
              </RainbowButton>

              <RainbowButton
                onClick={handleGetStarted}
                className="flex items-center gap-2"
              >
                <FaSignInAlt className="text-xl" />
                Get Started
              </RainbowButton>

              <RainbowButton
                onClick={() =>
                  window.open(
                    'https://github.com/EmilyThaHuman/openai-testing-app',
                    '_blank'
                  )
                }
                className="flex items-center gap-2"
              >
                <FaGithub className="text-xl" />
                View on GitHub
              </RainbowButton>
            </motion.div>
          </div>

          {/* Prompts Marquee - allowed to overflow */}
          <div className="w-screen -mx-4">
            <PromptsMarquee prompts={prompts} />
          </div>

          {/* Container for content after marquee */}
          <div className="max-w-7xl mx-auto">
            {/* Feature Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {[
                {
                  Icon: FaRobot,
                  label: 'AI Models',
                  description: 'Test various OpenAI models',
                },
                {
                  Icon: FaCode,
                  label: 'API Testing',
                  description: 'Visualize API responses',
                },
                {
                  Icon: FaTools,
                  label: 'Developer Tools',
                  description: 'Debug and optimize',
                },
              ].map(({ Icon, label, description }, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center p-6 rounded-xl bg-secondary/50"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: 'var(--secondary)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="text-4xl text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Resources Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-4">Resources</h2>
              <p className="text-lg text-muted-foreground">
                Explore our documentation and guides to get started with OpenAI
                API testing.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default HomePage;
