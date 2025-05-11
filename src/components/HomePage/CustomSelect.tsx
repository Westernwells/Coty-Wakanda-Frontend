import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
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
  className?: string;
  noBorder?: boolean;
}

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  isChanged = false,
  className,
  noBorder = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (ref.current) {
      setDropdownWidth(`${ref.current.offsetWidth}px`);
    }
  }, [open]);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        className={cn(
          "flex items-center justify-between w-full min-w-[100px] max-w-[160px] px-3 py-2 rounded-md bg-white text-gray-900 transition focus:outline-none focus:ring-1 focus:ring-primary",
          className
        )}
        style={{
          border: noBorder
            ? "none"
            : isChanged
              ? "1px solid #0F62FE"
              : "1px solid #94a3b8",
          backgroundColor: noBorder ? "#F2F4F6" : "white",
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
        <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-600" />
      </button>
      {open && (
        <ul
          className="absolute z-50 mt-1 max-w-2xl w-56 bg-white border border-gray-200 rounded-none shadow-lg max-h-60 overflow-auto"
          style={{ minWidth: dropdownWidth, width: dropdownWidth }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`px-3 py-2 cursor-pointer transition-colors duration-150 
                hover:bg-primary hover:text-white
                ${value === opt.value ? "bg-primary text-white" : "text-gray-900"}
              `}
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
