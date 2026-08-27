import { useCallback, useEffect, useState } from "react";
import { PiCheckCircle, PiCrown, PiLightning, PiShieldCheck, PiSparkle, PiSpinner } from "react-icons/pi";
import { toast } from "react-toastify";
import { createSubscriptionCheckout, getSubscriptionStatus } from "../../api/subscription";
import useAuth from "../../context/useAuth";

const SNAP_SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/snap.js";
const PAYMENT_STATUS_ATTEMPTS = 8;
const PAYMENT_STATUS_INTERVAL_MS = 1500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Format Currency IDR
function formatPrice(val) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);
}

function formatDate(val) {
  if (!val) return "Not available";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(val));
}

// Midtrans Snap Script Loader
function loadSnap(clientKey) {
  if (window.snap) return Promise.resolve(window.snap);

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${SNAP_SANDBOX_URL}"]`);

    function handleLoad() {
      if (window.snap) resolve(window.snap);
      else reject(new Error("Midtrans Snap could not be initialized."));
    }

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Midtrans Snap.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SNAP_SANDBOX_URL;
    script.async = true;
    script.dataset.clientKey = clientKey;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Unable to load Midtrans Snap.")), { once: true });
    document.head.appendChild(script);
  });
}

export default function Upgrade() {
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const isMockMode = import.meta.env.VITE_USE_MOCK === "true";

  const refreshStatus = useCallback(async () => {
    const result = await getSubscriptionStatus();
    setStatus(result.data);
    return result.data;
  }, []);

  useEffect(() => {
    let isActive = true;
    async function loadInitialStatus() {
      try {
        const result = await getSubscriptionStatus();
        if (isActive) setStatus(result.data);
      } catch (error) {
        toast.error(error.message || "Unable to load subscription status.");
      } finally {
        if (isActive) setIsLoadingStatus(false);
      }
    }
    loadInitialStatus();
    return () => {
      isActive = false;
    };
  }, []);

  // Poll for Premium Activation
  async function waitForPremiumActivation() {
    for (let attempt = 0; attempt < PAYMENT_STATUS_ATTEMPTS; attempt += 1) {
      const currentStatus = await refreshStatus();
      if (currentStatus?.premiumActive) {
        await refreshUser();
        return true;
      }
      if (attempt < PAYMENT_STATUS_ATTEMPTS - 1) {
        await delay(PAYMENT_STATUS_INTERVAL_MS);
      }
    }
    await refreshUser();
    return false;
  }

  async function handlePaymentSuccess() {
    setIsConfirmingPayment(true);
    try {
      const isPremiumActive = await waitForPremiumActivation();
      if (isPremiumActive) {
        toast.success("Payment confirmed! Premium access is now active.");
      } else {
        toast.info("Payment received. Confirmation is in progress.");
      }
    } finally {
      setIsConfirmingPayment(false);
    }
  }

  // Trigger Midtrans Checkout
  async function handleCheckout() {
    setIsCheckingOut(true);
    try {
      const checkout = await createSubscriptionCheckout();
      if (isMockMode) {
        await handlePaymentSuccess();
        return;
      }

      const clientKey = checkout.clientKey || import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
      if (!clientKey) throw new Error("Midtrans client key is not configured.");

      const snap = await loadSnap(clientKey);
      snap.pay(checkout.snapToken, {
        onSuccess: async () => {
          try {
            await handlePaymentSuccess();
          } catch (error) {
            toast.error(error.message || "Subscription status update failed.");
          }
        },
        onPending: async () => {
          await refreshStatus().catch(() => null);
          toast.info("Payment pending confirmation.");
        },
        onError: () => toast.error("Payment failed. Please try again."),
        onClose: () => toast.info("Payment window closed."),
      });
    } catch (error) {
      toast.error(error.message || "Unable to initialize checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0E16] text-white py-8 sm:py-12 lg:py-16 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[350px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/25 text-blue-400 text-xs font-semibold px-3.5 py-1 rounded-full mb-3">
            <PiCrown className="text-sm" />
            <span>Premium Membership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Unlock Unlimited <span className="text-blue-500">RAC AI</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Get unlimited recommendations, AI chatbot guidance, and instant credit simulations for 30 days.
          </p>
        </div>

        {/* Status Loading */}
        {isLoadingStatus && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <PiSpinner className="text-4xl text-blue-500 animate-spin" />
            <p className="text-xs font-medium">Checking subscription status...</p>
          </div>
        )}

        {/* Active Premium Card (Blue Luxury Style) */}
        {!isLoadingStatus && status?.premiumActive && (
          <div className="max-w-xl mx-auto bg-gradient-to-b from-[#141620] to-[#0C0E16] border border-blue-500/30 rounded-3xl p-8 text-center shadow-2xl shadow-blue-500/10">
            <div className="w-16 h-16 bg-blue-600/15 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-blue-400 text-3xl mb-4">
              <PiCrown />
            </div>
            <h2 className="text-xl font-bold text-white">Your Premium is Active</h2>
            <p className="text-3xl font-extrabold text-blue-400 mt-2">
              {status.daysRemaining} Days Remaining
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Active until {formatDate(status.expiresAt)}
            </p>
          </div>
        )}

        {/* Upgrade Plan Grid */}
        {!isLoadingStatus && !status?.premiumActive && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">

            {/* Plan Card */}
            <div className="md:col-span-7 bg-[#141620] border border-blue-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Full Access
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
                  <PiCrown className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Premium Plan</h3>
                  <p className="text-xs text-gray-400">Full Access for 30 Days</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-extrabold text-white">{formatPrice(99000)}</span>
                <span className="text-xs text-gray-400"> / 30 days</span>
              </div>

              <ul className="space-y-3 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <PiCheckCircle className="text-blue-400 text-base shrink-0" />
                  <span>Unlimited AI Car Recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <PiCheckCircle className="text-blue-400 text-base shrink-0" />
                  <span>Unlimited RAC AI Assistant Chatbot</span>
                </li>
                <li className="flex items-center gap-2">
                  <PiCheckCircle className="text-blue-400 text-base shrink-0" />
                  <span>AI Financial & Credit Score Insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <PiCheckCircle className="text-blue-400 text-base shrink-0" />
                  <span>Priority Server & Instant AI Responses</span>
                </li>
              </ul>

              <button
                type="button"
                disabled={isCheckingOut || isConfirmingPayment}
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-4 px-6 rounded-full shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <PiLightning className="text-base" />
                <span>
                  {isCheckingOut
                    ? "Preparing Midtrans..."
                    : isConfirmingPayment
                      ? "Confirming Payment..."
                      : "Upgrade Now with Midtrans"}
                </span>
              </button>
            </div>

            {/* Benefits Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#141620]/60 border border-white/10 p-5 rounded-2xl">
                <PiLightning className="text-xl text-blue-400 mb-2" />
                <h4 className="text-xs font-bold text-white">No Token Limits</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  Enjoy unlimited AI queries without worrying about daily token depletion.
                </p>
              </div>

              <div className="bg-[#141620]/60 border border-white/10 p-5 rounded-2xl">
                <PiShieldCheck className="text-xl text-blue-400 mb-2" />
                <h4 className="text-xs font-bold text-white">Secure Midtrans Sandbox</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  Supports QRIS, GoPay, Virtual Accounts, and Credit Cards via Midtrans Snap.
                </p>
              </div>

              <div className="bg-[#141620]/60 border border-white/10 p-5 rounded-2xl">
                <PiSparkle className="text-xl text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white">Instant Activation</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  Your account status refreshes immediately upon payment confirmation.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}