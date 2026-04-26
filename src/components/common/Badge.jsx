export default function Badge({ children, variant = 'green', className = '' }) {
  const variants = {
    green: 'bg-goen-green-100 text-goen-green-800',
    gold: 'bg-goen-gold-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-stone-100 text-stone-600',
    red: 'bg-red-100 text-red-700',
    depth1: 'bg-goen-green-700 text-white',
    depth2: 'bg-goen-green-500 text-white',
    depth3: 'bg-goen-green-300 text-goen-green-900',
    depth4: 'bg-blue-600 text-white',
    depth5: 'bg-blue-400 text-white',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.green} ${className}`}>
      {children}
    </span>
  )
}
