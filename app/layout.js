export const metadata = {
    title: 'Planificador de Meriendas',
    description: 'App para planificar meriendas para tus hijas',
};

export default function RootLayout({ children }) {
    return (
          <html lang="es">
            <body>{children}</body>
      </html>
    );
}
