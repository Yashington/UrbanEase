import React from "react";

const NavbarLogo = () => (
  <div className="flex items-center gap-3 select-none">
    {/* Urban City Creative SVG Icon */}
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      <rect x="5" y="16" width="4" height="17" rx="2" fill="#2563eb" />
      <rect x="12" y="10" width="4" height="23" rx="2" fill="#2563eb" />
      <rect x="19" y="20" width="4" height="13" rx="2" fill="#2563eb" />
      <rect x="26" y="14" width="4" height="19" rx="2" fill="#2563eb" />
      <circle cx="34" cy="10" r="2" fill="#2563eb" />
    </svg>
    <span
      className="font-extrabold text-2xl md:text-3xl tracking-tight font-[Montserrat] text-[#22223B] flex items-center"
      style={{
        fontFamily: "'Montserrat', 'Poppins', 'Quicksand', sans-serif",
        letterSpacing: "-.03em"
      }}
    >
      Urban
      <span className="text-[#2563eb] ml-1 relative">
        Ease
        <span className="absolute left-0 bottom-[-6px] w-full h-[3px] bg-gradient-to-r from-[#60A5FA] to-[#2563eb] rounded-full"></span>
      </span>
    </span>
  </div>
);

export default NavbarLogo;