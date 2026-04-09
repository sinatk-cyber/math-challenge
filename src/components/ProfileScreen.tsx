import React from 'react';
import { ArrowLeft, Settings, User, Mail, Award, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function ProfileScreen() {
  // ข้อมูลสมมติ (ในอนาคตจะดึงมาจาก Firebase Auth)
  const userStats = {
    solved: 124,
    streak: 15,
    rank: "Math Scholar"
  };

  return (
    <main className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Header Profile ส่วนบน (สี Teal พร้อมปุ่ม Setting) */}
      <div className="relative h-72 bg-[#129393] pt-6 px-6 text-white flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <Link to="/game" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Profile</h1>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Settings size={24} />
          </button>
        </div>

        {/* รูปโปรไฟล์ */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-4"
        >
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-200 shadow-lg">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
            <Award size={14} className="text-[#129393]" />
          </div>
        </motion.div>

        <motion.h2 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold"
        >
          Vibe Student #2026
        </motion.h2>
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm opacity-80 font-light"
        >
          {userStats.rank}
        </motion.p>

        {/* ส่วนแสดงสถิติ (Stats Bar เหมือนในรูป) */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-12 mt-6 w-full max-w-xs"
        >
          <div className="text-center">
            <p className="text-xl font-bold">{userStats.solved}</p>
            <p className="text-[10px] uppercase tracking-widest opacity-70">Solved</p>
          </div>
          <div className="w-[1px] h-8 bg-white/30 self-center" />
          <div className="text-center">
            <p className="text-xl font-bold">{userStats.streak}</p>
            <p className="text-[10px] uppercase tracking-widest opacity-70">Day Streak</p>
          </div>
        </motion.div>

        {/* ส่วนโค้งขาวด้านล่าง */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-white rounded-t-[2.5rem]" />
      </div>

      {/* รายละเอียดข้อมูล (List Items) */}
      <div className="flex-1 px-8 py-4 space-y-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <ProfileItem icon={<User size={18} />} label="Full Name" value="Math Enthusiast" />
          <ProfileItem icon={<Mail size={18} />} label="Email" value="student@vibemail.com" />
          <ProfileItem icon={<MapPin size={18} />} label="University" value="Vibe University" />
        </motion.div>

        {/* ปุ่ม Log Out */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8"
        >
          <Link 
            to="/" 
            className="btn-vibe w-full bg-[#129393] text-white flex items-center justify-center gap-2 shadow-md hover:bg-[#0b6b6b]"
          >
            Log Out
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

// Component ย่อยสำหรับรายการข้อมูล
function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 group cursor-pointer hover:bg-slate-50 transition-colors rounded-lg p-2 -mx-2">
      <div className="flex items-center gap-4">
        <div className="text-[#129393] opacity-60">
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{label}</p>
          <p className="text-slate-700 font-medium">{value}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300 group-hover:text-[#129393] transition-colors" />
    </div>
  );
}
