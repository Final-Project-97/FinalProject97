import { PiSparkle } from "react-icons/pi";

export default function CarInfo({ category, brand, year, name, price, priceNote, quickSpecs }) {
   return (
      <div className="space-y-5">
         <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/25 text-blue-400 px-3 py-1 rounded-full">
                  {category}
               </span>
               <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-400 px-3 py-1 rounded-full flex items-center gap-1">
                  <PiSparkle className="text-xs" /> Top Product
               </span>
            </div>
            <p className="text-xs text-gray-400 font-semibold">{brand} · {year}</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1 tracking-tight">
               {name}
            </h1>
            <div className="mt-3">
               <span className="text-2xl sm:text-3xl font-extrabold text-blue-500">
                  {price}
               </span>
               <p className="text-[10px] text-gray-400 mt-0.5">{priceNote}</p>
            </div>
         </div>

         {/* Quick Specs Bento */}
         <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#141620]/80 border border-white/10 rounded-2xl">
            {quickSpecs.map((spec, i) => (
               <div key={i} className="flex flex-col items-center text-center p-2">
                  <div className="mb-1">{spec.icon}</div>
                  <span className="text-[10px] uppercase text-gray-400 font-semibold">{spec.label}</span>
                  <span className="text-xs font-bold text-white mt-0.5">{spec.value}</span>
               </div>
            ))}
         </div>
      </div>
   );
}
