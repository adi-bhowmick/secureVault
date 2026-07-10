import { motion } from 'framer-motion';

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const AnimatedCard = ({ children, className = '', delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

const AnimatedList = ({ children, className = '' }) => (
  <motion.div
    variants={stagger}
    initial="initial"
    animate="animate"
    className={className}
  >
    {children}
  </motion.div>
);

const AnimatedListItem = ({ children, className = '' }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

export { AnimatedCard, AnimatedList, AnimatedListItem };
