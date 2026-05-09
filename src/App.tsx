import {
  ChevronLeft,
  User,
  ChevronDown,
} from "lucide-react";

function App() {
  return (
    <div className="w-full min-h-screen bg-[#1D2125] flex items-center justify-center p-4">
      <div className="w-[320px] rounded-2xl bg-[#282E33] shadow-2xl border border-[#3B444C] p-4 text-white">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button className="text-gray-400 hover:text-white">
            <ChevronLeft size={18} />
          </button>

          <h1 className="text-sm font-semibold">
            Auto Clone
          </h1>

          <button className="text-gray-400 hover:text-white">
            <User size={18} />
          </button>
        </div>

        {/* Repeat */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">
            Repeat
          </label>

          <button className="w-full bg-[#22272B] border border-[#3B444C] rounded-lg px-3 py-2 flex items-center justify-between text-sm">
            Weekly
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Time */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">
            Time
          </label>

          <input
            type="time"
            className="w-full bg-[#22272B] border border-[#3B444C] rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">
            Date
          </label>

          <input
            type="date"
            className="w-full bg-[#22272B] border border-[#3B444C] rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">
            Duration
          </label>

          <button className="w-full bg-[#22272B] border border-[#3B444C] rounded-lg px-3 py-2 flex items-center justify-between text-sm">
            2 Weeks
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Position */}
        <div className="mb-5">
          <label className="text-xs text-gray-400 mb-1 block">
            Position
          </label>

          <button className="w-full bg-[#22272B] border border-[#3B444C] rounded-lg px-3 py-2 flex items-center justify-between text-sm">
            Top
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Save */}
        <button className="w-full bg-[#579DFF] hover:bg-[#85B8FF] text-black font-medium py-2 rounded-lg transition-all">
          Save
        </button>
      </div>
    </div>
  );
}

export default App;