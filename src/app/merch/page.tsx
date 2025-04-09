// src/app/merch/page.tsx
"use client"; // Required for hooks and event handlers

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// --- Interfaces ---
interface Money { value: number; currency: string; }
interface Image { id: string; url: string; width: number; height: number; }
interface VariantAttributes { description: string; color?: { name: string; swatch: string; }; size?: { name: string; }; }
interface VariantStock { type: string; inStock?: number; }
interface ProductVariant { id: string; name: string; sku: string; unitPrice: Money; compareAtPrice?: Money; attributes: VariantAttributes; stock: VariantStock; images: Image[]; }
interface Product { id: string; name: string; slug: string; description: string; images: Image[]; variants: ProductVariant[]; }
interface ApiResponse { results: Product[]; paging?: any; }
interface Cart { id: string; items: any[]; checkoutUrl?: string; /* Add other cart details if needed */ } // Assuming checkoutUrl exists
// --- End of Interfaces ---


export default function Merch() {
    // --- State Variables ---
    const [products, setProducts] = useState<Product[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // For initial product load
    const [cartId, setCartId] = useState<string | null>(null); // Store the active cart ID
    const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null); // Store the variantId being added
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // Key: productId, Value: selectedVariantId
    const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false); // For checkout button loading state

    // --- Environment Variable Access ---
    const storefrontToken = process.env.NEXT_PUBLIC_FOURTHWALL_STOREFRONT_TOKEN;

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

                const initialSelected: Record<string, string> = {};
                fetchedProducts.forEach(product => {
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


    // --- Add to Cart Handler ---
    const handleAddToCart = async (variantId: string) => {
       if (!variantId) { alert("Please select a variant."); return; }
       setIsAddingToCart(variantId);
       setError(null);
       if (!storefrontToken) { alert("Error: Config missing"); setIsAddingToCart(null); return; }
       let currentCartId = cartId;
       try {
           if (!currentCartId) {
               console.log("Creating new cart...");
               const createCartApiUrl = `https://storefront-api.fourthwall.com/v1/carts?storefront_token=${storefrontToken}`;
               const createCartRes = await fetch(createCartApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [] }) });
               if (!createCartRes.ok) { throw new Error('Failed to create cart'); }
               const newCart: Cart = await createCartRes.json();
               currentCartId = newCart.id;
               setCartId(currentCartId);
               localStorage.setItem('fourthwallCartId', currentCartId);
               console.log("New cart created:", currentCartId);
           }
           if (!currentCartId) { throw new Error("Cart ID missing after creation attempt."); }
           console.log(`Adding variant ${variantId} to cart ${currentCartId}`);
           const addToCartApiUrl = `https://storefront-api.fourthwall.com/v1/carts/${currentCartId}/add?storefront_token=${storefrontToken}`;
           const addToCartRes = await fetch(addToCartApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ variantId: variantId, quantity: 1 }] }) });
           if (!addToCartRes.ok) { const text = await addToCartRes.text(); console.error(text); throw new Error('Failed to add item'); }
           const updatedCart: Cart = await addToCartRes.json();
           console.log("Item added:", updatedCart);
           alert(`Item added to cart!`);
       } catch (err: any) { console.error("handleAddToCart failed:", err); setError(err.message); alert(`Error: ${err.message}`); }
       finally { setIsAddingToCart(null); }
    };


    // --- Checkout Handler ---
     const handleCheckout = async () => {
        setIsCheckingOut(true);
        setError(null);
        if (!cartId) { alert("Your cart is empty."); setIsCheckingOut(false); return; }
        if (!storefrontToken) { alert("Error: Config missing."); setIsCheckingOut(false); return; }
        console.log(`Workspaceing cart details for checkout: Cart ID ${cartId}`);
        const getCartApiUrl = `https://storefront-api.fourthwall.com/v1/carts/${cartId}?storefront_token=${storefrontToken}`;
        try {
            const res = await fetch(getCartApiUrl);
            if (!res.ok) { throw new Error(`Failed to fetch cart details (${res.status})`); }
            const cartData: Cart = await res.json();

            // *** VERIFY THIS FIELD NAME in Fourthwall Docs ***
            const checkoutUrl = cartData.checkoutUrl;

            if (checkoutUrl && typeof checkoutUrl === 'string') {
                console.log("Redirecting to checkout:", checkoutUrl);
                window.location.href = checkoutUrl; // Redirect to Fourthwall
            } else { throw new Error("Could not find checkout URL."); }
        } catch (err: any) {
            console.error("handleCheckout failed:", err);
            setError(`Checkout Error: ${err.message}`);
            alert(`Checkout Error: ${err.message}`);
            setIsCheckingOut(false); // Only reset if redirect doesn't happen
        }
    };
    // --- End of Handlers ---


    // --- Render Component ---
    if (isLoading) { return <div className="container mx-auto p-4"><h1 className="text-3xl font-bold mb-4">My Merch</h1><p>Loading...</p></div>; }

    // Use a more prominent error display if needed
    // if (error) { return <div className="container mx-auto p-4"><h1 className="text-3xl font-bold text-red-600">Error</h1><p>{error}</p></div>; }

    return (
        <div className="container mx-auto p-4">
            {/* Header with Title and Checkout Button */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold">My Merch</h1>
                {cartId && (
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut || !cartId}
                        className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded text-sm transition-colors duration-200 ${isCheckingOut || !cartId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                )}
            </div>

             {/* Display Error Messages */}
             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            {/* Product Grid or No Products Message */}
            {(!products || products.length === 0) && !isLoading && (
                 <p>No products found in this collection.</p>
            )}
            {products && products.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {products.map((product) => {
                         const currentSelectedVariantId = selectedVariants[product.id];
                         const selectedVariant = product.variants?.find(v => v.id === currentSelectedVariantId);
                         const isSelectedOutOfStock = selectedVariant?.stock?.type === 'Limited' && selectedVariant?.stock?.inStock !== undefined && selectedVariant?.stock?.inStock <= 0;

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

                                 {/* Variant Selection */}
                                 {product.variants && product.variants.length > 1 && (
                                     <div className="mb-3">
                                         <label htmlFor={`variant-select-${product.id}`} className="block text-sm font-medium text-gray-700 mb-1">Options:</label>
                                         <select id={`variant-select-${product.id}`} name="variant" value={currentSelectedVariantId || ''} onChange={(e) => handleVariantChange(product.id, e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                             {product.variants.map(variant => ( <option key={variant.id} value={variant.id}>{variant.attributes.description || variant.name}</option> ))}
                                         </select>
                                     </div>
                                 )}

                                 {/* Price & Stock */}
                                 {selectedVariant && ( <p className="font-bold text-lg mb-1">${selectedVariant.unitPrice.value.toFixed(2)} {selectedVariant.unitPrice.currency}</p> )}
                                 {selectedVariant?.stock?.type === 'Limited' && selectedVariant?.stock?.inStock !== undefined && (
                                     <p className={`text-sm mb-3 ${isSelectedOutOfStock ? 'text-red-500' : 'text-green-600'}`}>{isSelectedOutOfStock ? 'Out of Stock' : `${selectedVariant.stock.inStock} left`}</p>
                                 )}

                                 {/* Buttons */}
                                 <div className="mt-auto pt-3">
                                     <Link href={`/merch/${product.slug}`} passHref>
                                         <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mb-2 text-sm transition-colors duration-200">View Details</button>
                                     </Link>
                                     <button
                                         onClick={() => handleAddToCart(currentSelectedVariantId)}
                                         disabled={!currentSelectedVariantId || isSelectedOutOfStock || isAddingToCart === currentSelectedVariantId}
                                         className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200 ${!currentSelectedVariantId || isSelectedOutOfStock || isAddingToCart === currentSelectedVariantId ? 'opacity-50 cursor-not-allowed' : ''}`} >
                                         {isAddingToCart === currentSelectedVariantId ? 'Adding...' : 'Add to Cart'}
                                     </button>
                                 </div>
                             </div>
                         )
                     })}
                 </div>
             )}
        </div>
    );
}