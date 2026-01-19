import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Cache & Memory Hierarchy Simulator',
    description: 'Interactive simulator for cache memory behavior and memory hierarchy in embedded systems',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}