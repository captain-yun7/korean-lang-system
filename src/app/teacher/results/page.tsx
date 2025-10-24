import { Card } from '@/components/ui';

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">성적 조회</h1>
        <p className="text-gray-600 mt-1">학생들의 학습 성적을 조회하세요</p>
      </div>

      <Card padding="md">
        <p className="text-gray-600">성적 조회 페이지 (구현 예정)</p>
      </Card>
    </div>
  );
}
