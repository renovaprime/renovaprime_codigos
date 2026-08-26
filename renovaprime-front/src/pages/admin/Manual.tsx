import { Layout } from '../../layout';
import { ManualGuide } from '../../components/ManualGuide';
import manual from './manual-superadmin.json';

export function AdminManual() {
  return (
    <Layout>
      <ManualGuide data={manual} />
    </Layout>
  );
}
