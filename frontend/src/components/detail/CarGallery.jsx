export default function CarGallery({
   colors,
   selectedColor,
   onSelectColor,
   mainImage,
}) {
   return (
      <div className="flex flex-col space-y-5">

         {/* Studio Frame */}
         <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#181B26] to-[#0E1017] shadow-2xl p-6 sm:p-10 flex items-center justify-center min-h-[320px] sm:min-h-[420px]">

            {/* Main Display */}
            <img
               src={mainImage}
               alt={selectedColor?.name || "Car"}
               className="w-full max-w-[520px] h-auto object-contain drop-shadow-2xl transition-all duration-300 hover:scale-105"
            />

            {/* Availability Badge */}
            {selectedColor && (
               <div className="absolute bottom-5 left-5 bg-[#141620]/90 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <span
                     className={`w-2 h-2 rounded-full ${selectedColor.availability === "available" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                        }`}
                  />
                  <span className="text-[11px] font-semibold text-gray-200">
                     {selectedColor.name} — {selectedColor.availability === "available" ? "In Stock" : "Limited Stock"}
                  </span>
               </div>
            )}
         </div>

         {/* Available Color Options */}
         <div className="bg-[#141620] border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="mb-3">
               <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Available Color Options
               </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
               {colors.map((color) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                     <button
                        key={color.name}
                        type="button"
                        onClick={() => onSelectColor(color)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                              ? "bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/20"
                              : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                           }`}
                     >
                        <div
                           className={`w-7 h-7 rounded-full shadow-inner ${isSelected ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#141620]" : ""
                              }`}
                           style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-[10px] font-medium text-gray-200 text-center truncate w-full">
                           {color.name}
                        </span>
                        <span
                           className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${color.availability === "available"
                                 ? "bg-emerald-500/20 text-emerald-400"
                                 : "bg-amber-500/20 text-amber-400"
                              }`}
                        >
                           {color.availability === "available" ? "In Stock" : "Limited"}
                        </span>
                     </button>
                  );
               })}
            </div>
         </div>

      </div>
   );
}