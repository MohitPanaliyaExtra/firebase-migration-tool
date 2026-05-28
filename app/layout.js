import './globals.css';

export const metadata = {
  title: 'Firebase Migration Tool',
  description: 'Transfer Firestore data between Firebase projects in seconds',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
