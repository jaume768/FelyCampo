'use client';

/* ============================================================
   CLIENTES — DATOS REALES: /api/v1/admin/customers/.

   UNA COSA IMPORTANTE, Y NO ES UN DETALLE: **comprar no crea cliente.**
   El checkout acepta pedidos sin cuenta (basta el correo), y esos
   pedidos guardan `Order.email` con `Order.user = NULL`. Así que quien
   compró sin registrarse NO es un usuario y no aparece en el listado de
   clientes registrados.

   Enseñar solo los registrados daría a entender que son todos los
   compradores. Por eso hay dos pestañas: «registrados» y «sin cuenta»,
   y el recuento de cada una a la vista. El hueco se ve, no se disimula.

   Lo único editable es bloquear una cuenta: un cliente nace
   registrándose, y borrarlo rompería el histórico de pedidos.
   ============================================================ */

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PageHeader, TablaAdmin, FiltroBar, useToast } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import {
  listarClientes, listarInvitados, bloquearCliente, adaptarCliente, adaptarInvitado,
} from '@/lib/api/adminOrders';
import { ApiError } from '@/lib/api/errors';
import styles from './page.module.css';

const POR_PAGINA = 20;

function fechaCorta(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { dateStyle: 'medium' });
}

export default function ClientesPage() {
  const { mostrarToast } = useToast();

  const [pestana, setPestana] = useState('registrados');
  const [query, setQuery] = useState('');
  const [pagina, setPagina] = useState(1);

  const [clientes, setClientes] = useState([]);
  const [total, setTotal] = useState(0);
  const [invitados, setInvitados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = { page: pagina, page_size: POR_PAGINA };
      if (query) params.search = query;
      const pag = await listarClientes(params);
      setClientes((pag.results || []).map(adaptarCliente));
      setTotal(pag.count ?? 0);
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      setError(fallo);
      setClientes([]);
      setTotal(0);
    } finally {
      setCargando(false);
    }
  }, [query, pagina]);

  useEffect(() => {
    const t = setTimeout(cargar, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [cargar, query]);

  useEffect(() => {
    setPagina(1);
  }, [query]);

  // Los invitados no paginan ni se filtran en servidor: son una agregación, y el volumen
  // es el de correos distintos que han comprado sin cuenta.
  useEffect(() => {
    listarInvitados()
      .then((filas) => setInvitados((filas || []).map(adaptarInvitado)))
      .catch(() => setInvitados([]));
  }, []);

  async function alternarBloqueo(cliente) {
    setGuardando(true);
    try {
      await bloquearCliente(cliente.id, !cliente.activo);
      await cargar();
      mostrarToast(cliente.activo ? 'Cuenta bloqueada' : 'Cuenta reactivada');
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      mostrarToast(`No se ha podido cambiar: ${fallo.firstDetail ?? fallo.message}`);
    } finally {
      setGuardando(false);
    }
  }

  const esRegistrados = pestana === 'registrados';
  const filasInvitados = query
    ? invitados.filter((i) => i.email.toLowerCase().includes(query.toLowerCase()))
    : invitados;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const columnasComunes = [
    { clave: 'email', etiqueta: 'Correo', render: (c) => c.email },
    { clave: 'pedidos', etiqueta: 'Pedidos', render: (c) => c.pedidos },
    { clave: 'pagados', etiqueta: 'Pagados', render: (c) => c.pedidosPagados },
    { clave: 'gasto', etiqueta: 'Gasto', render: (c) => c.gasto },
    { clave: 'ultimo', etiqueta: 'Último pedido', render: (c) => fechaCorta(c.ultimoPedido) },
  ];

  return (
    <div>
      <PageHeader
        titulo="Clientes"
        subtitulo={cargando ? 'Cargando…' : `${total} registrado${total === 1 ? '' : 's'} · ${invitados.length} han comprado sin cuenta`}
      />

      <p className={styles.explicacion}>
        Comprar <strong>no</strong> crea una cuenta: el checkout admite pedidos de invitado,
        que guardan solo el correo. Quien compró sin registrarse aparece en «Sin cuenta»,
        no aquí.
      </p>

      <div className={styles.pestanas}>
        <button
          type="button"
          className={`${styles.pestana} ${esRegistrados ? styles.pestanaActiva : ''}`}
          aria-pressed={esRegistrados}
          onClick={() => setPestana('registrados')}
        >
          Registrados ({total})
        </button>
        <button
          type="button"
          className={`${styles.pestana} ${!esRegistrados ? styles.pestanaActiva : ''}`}
          aria-pressed={!esRegistrados}
          onClick={() => setPestana('invitados')}
        >
          Sin cuenta ({invitados.length})
        </button>
      </div>

      <FiltroBar>
        <Input
          etiqueta="Buscar"
          placeholder="Correo o nombre"
          valor={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </FiltroBar>

      {error && (
        <div className={styles.aviso} role="alert">
          {error.isNetworkError
            ? 'No hemos podido conectar con el servidor.'
            : error.status === 401 || error.status === 403
              ? 'Tu sesión no tiene acceso al panel. Vuelve a entrar.'
              : error.message}
        </div>
      )}

      {esRegistrados ? (
        <>
          {!error && cargando && <p className={styles.estado} role="status">Cargando clientes…</p>}
          {!error && !cargando && clientes.length === 0 && (
            <p className={styles.estado}>
              Todavía no hay clientes registrados
              {invitados.length > 0 && `, pero ${invitados.length} persona${invitados.length === 1 ? ' ha' : 's han'} comprado sin cuenta`}.
            </p>
          )}

          <TablaAdmin
            columnas={[
              {
                clave: 'nombre',
                etiqueta: 'Nombre',
                // Las cuentas del equipo salen aquí solo si han comprado. Se marcan para
                // que no se confundan con clientela real al leer el recuento.
                render: (c) => (c.esDelEquipo
                  ? <span>{c.nombre} <span className={styles.marcaEquipo}>equipo</span></span>
                  : c.nombre),
              },
              ...columnasComunes,
              { clave: 'alta', etiqueta: 'Alta', render: (c) => fechaCorta(c.alta) },
              {
                clave: 'estado',
                etiqueta: 'Estado',
                render: (c) => (
                  <span className={styles.marcas}>
                    {!c.activo && <span className={styles.bloqueada}>bloqueada</span>}
                    {/* Informativo: hoy NO impide entrar ni comprar. */}
                    {!c.emailVerificado && <span className={styles.sinVerificar}>correo sin verificar</span>}
                  </span>
                ),
              },
            ]}
            filas={clientes}
            renderAcciones={(c) => (
              <Boton variante="texto" onClick={() => alternarBloqueo(c)} desactivado={guardando}>
                {c.activo ? 'Bloquear' : 'Reactivar'}
              </Boton>
            )}
          />

          {paginas > 1 && (
            <div className={styles.paginacion}>
              <button
                type="button"
                className={styles.paginaBoton}
                onClick={() => setPagina((n) => Math.max(1, n - 1))}
                disabled={pagina <= 1 || cargando}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className={styles.paginaTexto}>Página {pagina} de {paginas}</span>
              <button
                type="button"
                className={styles.paginaBoton}
                onClick={() => setPagina((n) => Math.min(paginas, n + 1))}
                disabled={pagina >= paginas || cargando}
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className={styles.estado}>
            Pedidos hechos sin cuenta, agrupados por correo. No son usuarios: no tienen
            perfil, ni contraseña, ni se les puede bloquear.
          </p>
          {filasInvitados.length === 0 && (
            <p className={styles.estado}>Nadie ha comprado todavía sin cuenta.</p>
          )}
          <TablaAdmin columnas={columnasComunes} filas={filasInvitados} />
        </>
      )}
    </div>
  );
}
