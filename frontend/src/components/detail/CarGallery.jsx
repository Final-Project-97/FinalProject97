import { useState } from "react";
import { PiCube, PiImage } from "react-icons/pi";

export default function CarGallery({
   colors,
   gallery,
   selectedColor,
   onSelectColor,
   mainImage,
   onSelectImage,
   image360Url,
}) {
   const [viewMode, setViewMode] = useState("2d");

   return (
      <div className="flex flex-col space-y-6">

         {/* Studio Frame */}
         <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#181B26] to-[#0E1017] shadow-2xl p-6 sm:p-10 flex items-center justify-center min-h-[320px] sm:min-h-[420px]">

            {/* 3D Toggle */}
            {image360Url && (
               <div className="absolute top-5 right-5 z-20 flex items-center bg-[#0C0E16]/80 backdrop-blur-md border border-white/15 p-1 rounded-full shadow-lg">
                  <button
                     onClick={() => setViewMode("2d")}
                     className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${viewMode === "2d"
                           ? "bg-blue-600 text-white shadow-sm"
                           : "text-gray-400 hover:text-white"
                        }`}
                  >
                     <PiImage className="text-sm" />
                     <span>Studio 2D</span>
                  </button>
                  <button
                     onClick={() => setViewMode("3d")}
                     className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${viewMode === "3d"
                           ? "bg-blue-600 text-white shadow-sm"
                           : "text-gray-400 hover:text-white"
                        }`}
                  >
                     <PiCube className="text-sm" />
                     <span>3D / 360°</span>
                  </button>
               </div>
            )}

            {/* Display */}
            {viewMode === "2d" || !image360Url ? (
               <img
                  src={mainImage}
                  alt={selectedColor?.name || "Car"}
                  className="w-full max-w-[520px] h-auto object-contain drop-shadow-2xl transition-all duration-300 hover:scale-105"
               />
            ) : (
               <iframe
                  src={image360Url}
                  title="3D Model Viewer"
                  className="w-full h-[320px] sm:h-[400px] rounded-2xl border-0"
                  allow="fullscreen"
               />
            )}

            {/* Availability */}
            {viewMode === "2d" && selectedColor && (
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

         {/* Color Picker */}
         <div className="bg-[#141620]/80 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
               <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Available Color Options
               </span>
               <span className="text-xs font-semibold text-blue-400">
                  {selectedColor?.name}
               </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
               {colors.map((color) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                     <button
                        key={color.name}
                        onClick={() => {
                           setViewMode("2d");
                           onSelectColor(color);
                        }}
                        className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected
                              ? "bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/20"
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

         {/* Thumbnail Gallery */}
         <div className="grid grid-cols-5 gap-2.5">
            {gallery.map((thumb, idx) => (
               <button
                  key={idx}
                  onClick={() => {
                     setViewMode("2d");
                     onSelectImage(thumb);
                  }}
                  className={`rounded-xl overflow-hidden border p-2 bg-[#141620]/60 flex items-center justify-center transition-all cursor-pointer ${mainImage === thumb && viewMode === "2d"
                        ? "border-blue-500 ring-2 ring-blue-500/50"
                        : "border-white/10 hover:border-white/30"
                     }`}
               >
                  <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-12 sm:h-14 object-contain" />
               </button>
            ))}
         </div>

      </div>
   );
}