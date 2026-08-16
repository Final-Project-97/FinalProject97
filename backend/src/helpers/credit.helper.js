/**
 * Helper untuk menghitung simulasi kredit kendaraan secara deterministik.
 * Menggunakan metode perhitungan bunga flat standar perbankan/leasing otomotif.
 *
 * @param {Number} carPrice - Harga OTR mobil
 * @param {Number} downPayment - Uang Muka (DP) dalam Rupiah
 * @param {Number} tenorMonths - Jangka waktu cicilan dalam bulan (contoh: 12, 24, 36, 48, 60)
 * @param {Number} interestRatePerYear - Suku bunga per tahun dalam persentase (contoh: 7.5)
 */
export const calculateCreditSimulation = (
  carPrice,
  downPayment,
  tenorMonths,
  interestRatePerYear,
) => {
  // 1. Validasi dasar logika bisnis finansial
  if (downPayment >= carPrice) {
    throw new Error(
      "Uang muka (DP) tidak boleh lebih besar atau sama dengan harga OTR mobil.",
    );
  }

  // 2. Hitung Pokok Pinjaman (Loan Amount)
  const loanAmount = carPrice - downPayment;

  // 3. Konversi tenor ke dalam tahun untuk perhitungan bunga flat
  const tenorYears = tenorMonths / 12;

  // 4. Hitung Total Bunga Selama Tenor (Metode Bunga Flat)
  // Rumus: Pokok Pinjaman * (Suku Bunga per Tahun / 100) * Tenor dalam Tahun
  const annualRateDecimal = interestRatePerYear / 100;
  const totalInterest = loanAmount * annualRateDecimal * tenorYears;

  // 5. Hitung Total Pembayaran (HPP / Total Hutang + Bunga)
  const totalPayment = loanAmount + totalInterest;

  // 6. Hitung Cicilan per Bulan
  const monthlyInstallment = totalPayment / tenorMonths;

  return {
    onTheRoadPrice: carPrice,
    downPayment: downPayment,
    loanAmount: Math.round(loanAmount),
    tenorMonths: Number(tenorMonths),
    interestRatePerYear: Number(interestRatePerYear),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    monthlyInstallment: Math.round(monthlyInstallment),
  };
};
