// src/app/merch/page.tsx
"use client"; // Required for hooks and event handlers

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
interface Collection {
    id: string;
    name: string;
    products: Product[];
}
// --- End of Interfaces ---


export default function Merch() {
    // --- State Variables ---
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cartId, setCartId] = useState<string | null>(null);
    const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
    const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});

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
                console.log("Collections fetched successfully:", data);
                
                if (!data.collections) {
                    throw new Error('Invalid API response format');
                }

                setCollections(data.collections);
                
                // Initialize selected variants
                const initialSelected: Record<string, string> = {};
                data.collections.forEach((collection: Collection) => {
                    collection.products.forEach((product: Product) => {
                        if (product.variants && product.variants.length > 0) {
                            initialSelected[product.id] = product.variants[0].id;
                        }
                    });
                });
                setSelectedVariants(initialSelected);

                // Initialize expanded state for each collection
                const initialExpandedState: Record<string, boolean> = {};
                data.collections.forEach((collection: Collection) => {
                    initialExpandedState[collection.id] = false;
                });
                setExpandedCollections(initialExpandedState);
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
               const createCartApiUrl = `https://storefront-api.fourthwall.com/v1/carts?storefront_token=${storefrontToken}`;
               const createCartRes = await fetch(createCartApiUrl, { 
                   method: 'POST', 
                   headers: { 'Content-Type': 'application/json' }, 
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
           const addToCartApiUrl = `https://storefront-api.fourthwall.com/v1/carts/${currentCartId}/add?storefront_token=${storefrontToken}`;
           const addToCartRes = await fetch(addToCartApiUrl, { 
               method: 'POST', 
               headers: { 'Content-Type': 'application/json' }, 
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

    const toggleCollection = (collectionId: string) => {
        setExpandedCollections(prev => ({
            ...prev,
            [collectionId]: !prev[collectionId]
        }));
    };

    // --- Render Component (JSX is the same as previous version) ---
    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Merch Store</h1>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Merch Store</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Merch Store</h1>

            {collections.map((collection, index) => (
                <div key={collection.id} className={`mb-12 ${index > 0 ? 'border-t pt-12' : ''}`}>
                    <h2 className="text-2xl font-bold mb-6">{collection.name}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {(expandedCollections[collection.id] ? collection.products : collection.products.slice(0, 10)).map((product) => {
                            const currentSelectedVariantId = selectedVariants[product.id];
                            const selectedVariant = product.variants?.find(v => v.id === currentSelectedVariantId);
                            const isSelectedOutOfStock = selectedVariant?.stock?.type === 'Limited' && selectedVariant?.stock?.inStock !== undefined && selectedVariant?.stock?.inStock <= 0;
                            return (
                                <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
                                    <div className="relative h-64">
                                        {product.images && product.images[0] ? (
                                            <Image
                                                src={product.images[0].url}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center bg-gray-100">
                                                <span className="text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                                        {product.variants && product.variants[0] && (
                                            <p className="text-gray-600 mb-4">
                                                ${product.variants[0].unitPrice.value.toFixed(2)} {product.variants[0].unitPrice.currency}
                                            </p>
                                        )}
                                        <Link href={`/merch/${product.slug}`}>
                                            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {collection.products.length > 10 && (
                        <div className="text-center mt-8">
                            <button
                                onClick={() => toggleCollection(collection.id)}
                                className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                            >
                                {expandedCollections[collection.id] ? 'Show Less' : `Show More ${collection.name} Items`}
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}