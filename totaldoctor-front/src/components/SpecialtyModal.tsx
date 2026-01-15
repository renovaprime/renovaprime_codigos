import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import type { Specialty } from '../types/api';

interface SpecialtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  editingSpecialty?: Specialty | null;
}

export function SpecialtyModal({ isOpen, onClose, onSave, editingSpecialty }: SpecialtyModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingSpecialty) {
      setName(editingSpecialty.name);
    } else {
      setName('');
    }
    setError('');
  }, [editingSpecialty, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(name.trim());
      setName('');
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('already exists') || err.message.includes('Specialty already exists')) {
          setError('Especialidade já existe');
        } else {
          setError(err.message || 'Erro ao salvar especialidade');
        }
      } else {
        setError('Erro ao salvar especialidade');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {editingSpecialty ? 'Editar Especialidade' : 'Nova Especialidade'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="specialty-name" className="block text-sm font-medium text-foreground mb-2">
              Nome da Especialidade
            </label>
            <Input
              id="specialty-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cardiologia"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || name.trim().length < 3}
              className="flex-1"
            >
              {editingSpecialty ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
