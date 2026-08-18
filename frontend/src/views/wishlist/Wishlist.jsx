import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PiHeart, PiPencilSimple, PiTrash, PiX } from "react-icons/pi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { deleteWishlist, getWishlist, updateWishlist } from "../../api/wishlist";
import "./Wishlist.css";

function formatPrice(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState({ selectedColor: "", notes: "" });

  useEffect(() => {
    async function loadWishlist() {
      try {
        const result = await getWishlist();
        setItems(result.data || []);
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

  async function saveItem(item) {
    try {
      const result = await updateWishlist(item._id, draft);
      setItems((current) =>
        current.map((entry) =>
          entry._id === item._id ? { ...entry, ...(result.data || draft) } : entry,
        ),
      );
      setEditingId("");
      toast.success("Wishlist preferences updated.");
    } catch (requestError) {
      toast.error(requestError.message || "Unable to update this wishlist item.");
    }
  }

  async function removeItem(item) {
    const confirmation = await Swal.fire({
      title: "Remove from wishlist?",
      text: `${item.car?.name || "This car"} will be removed from your list.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      cancelButtonText: "Keep it",
      confirmButtonColor: "#dc2626",
      background: "#141720",
      color: "#f8fafc",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await deleteWishlist(item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      toast.success("Car removed from your wishlist.");
    } catch (requestError) {
      toast.error(requestError.message || "Unable to remove this wishlist item.");
    }
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <header className="wishlist-header">
          <p>Saved vehicles</p>
          <h1>Your <span>Wishlist</span></h1>
          <p className="wishlist-subtitle">Keep your favorite cars together and update your preferred color or notes.</p>
        </header>

        {isLoading && <div className="wishlist-status">Loading your wishlist...</div>}
        {error && <div className="wishlist-status wishlist-error" role="alert">{error}</div>}

        {!isLoading && !error && items.length === 0 && (
          <section className="wishlist-empty">
            <PiHeart />
            <h2>Your wishlist is empty</h2>
            <p>Add a car from the catalog, car detail, or AI recommendations.</p>
            <Link to="/cars">Explore Catalog</Link>
          </section>
        )}

        <section className="wishlist-grid">
          {items.map((item) => (
            <article className="wishlist-card" key={item._id}>
              <div className="wishlist-image">
                {item.car?.thumbnailUrl ? <img alt={item.car.name} src={item.car.thumbnailUrl} /> : <PiHeart />}
              </div>
              <div className="wishlist-content">
                <div className="wishlist-title-row">
                  <div>
                    <p>{item.car?.brand || "RAC Catalog"}</p>
                    <h2>{item.car?.name || "Saved car"}</h2>
                  </div>
                  <strong>{formatPrice(item.car?.basePrice)}</strong>
                </div>

                {editingId === item._id ? (
                  <div className="wishlist-editor">
                    <input aria-label="Preferred color" onChange={(event) => setDraft((value) => ({ ...value, selectedColor: event.target.value }))} placeholder="Preferred color" value={draft.selectedColor} />
                    <textarea aria-label="Notes" onChange={(event) => setDraft((value) => ({ ...value, notes: event.target.value }))} placeholder="Add a note" rows="3" value={draft.notes} />
                    <div><button onClick={() => saveItem(item)} type="button">Save changes</button><button className="secondary" onClick={() => setEditingId("")} type="button"><PiX /> Cancel</button></div>
                  </div>
                ) : (
                  <div className="wishlist-details">
                    <p><span>Preferred color</span>{item.selectedColor || "Not selected"}</p>
                    <p><span>Notes</span>{item.notes || "No notes added"}</p>
                  </div>
                )}

                <div className="wishlist-actions">
                  <Link to={`/cars/${item.car?._id || item.carId}`}>View Details</Link>
                  <button onClick={() => startEditing(item)} type="button"><PiPencilSimple /> Edit</button>
                  <button className="danger" onClick={() => removeItem(item)} type="button"><PiTrash /> Remove</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
