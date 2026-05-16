import { Montserrat, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from "@/components/ThemeProvider"; // Pastikan path-nya bener

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'SIAP-PPKPT - Lindungi Kampus Kita',
  description: 'Layanan Pencegahan dan Penanganan Kekerasan di Perguruan Tinggi',
  icons: {
    icon: '/OIP.jpeg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning wajib ada di html tag kalau pake next-themes
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body className={`${montserrat.variable} ${inter.variable} font-inter`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}