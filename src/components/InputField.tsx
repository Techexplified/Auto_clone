interface Props {
  label: string;
  type: string;
}

function InputField({
  label,
  type,
}: Props) {
  return (
    <div className="mb-4">

      <label className="text-[12px] font-semibold text-[#9FADBC] mb-1.5 block">
        {label}
      </label>

      <div className="bg-[#22272B] border border-[#3B444C] rounded-[3px] px-3 py-2 hover:border-[#579DFF] transition focus-within:border-[#579DFF] focus-within:ring-1 focus-within:ring-[#579DFF]">

        <input
          type={type}
          className="w-full bg-transparent text-[14px] text-[#B6C2CF] outline-none placeholder-[#758195]"
        />

      </div>

    </div>
  );
}

export default InputField;