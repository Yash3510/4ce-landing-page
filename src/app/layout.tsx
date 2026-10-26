import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shader Development Studio",
  description:
    "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Based in Sweden and Working with Brands and Agencies Worldwide.",
  metadataBase: new URL("https://www.shader.se"),
  alternates: {
    canonical: "https://www.shader.se",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Shader Development Studio",
    description:
      "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Based in Sweden and Working with Brands and Agencies Worldwide.",
    url: "https://www.shader.se",
    siteName: "Shader Development Studio",
    images: [
      {
        url: "https://images.prismic.io/shader/aXyIqgIvOtkhCHKr_og.jpg?auto=format,compress&rect=0,0,1200,630&w=2400&h=1260",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shader Development Studio",
    description:
      "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Based in Sweden and Working with Brands and Agencies Worldwide.",
    images: [
      "https://images.prismic.io/shader/aXyIqgIvOtkhCHKr_og.jpg?auto=format,compress&rect=0,0,1200,630&w=2400&h=1260",
    ],
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
      <body className="stix_two_text_a3385497-module__eDuTOG__variable font-stix bg-black overflow-hidden overscroll-none select-none">
        {children}
      </body>
    </html>
  );
}
