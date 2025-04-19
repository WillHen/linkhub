import { EnvVarWarning } from '@/components/env-var-warning';
import HeaderAuth from '@/components/header-auth';
import { hasEnvVars } from '@/utils/supabase/check-env-vars';
import { Geist } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'LinksDeck',
  description: 'Sure your favorite links all in one place'
};

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin']
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={geistSans.className} suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <main className='min-h-screen flex flex-col items-center'>
            <div className='flex-1 w-full flex flex-col items-center'>
              <nav className='w-full flex justify-center border-b border-b-foreground/10 h-16'>
                <div className='w-full max-w-6xl flex justify-between items-center p-3 px-7 text-sm'>
                  <span className='text-[#121417] text-lg font-bold leading-[23px]'>
                    LinksDeck
                  </span>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </nav>
              <div className='flex self-stretch flex-1 justify-center items-start flex-row py-5 px-4'>
                {children}
                <Toaster position='top-right' reverseOrder={false} />
              </div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
