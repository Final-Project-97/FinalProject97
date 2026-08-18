import { Link } from "react-router";
import { PiCrown } from "react-icons/pi";

function AiAccessPrompt({ className = "" }) {
  return (
    <aside
      className={`rounded-xl border border-violet-400/30 bg-violet-400/10 p-4 text-sm text-violet-100 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <PiCrown className="mt-0.5 shrink-0 text-lg text-violet-300" />
        <div>
          <p className="font-semibold">AI access is unavailable</p>
          <p className="mt-1 leading-5 text-violet-200/80">
            Your free tokens are exhausted or your Premium access has expired.
            Subscribe again to continue using RAC AI.
          </p>
          <Link
            className="mt-3 inline-flex min-h-11 items-center rounded-full bg-violet-500 px-5 font-bold text-white transition hover:bg-violet-400"
            to="/upgrade"
          >
            View Premium
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default AiAccessPrompt;
