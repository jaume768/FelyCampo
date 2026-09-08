import Boton from './Boton';

export default {
  title: 'UI/Boton',
  component: Boton,
  argTypes: {
    variante: {
      control: 'select',
      options: ['solido', 'contorno', 'contorno-rosa', 'rosa', 'texto', 'texto-crema', 'flecha', 'avisa'],
      description: 'Sólido = acción principal. Rosa = solo CTA de compra, máximo una por pantalla. Contorno = acción secundaria. Contorno-rosa = mismo contorno en rosa-oscuro, para acciones secundarias de limpiar/descartar (ej. Limpiar filtros); mismo hover que contorno, invierte a relleno sólido. Texto = enlaces. Texto-crema = enlace en --color-crema, para fondos oscuros/imágenes. Flecha = nuevo diseño de CTA subrayado en mayúsculas con "→" al final. Avisa = tamaño fijo compacto, para "avísame cuando esté disponible".',
    },
    tamano: {
      control: 'select',
      options: ['s', 'm', 'l', 'full'],
      description: 'Solo aplica a las variantes solido/contorno/contorno-rosa/rosa — la variante avisa ignora este control (tamaño fijo).',
    },
    desactivado: {
      control: 'boolean',
      description: 'Deshabilita el botón e ignora los clics.',
    },
    mayusculas: {
      control: 'boolean',
      description: 'Solo aplica con variante="texto": pone el texto en mayúsculas (ej. enlaces legales).',
    },
    onClick: {
      description: 'Evento que se dispara al hacer clic (ignorado si desactivado es true).',
    },
  },
};

export const Variantes = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Boton variante="solido">Comprar</Boton>
      <Boton variante="contorno">Ver colección</Boton>
      <Boton variante="contorno-rosa">Limpiar filtros</Boton>
      <Boton variante="rosa">Añadir a la cesta</Boton>
      <Boton variante="texto">Descubre más</Boton>
    </div>
  ),
};

export const Tamanos = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Boton tamano="s">Pequeño</Boton>
      <Boton tamano="m">Mediano</Boton>
      <Boton tamano="l">Grande</Boton>
    </div>
  ),
};

export const Desactivado = {
  args: { children: 'No disponible', desactivado: true },
};

export const Avisa = {
  render: () => (
    <div style={{ maxWidth: '320px' }}>
      <Boton variante="avisa">Avísame cuando esté disponible</Boton>
    </div>
  ),
};

export const TextoMayusculas = {
  args: { variante: 'texto', mayusculas: true, children: 'Términos y condiciones' },
};

export const TextoCrema = {
  args: { variante: 'texto-crema', children: 'Descubre más' },
  render: (args) => (
    <div style={{ background: '#1a1a1a', padding: '32px', display: 'inline-block' }}>
      <Boton {...args} />
    </div>
  ),
};

export const Flecha = {
  args: { variante: 'flecha', children: 'Comprar ahora' },
};
