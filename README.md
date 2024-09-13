# Dcmall 웹사이트

Dcmall은 Next.js와 Spring Boot를 기반으로 한 핫딜 관련 정보를 제공합니다.

## 주요 기능

- 사용자 인증 (일반 로그인 및 Google 로그인)
- 상품 검색 및 추천 시스템
- 개인화된 마이페이지
- 키워드 기반 알림 서비스
- 텍스트 임베딩을 활용한 고급 검색 및 추천 기능

## 기술 스택

- **프론트엔드**: Next.js, React
- **백엔드**: Node.js, Next.js API 라우트, Spring Boot
- **데이터베이스**: MySQL, Supabase
- **인증**: 자체 구현 + Google OAuth
- **상태 관리**: React Query
- **AI/ML**: OpenAI API
- **임베딩**: OpenAI의 text-embedding-3-small 모델
- **벡터 데이터베이스**: Supabase

## 주요 특징

- XSS 공격 방지를 위한 입력 데이터 살균
- 비밀번호 보안을 위한 솔팅 및 해싱
- 무한 스크롤을 통한 효율적인 데이터 로딩
- SSL 지원으로 보안 강화
- 텍스트 임베딩을 활용한 의미론적 검색 및 추천
- Supabase를 활용한 벡터 검색 구현

## 임베딩 기능

- OpenAI의 text-embedding-3-small 모델을 사용하여 텍스트를 벡터로 변환
- 변환된 벡터를 Supabase에 저장하여 효율적인 유사도 검색 수행
- 사용자 쿼리와 상품 설명 간의 의미론적 유사성을 기반으로 한 검색 및 추천 제공

## 시작하기

1. 저장소 클론:
   ```
   git clone [저장소 URL]
   ```

2. 의존성 설치:
   ```
   npm install
   ```

3. 환경 변수 설정:
   `.env` 파일을 생성하고 다음 변수들을 설정하세요:
   - DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE
   - EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD
   - OPEN_API_KEY (OpenAI API 키)
   - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

4. 개발 서버 실행:
   ```
   npm run dev
   ```

5. SSL을 사용한 개발 서버 실행:
   ```
   npm run dev:ssl
   ```

## 임베딩 및 검색 프로세스

1. 상품 제목이나 설명을 OpenAI API를 통해 벡터로 변환
2. 변환된 벡터를 Supabase 데이터베이스에 저장
3. 사용자 검색 쿼리를 동일한 방식으로 벡터화
4. Supabase의 벡터 유사도 검색 기능을 사용하여 가장 관련성 높은 상품 검색


## 라이선스

[라이선스 정보 추가]
