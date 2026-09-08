import { NextIntlClientProvider } from 'next-intl';
import SectionClientsReview from './SectionClientsReview';
import messages from '../../../messages/es.json';

export default {
  title: 'Layout/SectionClientsReview',
  component: SectionClientsReview,
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const Principal = {};
