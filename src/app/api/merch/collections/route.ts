import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET(request: NextRequest) {
    const storefrontToken = process.env.NEXT_PUBLIC_FOURTHWALL_STOREFRONT_TOKEN;
    
    if (!storefrontToken) {
        return NextResponse.json({ error: 'Storefront token not configured' }, { status: 500 });
    }

    try {
        const shopUrl = process.env.NEXT_PUBLIC_FW_CHECKOUT;
        if (!shopUrl) {
            throw new Error('Shop URL not configured');
        }

        // Fetch both collections
        const collections = [
            { id: 'leafy-longplays', name: 'Leafy Longplays Collection' },
            { id: 'liefx', name: 'Liefx Collection' }
        ];

        const collectionsData = await Promise.all(collections.map(async (collection) => {
            try {
                // Construct the API URL for each collection
                const apiUrl = `https://storefront-api.fourthwall.com/v1/products?storefront_token=${storefrontToken}&collection=${collection.id}`;
                console.log('Fetching collection:', collection.name);
                
                const res = await fetch(apiUrl, {
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!res.ok) {
                    console.error(`Failed to fetch collection ${collection.id}:`, res.status);
                    return { id: collection.id, name: collection.name, products: [] };
                }

                const data = await res.json();
                return {
                    id: collection.id,
                    name: collection.name,
                    products: data.products || []
                };
            } catch (error) {
                console.error(`Error fetching collection ${collection.id}:`, error);
                return { id: collection.id, name: collection.name, products: [] };
            }
        }));
        
        return NextResponse.json({ collections: collectionsData });
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products', message: error.message }, 
            { status: 500 }
        );
    }
} 