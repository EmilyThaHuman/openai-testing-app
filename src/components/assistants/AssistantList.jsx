import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlayCircle, Edit, Loader2, Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';


// Animation variants
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

const AssistantCard = React.memo(
  ({ assistant, isSelected, onSelect, onStartRun, onStartEdit, isRunning }) => (
    <motion.div variants={itemVariants} layout layoutId={assistant.id}>
      <Card
        className={cn(
          'p-4 hover:bg-accent/50 transition-all duration-200',
          'border border-border/50 shadow-sm',
          'cursor-pointer relative overflow-hidden',
          isSelected && 'bg-accent border-accent'
        )}
        onClick={() => onSelect?.(assistant)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <h3 className="font-medium truncate">{assistant.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {assistant.id}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onStartEdit?.(assistant);
              }}
              disabled={isRunning || !isSelected}
              className="h-8 px-2 hover:bg-background/80"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onStartRun?.(assistant);
              }}
              disabled={isRunning || !isSelected}
              className="h-8 px-2 hover:bg-background/80"
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Run
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
);

AssistantCard.displayName = 'AssistantCard';

const LoadingState = () => (
  <motion.div
    variants={listVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="space-y-4"
  >
    {[1, 2, 3].map(i => (
      <motion.div
        key={i}
        variants={itemVariants}
        className="p-4 border rounded-lg shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[70px]" />
            <Skeleton className="h-8 w-[70px]" />
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const EmptyState = ({ onCreateNew }) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="text-center py-12"
  >
    <div className="max-w-sm mx-auto space-y-4">
      <p className="text-muted-foreground mb-4">
        No assistants available. Create your first assistant to get started.
      </p>
      <Button onClick={onCreateNew} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Assistant
      </Button>
    </div>
  </motion.div>
);

const AssistantList = ({
  assistants,
  selectedAssistant,
  onAssistantSelect,
  onStartRun,
  onStartEdit,
  isRunning,
  loading,
  onCreateNew,
}) => {
  const assistantArray = Array.isArray(assistants) ? assistants : [];

  return (
    <Card className="p-6 shadow-md border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Assistants</h2>
        <Button onClick={onCreateNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Assistant
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-15rem)] pr-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState />
          ) : assistantArray.length === 0 ? (
            <EmptyState onCreateNew={onCreateNew} />
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {assistantArray.map(assistant => (
                <AssistantCard
                  key={assistant.id}
                  assistant={assistant}
                  isSelected={selectedAssistant?.id === assistant.id}
                  onSelect={onAssistantSelect}
                  onStartRun={onStartRun}
                  onStartEdit={onStartEdit}
                  isRunning={isRunning}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </Card>
  );
};

AssistantList.propTypes = {
  assistants: PropTypes.array,
  selectedAssistant: PropTypes.object,
  onAssistantSelect: PropTypes.func,
  onStartRun: PropTypes.func,
  onStartEdit: PropTypes.func,
  isRunning: PropTypes.bool,
  loading: PropTypes.bool,
  onCreateNew: PropTypes.func,
};

export default React.memo(AssistantList);
