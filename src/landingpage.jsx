import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, Smile, Camera } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex flex-col items-center justify-center text-white overflow-hidden relative">
      {/* Animated Background Circles */}
      <motion.div
        className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-20 left-10"
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
      ></motion.div>
      <motion.div
        className="absolute w-80 h-80 bg-pink-400/10 rounded-full blur-3xl bottom-10 right-10"
        animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      ></motion.div>

      {/* Main Heading */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold mb-4 text-center text-white text-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        AI Emotion Detector
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg md:text-xl text-center max-w-2xl mb-8 text-white/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Understand human emotions through AI-powered face & text analysis.  
        <br /> Experience real-time emotion tracking like never before!
      </motion.p>

      {/* Features */}
      <div className="flex flex-wrap justify-center gap-8 mb-10">
        {[
          { icon: <Camera className="w-8 h-8 text-pink-300" />, text: "Face Detection" },
          { icon: <Smile className="w-8 h-8 text-yellow-300" />, text: "Emotion Analysis" },
          { icon: <Brain className="w-8 h-8 text-blue-300" />, text: "AI Insights" },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            className="flex flex-col items-center bg-white/10 p-6 rounded-2xl backdrop-blur-lg shadow-lg hover:bg-white/20 transition"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 * idx }}
          >
            {feature.icon}
            <p className="mt-2 font-medium">{feature.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Button */}
      <motion.button
        className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-indigo-100 hover:scale-105 transition-all shadow-md"
        onClick={() => navigate("/app")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Get Started →
      </motion.button>

      <footer className="absolute bottom-5 text-white/60 text-sm">
        © 2025 AI Emotion Detector | Built with ❤️ by Mood Buster Team
      </footer>
    </div>
  );
};

export default LandingPage;
