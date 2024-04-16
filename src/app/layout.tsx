import React from 'react'
import NavBar from './NavBar';

export default function RootLayout ({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang= "en">
            <body>
                <NavBar />
                <main>{children}</main>    
            </body>
        </html>
    )
}



