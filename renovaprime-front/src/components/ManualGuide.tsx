import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  History,
  LayoutDashboard,
  User,
  UserPlus,
  Users,
  CreditCard,
  Video,
  ShoppingCart,
  Percent,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { PageHeader } from './PageHeader';

export interface ManualStep {
  title: string;
  text: string;
}

export interface ManualSection {
  title: string;
  paragraphs?: string[];
  steps?: ManualStep[];
  bullets?: string[];
}

export interface ManualItem {
  id: string;
  title: string;
  description: string;
  route?: string;
  sections: ManualSection[];
}

export interface ManualCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: ManualItem[];
}

export interface ManualData {
  title: string;
  subtitle: string;
  categories: ManualCategory[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  UserPlus,
  Clock,
  Calendar,
  BarChart3,
  User,
  LayoutDashboard,
  FileText,
  ClipboardList,
  Video,
  History,
  Users,
  CreditCard,
  ShoppingCart,
  Percent,
  Building2,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? ChevronRight;
}

interface ManualGuideProps {
  data: ManualData;
}

export function ManualGuide({ data }: ManualGuideProps) {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);

  const categories = data.categories;
  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;
  const selectedItem = selectedCategory?.items.find((item) => item.id === itemId) ?? null;

  const handleBack = () => {
    if (selectedItem) {
      setItemId(null);
      return;
    }
    if (selectedCategory) {
      setCategoryId(null);
    }
  };

  const goToHome = () => {
    setCategoryId(null);
    setItemId(null);
  };

  const headerTitle = selectedItem?.title ?? selectedCategory?.title ?? data.title;
  const headerSubtitle = selectedItem
    ? selectedItem.description
    : selectedCategory
      ? selectedCategory.description
      : data.subtitle;

  return (
    <div className="w-full mx-auto space-y-6">
      <PageHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        leading={
          (selectedCategory || selectedItem) ? (
            <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={goToHome}
                className="hover:text-foreground transition-colors"
              >
                Manual
              </button>
              {selectedCategory && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setItemId(null)}
                    className={selectedItem ? 'hover:text-foreground transition-colors' : 'text-foreground font-medium'}
                  >
                    {selectedCategory.title}
                  </button>
                </>
              )}
              {selectedItem && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-foreground font-medium">{selectedItem.title}</span>
                </>
              )}
            </nav>
          ) : undefined
        }
        actions={
          selectedItem?.route ? (
            <Button onClick={() => navigate(selectedItem.route!)}>
              <ExternalLink className="w-4 h-4" />
              Ir para a tela
            </Button>
          ) : undefined
        }
      />

      {(selectedCategory || selectedItem) && (
        <Button variant="ghost" onClick={handleBack} className="self-start -mt-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      )}

      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <Card
                key={category.id}
                interactive
                className="h-full"
                onClick={() => setCategoryId(category.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/15 text-primary flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-display font-semibold text-foreground">{category.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                    <p className="mt-3 text-xs text-primary font-medium inline-flex items-center gap-1">
                      Ver fluxos
                      <ArrowRight className="w-3.5 h-3.5" />
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedCategory && !selectedItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedCategory.items.map((item) => (
            <Card
              key={item.id}
              interactive
              className="h-full"
              onClick={() => setItemId(item.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-display font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  <p className="mt-3 text-xs text-primary font-medium inline-flex items-center gap-1">
                    Abrir guia
                    <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="space-y-4">
          {selectedItem.sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="text-sm text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}

                  {section.steps && (
                    <ol className="space-y-4">
                      {section.steps.map((step, index) => (
                        <li key={step.title} className="flex gap-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {section.bullets && (
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
