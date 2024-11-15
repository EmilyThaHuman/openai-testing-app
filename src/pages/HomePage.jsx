import { Button } from '@/components/ui/button'
import { DotPattern } from '@/components/ui/DotPattern'
import { PromptsMarquee } from '@/components/ui/PromptsMarquee'
import { Navigation } from '@/layout/Navigation'
import { fadeInAnimation, floatAnimation } from '@/lib/utils'
import { motion } from 'framer-motion'
import { FaBolt, FaCode, FaRobot, FaTools } from 'react-icons/fa'

export function HomePage() {
  return (
    <div className="min-h-screen bg-background relative">
      <Navigation />

      <DotPattern className="opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

      <main className="relative overflow-hidden">
        <motion.div 
          className="relative z-10 py-16 container mx-auto px-4 text-center"
          {...fadeInAnimation}
        >
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm mb-6">
              <FaBolt className="mr-2" />
              Visualize API Integrations
            </span>
          </motion.div>

          <motion.h1 
            className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
            {...floatAnimation}
          >
            Test OpenAI APIs with Confidence
          </motion.h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Interactive playground for testing and visualizing OpenAI API endpoints.
            <br />
            <span className="font-semibold text-primary">
              Real-time responses, data visualization, and intuitive UI
            </span>
            <br />
            Perfect for developers building AI-powered applications.
          </p>

          <div className="flex justify-center space-x-4 mb-12">
            <Button
              size="lg"
              className="hover:-translate-y-1 transition-transform"
              onClick={() => window.location.href='/openai-test'}
            >
              Try API Playground
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="hover:-translate-y-1 transition-transform"
              onClick={() => window.location.href='/auth/register'}
            >
              Get Started
            </Button>
          </div>

          <div className="mb-16 -mx-4">
            <PromptsMarquee />
          </div>

          <div className="flex justify-center space-x-8 mb-16">
            {[
              { Icon: FaRobot, color: 'text-primary', delay: 0, label: 'AI Models' },
              { Icon: FaCode, color: 'text-primary', delay: 0.2, label: 'API Testing' },
              { Icon: FaTools, color: 'text-primary', delay: 0.4, label: 'Developer Tools' }
            ].map(({ Icon, color, delay, label }, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center space-y-2"
                {...floatAnimation}
                style={{ animationDelay: `${delay}s` }}
              >
                <Icon className={`text-5xl ${color}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Resources
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore our documentation and guides to get started with OpenAI API testing.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
} 