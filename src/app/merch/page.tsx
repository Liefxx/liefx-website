// src/app/merch/page.tsx
'use client'

export default function Merch() {
  return (
    <div>
      <h1>My Merch</h1>
      <iframe
        src="https://liefx-shop.fourthwall.com/"
        width="100%"
        height="600px" // Adjust height as needed
        style={{ border: 'none' }} // Remove default iframe border
      ></iframe>
    </div>
  );
}