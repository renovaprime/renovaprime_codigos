import { LayoutEmpresa } from '../../layout/LayoutEmpresa';
import { PageHeader } from '../../components';
import { CompanyBeneficiariesPanel } from '../../components/CompanyBeneficiariesPanel';

export function EmpresaBeneficiarios() {
  return (
    <LayoutEmpresa title="Beneficiários">
      <div className="space-y-6">
        <PageHeader
          title="Beneficiários"
          subtitle="Cadastre colaboradores (titulares) e dependentes. O colaborador acessa consultas em /beneficiario/login."
        />
        <CompanyBeneficiariesPanel mode="portal" />
      </div>
    </LayoutEmpresa>
  );
}
