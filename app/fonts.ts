import { Inter, Limelight, Fraunces } from "next/font/google";

export const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const limelight = Limelight({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-limelight",
});

export const fraunces = Fraunces({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});
