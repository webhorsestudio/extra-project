import { FiChevronDown } from 'react-icons/fi';

interface FilterRowProps {
  label: string;
  value: string;
  onClick: () => void;
}

export default function FilterRow({ label, value, onClick }: FilterRowProps) {
  return (
    <button
      className="w-full flex items-center justify-between bg-white rounded-2xl px-5 py-4 text-left shadow-sm mb-3 border border-gray-100"
      onClick={onClick}
      type="button"
    >
      <span className="text-base font-semibold text-gray-500">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-base font-bold text-gray-900">{value}</span>
        <FiChevronDown className="text-lg text-gray-400" />
      </span>
    </button>
  );
} 