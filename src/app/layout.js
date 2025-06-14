import "./globals.css";

export const metadata = {
  title: "WIRED",
  description: "WIRED",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
