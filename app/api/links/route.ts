import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const listId = searchParams.get('list_id');

        if (!listId) {
            return NextResponse.json(
                { error: 'List ID is required' },
                { status: 400 }
            );
        }

        const { data: links, error } = await supabase
            .from('links')
            .select('*')
            .eq('list_id', listId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ links });
    } catch (error) {
        console.error('Error fetching links:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

interface Link {
    title: string;
    url: string;
    description?: string;
    list_id: string;
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        const { links } = await request.json();

        if (!links || !Array.isArray(links) || links.length === 0) {
            return NextResponse.json(
                { error: 'Links array is required and must not be empty' },
                { status: 400 }
            );
        }

        // Validate each link
        for (const link of links) {
            if (!link.title || !link.url || !link.list_id) {
                return NextResponse.json(
                    { error: 'Each link must have a title, URL, and list_id' },
                    { status: 400 }
                );
            }
        }

        // Insert all links with user_id
        const { data: createdLinks, error: insertError } = await supabase
            .from('links')
            .insert(
                links.map((link: Link) => ({
                    ...link,
                    user_id: user.id
                }))
            )
            .select();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ links: createdLinks });
    } catch (error) {
        console.error('Error creating links:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const linkIds = searchParams.get('ids');

        if (!linkIds) {
            return NextResponse.json(
                { error: 'Link IDs are required' },
                { status: 400 }
            );
        }

        const ids = linkIds.split(',');
        const { error } = await supabase
            .from('links')
            .delete()
            .in('id', ids);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting links:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 