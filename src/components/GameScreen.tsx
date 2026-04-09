import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, HelpCircle, ArrowLeft, Delete, Loader2, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

type Token = {
  type: 'num';
  value: number;
  index: number;
} | {
  type: 'op';
  value: string;
};

export default function GameScreen() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Hint & Solution states
  const [hint, setHint] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isSolutionLoading, setIsSolutionLoading] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  // สุ่มโจทย์ใหม่
  const generateNewGame = () => {
    const newNums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) + 1);
    const newTarget = Math.floor(Math.random() * 100);
    setNumbers(newNums);
    setTarget(newTarget);
    setTokens([]);
    setCurrentResult(null);
    setIsCorrect(false);
    setHint(null);
    setSolution(null);
    setShowHintModal(false);
    setShowSolutionModal(false);
  };

  useEffect(() => {
    generateNewGame();
  }, []);

  const userEquation = tokens.map(t => t.value).join('');
  const usedIndices = tokens.filter(t => t.type === 'num').map(t => (t as any).index);

  // ระบบคำนวณผลลัพธ์แบบ Real-time (Safe Eval)
  useEffect(() => {
    if (tokens.length === 0) {
      setCurrentResult(null);
      setIsCorrect(false);
      return;
    }

    try {
      // แทนค่าสัญลักษณ์เพื่อการคำนวณ
      let sanitized = userEquation
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      
      // จัดการ Square Root: 
      // 1. กรณี √ ตามด้วยตัวเลข (เช่น √9 -> Math.sqrt(9))
      sanitized = sanitized.replace(/√(\d+(?:\.\d+)?)/g, 'Math.sqrt($1)');
      // 2. กรณี √ ตามด้วยวงเล็บ (เช่น √(9) -> Math.sqrt(9))
      sanitized = sanitized.replace(/√\(/g, 'Math.sqrt(');
      
      // eslint-disable-next-line no-eval
      const res = eval(sanitized);
      if (typeof res === 'number' && isFinite(res)) {
        setCurrentResult(res);
        
        // ตรวจสอบว่าผลลัพธ์ตรงเป้าหมาย และใช้ตัวเลขครบทั้ง 5 ตัว
        const allNumbersUsed = usedIndices.length === 5;
        if (Math.abs(res - target) < 0.001 && allNumbersUsed) {
          setIsCorrect(true);
        } else {
          setIsCorrect(false);
        }
      } else {
        setCurrentResult(null);
        setIsCorrect(false);
      }
    } catch {
      setCurrentResult(null);
      setIsCorrect(false);
    }
  }, [tokens, target, userEquation, usedIndices.length]);

  const addOp = (op: string) => {
    if (isCorrect) return;
    setTokens(prev => [...prev, { type: 'op', value: op }]);
  };

  const addNum = (num: number, index: number) => {
    if (isCorrect) return;
    if (usedIndices.includes(index)) return;
    setTokens(prev => [...prev, { type: 'num', value: num, index }]);
  };

  const backspace = () => {
    if (isCorrect) return;
    setTokens(prev => prev.slice(0, -1));
  };

  const getHint = async () => {
    if (isHintLoading) return;
    if (hint) {
      setShowHintModal(true);
      return;
    }

    setIsHintLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
        throw new Error("MISSING_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a math game assistant. The user is playing a game where they must use exactly 5 numbers to reach a target result using basic operators (+, -, *, /) and parentheses.
        Numbers: [${numbers.join(', ')}]
        Target: ${target}
        Provide a hint in Thai language. Do not give the full solution immediately. Give a small clue or a starting point. Keep it short and encouraging.`,
      });
      
      setHint(response.text || "ขออภัย ไม่สามารถสร้างคำใบ้ได้ในขณะนี้");
      setShowHintModal(true);
    } catch (error: any) {
      console.error("Error fetching hint:", error);
      if (error.message === "MISSING_API_KEY") {
        setHint("ไม่พบ API Key สำหรับ Gemini AI กรุณาตั้งค่า GEMINI_API_KEY ใน Environment Variables ของ Netlify แล้วทำการ Deploy ใหม่");
      } else {
        setHint("เกิดข้อผิดพลาดในการดึงคำใบ้ กรุณาลองใหม่อีกครั้ง");
      }
      setShowHintModal(true);
    } finally {
      setIsHintLoading(false);
    }
  };

  const getSolution = async () => {
    if (isSolutionLoading) return;
    if (solution) {
      setShowSolutionModal(true);
      return;
    }

    setIsSolutionLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
        throw new Error("MISSING_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a math game assistant. The user is playing a game where they must use exactly 5 numbers to reach a target result using basic operators (+, -, *, /) and parentheses.
        Numbers: [${numbers.join(', ')}]
        Target: ${target}
        Provide the full solution in Thai language. Show the step-by-step calculation that uses all 5 numbers to reach the target. If no solution is possible, explain why and suggest a close alternative.`,
      });
      
      setSolution(response.text || "ขออภัย ไม่สามารถสร้างเฉลยได้ในขณะนี้");
      setShowSolutionModal(true);
    } catch (error: any) {
      console.error("Error fetching solution:", error);
      if (error.message === "MISSING_API_KEY") {
        setSolution("ไม่พบ API Key สำหรับ Gemini AI กรุณาตั้งค่า GEMINI_API_KEY ใน Environment Variables ของ Netlify แล้วทำการ Deploy ใหม่");
      } else {
        setSolution("เกิดข้อผิดพลาดในการดึงเฉลย กรุณาลองใหม่อีกครั้ง");
      }
      setShowSolutionModal(true);
    } finally {
      setIsSolutionLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden">
      {/* Header Wave ส่วนบน */}
      <div className="relative h-48 bg-[#129393] flex flex-col items-center justify-center text-white px-6">
        <div className="absolute top-6 left-4">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
        </div>
        <div className="absolute top-6 right-4">
          <Link to="/profile" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <User size={24} />
          </Link>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          className="text-sm uppercase tracking-widest font-semibold"
        >
          Target Result
        </motion.p>
        <motion.h2 
          key={target}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black"
        >
          {target}
        </motion.h2>
        <div className="absolute -bottom-1 left-0 right-0 h-12 bg-[#f8fafc] rounded-t-[3rem]" />
      </div>

      <div className="flex-1 px-6 -mt-6">
        {/* ตัวเลขที่กำหนดให้ 5 ตัว */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <p className="text-xs text-slate-400 mb-4 font-medium text-center uppercase tracking-tighter">
            Use all 5 numbers: ({usedIndices.length}/5)
          </p>
          <div className="flex justify-between items-center">
            {numbers.map((num, i) => {
              const isUsed = usedIndices.includes(i);
              return (
                <motion.div 
                  key={`${target}-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: isUsed ? 0.4 : 1,
                    backgroundColor: isUsed ? '#f1f5f9' : '#e0f2f2'
                  }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-12 h-12 rounded-full text-[#129393] flex items-center justify-center text-xl font-bold shadow-sm border border-[#129393]/10 transition-colors`}
                >
                  {num}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ช่องแสดงสมการ */}
        <motion.div 
          animate={{ 
            borderColor: isCorrect ? '#4ade80' : '#f1f5f9',
            backgroundColor: isCorrect ? '#f0fdf4' : '#ffffff'
          }}
          className={`rounded-2xl p-6 min-h-[100px] shadow-inner border-2 transition-colors relative`}
        >
          <div className="text-2xl font-mono text-slate-700 break-all min-h-[1.5em]">
            {userEquation || <span className="text-slate-300 italic">Enter equation...</span>}
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-[#129393]'}`}>
                Current: {currentResult !== null ? (Number.isInteger(currentResult) ? currentResult : currentResult.toFixed(2)) : '?'}
              </span>
              {!isCorrect && usedIndices.length < 5 && userEquation && (
                <span className="text-[10px] text-orange-500 font-medium italic">
                  * Must use all 5 numbers
                </span>
              )}
            </div>
            <AnimatePresence>
              {isCorrect && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1 text-green-600 font-bold animate-bounce"
                >
                  <CheckCircle2 size={18} /> Perfect!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* แผงควบคุม (Pad) */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {['+', '-', '×', '÷', '(', ')', '^', '√'].map((op) => (
            <button 
              key={op} 
              onClick={() => addOp(op)} 
              className="h-14 bg-white rounded-xl shadow-sm border border-slate-100 text-[#129393] text-xl font-bold hover:bg-[#e0f2f2] active:scale-95 transition-all"
            >
              {op}
            </button>
          ))}
          {/* ปุ่มตัวเลข (กดเพื่อเพิ่มลงในสมการ) */}
          {numbers.map((num, i) => {
            const isUsed = usedIndices.includes(i);
            return (
              <button 
                key={`btn-${i}`} 
                disabled={isUsed}
                onClick={() => addNum(num, i)} 
                className={`h-14 rounded-xl shadow-md text-xl font-bold active:scale-95 transition-all ${
                  isUsed 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-[#129393] text-white hover:bg-[#0b6b6b]'
                }`}
              >
                {num}
              </button>
            );
          })}
          <button 
            onClick={backspace} 
            className="h-14 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all"
          >
            <Delete size={24} />
          </button>
          <button 
            onClick={generateNewGame} 
            className="h-14 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 mt-auto grid grid-cols-2 gap-3">
        <button 
          onClick={getHint}
          disabled={isHintLoading || isSolutionLoading}
          className="btn-vibe btn-vibe-outline flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isHintLoading ? <Loader2 className="animate-spin" size={20} /> : <HelpCircle size={20} />}
          {isHintLoading ? 'Thinking...' : 'Hint'}
        </button>
        <button 
          onClick={getSolution}
          disabled={isSolutionLoading || isHintLoading}
          className="btn-vibe border-2 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSolutionLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
          {isSolutionLoading ? 'Solving...' : 'Solution'}
        </button>
        <AnimatePresence>
          {isCorrect && (
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={generateNewGame} 
              className="col-span-2 btn-vibe btn-vibe-primary shadow-xl shadow-brand-primary/30 mt-2"
            >
              Next Challenge
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowHintModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-brand-light rounded-2xl">
                  <HelpCircle className="text-brand-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">คำใบ้ (Hint)</h3>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                "{hint}"
              </p>
              <button 
                onClick={() => setShowHintModal(false)}
                className="w-full mt-8 py-3 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-dark transition-colors"
              >
                เข้าใจแล้ว!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Solution Modal */}
      <AnimatePresence>
        {showSolutionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSolutionModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-2xl">
                  <CheckCircle2 className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">เฉลย (Solution)</h3>
              </div>
              <div className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-sm whitespace-pre-wrap">
                {solution}
              </div>
              <button 
                onClick={() => setShowSolutionModal(false)}
                className="w-full mt-8 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
