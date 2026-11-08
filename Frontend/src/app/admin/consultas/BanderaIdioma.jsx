// BanderaIdioma.jsx
//
// Bandera del idioma desde el que se envió el formulario (locale): España
// para "es", Reino Unido para "en". En SVG y no con emojis de bandera,
// porque Windows no los dibuja (salen las letras "ES"/"GB"). El nombre
// del idioma va en title/aria-label para quien pase el ratón o use lector.

import { nombreIdioma } from './citasFormato';

function Espana() {
  return (
    <>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </>
  );
}

function ReinoUnido() {
  return (
    <>
      <clipPath id="bandera-gb">
        <rect width="30" height="20" />
      </clipPath>
      <g clipPath="url(#bandera-gb)">
        <rect width="30" height="20" fill="#012169" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.5" />
        <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6" />
        <path d="M15 0V20M0 10H30" stroke="#C8102E" strokeWidth="3.5" />
      </g>
    </>
  );
}

export default function BanderaIdioma({ locale }) {
  const nombre = nombreIdioma(locale);
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 30 20"
      role="img"
      aria-label={nombre}
      style={{ display: 'block', boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.12)' }}
    >
      <title>{nombre}</title>
      {locale === 'en' ? <ReinoUnido /> : <Espana />}
    </svg>
  );
}
