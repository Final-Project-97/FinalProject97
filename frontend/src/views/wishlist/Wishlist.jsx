import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PiHeart, PiPencilSimple, PiTrash, PiArrowRight, PiCheck, PiSpinner } from "react-icons/pi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { deleteWishlist, getWishlist, updateWishlist } from "../../api/wishlist";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState({ selectedColor: "", notes: "" });

  // Format Currency IDR
  const formatPrice = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  // Fetch Wishlist Items
  useEffect(() => {
    async function loadWishlist() {
      try {
        const result = await getWishlist();
        setItems(result.data || result || []);
      } catch (requestError) {
        setError(requestError.message || "Unable to load your wishlist.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWishlist();
  }, []);

  function startEditing(item) {
    setEditingId(item._id);
    setDraft({ selectedColor: item.selectedColor || "", notes: item.notes || "" });
  }

  // Update Custom Note / Color
  async function saveItem(item) {
    try {
      const result = await updateWishlist(item._id, draft);
      setItems((current) =>
        current.map((entry) =>
          entry._id === item._id ? { ...entry, ...(result.data || draft) } : entry
        )
      );
      setEditingId("");
      toast.success("Wishlist preferences updated.");
    } catch (requestError) {
      toast.error(requestError.message || "Unable to update wishlist item.");
    }
  }

  // Remove Item with SweetAlert Confirmation
  async function removeItem(item) {
    const confirmation = await Swal.fire({
      title: "Remove from wishlist?",
      text: `${item.car?.name || "This car"} will be removed from your list.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      background: "#141620",
      color: "#ffffff",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await deleteWishlist(item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      toast.success("Car removed from your wishlist.");
    } catch (requestError) {
      toast.error(requestError.message || "Unable to remove wishlist item.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0E16] text-white py-8 sm:py-12 lg:py-16 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-white/10">
          <span className="text-blue-500 text-[11px] font-bold tracking-widest uppercase">
            SAVED VEHICLES
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1">
            Your <span className="text-blue-500">Wishlist</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Keep your favorite cars together and update your preferred color or notes.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <PiSpinner className="text-3xl text-blue-500 animate-spin" />
            <p className="text-xs font-medium">Loading your wishlist...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-16 bg-[#141620]/50 border border-red-500/20 rounded-2xl p-6">
            <p className="text-sm text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <div className="text-center py-20 bg-[#141620] border border-white/10 rounded-3xl p-8 max-w-lg mx-auto shadow-2xl">
            <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-full flex items-center justify-center mx-auto text-pink-400 text-2xl mb-4">
              <PiHeart />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Your wishlist is empty</h3>
            <p className="text-xs text-gray-400 mb-6">
              Browse the catalog and save the cars you are interested in.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-500/25"
            >
              <span>Explore Catalog</span>
              <PiArrowRight />
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const car = item.car;
              const carTargetId = car?.slug || car?.id || car?._id || item.carId;

              return (
                <div
                  key={item._id}
                  className="bg-[#141620] border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all duration-300 group"
                >
                  <div>
                    {/* Car Thumbnail */}
                    <div className="w-full h-44 bg-[#0C0E16]/80 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-white/5 mb-5">
                      <img
                        src={car?.thumbnailUrl || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=600&auto=format&fit=crop"}
                        alt={car?.name || "Car"}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Brand, Name, & Price Row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                          {car?.brand || "RAC"}
                        </span>
                        <h3 className="text-base font-extrabold text-white mt-0.5 group-hover:text-blue-400 transition-colors truncate">
                          {car?.name || "Vehicle"}
                        </h3>
                      </div>
                      <span className="text-sm font-extrabold text-white shrink-0">
                        {formatPrice(car?.basePrice)}
                      </span>
                    </div>

                    {/* Custom Color & Note Editing Form */}
                    {editingId === item._id ? (
                      <div className="space-y-2.5 bg-[#0C0E16] p-3.5 rounded-xl border border-white/10 mb-5">
                        <input
                          type="text"
                          value={draft.selectedColor}
                          onChange={(e) => setDraft({ ...draft, selectedColor: e.target.value })}
                          placeholder="Preferred Color"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                        <textarea
                          value={draft.notes}
                          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                          placeholder="Add a personal note..."
                          rows="2"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingId("")}
                            className="text-[11px] text-gray-400 hover:text-white px-3 py-1 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveItem(item)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1 rounded-md"
                          >
                            <PiCheck /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-3.5 border-y border-white/5 text-xs text-gray-400 mb-5">
                        <div className="flex justify-between items-center">
                          <span>Preferred color</span>
                          <span className="text-gray-200 font-medium">{item.selectedColor || "Default"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Notes</span>
                          <span className="text-gray-200 font-medium truncate max-w-[180px]">{item.notes || "-"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Row (3 Pill Buttons) */}
                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to={`/cars/${carTargetId}`}
                      className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-full shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all text-center"
                    >
                      View Details
                    </Link>

                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      className="flex items-center gap-1.5 bg-[#0C0E16] hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white text-xs font-semibold py-2.5 px-4 rounded-full transition-all cursor-pointer"
                      title="Edit note/color"
                    >
                      <PiPencilSimple className="text-xs" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold py-2.5 px-4 rounded-full transition-all cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <PiTrash className="text-xs" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}