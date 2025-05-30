import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET(request: NextRequest) {
    const storefrontToken = process.env.NEXT_PUBLIC_FOURTHWALL_STOREFRONT_TOKEN;
    
    console.log('[Merch API] Checking configuration...');
    console.log('[Merch API] Storefront token status:', storefrontToken ? 'Present' : 'Missing');

    if (!storefrontToken) {
        console.error('[Merch API] Storefront token not configured');
        return NextResponse.json({ error: 'Storefront token not configured' }, { status: 500 });
    }

    try {
        const apiUrl = `https://storefront-api.fourthwall.com/v1/products?storefront_token=${storefrontToken}`;
        console.log('[Merch API] Fetching products from:', apiUrl);
        
        const res = await fetch(apiUrl, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[Merch API] Error fetching products:', errorText);
            return NextResponse.json(
                { 
                    error: 'Failed to fetch products',
                    details: errorText,
                    url: apiUrl
                }, 
                { status: res.status }
            );
        }

        const data = await res.json();
        console.log('[Merch API] Products fetched successfully');
        
        return NextResponse.json({ products: data.results || [] });
    } catch (error: any) {
        console.error('[Merch API] Unexpected error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch products',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }, 
            { status: 500 }
        );
    }
} 