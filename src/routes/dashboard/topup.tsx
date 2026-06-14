import { createFileRoute } from '@tanstack/react-router';
import { TopupPage } from '../../pages/TopupPage';

export const Route = createFileRoute('/dashboard/topup')({
  component: TopupPage,
});
