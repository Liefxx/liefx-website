// src/app/merch/page.tsx
import Link from 'next/link';

export default function Merch() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Merch</h1>
      <p className="mb-4">Check out my official merch on Fourthwall!</p>
      <Link
        href="https://liefx-shop.fourthwall.com/"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit My Shop
      </Link>
      <p className="mt-4 text-sm text-gray-500">
          (This will open in a new tab)
      </p>
    </div>
  );
}