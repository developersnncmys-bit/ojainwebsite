import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="text-7xl">🍽️</div>
      <div>
        <h1 className="text-6xl font-black text-brand-green">404</h1>
        <p className="mt-3 text-xl font-bold text-gray-800">This page could not be found</p>
        <p className="mt-2 max-w-md text-gray-500">
          The page you’re looking for doesn’t exist or may have moved. Let’s get
          you back to something delicious.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-2xl bg-brand-green px-6 py-3 font-bold text-white shadow-md transition hover:bg-[#1B5E20]"
        >
          Back to Home
        </Link>
        <Link
          href="/categories"
          className="rounded-2xl border border-brand-green/30 px-6 py-3 font-bold text-brand-green transition hover:bg-brand-green-pale"
        >
          Browse Categories
        </Link>
      </div>
    </div>
  );
}
