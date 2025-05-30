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

// Basic XML parsing function
async function parseProductsFromXML(xml: string) {
    // Use a basic regex to extract product information
    // This is a temporary solution - we should use a proper XML parser
    const products = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gm;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const productXml = match[1];
        const title = productXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const description = productXml.match(/<description>(.*?)<\/description>/)?.[1] || '';
        const link = productXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
        const image = productXml.match(/<g:image_link>(.*?)<\/g:image_link>/)?.[1] || '';
        const price = productXml.match(/<g:price>(.*?)<\/g:price>/)?.[1] || '';
        const id = productXml.match(/<g:id>(.*?)<\/g:id>/)?.[1] || '';

        products.push({
            id,
            name: title,
            description,
            slug: link.split('/').pop() || '',
            images: [{ url: image }],
            variants: [{
                id: id,
                unitPrice: {
                    value: parseFloat(price.split(' ')[0]) || 0,
                    currency: price.split(' ')[1] || 'USD'
                }
            }]
        });
    }

    return products;
} 