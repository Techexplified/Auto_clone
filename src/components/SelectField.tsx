import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

function SelectField({
  label,
  value,
  options,
  onChange,
  className = "",
}: Props) {

  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>

      <label className="text-[13px] text-zinc-400 mb-1.5 block">
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between text-[14px] text-zinc-200 hover:border-zinc-700 transition outline-none"
      >

        {value}

        <ChevronDown
          size={16}
          className={`text-zinc-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />

      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-[76px] w-full bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 py-1">

          {options.map((option) => (

            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[14px] transition hover:bg-zinc-700/50
              ${
                value === option
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-300"
              }`}
            >

              {option}

            </button>

          ))}

        </div>
      )}

    </div>
  );
}

export default SelectField;