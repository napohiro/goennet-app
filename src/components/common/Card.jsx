export default function Card({ children, className = '', onClick }) {
  const interactive = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-stone-100 p-4 ${interactive} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
