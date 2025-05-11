import React, { useRef, useEffect } from "react";
import { Button } from "@mantine/core";
import { CSVLink } from "react-csv";

interface BulkActionsDropdownProps {
  csvData: object[];
  csvHeaders: { label: string; key: string }[];
  csvError: boolean;
  csvLoading: boolean;
  csvReady: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  csvLinkRef: React.RefObject<any>;
  handleBulkDownload: () => void;
  handleBulkUpload: () => void;
  handleBulkEdit: () => void;
}

export function BulkActionsDropdown({
  csvData,
  csvHeaders,
  csvError,
  csvLoading,
  csvReady,
  csvLinkRef,
  handleBulkDownload,
  handleBulkUpload,
  handleBulkEdit,
}: BulkActionsDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    setIsOpen((open) => !open);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="default"
        className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
        onClick={handleToggle}
        leftSection={
          <span className="w-5 h-5 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="20"
              viewBox="0 0 17 20"
              fill="none"
            >
              <path
                d="M1 7.17647V11.5882C1 14.9158 1 16.5796 2.03374 17.6133C3.06749 18.6471 4.73126 18.6471 8.05882 18.6471H8.94118C12.2687 18.6471 13.9326 18.6471 14.9662 17.6133C16 16.5796 16 14.9158 16 11.5882V8.05882C16 4.73126 16 3.06749 14.9662 2.03374C13.9326 1 12.2687 1 8.94118 1H8.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.82355 14.2354H13.353"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.82355 5.41211H13.353"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.82355 9.82324H13.353"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.64703 13.7938C3.64703 13.7938 4.50078 14.0295 4.97056 15.1173C4.97056 15.1173 5.85292 12.4702 7.61762 11.5879"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.73529 3.64706H1M6.73529 3.64706C6.73529 2.90564 4.68234 1.52045 4.16176 1M6.73529 3.64706C6.73529 4.38847 4.68233 5.77367 4.16176 6.29412"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        }
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
      >
        Bulk actions
      </Button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-40 rounded-xl bg-primary shadow-lg z-20  flex flex-col  text-white text-sm font-medium">
          <button
            className="px-6 py-2 text-left rounded-md hover:bg-white/10 transition-colors"
            onClick={handleBulkDownload}
            disabled={csvLoading}
          >
            {csvLoading ? (
              <span className="inline-flex items-center animate-pulse">
                Downloading
                <span className="ml-1 inline-block">
                  <span className="dot-1">.</span>
                  <span className="dot-2">.</span>
                  <span className="dot-3">.</span>
                </span>
              </span>
            ) : (
              "Bulk download"
            )}
          </button>
          <button
            className="px-6 py-2 text-left rounded-md hover:bg-white/10 transition-colors"
            disabled={csvLoading}
            onClick={handleBulkUpload}
          >
            Bulk upload
          </button>
          <button
            className="px-6 py-2 text-left rounded-md hover:bg-white/10 transition-colors"
            disabled={csvLoading}
            onClick={() => {
              handleBulkEdit();
              setIsOpen(false);
            }}
          >
            Bulk edit
          </button>
          {csvError && (
            <span className="px-6 py-2 text-red-300">
              Error downloading CSV
            </span>
          )}
          {csvReady && (
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename="all-products.csv"
              ref={csvLinkRef}
              className="hidden"
              target="_blank"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default BulkActionsDropdown;
