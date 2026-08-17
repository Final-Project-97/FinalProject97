import { PiSparkle, PiStarFill, PiCheckCircleFill } from "react-icons/pi";
import scrollIcon from "../../assets/Simple Scroll Down Icon.svg";

export default function Hero() {
    return (
        <div className="min-h-screen bg-[#0C0E16] text-white flex flex-col justify-between relative overflow-hidden">

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)] pointer-events-none" />

            {/* Ambient Glow Effects */}
            <div className="absolute top-1/4 left-1/4 w-[450px] h-[300px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

            {/* HERO CONTENT */}
            <main className="max-w-7xl mx-auto w-full px-6 lg:px-12 pt-8 pb-12 flex-1 flex flex-col justify-center z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center w-full">

                    {/* Left Column */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                        <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white leading-[1.15] tracking-tight">
                            Find Your Dream Car <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                                Perfect Match
                            </span>{" "}
                            Powered by AI.
                        </h1>

                        <p className="text-gray-400 text-xs sm:text-sm mt-4 leading-relaxed max-w-lg">
                            Enter your budget, preferences, and daily lifestyle. RAC intelligent AI analyzes vehicle specs to deliver the most precise car recommendation in seconds.
                        </p>

                        <div className="flex items-center gap-3 mt-6 pt-2">
                            <div className="flex text-amber-400 text-sm gap-0.5">
                                <PiStarFill /><PiStarFill /><PiStarFill /><PiStarFill /><PiStarFill />
                            </div>
                            <p className="text-xs text-gray-300 font-medium">
                                <span className="font-bold text-white">4.9/5</span> from 10,000+ happy car buyers
                            </p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-6 flex justify-center items-center">
                        <div className="relative w-full max-w-[540px]">

                            <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b from-white/5 to-transparent p-2">
                                <img
                                    src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop"
                                    alt="Luxury EV Car RAC"
                                    className="w-full h-[260px] sm:h-[320px] object-cover rounded-2xl brightness-95 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E16] via-transparent to-transparent opacity-80 pointer-events-none" />
                            </div>

                            {/* Floating Badge 1 */}
                            <div className="absolute -top-3 -left-2 sm:-left-4 bg-[#141620]/90 backdrop-blur-md border border-white/15 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-10">
                                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl">
                                    <PiSparkle className="text-base sm:text-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-[11px] font-bold text-white">98% Match Score</p>
                                    <p className="text-[8px] sm:text-[9px] text-gray-400">Smart Needs Analysis</p>
                                </div>
                            </div>

                            {/* Floating Badge 2 */}
                            <div className="absolute -bottom-3 -right-2 sm:-right-4 bg-[#141620]/90 backdrop-blur-md border border-white/15 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-10">
                                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                    <PiCheckCircleFill className="text-base sm:text-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-[11px] font-bold text-white">Save Time & Cost</p>
                                    <p className="text-[8px] sm:text-[9px] text-gray-400">Zero Showroom Hassle</p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            {/* Scroll Animation */}
            <div className="z-10 flex flex-col items-center justify-center lg:-mt-20 pb-6 mb-4">
                <img
                    src={scrollIcon}
                    alt="Scroll Down"
                    className="w-8 h-8 object-contain invert opacity-50"
                />
                <span className="text-[10px] tracking-[0.3em] font-semibold uppercase text-gray-400 mt-1">
                    SCROLL
                </span>
            </div>

        </div>
    );
}
