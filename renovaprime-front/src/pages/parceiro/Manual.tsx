import { LayoutParceiro } from '../../layout/LayoutParceiro';
import { ManualGuide, type ManualData } from '../../components/ManualGuide';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import type { PartnerEntityType } from '../../types/partner';
import manualParceiro from './manual-parceiro.json';
import manualFilial from './manual-filial.json';
import manualRevendedor from './manual-revendedor.json';

const MANUALS: Record<PartnerEntityType, ManualData> = {
  partner: manualParceiro as ManualData,
  branch: manualFilial as ManualData,
  reseller: manualRevendedor as ManualData,
};

export function ParceiroManual() {
  const { entity } = usePartnerAuth();
  const type: PartnerEntityType = entity?.type ?? 'partner';
  const data = MANUALS[type];

  return (
    <LayoutParceiro>
      <ManualGuide key={type} data={data} />
    </LayoutParceiro>
  );
}
