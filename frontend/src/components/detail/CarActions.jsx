import { Link } from "react-router";
import { PiHeart, PiCalculator, PiMapPin } from "react-icons/pi";

export default function CarActions({ carId, tags }) {
   return (
      <div className="space-y-4">
         {/* Primary Action: Wishlist */}
         <button
            type="button"
            data-car-id={carId}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-3.5 px-6 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
         >
            <PiHeart className="text-base" />
            <span>Add to Wishlist</span>
         </button>

         {/* Secondary Actions: Credit & Showroom */}
         <div className="grid grid-cols-2 gap-3">
            <Link
               to={`/simulasi-kredit?car=${carId}`}
               className="flex items-center justify-center gap-2 bg-[#141620] hover:bg-white/10 border border-white/15 text-gray-200 hover:text-white text-xs font-semibold py-3 px-4 rounded-full transition-all"
            >
               <PiCalculator className="text-base text-blue-400" />
               <span>Credit Plan</span>
            </Link>

            <button
               type="button"
               data-action="find-showroom"
               data-car-id={carId}
               className="flex items-center justify-center gap-2 bg-[#141620] hover:bg-white/10 border border-white/15 text-gray-200 hover:text-white text-xs font-semibold py-3 px-4 rounded-full transition-all cursor-pointer"
            >
               <PiMapPin className="text-base text-emerald-400" />
               <span>Find Showroom</span>
            </button>
         </div>

         {/* Tags */}
         <div className="flex flex-wrap gap-1.5 pt-2">
            {tags.map((tag, i) => (
               <span key={i} className="text-[10px] font-mono text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">
                  {tag}
               </span>
            ))}
         </div>
      </div>
   );
}