
import { motion } from "framer-motion";
import { FC } from "react";


const GradientHeader: FC = () => {
  return (
    <>
    <div className="relative py-16 overflow-hidden bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-purple-500/20 opacity-80 blur-3xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative container mx-auto text-center z-10"
      >
        
      </motion.div>
    </div>
      
    </>
  );
};

export default GradientHeader;
