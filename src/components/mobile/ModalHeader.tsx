interface ModalHeaderProps {
  city: string;
  view: 'location' | 'summary';
  onClose: () => void;
  onBack: () => void;
}

export default function ModalHeader({ city, view, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <div className="text-xl font-bold text-gray-900">
        {view === 'location' ? city : 'Filters'}
      </div>
      <button
        className="text-2xl text-gray-400 hover:text-gray-700 focus:outline-none"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
} 