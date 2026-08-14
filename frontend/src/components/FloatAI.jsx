import { useState } from "react";
import {  PiX, PiPaperPlaneRight, PiChatDotsBold } from "react-icons/pi";

export default function FloatAI() {
   const [isOpen, setIsOpen] = useState(false);
   const [messages, setMessages] = useState([
      {
         sender: "ai",
         text: "Halo! Saya RAC AI Assistant. Mau cari mobil keluarga, SUV tangguh, atau mobil listrik hemat budget? Tanyakan apa saja!",
      },
   ]);
   const [inputText, setInputText] = useState("");

   const handleSend = (e) => {
      e.preventDefault();
      if (!inputText.trim()) return;

      // Tambah pesan user
      const newMessages = [...messages, { sender: "user", text: inputText }];
      setMessages(newMessages);
      setInputText("");

      // Simulasi respon AI (Nanti diintegrasikan dengan backend LangChain/Groq)
      setTimeout(() => {
         setMessages((prev) => [
            ...prev,
            {
               sender: "ai",
               text: "Terima kasih! Rekomendasi mobil yang cocok sedang dianalisis berdasarkan budget & spesifikasi yang kamu cari...",
            },
         ]);
      }, 800);
   };

   return (
      <>
         {/* CHAT POPUP MODAL */}
         {isOpen && (
            <div className="fixed bottom-24 right-4 sm:right-6 w-[340px] sm:w-[380px] h-[480px] bg-[#141620] border border-white/15 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">

               {/* Header Chat */}
               <div className="bg-[#0C0E16] px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                        <PiChatDotsBold className="text-lg animate-pulse" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">RAC AI Assistant</h4>
                        <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                           5 Token Gratis Tersedia
                        </p>
                     </div>
                  </div>
                  <button
                     onClick={() => setIsOpen(false)}
                     className="btn btn-ghost btn-circle btn-xs text-gray-400 hover:text-white"
                  >
                     <PiX className="text-lg" />
                  </button>
               </div>

               {/* Area Pesan Chat */}
               <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                  {messages.map((msg, idx) => (
                     <div
                        key={idx}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                     >
                        <div
                           className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === "user"
                                 ? "bg-blue-600 text-white rounded-br-none"
                                 : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-none leading-relaxed"
                              }`}
                        >
                           {msg.text}
                        </div>
                     </div>
                  ))}
               </div>

               {/* Input Chat */}
               <form onSubmit={handleSend} className="p-3 bg-[#0C0E16] border-t border-white/10 flex items-center gap-2">
                  <input
                     type="text"
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     placeholder="Tanya rekomendasi mobil..."
                     className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                     type="submit"
                     className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors cursor-pointer"
                  >
                     <PiPaperPlaneRight className="text-sm" />
                  </button>
               </form>

            </div>
         )}

         <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3.5 rounded-full shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20 group"
            aria-label="Tanya RAC AI"
         >
            <PiChatDotsBold className="text-xl animate-spin-slow text-blue-200 group-hover:scale-110 transition-transform" />
            {/* <span className="text-xs font-bold tracking-wide pr-1">AI</span>
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">5</span> */}
         </button>
      </>
   );
}
