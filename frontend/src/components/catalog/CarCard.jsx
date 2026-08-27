import { Link } from "react-router";
import { PiArrowRight, PiUsers, PiGear, PiGasPump } from "react-icons/pi";

export default function CarCard({ car }) {
   const carId = car._id || car.id || car.slug;
   const formatRupiah = (num) =>
      new Intl.NumberFormat("id-ID", {
         style: "currency",
         currency: "IDR",
         maximumFractionDigits: 0,
      }).format(num);

   return (
      <div className="bg-[#141620] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
         <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
               <div>
                  <span className="text-[11px] font-semibold text-blue-400 tracking-wider uppercase">
                     {car.brand}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                     {car.name}
                  </h3>
               </div>
               <span className="text-[10px] font-medium bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gray-300">
                  {car.type}
               </span>
            </div>

            {/* Thumbnail */}
            <div className="w-full h-44 bg-[#0C0E16]/60 rounded-xl p-3 flex items-center justify-center overflow-hidden border border-white/5 mb-4">
               <img
                  src={car.thumbnailUrl}
                  alt={car.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
               />
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-gray-400 text-xs mb-4">
               <div className="flex items-center gap-1.5">
                  <PiUsers className="text-blue-400 text-sm" />
                  <span>{car.specs?.seats || 5} Seats</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <PiGear className="text-blue-400 text-sm" />
                  <span className="truncate">{car.specs?.transmission || "Automatic"}</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <PiGasPump className="text-blue-400 text-sm" />
                  <span className="truncate">{car.specs?.fuelType || "Gasoline"}</span>
               </div>
            </div>
         </div>

         {/* Price & Action */}
         <div className="flex items-center justify-between pt-2">
            <div>
               <span className="text-[10px] text-gray-400 block">Starting from</span>
               <span className="text-base font-extrabold text-white">
                  {formatRupiah(car.basePrice)}
               </span>
            </div>

            <Link
               to={`/cars/${carId}`}
               className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
               <span>Details</span>
               <PiArrowRight className="text-xs" />
            </Link>
         </div>
      </div>
   );
}
