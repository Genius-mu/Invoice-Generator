import { BookCheck } from "lucide-react"

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl shadow-md">
            <BookCheck 
              size={24} 
              strokeWidth={2.5} 
              className="text-white drop-shadow-md" 
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md">
            Invoice Generator
          </h2>
        </div>
      </div>
    </header>
  )
}

export default Header