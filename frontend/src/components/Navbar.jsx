import { useState } from "react";
import { Link, NavLink } from "react-router";
import racLogo from "../assets/RAC-Logo 1.png";
import {
    PiHeart,
    PiUser,
    PiList,
    PiX,
    PiHouse,
    PiSparkle,
    PiCalculator,
    PiCar,
    PiSignOut,
    PiCaretDown,
    PiLightning
} from "react-icons/pi";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Mock User Data
    const user = {
        isLoggedIn: true,
        name: "Budi Santoso",
        email: "budi@example.com",
        plan: "free",
        aiTokensRemaining: 5,
        avatar: null,
    };

    // Google Avatar & DiceBear Fallback
    const avatarUrl = user.avatar || user.picture || `https://api.dicebear.com/10.x/weave/svg?seed=${encodeURIComponent(user.name || "User")}`;

    // Desktop NavLink Style
    const getDesktopNavClass = ({ isActive }) =>
        `text-xs font-medium px-4 py-1.5 rounded-full transition-all ${isActive
            ? "bg-blue-600 text-white font-semibold shadow-sm"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`;

    // Mobile NavLink Style
    const getMobileNavClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
            ? "bg-blue-600 text-white font-semibold shadow-sm"
            : "text-gray-300 hover:text-white hover:bg-white/5"
        }`;

    return (
        <>
            <header className="sticky top-0 z-30 w-full bg-[#141620]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Bar */}
                    <div className="relative flex items-center justify-between h-[66px]">

                        {/* Logo */}
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

                        {/* Desktop Nav (Centered) */}
                        <nav className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                            <NavLink to="/" className={getDesktopNavClass}>
                                Home
                            </NavLink>
                            <NavLink to="/catalog" className={getDesktopNavClass}>
                                Catalog
                            </NavLink>
                            <NavLink to="/recommendation" className={getDesktopNavClass}>
                                AI Recommendation
                            </NavLink>
                            <NavLink to="/credit" className={getDesktopNavClass}>
                                Credit Plan
                            </NavLink>
                        </nav>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {user.isLoggedIn ? (
                                <>
                                    {/* AI Token Badge */}
                                    {user.plan === "free" ? (
                                        <div className="hidden sm:flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/25 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            <span>{user.aiTokensRemaining} Tokens</span>
                                        </div>
                                    ) : (
                                        <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                                            <PiSparkle className="text-xs" />
                                            <span>Premium Member</span>
                                        </div>
                                    )}

                                    {/* Profile Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="flex items-center gap-2.5 bg-[#141620] hover:bg-white/10 border border-white/10 p-1.5 pr-3 rounded-full transition-all cursor-pointer"
                                        >
                                            <img
                                                src={avatarUrl}
                                                alt={user.name}
                                                referrerPolicy="no-referrer"
                                                className="w-7 h-7 rounded-full bg-blue-600 object-cover border border-white/10"
                                            />
                                            <div className="hidden md:flex flex-col text-left">
                                                <span className="text-xs font-bold text-white leading-tight">
                                                    {user.name}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium capitalize">
                                                    {user.plan === "free" ? "Free Plan" : "Premium"}
                                                </span>
                                            </div>
                                            <PiCaretDown className={`text-xs text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isProfileOpen && (
                                            <>
                                                <div
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="fixed inset-0 z-40"
                                                />
                                                <div className="absolute right-0 mt-2 w-52 bg-[#0C0E16] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1">
                                                    <div className="px-3 py-2 border-b border-white/5 md:hidden">
                                                        <p className="text-xs font-bold text-white">{user.name}</p>
                                                        <p className="text-[10px] text-blue-400 font-semibold">{user.aiTokensRemaining} Tokens Remaining</p>
                                                    </div>

                                                    <Link
                                                        to="/wishlist"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                                    >
                                                        <PiHeart className="text-base" />
                                                        <span>My Wishlist</span>
                                                    </Link>

                                                    {user.plan === "free" && (
                                                        <Link
                                                            to="/upgrade"
                                                            onClick={() => setIsProfileOpen(false)}
                                                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                                                        >
                                                            <PiLightning className="text-base" />
                                                            <span>Upgrade to Premium</span>
                                                        </Link>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            setIsProfileOpen(false);
                                                        }}
                                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left cursor-pointer border-t border-white/5 mt-1 pt-2"
                                                    >
                                                        <PiSignOut className="text-base" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Sign In Button */
                                <Link to="/login" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-md shadow-blue-500/25">
                                    <PiUser className="text-sm" />
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>

                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Mobile Drawer */}
            <aside
                style={{ backgroundColor: "#0C0E16" }}
                className={`fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] border-r border-white/10 z-50 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
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

                    {/* Mobile User Info */}
                    {user.isLoggedIn && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl mt-4">
                            <img
                                src={avatarUrl}
                                alt={user.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full bg-blue-600 object-cover"
                            />
                            <div>
                                <h4 className="text-xs font-bold text-white">{user.name}</h4>
                                <span className="text-[10px] text-blue-400 font-semibold">{user.aiTokensRemaining} Tokens Remaining</span>
                            </div>
                        </div>
                    )}

                    <nav className="flex flex-col gap-2 mt-6">
                        <NavLink
                            to="/"
                            onClick={() => setIsOpen(false)}
                            className={getMobileNavClass}
                        >
                            <PiHouse className="text-lg" />
                            <span>Home</span>
                        </NavLink>
                        <NavLink
                            to="/catalog"
                            onClick={() => setIsOpen(false)}
                            className={getMobileNavClass}
                        >
                            <PiCar className="text-lg text-blue-400" />
                            <span>Catalog</span>
                        </NavLink>
                        <NavLink
                            to="/recommendation"
                            onClick={() => setIsOpen(false)}
                            className={getMobileNavClass}
                        >
                            <PiSparkle className="text-lg text-blue-400" />
                            <span>AI Recommendation</span>
                        </NavLink>
                        <NavLink
                            to="/credit"
                            onClick={() => setIsOpen(false)}
                            className={getMobileNavClass}
                        >
                            <PiCalculator className="text-lg" />
                            <span>Credit Plan</span>
                        </NavLink>
                        <NavLink
                            to="/wishlist"
                            onClick={() => setIsOpen(false)}
                            className={getMobileNavClass}
                        >
                            <PiHeart className="text-lg" />
                            <span>Wishlist</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="pt-6 border-t border-white/10">
                    {user.isLoggedIn ? (
                        <button
                            onClick={() => {
                                setIsOpen(false);
                            }}
                            className="flex items-center justify-center gap-2 w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-semibold py-3 rounded-full border border-red-500/20 transition-all cursor-pointer"
                        >
                            <PiSignOut className="text-base" />
                            <span>Sign Out</span>
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-full shadow-lg shadow-blue-500/25 transition-all"
                        >
                            <PiUser className="text-base" />
                            <span>Sign In to Account</span>
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}
