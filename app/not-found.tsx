import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-8">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
                    404
                </h1>

                <p className="text-gray-400 text-lg">
                    Page not found
                </p>

                <Link
                    href="/"
                    className="inline-block px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                    Go to Home
                </Link>
            </div>

            <footer className="absolute bottom-8 text-gray-600 text-sm">
                © {new Date().getFullYear()} MegaObsidian
            </footer>
        </main>
    );
}
