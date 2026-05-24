import Link from 'next/link';

export default function LandingPage() {
  return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-8 animate-in fade-in duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            MegaObsidian
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto">
            Manage your notes intelligently, like a second brain.
          </p>

          {/* دکمه داشبورد */}
          <div>
            <Link
                href="/dashboard"
                className="!inline-block !px-8 !py-4 !bg-white !text-black !font-semibold !rounded-full hover:!bg-gray-200 !transition-all !duration-300 !transform hover:!scale-105 active:!scale-95"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* یک فوتر ساده */}
        <footer className="absolute bottom-8 text-gray-600 text-sm">
          © {new Date().getFullYear()} MegaObsidian
        </footer>
      </main>
  );
}
