import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
import { ManualGuide } from '../../components/ManualGuide';
import manual from './manual-beneficiario.json';

export function BeneficiarioManual() {
  return (
    <LayoutBeneficiario>
      <ManualGuide data={manual} />
    </LayoutBeneficiario>
  );
}
