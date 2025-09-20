import { isNil } from 'lodash';
import { useParams } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { useSystemStore } from '@/features/system/hooks';

import InfoPage from './components/Info';
import InputPage from './components/Input';

export default function HierarchicalForm() {
  const params = useParams();
  const reportId = params.id;
  const { allReports } = useSystemStore(
    useShallow((state) => ({
      allReports: state.reports,
    }))
  );

  const { info } = allReports?.[reportId || ''] || {};

  if (info?.level && !isNil(info.school) && info.ward) {
    return <InputPage reportId={reportId || ''} />;
  }

  return <InfoPage reportId={reportId || ''} />;
}
