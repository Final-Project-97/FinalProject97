import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PiCreditCard, PiLightbulb, PiX } from "react-icons/pi";
import { simulateCredit } from "../../api/ai";
import { getCarById } from "../../api/cars";
import useAuth from "../../context/useAuth";
import "./Credit.css";

const tenorOptions = [12, 24, 36, 48, 60];
const initialForm = {
  carPrice: 500000000,
  downPaymentPercentage: 30,
  tenorMonths: 48,
  interestRate: 6.5,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatShortPrice(value) {
  const number = Number(value) || 0;
  if (number >= 1000000000) return `Rp ${(number / 1000000000).toFixed(1)} B`;
  return `Rp ${Math.round(number / 1000000)} M`;
}

function Credit() {
  const { isAuthenticated, updateAiTokens } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [selectedCar, setSelectedCar] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoadingCar, setIsLoadingCar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [toast, setToast] = useState("");

  const carId = searchParams.get("car");
  const downPayment = Math.round(
    form.carPrice * (form.downPaymentPercentage / 100),
  );
  const principalLoan = form.carPrice - downPayment;

  useEffect(() => {
    if (!carId) return;

    let isActive = true;

    async function loadCar() {
      setIsLoadingCar(true);
      try {
        const response = await getCarById(carId);
        if (isActive && response.data) {
          setSelectedCar(response.data);
          setForm((currentForm) => ({
            ...currentForm,
            carPrice: Number(response.data.basePrice) || currentForm.carPrice,
          }));
        }
      } catch (requestError) {
        if (isActive) setToast(requestError.message || "Unable to load the selected car price.");
      } finally {
        if (isActive) setIsLoadingCar(false);
      }
    }

    loadCar();
    return () => {
      isActive = false;
    };
  }, [carId]);

  function updateForm(name, value) {
    setForm((currentForm) => ({ ...currentForm, [name]: Number(value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setToast("");
    setLoginRequired(false);
    setUpgradeRequired(false);

    if (!isAuthenticated) {
      setLoginRequired(true);
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await simulateCredit({
        carPrice: form.carPrice,
        downPayment,
        tenorMonths: form.tenorMonths,
        interestRatePerYear: form.interestRate,
      });
      updateAiTokens(response.data?.remainingTokens);
      setResult(response.data);
    } catch (requestError) {
      if (requestError.status === 401) setLoginRequired(true);
      else if (requestError.status === 403 || requestError.code === "TOKEN_EXHAUSTED") setUpgradeRequired(true);
      else setToast(requestError.message || "Unable to calculate the credit simulation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const calculation = result?.calculation;
  const insight = result?.aiFinancialInsight;

  return (
    <div className="credit-page">
      <main className="credit-container">
        <header className="credit-header">
          <p>Financial</p>
          <h1>Credit <span>Simulation</span></h1>
          <h2>Calculate monthly installments and plan the purchase of your dream car.</h2>
        </header>

        <section className="credit-grid">
          <form className="credit-form" onSubmit={handleSubmit}>
            {selectedCar && <p className="credit-selected-car">Selected: <strong>{selectedCar.name}</strong></p>}

            <div className="credit-control">
              <div className="credit-label"><label htmlFor="car-price">Car Price (OTR)</label><strong>{formatShortPrice(form.carPrice)}</strong></div>
              <input className="credit-range" id="car-price" max="1500000000" min="100000000" onChange={(event) => updateForm("carPrice", event.target.value)} step="10000000" type="range" value={form.carPrice} />
              <div className="credit-range-text"><span>Rp 100 M</span><span>Rp 1.5 B</span></div>
            </div>

            <div className="credit-control">
              <div className="credit-label"><label htmlFor="down-payment">Down Payment (DP)</label><strong>{form.downPaymentPercentage}% — {formatCurrency(downPayment)}</strong></div>
              <input className="credit-range" id="down-payment" max="70" min="10" onChange={(event) => updateForm("downPaymentPercentage", event.target.value)} step="5" type="range" value={form.downPaymentPercentage} />
              <div className="credit-range-text"><span>10%</span><span>70%</span></div>
            </div>

            <fieldset className="credit-control">
              <div className="credit-label"><legend>Tenor</legend><strong>{form.tenorMonths} Months ({form.tenorMonths / 12} Years)</strong></div>
              <div className="credit-tenors">
                {tenorOptions.map((tenor) => (
                  <button className={form.tenorMonths === tenor ? "active" : ""} key={tenor} onClick={() => updateForm("tenorMonths", tenor)} type="button">{tenor}mo</button>
                ))}
              </div>
            </fieldset>

            <div className="credit-control">
              <div className="credit-label"><label htmlFor="interest-rate">Annual Interest Rate</label><strong>{form.interestRate}%</strong></div>
              <input className="credit-range" id="interest-rate" max="12" min="3" onChange={(event) => updateForm("interestRate", event.target.value)} step="0.5" type="range" value={form.interestRate} />
              <div className="credit-range-text"><span>3%</span><span>12%</span></div>
            </div>

            <dl className="credit-summary">
              <div><dt>Price</dt><dd>{formatCurrency(form.carPrice)}</dd></div>
              <div><dt>DP ({form.downPaymentPercentage}%)</dt><dd>{formatCurrency(downPayment)}</dd></div>
              <div><dt>Loan Principal</dt><dd>{formatCurrency(principalLoan)}</dd></div>
            </dl>

            <button className="credit-submit" disabled={isSubmitting || isLoadingCar || upgradeRequired} type="submit">
              {isSubmitting ? "Calculating..." : "Calculate Installment"}
            </button>
            {loginRequired && <p className="credit-notice">Please <Link to="/login">sign in</Link> before using the simulation.</p>}
            {upgradeRequired && <p className="credit-notice">AI tokens are exhausted. <Link to="/upgrade">View premium</Link>.</p>}
          </form>

          <div className="credit-results" aria-live="polite">
            {isSubmitting && <div className="credit-loading"><span /><span /><span /></div>}
            {!isSubmitting && !calculation && (
              <div className="credit-empty"><span><PiCreditCard /></span><h2>No results yet</h2><p>Set the parameters on the left, then click Calculate Installment.</p></div>
            )}
            {!isSubmitting && calculation && (
              <div className="credit-result-content">
                <p>Estimated monthly installment</p>
                <h2>{formatCurrency(calculation.monthlyInstallment)}</h2>
                <span>for {calculation.tenorMonths ?? form.tenorMonths} months</span>
                <dl>
                  <div><dt>On-the-road price</dt><dd>{formatCurrency(calculation.onTheRoadPrice)}</dd></div>
                  <div><dt>Down payment</dt><dd>{formatCurrency(calculation.downPayment)}</dd></div>
                  <div><dt>Total interest</dt><dd>{formatCurrency(calculation.totalInterest)}</dd></div>
                  <div><dt>Total payment</dt><dd>{formatCurrency(calculation.totalPayment)}</dd></div>
                </dl>
                {insight && <article className="credit-insight"><PiLightbulb /><div><strong>{insight.financialHealthStatus || "AI Insight"}</strong><p>{insight.insightText}</p></div></article>}
              </div>
            )}
          </div>
        </section>
      </main>

      {toast && <div className="credit-toast" role="alert"><span>{toast}</span><button aria-label="Close notification" onClick={() => setToast("")} type="button"><PiX /></button></div>}
    </div>
  );
}

export default Credit;
