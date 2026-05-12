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

      <label className="text-[13px] text-[#8C9BAB] mb-1.5 block">
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#22272b] border border-[#3B444C] rounded-xl px-4 py-3 flex items-center justify-between text-[14px] text-[#B6C2CF] hover:border-[#579DFF] focus:border-[#579DFF] outline-none"
      >

        {value}

        <ChevronDown
          size={16}
          className={`text-[#8C9BAB] transition ${
            open ? "rotate-180" : ""
          }`}
        />

      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-[76px] w-full bg-[#2C333A] border border-[#2C333A] rounded-xl shadow-2xl overflow-hidden z-50 py-1">

          {options.map((option) => (

            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[14px] transition hover:bg-[#3B444C]
              ${
                value === option
                  ? "bg-[#3B444C] text-[#B6C2CF]"
                  : "text-[#8C9BAB]"
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