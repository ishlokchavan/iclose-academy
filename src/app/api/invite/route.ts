import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendInviteEmail } from '@/lib/email/send-invite-email';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const secret = process.env.WEBHOOK_SECRET ?? '';
    if (secret && req.headers.get('x-webhook-secret') !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { email, full_name, set_password_url } = await req.json();

        if (!email || !set_password_url) {
            return NextResponse.json({ error: 'email and set_password_url required' }, { status: 400 });
        }

        await sendInviteEmail(email, full_name ?? '', set_password_url);

        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        console.error('invite email error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to send email' },
            { status: 500 },
        );
    }
}