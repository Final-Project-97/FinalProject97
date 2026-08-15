import { Link } from "react-router";
import racLogo from "../assets/RAC-Logo 1.png";
import {
   PiGithubLogo,
   PiInstagramLogo,
   PiLinkedinLogo,
   PiTwitterLogo,
   PiShieldCheck
} from "react-icons/pi";

export default function Footer() {
   return (
      <footer className="w-full bg-[#0C0E16] text-white border-t border-white/10 relative overflow-hidden pt-16 lg:pt-24 pb-12">

         {/* BG */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

         <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">


            {/* MAIN FOOTER LINKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">

               <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                  <div>
                     <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                        <img src={racLogo} alt="RAC Logo" className="h-10 w-auto object-contain" />
                     </Link>
                     <p className="text-gray-400 text-xs sm:text-sm mt-4 leading-relaxed max-w-sm">
                        Platform SaaS rekomendasi mobil cerdas berbasis AI terdepan di Indonesia. Temukan kendaraan paling pas sesuai gaya hidup dan kemampuan finansialmu.
                     </p>
                  </div>
               </div>

               <div className="lg:col-span-3 lg:pl-6">
                  <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                     Fitur Platform
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-400">
                     <li>
                        <Link to="/" className="hover:text-white transition-colors flex items-center justify-between group">
                           <span>Rekomendasi AI Cerdas</span>
                           <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Free</span>
                        </Link>
                     </li>
                     <li>
                        <Link to="/" className="hover:text-white transition-colors">
                           Interactive 360° View
                        </Link>
                     </li>
                     <li>
                        <Link to="/simulasi-kredit" className="hover:text-white transition-colors">
                           Kalkulator Simulasi Kredit
                        </Link>
                     </li>
                     <li>
                        <Link to="/" className="hover:text-white transition-colors">
                           Showroom Partner
                        </Link>
                     </li>
                  </ul>
               </div>

               <div className="lg:col-span-2">
                  <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                     Akun & Langganan
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-400">
                     <li>
                        <Link to="/login" className="hover:text-white transition-colors">
                           Masuk Akun
                        </Link>
                     </li>
                     <li>
                        <Link to="/register" className="hover:text-white transition-colors">
                           Daftar Pengguna Baru
                        </Link>
                     </li>
                     <li>
                        <span className="hover:text-white transition-colors cursor-pointer">
                           Top Up Token AI
                        </span>
                     </li>
                     <li>
                        <span className="hover:text-white transition-colors cursor-pointer">
                           Midtrans Subscription
                        </span>
                     </li>
                  </ul>
               </div>

               <div className="lg:col-span-3">
                  <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                     Keamanan & Dukungan
                  </p>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 text-xs text-gray-400">
                        <PiShieldCheck className="text-base text-blue-400 shrink-0" />
                        <span>Pembayaran Aman via Midtrans</span>
                     </div>
                     <p className="text-[11px] text-gray-400 leading-relaxed">
                        Butuh bantuan konsultasi teknis? Hubungi kami melalui saluran resmi komunitas kami.
                     </p>

                     {/* Social Media Icons */}
                     <div className="flex items-center gap-2.5 pt-2">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                           <PiGithubLogo className="text-base" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                           <PiInstagramLogo className="text-base" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                           <PiTwitterLogo className="text-base" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                           <PiLinkedinLogo className="text-base" />
                        </a>
                     </div>
                  </div>
               </div>

            </div>


            {/* BOTTOM BAR (Copyright & Giant Typography) */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
               <p>© {new Date().getFullYear()} RAC (Recommendation Auto Car). All rights reserved.</p>
            </div>
         </div>
      </footer>
   );
}
