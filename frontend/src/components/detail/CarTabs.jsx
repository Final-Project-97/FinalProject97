import { useState } from "react";

export default function CarTabs({ description, specs }) {
   const [activeTab, setActiveTab] = useState("description");

   return (
      <div className="space-y-4">
         <div className="border-b border-white/10 pb-2">
            <div className="flex items-center gap-6">
               <button
                  onClick={() => setActiveTab("description")}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 relative transition-colors cursor-pointer ${activeTab === "description" ? "text-blue-400 font-extrabold" : "text-gray-400 hover:text-white"
                     }`}
               >
                  Description
                  {activeTab === "description" && (
                     <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />
                  )}
               </button>

               <button
                  onClick={() => setActiveTab("specs")}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 relative transition-colors cursor-pointer ${activeTab === "specs" ? "text-blue-400 font-extrabold" : "text-gray-400 hover:text-white"
                     }`}
               >
                  Specifications
                  {activeTab === "specs" && (
                     <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />
                  )}
               </button>
            </div>
         </div>

         <div className="min-h-[140px]">
            {activeTab === "description" ? (
               <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {description}
               </p>
            ) : (
               <div className="divide-y divide-white/5 text-xs">
                  {specs.map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between py-2">
                        <span className="text-gray-400">{item.key}</span>
                        <span className="font-semibold text-white text-right">{item.value}</span>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
