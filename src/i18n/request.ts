import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

// Static imports for edge runtime compatibility
import enMessages from '../../messages/en.json';
import ptMessages from '../../messages/pt.json';
import esMessages from '../../messages/es.json';
import frMessages from '../../messages/fr.json';

const messages = {
  en: enMessages,
  pt: ptMessages,
  es: esMessages,
  fr: frMessages
};
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: messages[locale as keyof typeof messages]
  };
});
