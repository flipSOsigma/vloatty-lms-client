"use client";

export default function ClockDigit({ val }: { val: string }) {
  const num = parseInt(val, 10);
  const isNum = !isNaN(num);
  if (!isNum) {
    return <span className="text-[#d97706] font-light px-0.5 animate-pulse relative -top-1">:</span>;
  }
  return (
    <span className="inline-block relative h-12 w-[0.62em] overflow-hidden select-none">
      <span 
        className="absolute left-0 top-0 flex flex-col transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
        style={{ transform: `translateY(-${num * 10}%)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-12 flex items-center justify-center font-light text-zinc-900 text-[42px] tracking-tight leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

