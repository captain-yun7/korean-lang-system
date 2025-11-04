'use client';

import { Card, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ContentBlock {
  para: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  createdAt: Date;
}

interface PassageDetail {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  difficulty: string;
  contentBlocks: ContentBlock[];
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
  _count: {
    questions: number;
  };
}

export default function PassageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [passage, setPassage] = useState<PassageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // 지문 데이터 가져오기
  useEffect(() => {
    const fetchPassage = async () => {
      try {
        const response = await fetch(`/api/teacher/passages/${id}/detail`);
        if (response.ok) {
          const data = await response.json();
          setPassage(data.passage);
        } else if (response.status === 404) {
          router.push('/teacher/passages');
        }
      } catch (error) {
        console.error('Failed to fetch passage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassage();
  }, [id, router]);

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!passage) return;

    if (
      !confirm(
        `"${passage.title}" 지문을 삭제하시겠습니까?\n\n연결된 문제 ${passage._count.questions}개도 함께 삭제됩니다.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/teacher/passages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '지문 삭제에 실패했습니다.');
      }

      alert('지문이 삭제되었습니다.');
      router.push('/teacher/passages');
      router.refresh();
    } catch (error: any) {
      alert(error.message || '지문 삭제에 실패했습니다.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">지문을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const contentBlocks = passage.contentBlocks as ContentBlock[];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{passage.title}</h1>
          <p className="text-gray-600 mt-1">
            {passage.category} · {passage.subcategory} · {passage.difficulty}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/teacher/passages/${passage.id}/edit`}>
            <Button variant="secondary">수정</Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
          <Link href="/teacher/passages">
            <Button variant="secondary">목록</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">문단 수</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {contentBlocks.length}개
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">문제 수</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {passage._count.questions}개
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Content Blocks */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">지문 내용</h2>
        </Card.Header>
        <Card.Body className="p-6">
          <div className="space-y-6">
            {contentBlocks.map((block, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">문단 {index + 1}</h3>

                <div>
                  <p className="text-gray-900 whitespace-pre-wrap">{block.para}</p>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Questions */}
      {passage.questions.length > 0 && (
        <Card>
          <Card.Header className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                연결된 문제 ({passage.questions.length}개)
              </h2>
              <Link
                href={`/teacher/questions/new?passageId=${passage.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + 문제 추가
              </Link>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="divide-y divide-gray-200">
              {passage.questions.map((question) => (
                <div key={question.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                        {question.type}
                      </span>
                      <p className="text-gray-900 mt-2">{question.text}</p>
                    </div>
                    <Link
                      href={`/teacher/questions/${question.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 ml-4"
                    >
                      상세
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <Card.Header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">메타 정보</h2>
        </Card.Header>
        <Card.Body className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-600">등록일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(passage.createdAt).toLocaleString('ko-KR')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">최종 수정일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(passage.updatedAt).toLocaleString('ko-KR')}
              </dd>
            </div>
          </dl>
        </Card.Body>
      </Card>
    </div>
  );
}
