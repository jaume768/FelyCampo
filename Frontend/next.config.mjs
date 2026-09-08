import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `standalone` empaqueta en .next/standalone un servidor Node mínimo con solo las
  // dependencias que se usan de verdad. Es lo que copia el target `prod` del Dockerfile:
  // sin esto, esa imagen no arranca (no existe server.js) y habría que meter
  // node_modules entero, que son cientos de MB.
  output: 'standalone',
};

export default withNextIntl(nextConfig);
