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
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

         <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

            {/* Main Footer Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">

               {/* Brand & Bio */}
               <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                  <div>
                     <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                        <img src={racLogo} alt="RAC Logo" className="h-10 w-auto object-contain" />
                     </Link>
                     <p className="text-gray-400 text-xs sm:text-sm mt-4 leading-relaxed max-w-sm">
                        Indonesia's leading AI-powered car recommendation SaaS platform. Discover the perfect vehicle matching your lifestyle and financial capabilities.
                     </p>
                  </div>
               </div>

               {/* Platform Features */}
               <div className="lg:col-span-3 lg:pl-6">
                  <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                     Platform Features
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-400">
                     <li>
                        <Link to="/recomendation" className="hover:text-white transition-colors flex items-center justify-between group">
                           <span>Smart AI Recommendation</span>
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
                           Credit & Loan Simulator
                        </Link>
                     </li>
                     <li>
                        <Link to="/" className="hover:text-white transition-colors">
                           Partner Showrooms
                        </Link>
                     </li>
                  </ul>
               </div>

               {/* Account & Plans */}
               <div className="lg:col-span-2">
                  <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                     Account & Plans
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-400">
                     <li>
                        <Link to="/login" className="hover:text-white transition-colors">
                           Sign In
                        </Link>
                     </li>
                     <li>
                        <Link to="/register" className="hover:text-white transition-colors">
                           Create Account
                        </Link>
                     </li>
                     <li>
                        <span className="hover:text-white transition-colors cursor-pointer">
                           Top Up AI Tokens
                        </span>
                     </li>
                     <li>
                        <span className="hover:text-white transition-colors cursor-pointer">
                           Midtrans Subscription
                        </span>
                     </li>
                  </ul>
               </div>

               {/* Security & Support */}
               <div className="lg:col-span-3">
                  <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                     Security & Support
                  </p>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 text-xs text-gray-400">
                        <PiShieldCheck className="text-base text-blue-400 shrink-0" />
                        <span>Secure Payments via Midtrans</span>
                     </div>
                     <p className="text-[11px] text-gray-400 leading-relaxed">
                        Need technical assistance? Reach out to us through our official community channels.
                     </p>

                     <div className="flex items-center gap-2.5 pt-2">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors" aria-label="GitHub">
                           <PiGithubLogo className="text-base" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                           <PiInstagramLogo className="text-base" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                           <PiTwitterLogo className="text-base" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors" aria-label="LinkedIn">
                           <PiLinkedinLogo className="text-base" />
                        </a>
                     </div>
                  </div>
               </div>

            </div>

            {/* Bottom Bar */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
               <p>© {new Date().getFullYear()} RAC (Recommendation Auto Car). All rights reserved.</p>
            </div>
         </div>
      </footer>
   );
}