export default function LogoHeaderNodes() {
  return (
    <div className="flex items-center gap-2 group focus:outline-none">
      <svg 
        className="w-7 h-7 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-300" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M13 3L5 13h7l-1 8 8-10h-7l1-8z" className="fill-indigo-600/10" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Teleco<span className="text-indigo-600 dark:text-indigo-400">Smart</span>
      </span>
    </div>
  );
}