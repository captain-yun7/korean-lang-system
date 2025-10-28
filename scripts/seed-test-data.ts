import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...\n');

  // 교사와 학생 조회
  const teacher = await prisma.teacher.findFirst();
  const students = await prisma.student.findMany();

  if (!teacher) {
    console.error('❌ No teacher found!');
    return;
  }

  if (students.length === 0) {
    console.error('❌ No students found!');
    return;
  }

  console.log(`✅ Found 1 teacher and ${students.length} students\n`);

  // 지문 데이터 생성
  console.log('📚 Creating passages...');
  const passages = await Promise.all([
    prisma.passage.create({
      data: {
        title: '인공지능의 미래',
        category: '비문학',
        subcategory: '과학기술',
        difficulty: '고1-2',
        contentBlocks: [
          {
            para: '인공지능(AI)은 현대 사회에서 가장 주목받는 기술 중 하나입니다. AI는 인간의 지능을 모방하여 학습하고 판단하며 문제를 해결하는 컴퓨터 시스템입니다.',
            q: '인공지능의 정의는 무엇인가?',
            a: '인간의 지능을 모방하여 학습하고 판단하며 문제를 해결하는 컴퓨터 시스템',
            explanation: 'AI는 인간의 지능을 컴퓨터로 구현한 것입니다.',
          },
          {
            para: 'AI는 의료, 교육, 제조업 등 많은 분야에서 활용되고 있습니다. 특히 데이터 분석과 패턴 인식에서 뛰어난 성능을 보입니다.',
            q: '현대 사회에서 AI가 주목받는 이유는?',
            a: '다양한 분야에서 혁신적인 변화를 가져올 수 있기 때문',
            explanation: 'AI는 의료, 교육, 제조업 등 많은 분야에서 활용되고 있습니다.',
          },
        ],
        questions: {
          create: [
            {
              text: 'AI의 가장 중요한 특징은 무엇인가?',
              type: '객관식',
              options: ['학습 능력', '크기', '가격', '색상'],
              answers: ['학습 능력'],
              explanation: 'AI의 핵심은 데이터로부터 학습하는 능력입니다.',
            },
            {
              text: 'AI 기술이 적용될 수 있는 분야를 서술하시오.',
              type: '서술형',
              answers: ['의료, 교육, 제조업, 금융, 자율주행 등'],
              explanation: 'AI는 거의 모든 산업 분야에 적용될 수 있습니다.',
            },
          ],
        },
      },
    }),
    prisma.passage.create({
      data: {
        title: '고전시의 아름다움',
        category: '문학',
        subcategory: '고전시가',
        difficulty: '중학교',
        contentBlocks: [
          {
            para: '우리나라 고전시는 자연과 인간의 조화를 노래합니다. 한국의 정서와 아름다움이 담겨 있습니다.',
            q: '고전시의 주요 주제는?',
            a: '자연과 인간의 조화',
            explanation: '고전시는 자연을 통해 삶의 의미를 찾습니다.',
          },
        ],
        questions: {
          create: [
            {
              text: '고전시에서 자주 등장하는 소재는?',
              type: '단답형',
              answers: ['산', '강', '달', '꽃', '새'],
              explanation: '자연물이 주요 소재입니다.',
            },
          ],
        },
      },
    }),
    prisma.passage.create({
      data: {
        title: '품사의 이해',
        category: '문법',
        subcategory: '품사',
        difficulty: '고3',
        contentBlocks: [
          {
            para: '한국어의 품사는 체언, 용언, 수식언, 관계언, 독립언으로 분류됩니다. 각 품사는 고유한 문법적 기능을 가지고 있습니다.',
            q: '한국어 품사의 5대 분류는?',
            a: '체언, 용언, 수식언, 관계언, 독립언',
            explanation: '품사는 단어의 문법적 기능에 따라 분류됩니다.',
          },
        ],
        questions: {
          create: [
            {
              text: '명사가 속하는 품사는?',
              type: '객관식',
              options: ['체언', '용언', '수식언', '관계언'],
              answers: ['체언'],
              explanation: '명사, 대명사, 수사는 체언에 속합니다.',
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${passages.length} passages\n`);

  // 과제 배정 (학년/반 전체)
  console.log('📋 Assigning passages to class...');
  const firstStudent = students[0];
  await prisma.assignedPassage.create({
    data: {
      passageId: passages[0].id,
      assignedBy: teacher.id,
      targetGrade: firstStudent.grade,
      targetClass: firstStudent.class,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
    },
  });

  // 개인 과제 배정
  await prisma.assignedPassage.create({
    data: {
      passageId: passages[1].id,
      assignedBy: teacher.id,
      assignedTo: firstStudent.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
    },
  });

  console.log('✅ Assigned 2 passages\n');

  // 학습 결과 생성 (첫 번째 학생)
  console.log('📝 Creating student results...');

  const result1 = await prisma.result.create({
    data: {
      studentId: firstStudent.id,
      passageId: passages[0].id,
      readingTime: 180, // 3분
      score: 85,
      paragraphAnswers: [
        {
          q: '인공지능의 정의는 무엇인가?',
          answer: '인간의 지능을 모방하는 시스템',
          correctAnswer: '인간의 지능을 모방하여 학습하고 판단하며 문제를 해결하는 컴퓨터 시스템',
          isCorrect: true,
          explanation: 'AI는 인간의 지능을 컴퓨터로 구현한 것입니다.',
        },
      ],
      submittedAt: new Date(),
    },
  });

  // 문제 답변 생성
  const aiQuestions = await prisma.question.findMany({
    where: { passageId: passages[0].id },
  });

  await prisma.questionAnswer.createMany({
    data: aiQuestions.map((q, idx) => ({
      resultId: result1.id,
      questionId: q.id,
      answer: idx === 0 ? '학습 능력' : '의료, 교육, 제조업',
      isCorrect: true,
    })),
  });

  // 오답 생성 (두 번째 학생)
  const result2 = await prisma.result.create({
    data: {
      studentId: students[1].id,
      passageId: passages[0].id,
      readingTime: 240,
      score: 60,
      paragraphAnswers: [],
      submittedAt: new Date(),
    },
  });

  const wrongQuestion = aiQuestions[0];
  await prisma.questionAnswer.create({
    data: {
      resultId: result2.id,
      questionId: wrongQuestion.id,
      answer: '크기',
      isCorrect: false,
    },
  });

  await prisma.wrongAnswer.create({
    data: {
      studentId: students[1].id,
      questionId: wrongQuestion.id,
      wrongAnswer: '크기',
      correctAnswer: '학습 능력',
      explanation: 'AI의 핵심은 데이터로부터 학습하는 능력입니다.',
      isReviewed: false,
    },
  });

  console.log('✅ Created 2 results with answers\n');

  // 더 많은 결과 생성 (순위 테스트용)
  console.log('🏆 Creating more results for ranking...');

  for (let i = 0; i < students.length; i++) {
    for (let j = 0; j < 3; j++) {
      const passageIndex = j % passages.length;
      const score = 70 + Math.floor(Math.random() * 30); // 70-100점

      await prisma.result.create({
        data: {
          studentId: students[i].id,
          passageId: passages[passageIndex].id,
          readingTime: 120 + Math.floor(Math.random() * 180),
          score: score,
          paragraphAnswers: [],
          submittedAt: new Date(Date.now() - j * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log(`✅ Created ${students.length * 3} additional results\n`);

  console.log('🎉 Test data seeding completed!\n');

  // 최종 통계
  const finalCount = {
    passages: await prisma.passage.count(),
    questions: await prisma.question.count(),
    assignments: await prisma.assignedPassage.count(),
    results: await prisma.result.count(),
    wrongAnswers: await prisma.wrongAnswer.count(),
  };

  console.log('📊 Final Database Status:');
  console.log('========================');
  console.log(`📚 Passages: ${finalCount.passages}`);
  console.log(`❓ Questions: ${finalCount.questions}`);
  console.log(`📋 Assignments: ${finalCount.assignments}`);
  console.log(`📝 Results: ${finalCount.results}`);
  console.log(`❌ Wrong Answers: ${finalCount.wrongAnswers}`);
  console.log('========================');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
