// src/app/merch/page.tsx
import React from 'react';

// Define the structure of a product based on the API spec (adjust if needed)
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
  compareAtPrice?: Money; // Optional
  images: Image[];
  // Add other variant fields if needed (stock, attributes, etc.)
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: Image[];
  variants: ProductVariant[];
  // Add other product fields if needed (state, access, createdAt, etc.)
}

// Define the expected structure of the API response
interface ApiResponse {
  results: Product[];
  paging?: any; // Include paging info if you plan to use it
}

// Define the props for your page component
interface MerchPageProps {
  products: Product[] | null;
  error: string | null;
}

// This function runs on the server for each request
export async function getServerSideProps(context: any) { // Use `any` or define specific context type if needed

  // Read the token from environment variables
  const storefrontToken = process.env.FOURTHWALL_STOREFRONT_TOKEN;

  // Add a check to ensure the environment variable is set
  if (!storefrontToken) {
    console.error("ERROR: FOURTHWALL_STOREFRONT_TOKEN environment variable is not set.");
    return {
      props: {
        products: null,
        error: "Configuration error: Storefront token not found. Check environment variables.",
      },
    };
  }

  // Set the actual collection slug
  const collectionSlug = 'liefx';

  const apiUrl = `https://storefront-api.fourthwall.com/v1/collections/${collectionSlug}/products?storefront_token=${storefrontToken}`;

  try {
    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errorText = await res.text(); // Get more details on the error if possible
      console.error(`API Error: ${res.status} ${res.statusText}. Response: ${errorText} (URL: ${apiUrl})`); // Log URL too
      return {
        props: {
          products: null,
          error: `Failed to fetch products (${res.status}). Check collection slug ('${collectionSlug}') and API token validity.`,
        },
      };
    }

    const data: ApiResponse = await res.json();
    const products = data.results || []; // Ensure products is always an array

    return {
      props: {
        products,
        error: null,
      },
    };
  } catch (error: any) { // Catch specific error types if needed
    console.error('Network or fetch error:', error);
    return {
      props: {
        products: null,
        error: `Failed to connect to the API: ${error.message || 'Unknown error'}`,
      },
    };
  }
}

// Your page component
export default function Merch({ products, error }: MerchPageProps) {

  // Handle Error State
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Error Loading Merch</h1>
        <p>{error}</p>
        <p className="mt-4">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  // Handle Loading or No Products State (getServerSideProps means usually error if null)
  if (!products) {
     // This state might be reached if getServerSideProps returns null products without an error prop,
     // though the current logic tries to always return an error string in case of issues.
     return (
       <div className="container mx-auto p-4">
         <h1 className="text-3xl font-bold mb-4">My Merch</h1>
         <p>Could not load products. Please check the server configuration or API status.</p>
       </div>
     );
  }

  // Handle No Products Found State
  if (products.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">My Merch</h1>
        <p>No products found in the '{'liefx'}' collection. Check back later!</p>
      </div>
    );
  }

  // Display Products
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Merch</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200"> {/* Added shadow */}
            {product.images && product.images.length > 0 && (
              <div className="w-full h-48 mb-4 overflow-hidden rounded"> {/* Container for image */}
                 <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover" // Ensure image covers the area
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
             {/* Buttons for future functionality */}
            <div className="mt-auto pt-3"> {/* Push buttons to bottom */}
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