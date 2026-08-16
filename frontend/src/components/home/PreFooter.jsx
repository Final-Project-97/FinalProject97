import { PiArrowUpRight, PiSparkle } from "react-icons/pi";
import { Link } from "react-router";

export default function PreFooter() {
   return (
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-16 lg:pt-12 lg:pb-24">
         <div className="w-full bg-gradient-to-b from-[#141620] to-[#0E1017] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">

            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  <PiSparkle className="text-sm animate-pulse" />
                  <span>Get 5 Free AI Tokens</span>
               </div>
               <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Ready to find your dream car with AI?
               </h2>
               <p className="text-gray-400 text-xs sm:text-sm mt-3 leading-relaxed">
                  Start instant consultation, compare vehicle specs, rotate in 360°, and calculate loan estimates effortlessly without visiting showrooms.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
               <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
               >
                  <PiSparkle className="text-base" />
                  <span>Start AI Consultation</span>
               </Link>
               <Link
                  to="/simulasi-kredit"
                  className="flex items-center justify-center gap-1.5 bg-[#141620] hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full transition-all cursor-pointer"
               >
                  <span>Credit Simulation</span>
                  <PiArrowUpRight className="text-sm" />
               </Link>
            </div>

         </div>
      </section>
   );
}