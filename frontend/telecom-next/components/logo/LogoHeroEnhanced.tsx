export default function LogoHeroEnhanced() {
  return (
    <div className="flex items-center justify-center mb-8 animate-fade-up">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute -inset-4 bg-accent-blue/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        
        {/* Two spark icons rotating in opposite directions */}
        <div className="relative w-24 h-24">
          <svg 
            className="w-full h-full text-accent-blue group-hover:rotate-12 transition-transform duration-700 animate-spin-slow" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7v-7z" className="fill-accent-blue/10" />
          </svg>
          <svg 
            className="w-full h-full text-indigo-600 group-hover:rotate-12 transition-transform duration-700 animate-spin-slow-reverse" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7v-7z" className="fill-indigo-600/10" />
          </svg>
        </div>

        {/* Text */}
        <div className="absolute -bottom-12 left-0 right-0 flex items-center justify-center">
          <span className="text-2xl font-bold tracking-tight text-white">
            Teleco<span className="text-accent-blue">Smart</span>
          </span>
        </div>
      </div>
    </div>
  );
}