import { NextIntlClientProvider } from 'next-intl';
import Footer from './Footer';
import messages from '../../../messages/es.json';

export default {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    // Footer usa next/navigation (usePathname/useRouter) para el selector
    // de idioma — sin esto, @storybook/nextjs-vite no monta el mock del
    // app router y useRouter() revienta con "invariant expected app
    // router to be mounted".
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/es' },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const Principal = {};
