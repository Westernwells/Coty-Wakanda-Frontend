import { useRef, useState, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  isChanged?: boolean;
}

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  isChanged = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        className={`flex items-center justify-between w-full min-w-[100px] max-w-[160px] px-3 py-2 border rounded-md bg-white text-gray-900 transition
          focus:outline-none focus:ring-2 focus:ring-blue-500`}
        style={{
          border: isChanged ? "1px solid #0F62FE" : "1px solid #94a3b8",
        }}
        onClick={() => setOpen((prev) => !prev)}
        title={selected ? selected.label : placeholder}
      >
        <span
          className={
            !value || !selected ? "text-gray-400 truncate" : "truncate"
          }
          style={{ maxWidth: "90%" }}
        >
          {!value || !selected ? placeholder : selected.label}
        </span>
        <svg
          className="w-4 h-4 ml-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                value === opt.value ? "bg-blue-100 text-blue-700" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
