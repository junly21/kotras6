# NetworkMap 하이라이트 시스템

## 개요

NetworkMap은 SVG 기반의 지하철 노선도를 표시하며, 다양한 하이라이트 기능을 제공합니다.

## 파일 구조

```
NetworkMap/
├── NetworkMap.tsx          # 메인 컴포넌트 (150줄)
├── highlightUtils.ts       # 하이라이트 로직 (80줄)
├── svgRenderer.tsx         # SVG 렌더링 로직 (200줄)
├── utils.ts               # SVG 파싱 유틸리티
├── DefaultTooltips.tsx    # 기본 툴팁 컴포넌트
└── README.md              # 이 문서
```

## 하이라이트 원리

### 1. SVG 구조

- SVG 내에는 `<path>` 태그만 존재
- **역(Station)**: `id`가 숫자만 (예: `"123"`)
- **간선(Link)**: `id`가 "숫자-숫자" (예: `"123-456"`)

### 2. 하이라이트 타입

#### Line 모드 (노선별 하이라이트)

```typescript
{
  type: "line",
  value: "1호선" // 노선명
}
```

- 해당 노선의 모든 역과 간선을 하이라이트
- 다른 노선은 opacity 0.2로 흐리게 표시

#### Path 모드 (경로별 하이라이트)

```typescript
{
  type: "path",
  value: ["123", "456", "789"] // 역 ID 배열
}
```

- 선택된 역들만 하이라이트
- 연속된 역들 사이의 간선도 함께 하이라이트
- 나머지 요소들은 opacity 0.1로 흐리게 표시

#### Nodes 모드 (개별 역 하이라이트)

```typescript
{
  type: "nodes",
  value: ["123", "456"] // 역 ID 배열
}
```

- 선택된 역들만 하이라이트
- 간선은 하이라이트하지 않음
- 나머지 요소들은 opacity 0.1로 흐리게 표시

### 3. 하이라이트 처리 과정

1. **상태 계산** (`highlightUtils.ts`)

   ```typescript
   const highlightState = calculateHighlightState(highlights, nodes, links);
   ```

2. **Opacity 계산** (`highlightUtils.ts`)

   ```typescript
   const opacity = calculateOpacity(id, highlightState, isNode, line);
   ```

3. **SVG 렌더링** (`svgRenderer.tsx`)
   - path 태그의 id 패턴에 따라 역/간선 구분
   - 계산된 opacity 적용
   - 툴팁 및 클릭 이벤트 처리

## 사용 예시

### 노선별 하이라이트

```typescript
<NetworkMap
  nodes={nodes}
  links={links}
  svgText={svgText}
  highlights={[{ type: "line", value: "1호선" }]}
/>
```

### 경로별 하이라이트

```typescript
<NetworkMap
  nodes={nodes}
  links={links}
  svgText={svgText}
  highlights={[
    {
      type: "path",
      value: ["226", "227", "228", "229"],
    },
  ]}
/>
```

## 성능 최적화

- `useMemo`를 사용하여 하이라이트 상태 메모이제이션
- 불필요한 리렌더링 방지
- 파일 분리로 코드 가독성 및 유지보수성 향상
