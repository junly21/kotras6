interface PagePlaceholderProps {
  title: string;
  description?: string;
}

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        <div className="bg-gray-100 rounded-lg p-8 w-full max-w-md">
          <div className="text-gray-500 text-sm">
            이 페이지는 개발 중입니다.
          </div>
        </div>
      </div>
    </div>
  );
}
