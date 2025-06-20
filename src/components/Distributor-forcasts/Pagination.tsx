interface PaginationProps {
  activePage: number;
  totalPages: number;
  setActivePage: (page: number) => void;
}

export default function Pagination({ activePage, totalPages, setActivePage }: PaginationProps) {
  const handlePrevious = () => {
    if (activePage > 1) setActivePage(activePage - 1);
  };

  const handleNext = () => {
    if (activePage < totalPages) setActivePage(activePage + 1);
  };

  const renderPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (activePage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (activePage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages);
      }
    }

    return pages.map((page, i) =>
      typeof page === "number" ? (
        <button
          key={i}
          onClick={() => setActivePage(page)}
          className={`text-base p-4 w-12 h-12 rounded border transition-colors duration-200 ${page === activePage
              ? "text-#0F62FE"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
        >
          {page}
        </button>
      ) : (
        <span key={i} className="text-base p-4 w-12 h-12 flex items-center justify-center text-gray-500">
          ...
        </span>
      )
    );
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      <button
        onClick={handlePrevious}
        disabled={activePage === 1}
        className="text-base p-4 w-20 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
      >
        Previous
      </button>

      {renderPages()}

      <button
        onClick={handleNext}
        disabled={activePage === totalPages}
        className="text-base p-4 w-20 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}