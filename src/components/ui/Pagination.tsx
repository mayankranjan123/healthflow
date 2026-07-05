import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  itemNameSingular?: string;
  itemNamePlural?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemNameSingular = 'item',
  itemNamePlural = 'items',
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
      <p className="text-xs text-slate-500 font-medium font-sans">
        Showing <span className="font-semibold text-slate-800">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-800">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalItems}</span> {totalItems === 1 ? itemNameSingular : itemNamePlural}
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`
            w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center transition-colors bg-white text-slate-600
            ${currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 hover:text-slate-800'}
          `}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`
            w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center transition-colors bg-white text-slate-600
            ${currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 hover:text-slate-800'}
          `}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
