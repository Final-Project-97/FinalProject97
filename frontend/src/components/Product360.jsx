import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PiArrowRight, PiArrowsClockwise } from "react-icons/pi";

export default function Product360() {
  const [selectedColor, setSelectedColor] = useState("Graphite Noir");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.CI360) {
        window.CI360.destroy(); // Bersihkan instance lama jika ada
        window.CI360.init();    // Inisialisasi ulang
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const colors = [
    { name: "Graphite Noir", hex: "#1E2026" },
    { name: "Emerald Mint", hex: "#6EE7B7" },
    { name: "Coral Sunset", hex: "#FB923C" },
    { name: "Sapphire Blue", hex: "#60A5FA" },
    { name: "Pearl White", hex: "#F3F4F6" },
  ];

  return (
    <section className="w-full bg-[#0C0E16] text-white py-14 lg:py-20 border-t border-white/10 relative overflow-hidden">

      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[450px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-gray-400 text-xs font-semibold tracking-widest uppercase">
              FEATURE PRODUCT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1 tracking-tight">
              Interactive 360° — <span className="text-blue-500">SHK 8000</span>
            </h2>
          </div>
          <Link
            to="/car/shk-8000"
            className="flex items-center gap-1.5 self-start sm:self-auto bg-[#141620] hover:bg-white/10 border border-white/15 text-gray-200 hover:text-white text-xs font-medium px-5 py-2.5 rounded-full transition-all cursor-pointer"
          >
            <span>Detail model</span>
            <PiArrowRight className="text-xs" />
          </Link>
        </div>

        {/* CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* KOLOM KIRI: CI360 Container */}
          <div className="lg:col-span-8 bg-[#141620]/70 border border-white/10 rounded-xs p-6 sm:p-10 shadow-2xl relative">

            {/* CI360 */}
            <div className="w-full flex justify-center items-center py-4 cursor-grab active:cursor-grabbing">
              <div
                className="cloudimage-360 w-full max-w-[560px]"
                data-folder="/cars/shk-8000/"
                data-filename-x="{index}.png"
                data-amount-x="6"
                data-drag-speed="50"
                data-autoplay="false"
              />
            </div>

            {/* Footer Hint */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <PiArrowsClockwise className="text-base text-blue-400" />
                <span className="text-[11px] font-medium tracking-wide">Geser / Drag untuk memutar 360°</span>
              </div>
              <span className="text-[11px] font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                CI360 Enabled
              </span>
            </div>
          </div>

          {/* KOLOM KANAN: Color Configurator */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-5 lg:pl-4">
            <div>
              <span className="text-gray-400 text-[11px] font-semibold tracking-widest uppercase">
                COLOR CONFIGURATOR
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {selectedColor}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Ganti warna bodi secara instan dan putar unit 360° tanpa harus datang ke showroom. Ringan, tanpa 3D engine — sesuai constraint MVP.
              </p>
            </div>

            {/* Color Swatches */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer relative flex items-center justify-center ${selectedColor === color.name
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0C0E16] scale-110"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={color.name}
                  />
                ))}
              </div>

              {/* Indikator Garis Aktif */}
              <div className="flex items-center gap-1.5 pt-1">
                {colors.map((color) => (
                  <div
                    key={color.name}
                    className={`h-1 rounded-full transition-all duration-300 ${selectedColor === color.name ? "w-6 bg-blue-500" : "w-3 bg-white/15"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
