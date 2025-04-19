import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Get the session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('Session error:', sessionError);
            return NextResponse.json({ error: 'Session error' }, { status: 401 });
        }

        if (!session) {
            console.error('No session found');
            return NextResponse.json({ error: 'No session found' }, { status: 401 });
        }

        // Get list_id from URL
        const { searchParams } = new URL(request.url);
        const listId = searchParams.get('id');

        if (!listId) {
            return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
        }

        // Get the specific list
        const { data: list, error: listError } = await supabase
            .from('lists')
            .select('*')
            .eq('id', listId)
            .eq('user_id', session.user.id)
            .single();

        if (listError) {
            console.error('Error fetching list:', listError);
            return NextResponse.json({ error: listError.message }, { status: 500 });
        }

        if (!list) {
            return NextResponse.json({ error: 'List not found' }, { status: 404 });
        }

        return NextResponse.json({ list });
    } catch (err) {
        console.error('Error in lists route:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Get the session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('Session error:', sessionError);
            return NextResponse.json({ error: 'Session error' }, { status: 401 });
        }

        if (!session) {
            console.error('No session found');
            return NextResponse.json({ error: 'No session found' }, { status: 401 });
        }

        const { title, description, links } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Create the list
        const { data: list, error: listError } = await supabase
            .from('lists')
            .insert({
                title,
                description,
                user_id: session.user.id
            })
            .select()
            .single();

        if (listError) {
            console.error('Error creating list:', listError);
            return NextResponse.json({ error: listError.message }, { status: 500 });
        }

        // If links are provided, create them
        if (links && links.length > 0) {
            const { error: linksError } = await supabase
                .from('links')
                .insert(
                    links.map((link: { title: string; url: string }) => ({
                        title: link.title,
                        url: link.url,
                        list_id: list.id,
                        user_id: session.user.id
                    }))
                );

            if (linksError) {
                console.error('Error creating links:', linksError);
                // Don't return error here, just log it
            }
        }

        return NextResponse.json({ list });
    } catch (err) {
        console.error('Error in lists route:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const listId = searchParams.get('id');

        if (!listId) {
            return NextResponse.json(
                { error: 'List ID is required' },
                { status: 400 }
            );
        }

        // First delete associated links
        const { error: linksError } = await supabase
            .from('links')
            .delete()
            .eq('list_id', listId);

        if (linksError) {
            return NextResponse.json(
                { error: linksError.message },
                { status: 500 }
            );
        }

        // Then delete the list
        const { error: listError } = await supabase
            .from('lists')
            .delete()
            .eq('id', listId);

        if (listError) {
            return NextResponse.json(
                { error: listError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting list:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 