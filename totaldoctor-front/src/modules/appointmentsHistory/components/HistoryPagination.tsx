import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoryPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function HistoryPagination({ page, limit, total, onPageChange }: HistoryPaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Mostrando {startItem} a {endItem} de {total} resultados
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                  pageNum === page
                    ? 'bg-primary text-white'
                    : 'bg-card text-foreground hover:bg-muted border border-border'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proximo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
