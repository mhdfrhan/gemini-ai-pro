import { createFileRoute } from '@tanstack/react-router';
import HistoryPage from '../../pages/HistoryPage';

export const Route = createFileRoute('/dashboard/history')({
  component: HistoryPage,
  validateSearch: (search: Record<string, unknown>) => ({
    highlight: search.highlight as string | undefined,
  }),
});
