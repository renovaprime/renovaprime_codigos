import type { VitalsData } from '../types/medicalRecord';

interface VitalsFormProps {
  value: VitalsData;
  onChange: (vitals: VitalsData) => void;
  disabled?: boolean;
}

export function VitalsForm({ value, onChange, disabled }: VitalsFormProps) {
  const handleChange = (field: keyof VitalsData, rawValue: string) => {
    const numericFields: (keyof VitalsData)[] = ['heart_rate', 'temperature', 'weight', 'height', 'spo2', 'respiratory_rate'];
    const newValue = numericFields.includes(field) ? (rawValue ? parseFloat(rawValue) : undefined) : (rawValue || undefined);
    onChange({ ...value, [field]: newValue });
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:bg-muted';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">PA (mmHg)</label>
        <input
          type="text"
          placeholder="120/80"
          value={value.blood_pressure || ''}
          onChange={(e) => handleChange('blood_pressure', e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">FC (bpm)</label>
        <input
          type="number"
          placeholder="72"
          value={value.heart_rate ?? ''}
          onChange={(e) => handleChange('heart_rate', e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Temp. (°C)</label>
        <input
          type="number"
          step="0.1"
          placeholder="36.5"
          value={value.temperature ?? ''}
          onChange={(e) => handleChange('temperature', e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Peso (kg)</label>
        <input
          type="number"
          step="0.1"
          placeholder="70"
          value={value.weight ?? ''}
          onChange={(e) => handleChange('weight', e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Altura (cm)</label>
        <input
          type="number"
          placeholder="170"
          value={value.height ?? ''}
          onChange={(e) => handleChange('height', e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">SpO2 (%)</label>
        <input
          type="number"
          placeholder="98"
          value={value.spo2 ?? ''}
          onChange={(e) => handleChange('spo2', e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">FR (irpm)</label>
        <input
          type="number"
          placeholder="16"
          value={value.respiratory_rate ?? ''}
          onChange={(e) => handleChange('respiratory_rate', e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
    </div>
  );
}
