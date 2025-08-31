import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const NavBar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-gray-200" />
            </div>
            <span className="text-xl font-bold text-gray-200">
              Banana Studio
            </span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
