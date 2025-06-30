import Link from "next/link";
export default function Home() {
  return (
    <div>
      <h1>메인 페이지</h1>
      <Link href="/test-grid">테스트 그리드로 이동</Link>
    </div>
  );
}
