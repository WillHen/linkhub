import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface Link {
    title: string;
    url: string;
    description?: string;
    id?: string;
}

export async function GET(
    request: Request,
    { params }: { params: { list_id: string } }
) {
    try {
        const supabase = await createClient();
        const { list_id } = await params;


        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // If list_id is present, get that specific list
        if (list_id) {
            const { data: list, error: listError } = await supabase
                .from('lists')
                .select('*')
                .eq('id', list_id)
                .eq('user_id', user.id)
                .single();


            if (listError) {
                return NextResponse.json({ error: listError.message }, { status: 500 });
            }

            if (!list) {
                return NextResponse.json({ error: 'List not found' }, { status: 404 });
            }

            return NextResponse.json({ list });
        }

        // If no list_id, get all lists for the user
        const { data: lists, error: listsError } = await supabase
            .from('lists')
            .select('*')
            .eq('user_id', user.id);

        if (listsError) {
            return NextResponse.json({ error: listsError.message }, { status: 500 });
        }

        return NextResponse.json({ lists });
    } catch (error) {
        console.error('Error fetching lists:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { list_id: string } }
) {
    try {
        const supabase = await createClient();
        const { list_id } = await params;

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, links } = await request.json();

        // Update the list
        const { error: listError } = await supabase
            .from('lists')
            .update({ title, description })
            .eq('id', list_id);

        if (listError) {
            return NextResponse.json({ error: listError.message }, { status: 500 });
        }


        // Insert new links if any
        if (links && links.length > 0) {
            // Split links into new and existing
            const newLinks = links.filter((link: Link) => !link.id);
            const existingLinks = links.filter((link: Link) => link.id);

            // Insert new links
            if (newLinks.length > 0) {
                const { error: insertError } = await supabase
                    .from('links')
                    .insert(newLinks.map((link: Link) => ({
                        ...link,
                        list_id: list_id,
                        user_id: user.id
                    })));

                if (insertError) {
                    return NextResponse.json({ error: insertError.message }, { status: 500 });
                }
            }

            // Update existing links
            if (existingLinks.length > 0) {
                const { error: updateError } = await supabase
                    .from('links')
                    .upsert(existingLinks.map((link: Link) => ({
                        ...link,
                        list_id: list_id,
                        user_id: user.id
                    })), {
                        onConflict: 'id'
                    });

                if (updateError) {
                    return NextResponse.json({ error: updateError.message }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating list:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { list_id: string } }
) {
    try {
        const supabase = await createClient();
        const { list_id } = await params;

        // Delete associated links first
        const { error: linksError } = await supabase
            .from('links')
            .delete()
            .eq('list_id', list_id);

        if (linksError) {
            return NextResponse.json({ error: linksError.message }, { status: 500 });
        }

        // Then delete the list
        const { error: listError } = await supabase
            .from('lists')
            .delete()
            .eq('id', list_id);

        if (listError) {
            return NextResponse.json({ error: listError.message }, { status: 500 });
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
