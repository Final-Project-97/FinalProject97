export default function Stats() {
  const stats = [
    { value: "5+", label: "Available Models" },
    { value: "4", label: "Premium Brands" },
    { value: "12+", label: "Partner Showrooms" },
    { value: "10K+", label: "Happy Users" },
  ];

  return (
    <section className="w-full border-t border-white/10 bg-[#0C0E16]/80 backdrop-blur-sm py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-500 tracking-tight">
                {stat.value}
              </span>
              <span className="text-gray-400 text-xs sm:text-sm font-medium mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
