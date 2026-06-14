import { createFileRoute } from '@tanstack/react-router';
import SubmitTaskPage from '../../pages/SubmitTaskPage';

export const Route = createFileRoute('/dashboard/submit')({
  component: SubmitTaskPage,
});
