// src/app/merch/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import Link from 'next/link';

// --- Interfaces (Ensure ProductVariant includes attributes and stock) ---
interface Money { value: number; currency: string; }
interface Image { id: string; url: string; width: number; height: number; }
// Added more specific types based on previous YAML examples
interface VariantAttributes {
    description: string; // e.g., "Black / L"
    color?: { name: string; swatch: string; };
    size?: { name: string; };
}
interface VariantStock {
    type: string; // "Limited" or "Unlimited"
    inStock?: number; // Only if type is "Limited"
}
interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    unitPrice: Money;
    compareAtPrice?: Money;
    attributes: VariantAttributes; // Use defined attributes interface
    stock: VariantStock;        // Use defined stock interface
    images: Image[];
}
interface Product { id: string; name: string; slug: string; description: string; images: Image[]; variants: ProductVariant[]; }
interface ApiResponse { results: Product[]; paging?: any; }
interface Cart { id: string; items: any[]; }
// --- End of Interfaces ---


export default function Merch() {
    // --- State Variables ---
    const [products, setProducts] = useState<Product[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cartId, setCartId] = useState<string | null>(null);
    const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null); // Store the variantId being added
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // Key: productId, Value: selectedVariantId

    // --- Environment Variable Access ---
    const storefrontToken = process.env.NEXT_PUBLIC_FOURTHWALL_STOREFRONT_TOKEN;

    // --- Effect for Initial Data Fetching & Default Variant Selection ---
    useEffect(() => {
        const storedCartId = localStorage.getItem('fourthwallCartId');
        if (storedCartId) {
            console.log("Loaded cartId from localStorage:", storedCartId);
            setCartId(storedCartId);
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            if (!storefrontToken) {
                console.error("ERROR: NEXT_PUBLIC_FOURTHWALL_STOREFRONT_TOKEN is not set.");
                setError("Configuration error: Storefront token not configured.");
                setIsLoading(false);
                return;
            }

            const collectionSlug = 'liefx';
            const apiUrl = `https://storefront-api.fourthwall.com/v1/collections/${collectionSlug}/products?storefront_token=${storefrontToken}`;

            try {
                const res = await fetch(apiUrl, { cache: 'no-store' });
                if (!res.ok) { throw new Error(`Failed to fetch products (${res.status})`); }
                const data: ApiResponse = await res.json();
                const fetchedProducts = data.results || [];
                setProducts(fetchedProducts);

                // --- Initialize selected variants ---
                const initialSelected: Record<string, string> = {};
                fetchedProducts.forEach(product => {
                    if (product.variants && product.variants.length > 0) {
                        // Default to the first variant's ID
                        initialSelected[product.id] = product.variants[0].id;
                    }
                });
                setSelectedVariants(initialSelected);
                // --- End Initialization ---

            } catch (fetchError: any) {
                console.error("Fetch error:", fetchError);
                setError(`Failed to load products: ${fetchError.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [storefrontToken]); // Dependency array


    // --- Handler for Variant Selection Change ---
    const handleVariantChange = useCallback((productId: string, variantId: string) => {
        setSelectedVariants(prev => ({
            ...prev,
            [productId]: variantId,
        }));
    }, []); // Empty dependency array, function identity is stable


    // --- Add to Cart Handler (logic remains the same, input changes) ---
    const handleAddToCart = async (variantId: string) => {
       // Check if a valid variantId was actually passed
       if (!variantId) {
           alert("Please select a variant.");
           console.error("Add to Cart Error: No variant ID provided.");
           return;
       }

       setIsAddingToCart(variantId);
       setError(null);

       if (!storefrontToken) { /* ... handle missing token ... */ alert("Error: Config missing"); setIsAddingToCart(null); return; }

       let currentCartId = cartId;

       try {
           if (!currentCartId) {
               // --- Create Cart ---
               console.log("Creating new cart...");
               const createCartApiUrl = `https://storefront-api.fourthwall.com/v1/carts?storefront_token=${storefrontToken}`;
               const createCartRes = await fetch(createCartApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [] }) });
               if (!createCartRes.ok) { /* ... handle error ... */ throw new Error('Failed to create cart'); }
               const newCart: Cart = await createCartRes.json();
               currentCartId = newCart.id;
               setCartId(currentCartId);
               localStorage.setItem('fourthwallCartId', currentCartId);
               console.log("New cart created:", currentCartId);
           }

           if (!currentCartId) { throw new Error("Cart ID missing after creation attempt."); }

           // --- Add Item ---
           console.log(`Adding variant ${variantId} to cart ${currentCartId}`);
           const addToCartApiUrl = `https://storefront-api.fourthwall.com/v1/carts/${currentCartId}/add?storefront_token=${storefrontToken}`;
           const addToCartRes = await fetch(addToCartApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ variantId: variantId, quantity: 1 }] }) });
           if (!addToCartRes.ok) { /* ... handle error ... */ const text = await addToCartRes.text(); console.error(text); throw new Error('Failed to add item'); }
           const updatedCart: Cart = await addToCartRes.json();
           console.log("Item added:", updatedCart);
           alert(`Item added to cart!`);

       } catch (err: any) { /* ... handle error ... */ console.error("handleAddToCart failed:", err); setError(err.message); alert(`Error: ${err.message}`);
       } finally {
           setIsAddingToCart(null);
       }
    };
    // --- End of Add to Cart Handler ---


    // --- Render Component ---
    if (isLoading) { /* ... loading state ... */ return <div className="container mx-auto p-4"><h1 className="text-3xl font-bold mb-4">My Merch</h1><p>Loading...</p></div>; }
    if (error) { /* ... error state ... */ return <div className="container mx-auto p-4"><h1 className="text-3xl font-bold text-red-600">Error</h1><p>{error}</p></div>; }
    if (!products || products.length === 0) { /* ... no products state ... */ return <div className="container mx-auto p-4"><h1 className="text-3xl font-bold">Merch</h1><p>None found.</p></div>; }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">My Merch</h1>
            {/* {cartId && <p className="text-xs text-gray-500 mb-4">Cart ID: {cartId}</p>} */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                    // Find the full object for the currently selected variant
                    const currentSelectedVariantId = selectedVariants[product.id];
                    const selectedVariant = product.variants?.find(v => v.id === currentSelectedVariantId);

                    // Determine if the selected variant is out of stock
                    const isSelectedOutOfStock = selectedVariant?.stock?.type === 'Limited' &&
                                                 selectedVariant?.stock?.inStock !== undefined &&
                                                 selectedVariant?.stock?.inStock <= 0;

                    return (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
                            {/* Image */}
                            {product.images && product.images.length > 0 && (
                                <div className="w-full h-48 mb-4 overflow-hidden rounded">
                                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            {/* Details */}
                            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                            <p className="text-gray-600 mb-3 text-sm flex-grow">{product.description?.substring(0, 100)}{product.description?.length > 100 ? '...' : ''}</p>

                            {/* --- Variant Selection Dropdown (if more than 1 variant) --- */}
                            {product.variants && product.variants.length > 1 && (
                                <div className="mb-3">
                                    <label htmlFor={`variant-select-${product.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                        Options:
                                    </label>
                                    <select
                                        id={`variant-select-${product.id}`}
                                        name="variant"
                                        value={currentSelectedVariantId || ''} // Controlled component
                                        onChange={(e) => handleVariantChange(product.id, e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        {product.variants.map(variant => (
                                            <option key={variant.id} value={variant.id}>
                                                {variant.attributes.description || variant.name} {/* Display variant description */}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {/* --- End Variant Selection --- */}


                            {/* --- Price (reflects selected variant) --- */}
                            {selectedVariant && (
                                <p className="font-bold text-lg mb-3">
                                    ${selectedVariant.unitPrice.value.toFixed(2)} {selectedVariant.unitPrice.currency}
                                    {selectedVariant.compareAtPrice && (
                                        <span className="text-base text-gray-500 line-through ml-2">
                                            ${selectedVariant.compareAtPrice.value.toFixed(2)}
                                        </span>
                                     )}
                                </p>
                            )}
                             {/* --- End Price --- */}

                            {/* Stock Info (optional) */}
                             {selectedVariant?.stock?.type === 'Limited' && selectedVariant?.stock?.inStock !== undefined && (
                                 <p className={`text-sm mb-3 ${isSelectedOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                                     {isSelectedOutOfStock ? 'Out of Stock' : `${selectedVariant.stock.inStock} left`}
                                 </p>
                             )}


                            {/* Buttons */}
                            <div className="mt-auto pt-3">
                                {/* View Details Button */}
                                <Link href={`/merch/${product.slug}`} passHref>
                                    <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mb-2 text-sm transition-colors duration-200">
                                        View Details
                                    </button>
                                </Link>
                                {/* Add to Cart Button (uses selected variant) */}
                                <button
                                    onClick={() => handleAddToCart(currentSelectedVariantId)} // Pass the currently selected variant ID
                                    disabled={
                                        !currentSelectedVariantId || // No variant selected
                                        isSelectedOutOfStock ||     // Selected variant is out of stock
                                        isAddingToCart === currentSelectedVariantId // Currently adding this variant
                                    }
                                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200 ${
                                        !currentSelectedVariantId || isSelectedOutOfStock || isAddingToCart === currentSelectedVariantId
                                            ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isAddingToCart === currentSelectedVariantId ? 'Adding...' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}