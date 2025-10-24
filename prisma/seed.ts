import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 기본 카테고리 생성
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'LED 전광판',
        description: '디지털 LED 전광판 광고',
      },
    }),
    prisma.category.create({
      data: {
        name: '현수막',
        description: '현수막 광고',
      },
    }),
    prisma.category.create({
      data: {
        name: '버스정류장',
        description: '버스정류장 광고판',
      },
    }),
    prisma.category.create({
      data: {
        name: '지하철역',
        description: '지하철역 내부 광고',
      },
    }),
    prisma.category.create({
      data: {
        name: '옥외간판',
        description: '건물 외벽 간판',
      },
    }),
  ]);

  // 서울 주요 구 생성
  const districts = await Promise.all([
    prisma.district.create({ data: { name: '강남구', city: '서울' } }),
    prisma.district.create({ data: { name: '서초구', city: '서울' } }),
    prisma.district.create({ data: { name: '송파구', city: '서울' } }),
    prisma.district.create({ data: { name: '강동구', city: '서울' } }),
    prisma.district.create({ data: { name: '마포구', city: '서울' } }),
    prisma.district.create({ data: { name: '용산구', city: '서울' } }),
    prisma.district.create({ data: { name: '중구', city: '서울' } }),
    prisma.district.create({ data: { name: '종로구', city: '서울' } }),
  ]);

  // 샘플 광고 데이터
  const sampleAds = [
    {
      title: '강남역 LED 전광판 A구역',
      slug: 'gangnam-led-a',
      description: '강남역 2번 출구 정면 대형 LED 전광판입니다.',
      categoryId: categories[0].id, // LED 전광판
      districtId: districts[0].id, // 강남구
      location: {
        address: '서울시 강남구 강남대로 396',
        coordinates: [127.027926, 37.497954],
        landmarks: ['강남역', '강남역사거리', 'CGV 강남'],
        district: '강남구'
      },
      specs: {
        type: 'LED 전광판',
        size: '10m x 3m',
        resolution: '1920x576',
        material: 'LED',
        installation: '건물 외벽'
      },
      pricing: {
        monthly: 3000000,
        deposit: 1000000,
        minimumPeriod: 3,
        currency: 'KRW'
      },
      metadata: {
        traffic: '일평균 10만명 이상',
        visibility: '매우 좋음',
        nearbyBusinesses: ['강남역', 'CGV', '스타벅스', '맥도날드'],
        operatingHours: '24시간',
        restrictions: ['음주 광고 불가', '의료 광고 제한']
      }
    },
    {
      title: '홍대입구역 버스정류장 광고',
      slug: 'hongdae-bus-stop',
      description: '홍대입구역 인근 주요 버스정류장 광고판입니다.',
      categoryId: categories[2].id, // 버스정류장
      districtId: districts[4].id, // 마포구
      location: {
        address: '서울시 마포구 양화로 160',
        coordinates: [126.924910, 37.556628],
        landmarks: ['홍대입구역', '홍익대학교', '홍대거리'],
        district: '마포구'
      },
      specs: {
        type: '버스정류장 광고판',
        size: '2m x 1.2m',
        material: '후면조명 필름',
        installation: '버스정류장'
      },
      pricing: {
        monthly: 800000,
        deposit: 300000,
        minimumPeriod: 6,
        currency: 'KRW'
      },
      metadata: {
        traffic: '일평균 5만명',
        visibility: '좋음',
        nearbyBusinesses: ['홍익대학교', '클럽', '카페', '음식점'],
        operatingHours: '24시간',
        restrictions: []
      }
    },
    {
      title: '잠실역 지하철 광고',
      slug: 'jamsil-subway-ad',
      description: '잠실역 대합실 메인 광고 공간입니다.',
      categoryId: categories[3].id, // 지하철역
      districtId: districts[2].id, // 송파구
      location: {
        address: '서울시 송파구 올림픽로 지하 265',
        coordinates: [127.100311, 37.513292],
        landmarks: ['잠실역', '롯데월드', '잠실야구장'],
        district: '송파구'
      },
      specs: {
        type: '지하철 광고판',
        size: '5m x 2m',
        material: '후면조명 필름',
        installation: '지하철 대합실'
      },
      pricing: {
        monthly: 1500000,
        deposit: 500000,
        minimumPeriod: 3,
        currency: 'KRW'
      },
      metadata: {
        traffic: '일평균 15만명',
        visibility: '매우 좋음',
        nearbyBusinesses: ['롯데월드', '롯데백화점', '잠실야구장'],
        operatingHours: '첫차-막차',
        restrictions: ['지하철공사 심의 필요']
      }
    },
    {
      title: '명동 현수막 광고',
      slug: 'myeongdong-banner',
      description: '명동 메인스트리트 현수막 광고 위치입니다.',
      categoryId: categories[1].id, // 현수막
      districtId: districts[6].id, // 중구
      location: {
        address: '서울시 중구 명동길 26',
        coordinates: [126.981893, 37.563692],
        landmarks: ['명동역', '명동성당', '롯데백화점'],
        district: '중구'
      },
      specs: {
        type: '현수막',
        size: '8m x 1m',
        material: '배너천',
        installation: '가로등 현수막'
      },
      pricing: {
        monthly: 500000,
        deposit: 200000,
        minimumPeriod: 1,
        currency: 'KRW'
      },
      metadata: {
        traffic: '일평균 8만명',
        visibility: '좋음',
        nearbyBusinesses: ['명동성당', '롯데백화점', '쇼핑몰'],
        operatingHours: '24시간',
        restrictions: ['구청 허가 필요']
      }
    },
    {
      title: '이태원 옥외간판',
      slug: 'itaewon-outdoor-sign',
      description: '이태원 메인스트리트 건물 외벽 간판 광고입니다.',
      categoryId: categories[4].id, // 옥외간판
      districtId: districts[5].id, // 용산구
      location: {
        address: '서울시 용산구 이태원로 200',
        coordinates: [126.994041, 37.534567],
        landmarks: ['이태원역', '해밀톤호텔', 'N서울타워'],
        district: '용산구'
      },
      specs: {
        type: '옥외간판',
        size: '6m x 2m',
        material: 'LED 백라이트',
        installation: '건물 외벽'
      },
      pricing: {
        monthly: 1200000,
        deposit: 400000,
        minimumPeriod: 6,
        currency: 'KRW'
      },
      metadata: {
        traffic: '일평균 6만명',
        visibility: '매우 좋음',
        nearbyBusinesses: ['외국인 관광지', '레스토랑', '바'],
        operatingHours: '24시간',
        restrictions: ['구청 간판 심의 필요']
      }
    }
  ];

  // 광고 데이터 생성
  for (const adData of sampleAds) {
    const ad = await prisma.ad.create({
      data: {
        title: adData.title,
        slug: adData.slug,
        description: adData.description,
        categoryId: adData.categoryId,
        districtId: adData.districtId,
        location: adData.location,
        specs: adData.specs,
        pricing: adData.pricing,
        metadata: adData.metadata,
      },
    });

    // 각 광고에 샘플 이미지 추가 (더미 이미지 URL)
    await Promise.all([
      prisma.adImage.create({
        data: {
          adId: ad.id,
          url: `https://picsum.photos/800/600?random=${ad.id}-1`,
          alt: `${ad.title} 메인 이미지`,
          order: 0,
        },
      }),
      prisma.adImage.create({
        data: {
          adId: ad.id,
          url: `https://picsum.photos/800/600?random=${ad.id}-2`,
          alt: `${ad.title} 측면 뷰`,
          order: 1,
        },
      }),
    ]);

    console.log(`✅ Created ad: ${ad.title}`);
  }

  console.log('🎉 Seeding completed!');
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${districts.length} districts`);
  console.log(`Created ${sampleAds.length} ads with images`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });