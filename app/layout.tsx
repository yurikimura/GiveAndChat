import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Give & Chat — 考え直すための対話ガイド",
  description: "Adam Grant氏の研究・著作を手がかりに、気持ちを整理し、次の小さな一歩を見つける対話ガイド。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
