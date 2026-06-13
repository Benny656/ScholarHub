import type { Metadata } from "next";

// Add or update the metadata export to include this icons block
export const metadata: Metadata = {
  title: "ScholarHub",
  description: "AI-Powered Education and Collaboration Platform",
  icons: {
    apple: "/apple-icon.png", // Maps the iPhone icon from your public folder
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B1020] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
