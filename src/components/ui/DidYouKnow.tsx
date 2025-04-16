import React, { useEffect, useState, useCallback } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import medicalFacts from '@/data/medicalFacts.json';

interface MedicalFact {
  fact: string;
  source: string;
}

export const DidYouKnow = () => {
  const [currentFact, setCurrentFact] = useState<MedicalFact>(medicalFacts[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [usedFactIndices, setUsedFactIndices] = useState<number[]>([0]);

  const getRandomFact = useCallback(() => {
    const unusedFactIndices = medicalFacts
      .map((_, index) => index)
      .filter(index => !usedFactIndices.includes(index));
    
    // If all facts have been used, reset the used facts
    if (unusedFactIndices.length === 0) {
      setUsedFactIndices([]);
      const randomIndex = Math.floor(Math.random() * medicalFacts.length);
      return medicalFacts[randomIndex];
    }
    
    const randomIndex = unusedFactIndices[Math.floor(Math.random() * unusedFactIndices.length)];
    setUsedFactIndices(prev => [...prev, randomIndex]);
    return medicalFacts[randomIndex];
  }, [usedFactIndices]);

  const changeFact = useCallback(() => {
    setIsVisible(false);
    // Wait for exit animation to complete
    const timeout = setTimeout(() => {
      setCurrentFact(getRandomFact());
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [getRandomFact]);

  useEffect(() => {
    // Set up interval to change facts every 35 seconds
    const interval = setInterval(changeFact, 35000);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, [changeFact]);

  const handleClose = () => {
    setIsVisible(false);
    // Show new fact after 35 seconds
    setTimeout(() => {
      setCurrentFact(getRandomFact());
      setIsVisible(true);
    }, 35000);
  };

  if (!currentFact) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-24 right-4 max-w-sm bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg border border-blue-100 p-4 z-[100]"
        >
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-blue-100 rounded-full">
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Did You Know?</h3>
              <p className="text-sm text-gray-600">{currentFact.fact}</p>
              <span className="inline-block mt-2 text-xs text-blue-500 font-medium px-2 py-1 bg-blue-50 rounded-full">
                Source: {currentFact.source}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 