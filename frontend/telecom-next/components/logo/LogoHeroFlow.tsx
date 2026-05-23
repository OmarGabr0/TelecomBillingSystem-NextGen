export default function LogoHeroFlow() {
  return (
    <div className="flex items-center justify-center mb-8 animate-fade-up">
      <div className="relative">
        <svg 
          className="w-16 h-16 text-accent-blue group-hover:rotate-12 transition-transform duration-300 animate-pulse-slow" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7v-7z" className="fill-accent-blue/10" />
        </svg>
        <div className="absolute -inset-4 bg-accent-blue/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}