import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET(request: NextRequest) {
    const storefrontToken = process.env.NEXT_PUBLIC_FOURTHWALL_STOREFRONT_TOKEN;
    
    if (!storefrontToken) {
        return NextResponse.json({ error: 'Storefront token not configured' }, { status: 500 });
    }

    try {
        const apiUrl = `https://shop.fourthwall.com/api/v1/shop/products?storefront_token=${storefrontToken}`;
        
        const res = await fetch(apiUrl, {
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch products' }, 
            { status: 500 }
        );
    }
} 