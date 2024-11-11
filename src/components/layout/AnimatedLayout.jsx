import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export function AnimatedLayout({ children }) {
  const { sidebarOpen } = useStore((state) => state.ui);
  
  return (
    <div className="h-screen flex overflow-hidden">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 bg-background border-r"
          >
            <Sidebar />
          </motion.aside>
        )}
      </AnimatePresence>
      
      <motion.main
        layout
        className="flex-1 overflow-auto"
        animate={{
          marginLeft: sidebarOpen ? "0" : "-18rem",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.main>
    </div>
  );
} 