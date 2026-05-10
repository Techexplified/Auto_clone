interface Props {
  label: string;
  type: string;
}

function InputField({
  label,
  type,
}: Props) {
  return (
    <div className="mb-3">

      <label className="text-[11px] text-gray-400 mb-1 block">
        {label}
      </label>

      <div className="bg-[#22272B] border border-[#3B444C] rounded-md px-3 py-1.5 hover:border-[#579DFF] transition">

        <input
          type={type}
          className="w-full bg-transparent text-[13px] text-white outline-none"
        />

      </div>

    </div>
  );
}

export default InputField;