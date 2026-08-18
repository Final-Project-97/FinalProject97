import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { PiHeart, PiHeartFill, PiCalculator, PiMapPin } from "react-icons/pi";
import { toast } from "react-toastify";
import { addWishlist, deleteWishlist, getWishlist } from "../../api/wishlist";
import useAuth from "../../context/useAuth";

export default function CarActions({ carId, selectedColor, tags }) {
   const { isAuthenticated } = useAuth();
   const location = useLocation();
   const navigate = useNavigate();

   const [isInWishlist, setIsInWishlist] = useState(false);
   const [wishlistEntryId, setWishlistEntryId] = useState(null);
   const [isProcessing, setIsProcessing] = useState(false);

   // Check if Car is Already in User Wishlist
   useEffect(() => {
      async function checkWishlistStatus() {
         if (!isAuthenticated || !carId) return;
         try {
            const response = await getWishlist();
            const items = response.data || response || [];
            const match = items.find(
               (item) => item.carId === carId || item.car?._id === carId || item.car?.slug === carId
            );
            if (match) {
               setIsInWishlist(true);
               setWishlistEntryId(match._id);
            } else {
               setIsInWishlist(false);
               setWishlistEntryId(null);
            }
         } catch {
            // Fallback silently if wishlist check fails
         }
      }

      checkWishlistStatus();
   }, [isAuthenticated, carId]);

   // Toggle Wishlist Action
   async function handleToggleWishlist() {
      if (!isAuthenticated) {
         navigate("/login", { state: { from: location } });
         return;
      }

      setIsProcessing(true);
      try {
         if (isInWishlist && wishlistEntryId) {
            // Remove from wishlist
            await deleteWishlist(wishlistEntryId);
            setIsInWishlist(false);
            setWishlistEntryId(null);
            toast.info("Removed from your wishlist.");
         } else {
            // Add to wishlist
            const res = await addWishlist({ carId, selectedColor, source: "detail" });
            setIsInWishlist(true);
            setWishlistEntryId(res.data?._id || res._id);
            toast.success("Car added to your wishlist.");
         }
      } catch (error) {
         toast.error(error.status === 409 ? "Already in your wishlist." : error.message);
      } finally {
         setIsProcessing(false);
      }
   }

   return (
      <div className="space-y-4">
         {/* Primary Action: Dynamic Wishlist Button */}
         <button
            type="button"
            data-car-id={carId}
            disabled={isProcessing}
            onClick={handleToggleWishlist}
            className={`w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-bold py-3.5 px-6 rounded-full transition-all cursor-pointer shadow-lg ${isInWishlist
                  ? "bg-pink-600/20 border border-pink-500/40 text-pink-400 hover:bg-pink-600/30 shadow-pink-500/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
               }`}
         >
            {isInWishlist ? (
               <>
                  <PiHeartFill className="text-base text-pink-500" />
                  <span>{isProcessing ? "Updating..." : "In Wishlist (Saved)"}</span>
               </>
            ) : (
               <>
                  <PiHeart className="text-base" />
                  <span>{isProcessing ? "Adding..." : "Add to Wishlist"}</span>
               </>
            )}
         </button>

         {/* Secondary Actions: Credit & Showroom */}
         <div className="grid grid-cols-2 gap-3">
            <Link
               to={`/credit?car=${carId}`}
               className="flex items-center justify-center gap-2 bg-[#141620] hover:bg-white/10 border border-white/15 text-gray-200 hover:text-white text-xs font-semibold py-3 px-4 rounded-full transition-all"
            >
               <PiCalculator className="text-base text-blue-400" />
               <span>Credit Plan</span>
            </Link>

            <Link
               to="/showrooms"
               className="flex items-center justify-center gap-2 bg-[#141620] hover:bg-white/10 border border-white/15 text-gray-200 hover:text-white text-xs font-semibold py-3 px-4 rounded-full transition-all"
            >
               <PiMapPin className="text-base text-emerald-400" />
               <span>Find Showroom</span>
            </Link>
         </div>

         {/* Tags */}
         {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
               {tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                     {tag}
                  </span>
               ))}
            </div>
         )}
      </div>
   );
}