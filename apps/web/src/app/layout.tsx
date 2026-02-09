import "@/styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="no-scrollbar">
            <body>
                {children}
            </body>
        </html>
    );
}