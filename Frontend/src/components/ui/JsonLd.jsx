// JsonLd.jsx — pinta uno o varios objetos JSON-LD (ver
// src/lib/datosEstructurados.js) en un <script type="application/ld+json">.
// "<" se escapa como <: así ningún texto del catálogo puede cerrar el
// <script> antes de tiempo (inyección de HTML).

export default function JsonLd({ datos }) {
  const lista = (Array.isArray(datos) ? datos : [datos]).filter(Boolean);
  return lista.map((objeto, indice) => (
    <script
      // eslint-disable-next-line react/no-array-index-key
      key={indice}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(objeto).replace(/</g, '\\u003c') }}
    />
  ));
}
