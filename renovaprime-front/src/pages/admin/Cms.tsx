import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../../layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { ConfirmModal } from '../../components/ConfirmModal';
import { PageHeader } from '../../components';
import { cmsService } from '../../services/cmsService';
import type { CmsEntry } from '../../types/api';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  FileJson,
  Search,
  X
} from 'lucide-react';

interface CmsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, title: string, content: string) => Promise<void>;
  entry?: CmsEntry | null;
  isLoading?: boolean;
}

function CmsFormModal({ isOpen, onClose, onSave, entry, isLoading }: CmsFormModalProps) {
  const [key, setKey] = useState('');
  const [title, setTitle] = useState('');
  const [contentJson, setContentJson] = useState('');

  useEffect(() => {
    if (entry) {
      setKey(entry.key);
      setTitle(entry.title);
      setContentJson(entry.content);
    } else {
      setKey('');
      setTitle('');
      setContentJson('');
    }
  }, [entry, isOpen]);

  const handleSave = async () => {
    await onSave(key, title, contentJson);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {entry ? 'Editar Entrada CMS' : 'Nova Entrada CMS'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-auto">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Chave
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={!!entry}
              placeholder="ex: homepage-hero, footer-links"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:cursor-not-allowed"
            />
            {entry && (
              <p className="text-xs text-muted-foreground mt-1">
                A chave não pode ser alterada após a criação.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Banner Principal, Links do Rodapé"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">
              Conteúdo
            </label>
            <textarea
              value={contentJson}
              onChange={(e) => setContentJson(e.target.value)}
              rows={15}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder=''
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!key.trim() || !title.trim() || !contentJson.trim() || isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            {entry ? 'Salvar Alterações' : 'Criar Entrada'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminCms() {
  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<CmsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CmsEntry | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<CmsEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cmsService.listAll();
      setEntries(data);
      setFilteredEntries(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar entradas CMS';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const filtered = entries.filter(entry =>
        entry.key.toLowerCase().includes(searchLower) ||
        entry.title.toLowerCase().includes(searchLower)
      );
      setFilteredEntries(filtered);
    } else {
      setFilteredEntries(entries);
    }
  }, [search, entries]);

  const handleCreate = () => {
    setSelectedEntry(null);
    setFormModalOpen(true);
  };

  const handleEdit = (entry: CmsEntry) => {
    setSelectedEntry(entry);
    setFormModalOpen(true);
  };

  const handleSave = async (key: string, title: string, content: string) => {
    setIsSaving(true);
    try {
      if (selectedEntry) {
        await cmsService.update(key, title, content);
      } else {
        await cmsService.create(key, title, content);
      }
      setFormModalOpen(false);
      await loadEntries();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar entrada';
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (entry: CmsEntry) => {
    setEntryToDelete(entry);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);
    try {
      await cmsService.delete(entryToDelete.key);
      setDeleteModalOpen(false);
      setEntryToDelete(null);
      await loadEntries();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir entrada';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout title="CMS">
      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Gerenciador de Conteúdo (CMS)"
          subtitle="Gerencie o conteúdo dinâmico do sistema."
          actions={
            <Button variant="secondary" onClick={loadEntries} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          }
        />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou chave..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-700 underline mt-1"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : filteredEntries.length === 0 ? (
          /* Empty state */
          <Card>
            <CardContent className="flex flex-col items-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileJson className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display text-foreground mb-2">
                {search ? 'Nenhuma entrada encontrada' : 'Nenhuma entrada CMS'}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {search
                  ? 'Tente buscar com outros termos.'
                  : 'Crie a primeira entrada para começar a gerenciar o conteúdo do sistema.'
                }
              </p>
              {!search && (
                <Button className="mt-4" onClick={handleCreate}>
                  <Plus className="w-4 h-4" />
                  Criar Primeira Entrada
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Entries list */
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-primary" />
                        {entry.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Chave: <code className="bg-muted px-1 rounded">{entry.key}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(entry)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-auto max-h-32 whitespace-pre-wrap">
                    {entry.content}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <CmsFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSave}
        entry={selectedEntry}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEntryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Entrada CMS"
        description={`Tem certeza que deseja excluir a entrada "${entryToDelete?.key}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </Layout>
  );
}
