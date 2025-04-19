import { createServiceClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createServiceClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (err) {
        console.error('Error getting user:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 