import { AlertCircle } from "lucide-react";

type ExclamationTooltipProps = {
  message?: string;
};

export default function ExclamationTooltip({
  message,
}: ExclamationTooltipProps) {
  if (!message) return null;

  return (
    <div className="relative group w-fit">
      <AlertCircle className="text-yellow-500 w-3 h-3 cursor-pointer" />
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
        {message}
      </div>
    </div>
  );
}
