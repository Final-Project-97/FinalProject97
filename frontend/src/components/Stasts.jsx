export default function Stats() {
  const statsData = [
    { value: "5+", label: "Model Tersedia" },
    { value: "4", label: "Brand Premium" },
    { value: "12+", label: "Showroom Partner" },
    { value: "10K+", label: "Pengguna Puas" },
  ];

  return (
    <section className="w-full border-t border-white/10 bg-[#0C0E16]/80 backdrop-blur-sm py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-center divide-x-0 md:divide-x divide-white/5">
          {statsData.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center px-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-500 tracking-tight">
                {item.value}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
