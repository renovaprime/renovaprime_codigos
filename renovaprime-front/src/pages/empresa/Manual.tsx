import { LayoutEmpresa } from '../../layout/LayoutEmpresa';
import { ManualGuide } from '../../components/ManualGuide';
import manual from './manual-empresa.json';

export function EmpresaManual() {
  return (
    <LayoutEmpresa title="Manual">
      <ManualGuide data={manual} />
    </LayoutEmpresa>
  );
}
