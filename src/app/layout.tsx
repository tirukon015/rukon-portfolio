import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/content/site";
import {
  BASE_URL,
  graph,
  openGraphFor,
  personSchema,
  twitterFor,
  websiteSchema,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = `${site.name}, ${site.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: siteTitle,
    // Every other route supplies only its own name; this appends the rest.
    template: `%s | ${site.name}`,
  },
  description: site.statement,
  alternates: { canonical: "/" },
  authors: [{ name: site.name, url: BASE_URL }],
  creator: site.name,
  openGraph: {
    ...openGraphFor({ title: site.role, description: site.statement, url: "/" }),
    // The homepage titles itself fully rather than using the "X | Name" form.
    title: siteTitle,
  },
  twitter: twitterFor(siteTitle, site.statement),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-MY"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <JsonLd data={graph(personSchema(), websiteSchema())} />
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
