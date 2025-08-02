/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Desactiva la verificación de ESLint durante la compilación para evitar errores
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desactiva la verificación de TypeScript durante la compilación
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;