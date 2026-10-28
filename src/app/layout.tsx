import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio — Creative Development Studio",
  description:
    "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Working with Brands and Agencies Worldwide.",
  metadataBase: new URL("http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Studio — Creative Development Studio",
    description:
      "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Working with Brands and Agencies Worldwide.",
    url: "/",
    siteName: "Studio Development",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio — Creative Development Studio",
    description:
      "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Working with Brands and Agencies Worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="stix_two_text_a3385497-module__eDuTOG__variable font-stix bg-black overflow-x-hidden select-none">
        {children}
      </body>
    </html>
  );
}
