'use client';

/* ============================================================
   PANEL DE CLIENTE (/mi-cuenta/panel) — Fely Campo
   El "dentro" de Mi Cuenta — placeholder de lo que vería una clienta
   ya registrada/con sesión iniciada (ver MiCuentaModal.jsx: sus dos
   "submit" navegan aquí como demostración, ninguno comprueba
   credenciales de verdad todavía). Sidebar de pestañas (mismo
   subrayado que .navLink/.navLinkActivo del Navbar, en columna en vez
   de en fila — igual criterio que .submenuLink en
   NavbarPanelLateralContent.module.css) + contenido a la derecha.

   Tres pestañas:
   - "Mis pedidos" (por defecto): pedidos de ejemplo con sus productos
     — cada producto lleva "Escribir reseña" (abre EscribirResenaModal,
     ver ahí), justo lo que se pidió: un sitio para reseñar productos
     ya comprados. Tras "enviar" en el modal, el botón de ese producto
     pasa a "Reseña enviada" — solo estado local de esta página
     (useState), no hay backend que cruce compras con reseñas todavía.
   - "Mis reseñas": las que la clienta ya ha escrito — de ejemplo
     también, no las que se acaban de enviar arriba (no hay conexión
     real entre las dos).
   - "Mis datos": formulario con los mismos campos que el registro de
     MiCuentaModal.jsx (nombre completo, email, fecha de nacimiento),
     precargado — "Guardar cambios" no hace nada (placeholder).

   PLACEHOLDER a propósito, a petición: todo el contenido (pedidos,
   reseñas, datos) es fijo, tomado de productosEjemplo.js — sin
   backend real que sepa qué ha comprado o escrito una clienta
   concreta.
   ============================================================ */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { Input, Boton } from '@/components/ui';
import { EscribirResenaModal } from '@/components/ecommerce';
import { productosEjemplo } from '@/components/layout/productosEjemplo';
import styles from './page.module.css';

// PLACEHOLDER — ver comentario de arriba: pedidos y reseñas fijos de
// ejemplo, tomados de productosEjemplo.js.
const PEDIDOS_EJEMPLO = [
  {
    numero: 'FC-2941',
    fecha: '12 de mayo de 2026',
    estado: 'Entregado',
    productos: [productosEjemplo[0], productosEjemplo[3]],
  },
  {
    numero: 'FC-2887',
    fecha: '3 de marzo de 2026',
    estado: 'Entregado',
    productos: [productosEjemplo[7]],
  },
];

const RESENAS_EJEMPLO = [
  { producto: productosEjemplo[5], valoracion: 5, texto: 'La caída de la tela es preciosa, mejor en persona que en foto.' },
];

const TABS = ['pedidos', 'resenas', 'datos'];

