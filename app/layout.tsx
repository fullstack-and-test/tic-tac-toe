import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pixel-Art Tic-Tac-Toe',
  description:
    'Modern pixel-art tic-tac-toe website. Play offline with smooth animations and responsive design.',
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
