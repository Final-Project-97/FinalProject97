import { useState } from "react";
import { Link } from "react-router";
import racLogo from "../assets/RAC-Logo 1.png";
import {
    PiHeart,
    PiUser,
    PiList,
    PiX,
    PiHouse,
    PiSparkle,
    PiCalculator
} from "react-icons/pi";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* NAVBAR HEADER */}
            <header className="sticky top-0 z-30 w-full bg-[#141620]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[66px]">

                        {/* Mobile Button & Logo */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="btn btn-ghost btn-circle btn-sm text-white lg:hidden"
                                aria-label="Open Menu"
                            >
                                <PiList className="text-2xl" />
                            </button>
                            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
                                <img src={racLogo} alt="RAC Logo" className="h-10 w-auto object-contain" />
                            </Link>
                        </div>

                        {/* Menu Desktop */}
                        <nav className="hidden lg:flex items-center gap-2">
                            <Link to="/" className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                                Home
                            </Link>
                            <Link to="/recomendation" className="text-gray-300 hover:text-white hover:bg-white/10 text-xs font-medium px-4 py-1.5 rounded-full transition-all">
                                AI Recomendation
                            </Link>
                            <Link to="/simulasi-kredit" className="text-gray-300 hover:text-white hover:bg-white/10 text-xs font-medium px-4 py-1.5 rounded-full transition-all">
                                Credit Plan
                            </Link>
                        </nav>

                        {/* Login */}
                        <div className="flex items-center gap-3">
                            <button className="btn btn-ghost btn-circle btn-sm text-gray-300 hover:text-white hover:bg-white/10" aria-label="Wishlist">
                                <PiHeart className="text-xl" />
                            </button>
                            <Link to="/login" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-md shadow-blue-500/25">
                                <PiUser className="text-sm" />
                                <span>Masuk</span>
                            </Link>
                        </div>

                    </div>
                </div>
            </header>

            {/* MOBILE SIDEBAR DRAWER */}
            {/* BG */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Side Bar*/}
            <aside
                style={{ backgroundColor: "#0C0E16" }}
                className={`fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] border-r border-white/10 z-50 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header Drawer */}
                <div>
                    <div className="flex items-center justify-between pb-6 border-b border-white/10">
                        <img src={racLogo} alt="RAC Logo" className="h-9 w-auto object-contain" />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="btn btn-ghost btn-circle btn-sm text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <PiX className="text-xl" />
                        </button>
                    </div>

                    {/* Mobile Navigation*/}
                    <nav className="flex flex-col gap-2 mt-6">
                        {/* Home */}
                        <Link
                            to="/"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm"
                        >
                            <PiHouse className="text-lg" />
                            <span>Home</span>
                        </Link>

                        {/* AI Recomendation */}
                        <Link
                            to="/recomendation"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
                        >
                            <PiSparkle className="text-lg text-blue-400" />
                            <span>AI Recomendation</span>
                        </Link>

                        {/* Credit Plan */}
                        <Link
                            to="/simulasi-kredit"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
                        >
                            <PiCalculator className="text-lg" />
                            <span>Credit Plan</span>
                        </Link>

                        {/* Wishlist */}
                        <Link
                            to="/wishlist"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors border-t border-white/5 mt-1 pt-3"
                        >
                            <PiHeart className="text-lg" />
                            <span>Wishlist</span>
                        </Link>
                    </nav>
                </div>

                {/* Footer Drawer: Tombol Masuk */}
                <div className="pt-6 border-t border-white/10">
                    <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-full shadow-lg shadow-blue-500/25 transition-all"
                    >
                        <PiUser className="text-base" />
                        <span>Login</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
