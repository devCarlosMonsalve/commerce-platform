import { FeedbackScreen } from '@/components/feedback-screen';

export default function Loading() {
  return (
    <FeedbackScreen
      busy
      eyebrow="Commerce Platform"
      title="Loading"
      description="Preparing your workspace."
    />
  );
}
