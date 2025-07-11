# Kotras6 애플리케이션 배포 가이드

## 배포 방법

### 1. Docker 컨테이너 배포 (권장)

```bash
# 1. 파일 압축 해제
tar -xzf kotras6-app.tar.gz

# 2. Docker 이미지 빌드
docker build -f Dockerfile.production -t kotras-app .

# 3. 컨테이너 실행
docker run -d \
  --name kotras-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e EXTERNAL_API_URL=http://your-api-server.com \
  --restart unless-stopped \
  kotras-app
```

### 2. Docker Compose 사용

```bash
# 1. docker-compose.yml 수정 (환경 변수 설정)
# 2. 실행
docker-compose up -d
```

## 환경 변수 설정

| 변수명               | 설명              | 예시                  |
| -------------------- | ----------------- | --------------------- |
| NODE_ENV             | 실행 환경         | production            |
| EXTERNAL_API_URL     | 외부 API 서버 URL | http://api-server.com |
| EXTERNAL_API_TIMEOUT | API 타임아웃      | 30000                 |

## 포트 설정

- **애플리케이션 포트**: 3000
- **외부 접근 포트**: 80 또는 443 (프록시 설정 필요)

## 모니터링

```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs kotras-app

# 컨테이너 재시작
docker restart kotras-app
```

## 문제 해결

1. **포트 충돌**: 다른 포트로 변경
2. **메모리 부족**: 컨테이너 리소스 제한 설정
3. **API 연결 실패**: 환경 변수 확인
