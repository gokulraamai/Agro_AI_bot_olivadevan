export const metadata = {
  title: "AgriBot Pro — Your Agriculture Assistant",
  description: "AI Agricultural Expert for Indian Natural Farming, by Olivadevan",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌾</text></svg>" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#070D08" }}>
        {children}
      </body>
    </html>
  );
}
