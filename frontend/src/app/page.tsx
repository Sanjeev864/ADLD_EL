'use client';

import React from 'react';
import Simulator from '@/components/Simulator';

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
            <Simulator />
        </main>
    );
}