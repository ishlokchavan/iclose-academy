'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function ResetPasswordPage() {
    const [ready, setReady] = useState(false);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Hash fragment is only available in the browser
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
            supabase.auth
                .setSession({ access_token: accessToken, refresh_token: refreshToken })
                .then(({ error }) => {
                    if (error) setError(error.message);
                    else setReady(true);
                });
        } else {
            setError('Invalid or expired link. Please request a new invite.');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError('Password must contain at least one uppercase letter.');
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError('Password must contain at least one number.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Set your password</h1>

                {!ready && !error && (
                    <p style={styles.muted}>Verifying your link…</p>
                )}

                {error && (
                    <div style={styles.errorBox}>
                        <p style={styles.errorText}>{error}</p>
                    </div>
                )}

                {success && (
                    <div style={styles.successBox}>
                        <p style={styles.successTitle}>Password set!</p>
                        <p style={styles.muted}>
                            Open the <strong>iClose Academy</strong> app and sign in with your
                            email and new password.
                        </p>
                    </div>
                )}

                {ready && !success && (
                    <form onSubmit={handleSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 8 chars, one uppercase, one number"
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Confirm Password</label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Repeat password"
                                style={styles.input}
                                required
                            />
                        </div>
                        <button type="submit" style={styles.button} disabled={loading}>
                            {loading ? 'Saving…' : 'Set Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f7',
        padding: '24px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1d1d1f',
        marginBottom: '24px',
    },
    field: { marginBottom: '16px' },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#1d1d1f',
        marginBottom: '6px',
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1.5px solid #d2d2d7',
        fontSize: '16px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#0071e3',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        marginTop: '8px',
    },
    errorBox: {
        backgroundColor: '#fff0f0',
        border: '1px solid #ffc0c0',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
    },
    errorText: { color: '#c00', fontSize: '14px', margin: 0 },
    successBox: {
        backgroundColor: '#f0fff4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '16px',
    },
    successTitle: {
        color: '#16a34a',
        fontWeight: '600',
        fontSize: '18px',
        marginBottom: '8px',
    },
    muted: { color: '#6e6e73', fontSize: '14px', margin: 0 },
};