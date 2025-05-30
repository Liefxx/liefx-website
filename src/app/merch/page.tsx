// src/app/merch/page.tsx
"use client"; // Required for hooks and event handlers

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// --- Interfaces (same as before) ---
interface Money { value: number; currency: string; }
interface Image { id: string; url: string; width: number; height: number; }
interface VariantAttributes { description: string; color?: { name: string; swatch: string; }; size?: { name: string; }; }
interface VariantStock { type: string; inStock?: number; }
interface ProductVariant { id: string; name: string; sku: string; unitPrice: Money; compareAtPrice?: Money; attributes: VariantAttributes; stock: VariantStock; images: Image[]; }
interface Product { id: string; name: string; slug: string; description: string; images: Image[]; variants: ProductVariant[]; }
interface ApiResponse { results: Product[]; paging?: any; }
// Basic Cart interface, assuming newCart.id is string
interface Cart { id: string; items: any[]; checkoutUrl?: string; }
// --- End of Interfaces ---


export default function Merch() {
    // --- State Variables ---
    const [products, setProducts] = useState<Product[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cartId, setCartId] = useState<string | null>(null);
    const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

    // --- Environment Variable Access ---
    const storefrontToken = process.env.NEXT_PUBLIC_FOURTHWALL_STOREFRONT_TOKEN;
    const checkoutDomain = process.env.NEXT_PUBLIC_FW_CHECKOUT;

    // --- Effect for Initial Data Fetching & Loading Cart ID ---
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
                console.error("ERROR: Storefront token not configured properly:", storefrontToken);
                setError("Configuration error: Storefront token not configured");
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/merch');
                
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("API Error:", errorText);
                    throw new Error(`Failed to fetch products (${res.status}): ${errorText}`);
                }

                const data = await res.json();
                console.log("Products fetched successfully:", data);
                
                if (!data.products) {
                    throw new Error('Invalid API response format');
                }

                setProducts(data.products);
                
                // Initialize selected variants
                const initialSelected: Record<string, string> = {};
                data.products.forEach((product: Product) => {
                    if (product.variants && product.variants.length > 0) {
                        initialSelected[product.id] = product.variants[0].id;
                    }
                });
                setSelectedVariants(initialSelected);
            } catch (fetchError: any) {
                console.error("Fetch error:", fetchError);
                setError(`Failed to load products: ${fetchError.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [storefrontToken]);

    // --- Handler for Variant Selection Change ---
    const handleVariantChange = useCallback((productId: string, variantId: string) => {
        setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
    }, []);

    // --- Add to Cart Handler (Unchanged from previous version with localStorage fix) ---
    const handleAddToCart = async (variantId: string) => {
       if (!variantId) { alert("Please select a variant."); return; }
       setIsAddingToCart(variantId);
       setError(null);
       if (!storefrontToken) { alert("Error: Config missing"); setIsAddingToCart(null); return; }
       let currentCartId = cartId;
       try {
           if (!currentCartId) {
               console.log("Creating new cart...");
               const createCartApiUrl = `https://api.fourthwall.com/api/public/v1.0/carts?storefront_token=${storefrontToken}`;
               const createCartRes = await fetch(createCartApiUrl, { 
                   method: 'POST', 
                   headers: { 
                       'Content-Type': 'application/json',
                       'Accept': 'application/json'
                   }, 
                   body: JSON.stringify({ items: [] }) 
               });
               if (!createCartRes.ok) { throw new Error('Failed to create cart'); }
               const newCart: Cart = await createCartRes.json();
               currentCartId = newCart.id;
               setCartId(currentCartId);
               if (currentCartId) { // Check if ID is valid before saving
                   localStorage.setItem('fourthwallCartId', currentCartId);
                   console.log("New cart created and ID saved:", currentCartId);
               } else { throw new Error("Invalid Cart ID received after creation."); }
           }
           if (!currentCartId) { throw new Error("Cart ID missing after creation attempt."); }
           console.log(`Adding variant ${variantId} to cart ${currentCartId}`);
           const addToCartApiUrl = `https://api.fourthwall.com/api/public/v1.0/carts/${currentCartId}/add?storefront_token=${storefrontToken}`;
           const addToCartRes = await fetch(addToCartApiUrl, { 
               method: 'POST', 
               headers: { 
                   'Content-Type': 'application/json',
                   'Accept': 'application/json'
               }, 
               body: JSON.stringify({ items: [{ variantId: variantId, quantity: 1 }] }) 
           });
           if (!addToCartRes.ok) { const text = await addToCartRes.text(); console.error(text); throw new Error('Failed to add item'); }
           const updatedCart = await addToCartRes.json();
           console.log("Item added:", updatedCart);
           alert(`Item added to cart!`);
       } catch (err: any) { console.error("handleAddToCart failed:", err); setError(err.message); alert(`Error: ${err.message}`); }
       finally { setIsAddingToCart(null); }
    };


    // --- Checkout Handler (Updated to construct URL) ---
     const handleCheckout = () => {
        setIsCheckingOut(true);
        setError(null);

        if (!cartId) {
            alert("Your cart appears to be empty.");
            console.log("Checkout skipped, no local cartId found.");
            setIsCheckingOut(false);
            return;
        }

        if (!checkoutDomain) {
             alert("Error: Checkout domain configuration missing.");
             console.error("Checkout Error: NEXT_PUBLIC_FW_CHECKOUT environment variable is not set.");
             setIsCheckingOut(false);
             return;
        }

        // Construct the checkout URL based on documentation
        const checkoutRedirectUrl = `https://${checkoutDomain}/checkout/?cartId=${cartId}`;
        // Optionally add currency if needed: = `https://${checkoutDomain}/checkout/?cartCurrency=USD&cartId=${cartId}`;

        try {
            console.log(`Redirecting to constructed checkout URL: ${checkoutRedirectUrl}`);
            // Redirect the user's browser
            window.location.href = checkoutRedirectUrl;
            // If redirect starts, the rest of the code might not execute.

        } catch (err: any) {
            // This catch block might not catch standard redirect issues
            console.error("Redirect failed unexpectedly:", err);
            alert("Could not redirect to checkout.");
            setIsCheckingOut(false); // Reset state on failure
        }
    };
    // --- End of Handlers ---


    // --- Render Component (JSX is the same as previous version) ---
    if (isLoading) { return <div className="container mx-auto p-4"><h1 className="text-3xl font-bold mb-4">My Merch</h1><p>Loading...</p></div>; }

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold">My Merch</h1>
                {cartId && ( <button onClick={handleCheckout} disabled={isCheckingOut} className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded text-sm transition-colors duration-200 ${isCheckingOut ? 'opacity-50 cursor-not-allowed' : ''}`} > {isCheckingOut ? 'Redirecting...' : 'View Cart / Checkout'} </button> )}
            </div>
            {/* Error Display */}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {/* Product Grid / No Products */}
            {(!products || products.length === 0) && !isLoading && ( <p>No products found.</p> )}
            {products && products.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {products.map((product) => {
                         const currentSelectedVariantId = selectedVariants[product.id];
                         const selectedVariant = product.variants?.find(v => v.id === currentSelectedVariantId);
                         const isSelectedOutOfStock = selectedVariant?.stock?.type === 'Limited' && selectedVariant?.stock?.inStock !== undefined && selectedVariant?.stock?.inStock <= 0;
                         return (
                             <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
                                 {/* Image */}
                                 {product.images && product.images.length > 0 && ( <div className="w-full h-48 mb-4 overflow-hidden rounded"><img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" /></div> )}
                                 {/* Details */}
                                 <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                                 <p className="text-gray-600 mb-3 text-sm flex-grow">{product.description?.substring(0, 100)}{product.description?.length > 100 ? '...' : ''}</p>
                                 {/* Variant Selection */}
                                 {product.variants && product.variants.length > 1 && ( <div className="mb-3"><label htmlFor={`variant-select-${product.id}`} className="block text-sm font-medium text-gray-700 mb-1">Options:</label><select id={`variant-select-${product.id}`} name="variant" value={currentSelectedVariantId || ''} onChange={(e) => handleVariantChange(product.id, e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">{product.variants.map(variant => ( <option key={variant.id} value={variant.id}>{variant.attributes.description || variant.name}</option> ))} </select> </div> )}
                                 {/* Price & Stock */}
                                 {selectedVariant && ( <p className="font-bold text-lg mb-1">${selectedVariant.unitPrice.value.toFixed(2)} {selectedVariant.unitPrice.currency}</p> )}
                                 {selectedVariant?.stock?.type === 'Limited' && selectedVariant?.stock?.inStock !== undefined && ( <p className={`text-sm mb-3 ${isSelectedOutOfStock ? 'text-red-500' : 'text-green-600'}`}>{isSelectedOutOfStock ? 'Out of Stock' : `${selectedVariant.stock.inStock} left`}</p> )}
                                 {/* Buttons */}
                                 <div className="mt-auto pt-3">
                                     <Link href={`/merch/${product.slug}`} passHref><button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mb-2 text-sm transition-colors duration-200">View Details</button></Link>
                                     <button onClick={() => handleAddToCart(currentSelectedVariantId)} disabled={!currentSelectedVariantId || isSelectedOutOfStock || isAddingToCart === currentSelectedVariantId} className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200 ${!currentSelectedVariantId || isSelectedOutOfStock || isAddingToCart === currentSelectedVariantId ? 'opacity-50 cursor-not-allowed' : ''}`} >{isAddingToCart === currentSelectedVariantId ? 'Adding...' : 'Add to Cart'}</button>
                                 </div>
                             </div>
                         )
                     })}
                 </div>
             )}
        </div>
    );
}