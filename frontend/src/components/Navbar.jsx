import { useState } from "react";
import { Link, NavLink } from "react-router";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import racLogo from "../assets/RAC-Logo 1.png";
import useAuth from "../context/useAuth";
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
    PiLightning,
    PiCrown
} from "react-icons/pi";

export default function Navbar() {
    const { user, subscription, isAuthenticated, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Google Avatar & DiceBear Fallback
    const avatarUrl = user?.avatar || user?.picture || `https://api.dicebear.com/10.x/weave/svg?seed=${encodeURIComponent(user?.name || user?.email || "User")}`;

    // Fixed: check all possible premium indicators from /me and /subscription/status
    const isPremium = Boolean(
        subscription?.premiumActive ||
        subscription?.status === "active" ||
        subscription?.paymentStatus === "success" ||
        user?.isPremium ||
        user?.plan === "premium" ||
        user?.tier === "premium"
    );
    const remainingTokens = user?.aiTokensRemaining ?? 5;

    // Format expiry date for premium users
    function formatExpiry() {
        const expiresAt = subscription?.expiresAt;
        if (!expiresAt) return null;
        const date = new Date(expiresAt);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }

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

    // Close sidebar when opening dropdown
    function toggleProfile() {
        setIsOpen(false);
        setIsProfileOpen(!isProfileOpen);
    }

    // Close dropdown when opening sidebar
    function openSidebar() {
        setIsProfileOpen(false);
        setIsOpen(true);
    }

    async function handleSignOut() {
        const confirmation = await Swal.fire({
            title: "Sign out of RAC?",
            text: "You will need to sign in again to access your wishlist and Premium features.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sign Out",
            cancelButtonText: "Stay Signed In",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#252936",
            background: "#141720",
            color: "#f8fafc",
            iconColor: "#60a5fa",
            reverseButtons: true,
            scrollbarPadding: false,
            customClass: {
                popup: "rac-swal-popup",
                confirmButton: "rac-swal-button",
                cancelButton: "rac-swal-button",
            },
        });

        if (!confirmation.isConfirmed) return;

        setIsProfileOpen(false);
        setIsOpen(false);
        await signOut();
        toast.success("You have been signed out.");
    }

    return (
        <>
            <header className="sticky top-0 z-30 w-full bg-[#141620]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Bar */}
                    <div className="relative flex items-center justify-between h-[66px]">

                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={openSidebar}
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
                            {isAuthenticated ? (
                                <>
                                    {/* Badge: premium crown or token count */}
                                    {isPremium ? (
                                        <div className="hidden sm:flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3.5 py-1.5 rounded-full">
                                            <PiCrown className="text-sm" />
                                            <span>Premium</span>
                                        </div>
                                    ) : (
                                        <div className="hidden sm:flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/25 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            <span>{remainingTokens} Tokens</span>
                                        </div>
                                    )}

                                    {/* Profile Dropdown — desktop only */}
                                    <div className="relative hidden sm:block">
                                        <button
                                            onClick={toggleProfile}
                                            className="flex items-center gap-2.5 bg-[#141620] hover:bg-white/10 border border-white/10 p-1.5 pr-3 rounded-full transition-all cursor-pointer"
                                        >
                                            <img
                                                src={avatarUrl}
                                                alt={user?.name || "User"}
                                                referrerPolicy="no-referrer"
                                                className="w-7 h-7 rounded-full bg-blue-600 object-cover border border-white/10"
                                            />
                                            <div className="hidden md:flex flex-col text-left">
                                                <span className="text-xs font-bold text-white leading-tight">
                                                    {user?.name || "User"}
                                                </span>
                                                <span className={`text-[10px] font-medium ${isPremium ? "text-blue-400 font-semibold" : "text-gray-400"}`}>
                                                    {isPremium ? "Pro Plan" : "Free Plan"}
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
                                                    <Link
                                                        to="/wishlist"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                                    >
                                                        <PiHeart className="text-base" />
                                                        <span>My Wishlist</span>
                                                    </Link>

                                                    {/* Premium: show expiry — Free: show upgrade link */}
                                                    {isPremium ? (
                                                        <Link
                                                            to="/upgrade"
                                                            onClick={() => setIsProfileOpen(false)}
                                                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600/10 rounded-xl transition-colors"
                                                        >
                                                            <PiCrown className="text-base" />
                                                            <div className="flex flex-col">
                                                                <span>Pro Plan</span>
                                                                {formatExpiry() && (
                                                                    <span className="text-[10px] text-gray-500 font-normal">
                                                                        Expires {formatExpiry()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    ) : (
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
                                                        onClick={handleSignOut}
                                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left cursor-pointer border-t border-white/5 mt-1 pt-2"
                                                    >
                                                        <PiSignOut className="text-base" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Mobile avatar — opens sidebar */}
                                    <button
                                        onClick={openSidebar}
                                        className="sm:hidden"
                                        aria-label="Open Menu"
                                    >
                                        <img
                                            src={avatarUrl}
                                            alt={user?.name || "User"}
                                            referrerPolicy="no-referrer"
                                            className="w-8 h-8 rounded-full bg-blue-600 object-cover border-2 border-blue-500/40"
                                        />
                                    </button>
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
                    {isAuthenticated && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl mt-4">
                            <img
                                src={avatarUrl}
                                alt={user?.name || "User"}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full bg-blue-600 object-cover"
                            />
                            <div>
                                <h4 className="text-xs font-bold text-white">{user?.name || "User"}</h4>
                                {/* Show plan status and expiry or token count */}
                                {isPremium ? (
                                    <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
                                        <PiCrown className="text-xs" />
                                        Pro Plan
                                        {formatExpiry() && (
                                            <span className="text-gray-500 font-normal ml-1">· exp {formatExpiry()}</span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-blue-400 font-semibold">
                                        {remainingTokens} Tokens Remaining
                                    </span>
                                )}
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
                            <PiCar className="text-lg" />
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

                        {/* Sidebar: upgrade link for free users only */}
                        {isAuthenticated && !isPremium && (
                            <NavLink
                                to="/upgrade"
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive
                                        ? "bg-amber-500 text-white shadow-sm"
                                        : "text-amber-400 hover:bg-amber-500/10"
                                    }`
                                }
                            >
                                <PiLightning className="text-lg" />
                                <span>Upgrade to Premium</span>
                            </NavLink>
                        )}
                    </nav>
                </div>

                <div className="pt-6 border-t border-white/10">
                    {isAuthenticated ? (
                        <button
                            onClick={handleSignOut}
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