function Estrellas({ valoracion }) {
  return (
    <div className={styles.estrellasLectura} aria-label={`${valoracion} / 5`}>
      {[1, 2, 3, 4, 5].map((numero) => (
        <Star
          key={numero}
          size={16}
          strokeWidth={1.5}
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill={numero <= valoracion ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function Pagina() {
  const t = useTranslations('panelCliente');
  // Mismas etiquetas que el formulario de registro de MiCuentaModal.jsx
  // (nombreCompleto/email/fechaNacimiento) — no se duplican como
  // claves nuevas en "panelCliente".
  const tCuenta = useTranslations('miCuenta');
  const [tab, setTab] = useState('pedidos');
  const [productoModal, setProductoModal] = useState(null);
  const [resenadas, setResenadas] = useState([]);

  const abrirResena = (producto) => setProductoModal(producto);
  const cerrarResena = () => setProductoModal(null);
  const marcarResenado = () => {
    setResenadas((actuales) => (
      productoModal && !actuales.includes(productoModal.nombre)
        ? [...actuales, productoModal.nombre]
        : actuales
    ));
  };

  return (
    <section className="seccion contenedor panelCliente">
      <div className={styles.layout}>
        <nav className={styles.sidebar} aria-label="Mi cuenta">
          {TABS.map((clave) => (
            <button
              key={clave}
              type="button"
              className={`${styles.tab} ${tab === clave ? styles.tabActivo : ''}`}
              onClick={() => setTab(clave)}
            >
              {t(`tab${clave.charAt(0).toUpperCase()}${clave.slice(1)}`)}
            </button>
          ))}
        </nav>

        <div className={styles.contenido}>
          {tab === 'pedidos' && (
            <div className={styles.bloque}>
              <h1 className={styles.titulo}>{t('pedidosTitulo')}</h1>

              {PEDIDOS_EJEMPLO.map((pedido) => (
                <div key={pedido.numero} className={styles.pedido}>
                  <div className={styles.pedidoCabecera}>
                    <p className={styles.pedidoNumero}>{t('pedidoNumero', { numero: pedido.numero })}</p>
                    <p className={styles.pedidoMeta}>{pedido.fecha} · {pedido.estado}</p>
                  </div>

                  <div className={styles.pedidoProductos}>
                    {pedido.productos.map((producto) => {
                      const yaResenado = resenadas.includes(producto.nombre);
                      return (
                        <div key={producto.nombre} className={styles.pedidoProducto}>
                          <img src={producto.imagen} alt="" className={styles.pedidoImagen} />
                          <div className={styles.pedidoProductoInfo}>
                            <p className={styles.pedidoProductoNombre}>{producto.nombre}</p>
                            <p className={styles.pedidoProductoPrecio}>{producto.precio}</p>
                          </div>
                          <Boton
                            variante="contorno"
                            tamano="s"
                            desactivado={yaResenado}
                            onClick={() => abrirResena(producto)}
                            className={styles.pedidoAccion}
                          >
                            {yaResenado ? t('resenaEnviada') : t('escribirResena')}
                          </Boton>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'resenas' && (
            <div className={styles.bloque}>
              <h1 className={styles.titulo}>{t('resenasTitulo')}</h1>

              {RESENAS_EJEMPLO.length === 0 ? (
                <p className={styles.vacio}>{t('resenasVacio')}</p>
              ) : (
                RESENAS_EJEMPLO.map(({ producto, valoracion, texto }) => (
                  <div key={producto.nombre} className={styles.resena}>
                    <img src={producto.imagen} alt="" className={styles.pedidoImagen} />
                    <div className={styles.resenaInfo}>
                      <p className={styles.pedidoProductoNombre}>{producto.nombre}</p>
                      <Estrellas valoracion={valoracion} />
                      <p className={styles.resenaTexto}>&ldquo;{texto}&rdquo;</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'datos' && (
            <div className={styles.bloque}>
              <div className={styles.cabeceraBloque}>
                <h1 className={styles.titulo}>{t('datosTitulo')}</h1>
                <p className={styles.subtitulo}>{t('datosSubtitulo')}</p>
              </div>

              <form className={styles.form} onSubmit={(evento) => evento.preventDefault()}>
                <Input etiqueta={tCuenta('nombreCompleto')} tipo="text" nombre="nombreCompleto" valor="María Martín García" onChange={() => {}} />
                <Input etiqueta={tCuenta('email')} tipo="email" nombre="email" valor="maria@ejemplo.com" onChange={() => {}} />
                <Input etiqueta={tCuenta('fechaNacimiento')} tipo="date" nombre="fechaNacimiento" valor="1994-05-12" onChange={() => {}} />
                <Boton variante="solido" tamano="m" type="submit">{t('guardarCambios')}</Boton>
              </form>
            </div>
          )}
        </div>
      </div>

      <EscribirResenaModal
        abierto={!!productoModal}
        onCerrar={cerrarResena}
        producto={productoModal}
        onEnviado={marcarResenado}
      />
    </section>
  );
}
