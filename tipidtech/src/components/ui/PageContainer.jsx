// ui/PageContainer.jsx
// Wraps each page's content with consistent horizontal padding and a
// max-width cap. Use this instead of ad-hoc padding divs on screens.
//
// Usage:
//   <PageContainer>…page content…</PageContainer>

export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
