import { ChevronLeft, User } from "lucide-react";

function Header() {
  return (
    <div className="flex items-center justify-between mb-4 px-1">

      <button className="text-[#9FADBC] hover:text-white transition p-1 rounded-md hover:bg-[#A6C5E229]">
        <ChevronLeft size={18} />
      </button>

      <h1 className="text-[14px] font-semibold text-[#B6C2CF]">
        Auto Clone
      </h1>

      <button className="text-[#9FADBC] hover:text-white transition p-1 rounded-md hover:bg-[#A6C5E229]">
        <User size={18} />
      </button>

    </div>
  );
}

export default Header;