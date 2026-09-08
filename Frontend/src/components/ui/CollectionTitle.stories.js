import { NextIntlClientProvider } from 'next-intl';
import CollectionTitle from './CollectionTitle';
import messages from '../../../messages/es.json';

export default {
  title: 'UI/CollectionTitle',
  component: CollectionTitle,
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const Principal = {
  args: {
    labelKey: 'collectionTitle.edicionMujer.label',
    titleKey: 'collectionTitle.edicionMujer.title',
    descriptionKey: 'collectionTitle.edicionMujer.description',
  },
};

export const SinDescripcion = {
  args: {
    labelKey: 'collectionTitle.edicionMujer.label',
    titleKey: 'collectionTitle.edicionMujer.title',
  },
};

