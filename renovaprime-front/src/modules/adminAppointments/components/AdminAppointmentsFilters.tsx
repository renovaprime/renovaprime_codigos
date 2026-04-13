import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { Specialty } from '../../../types/api';

interface AdminAppointmentsFiltersProps {
  onFilterChange: (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    specialtyId?: number;
    type?: 'ONLINE' | 'PRESENTIAL';
    search?: string;
  }) => void;
  specialties?: Specialty[];
  showStatusFilter?: boolean;
  statusOptions?: { value: string; label: string }[];
}

export function AdminAppointmentsFilters({
  onFilterChange,
  specialties = [],
  showStatusFilter = true,
  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'SCHEDULED', label: 'Agendadas' },
    { value: 'IN_PROGRESS', label: 'Em andamento' },
  ],
}: AdminAppointmentsFiltersProps) {
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specialtyId, setSpecialtyId] = useState<number | ''>('');
  const [type, setType] = useState<'ONLINE' | 'PRESENTIAL' | ''>('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      specialtyId: specialtyId || undefined,
      type: type || undefined,
      search: search || undefined,
    });
  };

  const handleClearFilters = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
    setSpecialtyId('');
    setType('');
    setSearch('');
    onFilterChange({});
  };

  const hasActiveFilters = status || startDate || endDate || specialtyId || type || search;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      {/* Search and toggle filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder="Buscar por medico ou beneficiario..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-primary text-white border-primary'
              : 'bg-card text-foreground border-border hover:bg-muted'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white" />}
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status filter */}
            {showStatusFilter && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type filter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as '' | 'ONLINE' | 'PRESENTIAL')}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todos</option>
                <option value="ONLINE">Online</option>
                <option value="PRESENTIAL">Presencial</option>
              </select>
            </div>

            {/* Specialty filter */}
            {specialties.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Especialidade
                </label>
                <select
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Todas</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Start date filter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Data inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* End date filter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Data final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
