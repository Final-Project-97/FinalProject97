import { useCallback, useEffect, useState } from "react";
import { PiCheckCircle, PiCrown, PiLightning, PiShieldCheck, PiSparkle } from "react-icons/pi";
import { toast } from "react-toastify";
import { createSubscriptionCheckout, getSubscriptionStatus } from "../../api/subscription";
import useAuth from "../../context/useAuth";
import "./Upgrade.css";

const SNAP_SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/snap.js";

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

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

  async function handlePaymentSuccess() {
    await Promise.all([refreshUser(), refreshStatus()]);
    toast.success("Payment completed. Premium access is now being updated.");
  }

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
            toast.error(error.message || "Payment succeeded, but the subscription status could not be refreshed.");
          }
        },
        onPending: async () => {
          await refreshStatus().catch(() => null);
          toast.info("Payment is pending confirmation.");
        },
        onError: () => toast.error("Payment failed. Please try again."),
        onClose: () => toast.info("Payment window closed before completion."),
      });
    } catch (error) {
      toast.error(error.message || "Unable to start the payment process.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="upgrade-page">
      <div className="upgrade-container">
        <header className="upgrade-hero">
          <span className="upgrade-eyebrow"><PiSparkle /> Premium membership</span>
          <h1>Unlock unlimited <span>RAC AI</span></h1>
          <p>Get unlimited recommendations, chatbot guidance, and credit insights for 30 days.</p>
        </header>

        {isLoadingStatus ? (
          <div className="upgrade-loading">Checking your subscription...</div>
        ) : status?.premiumActive ? (
          <section className="upgrade-active">
            <span><PiCrown /></span>
            <div>
              <p>Premium is active</p>
              <h2>{status.daysRemaining} days remaining</h2>
              <small>Active until {formatDate(status.expiresAt)}</small>
            </div>
          </section>
        ) : (
          <section className="upgrade-grid">
            <article className="upgrade-plan">
              <div className="upgrade-plan-heading">
                <span><PiCrown /></span>
                <div><p>Premium Monthly</p><h2>{formatCurrency(99000)} <small>/ 30 days</small></h2></div>
              </div>
              <ul>
                <li><PiCheckCircle /> Unlimited AI car recommendations</li>
                <li><PiCheckCircle /> Unlimited RAC AI Assistant conversations</li>
                <li><PiCheckCircle /> AI-powered credit insights</li>
                <li><PiCheckCircle /> Premium access for 30 days</li>
              </ul>
              <button disabled={isCheckingOut} onClick={handleCheckout} type="button">
                <PiLightning /> {isCheckingOut ? "Preparing payment..." : "Upgrade with Midtrans"}
              </button>
              <small>Secure sandbox payment powered by Midtrans.</small>
            </article>

            <aside className="upgrade-benefits">
              <div><span><PiLightning /></span><h3>No AI token limit</h3><p>Use every AI feature without consuming free tokens while Premium is active.</p></div>
              <div><span><PiShieldCheck /></span><h3>Secure checkout</h3><p>Complete your payment through the official Midtrans Snap interface.</p></div>
              <div><span><PiSparkle /></span><h3>Instant access</h3><p>Your account status refreshes after successful payment confirmation.</p></div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
