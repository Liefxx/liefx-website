// src/app/merch/page.tsx
import React from 'react';

// --- Keep the same Interfaces (Money, Image, ProductVariant, Product, ApiResponse) ---
interface Money {
    value: number;
    currency: string;
}

interface Image {
    id: string;
    url: string;
    width: number;
    height: number;
}

interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    unitPrice: Money;
    compareAtPrice?: Money;
    images: Image[];
    // Add other variant fields if needed
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: Image[];
    variants: ProductVariant[];
    // Add other product fields if needed
}

interface ApiResponse {
    results: Product[];
    paging?: any;
}
// --- End of Interfaces ---


// Make the Page component async to fetch data directly
export default async function Merch() {

    let products: Product[] | null = null;
    let error: string | null = null;

    // --- Data fetching logic moved inside the component ---
    const storefrontToken = process.env.FOURTHWALL_STOREFRONT_TOKEN;
    const collectionSlug = 'liefx'; // Your collection slug

    if (!storefrontToken) {
        console.error("ERROR: FOURTHWALL_STOREFRONT_TOKEN environment variable is not set.");
        error = "Configuration error: Storefront token not found. Check environment variables.";
    } else {
        const apiUrl = `https://storefront-api.fourthwall.com/v1/collections/${collectionSlug}/products?storefront_token=${storefrontToken}`;

        try {
            const res = await fetch(
                apiUrl,
                { cache: 'no-store' } // Use this to ensure fresh data on each request, like getServerSideProps
                // Or use { next: { revalidate: 60 } } for Incremental Static Regeneration (ISR) - data refreshes every 60 seconds
            );

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`API Error: ${res.status} ${res.statusText}. Response: ${errorText} (URL: ${apiUrl})`);
                error = `Failed to fetch products (${res.status}). Check collection slug ('${collectionSlug}') and API token validity.`;
            } else {
                const data: ApiResponse = await res.json();
                products = data.results || []; // Assign fetched products
            }
        } catch (fetchError: any) {
            console.error('Network or fetch error:', fetchError);
            error = `Failed to connect to the API: ${fetchError.message || 'Unknown error'}`;
        }
    }
    // --- End of data fetching logic ---


    // --- Rendering logic remains similar, using local variables 'products' and 'error' ---
    if (error) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4 text-red-600">Error Loading Merch</h1>
                <p>{error}</p>
                <p className="mt-4">Please try refreshing the page or contact support if the problem persists.</p>
            </div>
        );
    }

    if (!products) {
         // This state could occur if the token wasn't set, or fetch failed before assigning
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">My Merch</h1>
                <p>Could not load products. Please check the server configuration or API status.</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">My Merch</h1>
                <p>No products found in the '{collectionSlug}' collection. Check back later!</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">My Merch</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
                        {product.images && product.images.length > 0 && (
                            <div className="w-full h-48 mb-4 overflow-hidden rounded">
                                <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                        <p className="text-gray-600 mb-3 text-sm flex-grow">{product.description?.substring(0, 100)}{product.description?.length > 100 ? '...' : ''}</p>
                        {product.variants && product.variants.length > 0 && (
                            <p className="font-bold text-lg mb-3">
                                ${product.variants[0].unitPrice.value.toFixed(2)} {product.variants[0].unitPrice.currency}
                            </p>
                        )}
                        <div className="mt-auto pt-3">
                            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mb-2 text-sm transition-colors duration-200">
                                View Details
                            </button>
                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200">
                                Add to Cart {/* Needs cart API integration */}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}