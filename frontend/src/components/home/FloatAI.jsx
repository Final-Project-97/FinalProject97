import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { PiChatDotsBold, PiPaperPlaneRight, PiX } from "react-icons/pi";
import { sendChatMessage } from "../../api/ai";
import AiAccessPrompt from "../shared/AiAccessPrompt";
import useAuth from "../../context/useAuth";

const initialMessage = {
  sender: "ai",
  text: "Hello! I am the RAC AI Assistant. Ask me about cars, specifications, prices, or recommendations — I am ready to help!",
};

function FloatAIContent() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    subscription,
    updateAiTokens,
    user,
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [inputText, setInputText] = useState("");
  const [remainingTokens, setRemainingTokens] = useState(null);
  const [sessionStartedAt] = useState(() => Date.now());
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null); // ref for the scrollable chat area

  // Scroll chat container to bottom
  function scrollToBottom() {
    const container = chatContainerRef.current;
    if (!container) return;
    // Small delay ensures DOM has updated before scrolling
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }

  // Auto-scroll when messages change, AI is typing, or chat opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isSending, isOpen]);

  // Auto-resize input textarea
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  // Handle send message
  async function handleSend(event) {
    if (event) event.preventDefault();

    const message = inputText.trim();
    if (!message || isSending || isAccessExhausted) return;

    setError("");
    setLoginRequired(false);

    if (!isAuthenticated) {
      setLoginRequired(true);
      return;
    }

    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setInputText("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsSending(true);

    try {
      const result = await sendChatMessage(message);
      const reply = result.data?.reply;

      if (!reply) {
        throw new Error("The AI response was empty. Please try again.");
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);

      if (typeof result.data?.remainingTokens === "number") {
        setRemainingTokens(result.data.remainingTokens);
        updateAiTokens(result.data.remainingTokens);
      }
    } catch (requestError) {
      if (requestError.status === 401) {
        setLoginRequired(true);
      } else if (
        requestError.status === 403 ||
        requestError.code === "TOKEN_EXHAUSTED"
      ) {
        setRemainingTokens(0);
        setUpgradeRequired(true);
      } else {
        setError(requestError.message || "Unable to send your message.");
      }
    } finally {
      setIsSending(false);
    }
  }

  // Handle Enter to send (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const availableTokens = remainingTokens ?? user?.aiTokensRemaining;
  const subscriptionExpiry = subscription?.expiresAt
    ? new Date(subscription.expiresAt).getTime()
    : 0;
  const hasActiveSubscription = subscriptionExpiry > sessionStartedAt;
  const hasNoFreeTokens =
    isAuthenticated &&
    !hasActiveSubscription &&
    typeof availableTokens === "number" &&
    availableTokens <= 0;
  const isAccessExhausted = upgradeRequired || hasNoFreeTokens;

  const tokenLabel = isAuthLoading
    ? "Checking AI access..."
    : isAuthenticated
      ? hasActiveSubscription
        ? "Premium AI access"
        : `${availableTokens ?? 0} AI tokens available`
      : "Sign in to use RAC AI";

  return (
    <>
      {/* Floating Chat Modal */}
      {isOpen && (
        <section
          aria-label="RAC AI Assistant"
          className="fixed bottom-24 right-4 z-50 flex h-[500px] w-[340px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#141620] shadow-2xl duration-300 animate-in fade-in slide-in-from-bottom-5 sm:right-6 sm:w-[380px]"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-white/10 bg-[#0C0E16] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600/20 p-2 text-blue-400">
                <PiChatDotsBold className="animate-pulse text-lg" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  RAC AI Assistant
                </h2>
                <p className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  {tokenLabel}
                </p>
              </div>
            </div>
            <button
              aria-label="Close RAC AI Assistant"
              className="btn btn-circle btn-ghost btn-xs text-gray-400 hover:text-white"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <PiX className="text-lg" />
            </button>
          </header>

          {/* Messages Scroll Area — ref on container for reliable scroll */}
          <div
            ref={chatContainerRef}
            className="flex-1 space-y-3 overflow-y-auto p-4 text-xs"
            aria-live="polite"
          >
            {messages.map((message, index) => (
              <div
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                key={`${message.sender}-${index}`}
              >
                {/* Message Bubble with Text Wrapping */}
                <p
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed break-words break-all whitespace-pre-wrap ${message.sender === "user"
                    ? "rounded-br-none bg-blue-600 text-white"
                    : "rounded-bl-none border border-white/10 bg-white/5 text-gray-200"
                    }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-none border border-white/10 bg-white/5 p-3 text-gray-400">
                  RAC AI is thinking...
                </p>
              </div>
            )}
          </div>

          {/* Input Footer Area */}
          <div className="bg-[#0C0E16]">
            {loginRequired && (
              <p className="mx-3 mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-2.5 text-xs text-amber-100">
                Please{" "}
                <Link className="font-bold underline" to="/login">
                  sign in
                </Link>{" "}
                before using RAC AI.
              </p>
            )}
            {isAccessExhausted && (
              <AiAccessPrompt className="mx-3 mt-3 text-xs" />
            )}
            {error && (
              <p
                className="mx-3 mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-2.5 text-xs text-red-200"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* Auto-Wrapping Input Form */}
            <form
              className="flex items-end gap-2 border-t border-white/10 p-3"
              onSubmit={handleSend}
            >
              <label className="sr-only" htmlFor="float-ai-message">
                Ask RAC AI
              </label>

              {/* Auto-Expanding Textarea with Hidden Scrollbar */}
              <textarea
                ref={textareaRef}
                className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[38px] max-h-[100px] leading-normal overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                disabled={isSending || isAccessExhausted || isAuthLoading}
                id="float-ai-message"
                maxLength={500}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAccessExhausted ? "Upgrade to continue" : "Ask about cars (Enter to send)..."
                }
                rows={1}
                value={inputText}
              />

              {/* Send Button */}
              <button
                aria-label="Send message"
                className="cursor-pointer shrink-0 rounded-full bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 mb-0.5"
                disabled={
                  !inputText.trim() ||
                  isSending ||
                  isAccessExhausted ||
                  isAuthLoading
                }
                type="submit"
              >
                <PiPaperPlaneRight className="text-sm" />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        aria-label={isOpen ? "Close RAC AI Assistant" : "Open RAC AI Assistant"}
        className="group fixed bottom-6 right-4 z-50 flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-indigo-500 sm:right-6"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <PiChatDotsBold className="text-xl text-blue-200 transition-transform group-hover:scale-110" />
      </button>
    </>
  );
}

export default function FloatAI() {
  return <FloatAIContent />;
}