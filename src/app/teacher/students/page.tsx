import { Card } from '@/components/ui';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
        <p className="text-gray-600 mt-1">학생 정보를 조회하고 관리하세요</p>
      </div>

      <Card padding="md">
        <p className="text-gray-600">학생 관리 페이지 (구현 예정)</p>
      </Card>
    </div>
  );
}
