interface ExploreButtonProps {
  onClick: () => void;
}

export default function ExploreButton({ onClick }: ExploreButtonProps) {
  return (
    <button
      className="w-full bg-[#11182B] text-white py-4 rounded-2xl text-base font-semibold shadow-lg hover:bg-[#222b44] transition-colors"
      onClick={onClick}
      type="button"
    >
      Explore
    </button>
  );
} 