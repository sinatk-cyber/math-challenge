import { Bird } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function SplashScreen() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#129393] px-6 overflow-hidden">
      {/* เอฟเฟกต์วงกลมจางๆ ด้านหลังให้นกดูเด่นขึ้น */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl" 
      />

      {/* ส่วนของโลโก้นก Vibe Bird */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/20 p-8 rounded-full backdrop-blur-sm border border-white/30 shadow-2xl"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bird size={120} className="text-white fill-white/20" />
          </motion.div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 text-4xl font-bold text-white tracking-tight text-center"
        >
          Math Vibe <br />
          <span className="text-2xl font-light opacity-90">Challenge</span>
        </motion.h1>
      </div>

      {/* ปุ่ม Continue ตามแบบ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-16 w-full px-10 max-w-md z-20"
      >
        <Link 
          to="/game" 
          className="btn-vibe w-full bg-white text-[#129393] text-lg font-semibold hover:bg-slate-100 block text-center"
        >
          Continue
        </Link>
      </motion.div>

      {/* ตกแต่งด้านล่างด้วยเส้นคลื่นเบาๆ */}
      <div className="absolute -bottom-10 left-0 w-full h-32 bg-white/5 rounded-[50%_50%_0_0] scale-150 pointer-events-none z-10" />
    </main>
  );
}
