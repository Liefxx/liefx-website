// src/app/merch/[slug]/page.tsx
import React from 'react';
// No need to import Link here unless you are linking away from this page

// --- Interfaces based on Fourthwall API Spec for a Single Product ---
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

// Simplified Attributes - adjust if more detail needed (like color swatch)
interface VariantAttributes {
    description: string;
    color?: { name: string; swatch: string; };
    size?: { name: string; };
}

// Simplified Stock - adjust based on actual 'type' ("Limited" or "Unlimited")
interface VariantStock {
    type: string;
    inStock?: number; // Only present if type is "Limited"
}

interface ProductVariant {
    id: string; // This is the important ID for adding to cart
    name: string; // Full variant name, e.g., "My T-Shirt - Black / L"
    sku: string;
    unitPrice: Money;
    compareAtPrice?: Money;
    attributes: VariantAttributes;
    stock: VariantStock;
    images: Image[]; // Variants can have their own specific images
}

interface SingleProduct {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: Image[]; // Main product images
    variants: ProductVariant[];
    state: { type: string }; // e.g., "Available" or "SoldOut"
    access: { type: string }; // e.g., "Public", "Hidden", "Archived"
    createdAt: string;
    updatedAt: string;
}
// --- End of Interfaces ---


// --- Server-side Data Fetching Function ---
async function getProductDetails(slug: string): Promise<SingleProduct | null> {
    const storefrontToken = process.env.FOURTHWALL_STOREFRONT_TOKEN;

    if (!storefrontToken) {
        console.error(`Product Detail Error [${slug}]: FOURTHWALL_STOREFRONT_TOKEN environment variable is not set.`);
        // In production, you might want to throw an error or return a specific error object
        return null;
    }

    const apiUrl = `https://storefront-api.fourthwall.com/v1/products/${slug}?storefront_token=${storefrontToken}`;
    console.log(`Workspaceing product details from: ${apiUrl}`); // Log API URL for debugging

    try {
        const res = await fetch(apiUrl, {
             cache: 'no-store' // Fetch fresh data on each request - good for stock/price changes
             // Or consider revalidation: next: { revalidate: 60 } // Revalidate every 60 seconds
        });

        if (!res.ok) {
            // Log more details if possible
            const errorBody = await res.text();
            console.error(`Product Detail API Error [${slug}]: ${res.status} ${res.statusText}. Response: ${errorBody}`);
            return null; // Indicate failure
        }

        const productData: SingleProduct = await res.json();
        return productData;

    } catch (error: any) {
        console.error(`Product Detail Fetch Error [${slug}]:`, error);
        return null; // Indicate failure
    }
}
// --- End of Data Fetching Function ---


// --- The Page Component ---
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = params; // Extract slug from URL parameters
    const product = await getProductDetails(slug);

    // --- Handle Product Not Found or Error ---
    if (!product) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600">Product Not Found</h1>
                <p className="mt-2">Sorry, we couldn't find the product you were looking for or there was an error loading its details.</p>
                {/* Maybe add a link back to the main merch page */}
            </div>
        );
    }

     // --- Handle Non-Public Products (Optional Check) ---
     if (product.access?.type !== 'Public') {
         return (
             <div className="container mx-auto p-4 text-center">
                 <h1 className="text-2xl font-bold">Product Unavailable</h1>
                 <p className="mt-2">This product is currently not available for public viewing.</p>
             </div>
         );
     }


    // --- Render Product Details ---
    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div>
                    {product.images && product.images.length > 0 ? (
                        // Basic: Show the first image. Consider a carousel for multiple images.
                        <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-auto rounded-lg shadow-md object-cover" // Adjust styling as needed
                        />
                        // TODO: Add image thumbnails or a carousel component if needed
                    ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">No Image Available</div>
                    )}
                </div>

                {/* Details Section */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>

                     {/* Display Price Range or Selected Variant Price */}
                     {product.variants && product.variants.length > 0 && (
                        <p className="text-2xl font-semibold text-gray-800 mb-4">
                           {/* Simple: Show first variant price. Complex: Update based on selection */}
                           ${product.variants[0].unitPrice.value.toFixed(2)} {product.variants[0].unitPrice.currency}
                           {product.variants[0].compareAtPrice && (
                              <span className="text-lg text-gray-500 line-through ml-2">
                                 ${product.variants[0].compareAtPrice.value.toFixed(2)}
                              </span>
                           )}
                        </p>
                     )}

                    <div className="prose mb-6"> {/* Using prose for nice default description styling */}
                       <p>{product.description}</p>
                    </div>

                    {/* Variant Selection & Add to Cart */}
                    <div className="space-y-4">
                         {/* --- Variant Selection UI (Needs Client Component Logic) --- */}
                         {/* TODO: If multiple variants exist, add dropdowns/buttons here */}
                         {/* For now, we'll just list variants and add buttons */}

                         {product.variants && product.variants.map((variant) => (
                             <div key={variant.id} className="border border-gray-200 p-3 rounded flex justify-between items-center">
                                 <div>
                                     <p className="font-medium">{variant.attributes.description || variant.name}</p>
                                     <p className="text-sm text-gray-600">
                                         ${variant.unitPrice.value.toFixed(2)}
                                         {/* Indicate stock status */}
                                         {variant.stock?.type === 'Limited' && variant.stock.inStock !== undefined && variant.stock.inStock <= 0 && <span className="text-red-500 ml-2">(Out of Stock)</span>}
                                         {variant.stock?.type === 'Limited' && variant.stock.inStock !== undefined && variant.stock.inStock > 0 && <span className="text-green-600 ml-2">({variant.stock.inStock} left)</span>}
                                     </p>
                                 </div>
                                 {/* Placeholder Add to Cart Button per Variant */}
                                 <button
                                     // onClick handler will need client-side logic ('use client', useState, etc.)
                                     // disabled={variant.stock?.type === 'Limited' && variant.stock.inStock !== undefined && variant.stock.inStock <= 0}
                                     className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200 ${variant.stock?.type === 'Limited' && variant.stock.inStock !== undefined && variant.stock.inStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                 >
                                     Add to Cart
                                 </button>
                             </div>
                         ))}
                         {(!product.variants || product.variants.length === 0) && (
                            <p className="text-gray-500">No purchase options available.</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
}