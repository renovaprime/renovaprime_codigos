import { LayoutProfissional } from '../../layout/LayoutProfissional';
import { ManualGuide } from '../../components/ManualGuide';
import manual from './manual-professional.json';

export function ProfissionalManual() {
  return (
    <LayoutProfissional>
      <ManualGuide data={manual} />
    </LayoutProfissional>
  );
}
