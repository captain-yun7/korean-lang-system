import { Card } from '@/components/ui';

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">문제 관리</h1>
        <p className="text-gray-600 mt-1">학습 문제를 등록하고 관리하세요</p>
      </div>

      <Card padding="md">
        <p className="text-gray-600">문제 관리 페이지 (구현 예정)</p>
      </Card>
    </div>
  );
}
