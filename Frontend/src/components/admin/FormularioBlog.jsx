'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, FormSeccion, PickerDrawer, useToast } from './index';
import { Boton, Input } from '../ui';
import { bancoImagenes } from './mockData';
import styles from './FormularioBlog.module.css';

const CATEGORIAS = ['Colecciones', 'Atelier', 'Consejos'];

function FormularioBlog({ entradaExistente }) {
  const router = useRouter();
  const { mostrarToast } = useToast();

  const [titulo, setTitulo] = useState(entradaExistente?.titulo || '');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState(entradaExistente?.categoria || '');
  const [imagen, setImagen] = useState(entradaExistente?.imagen || '');
  const [pickerAbierto, setPickerAbierto] = useState(false);
  const [seleccionTemp, setSeleccionTemp] = useState([]);

  function guardar(estado) {
    mostrarToast(estado === 'Publicado' ? 'Entrada publicada (demo)' : 'Borrador guardado (demo)');
    router.push('/admin/blog');
  }

  return (
    <div>
      <PageHeader titulo={entradaExistente ? 'Editar entrada' : 'Nueva entrada'} />

      <FormSeccion numero={1} titulo="Contenido">
        <Input etiqueta="Título" valor={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <label>
          <span className={styles.etiquetaCampo}>Categoría (opcional)</span>
          <select className={styles.selectInput} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Sin categoría</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className={styles.campoAncho}>
          <span className={styles.etiquetaCampo}>Cuerpo del artículo</span>
          <textarea className={styles.textarea} value={contenido} onChange={(e) => setContenido(e.target.value)} />
        </div>
      </FormSeccion>

      <FormSeccion numero={2} titulo="Imagen destacada">
        <div className={styles.campoAncho}>
          <div className={styles.imagen}>
            {imagen ? <img src={imagen} alt="" className={styles.imagenMiniatura} /> : <span className={styles.imagenMiniatura} />}
            <Boton
              variante="contorno"
              tamano="s"
              onClick={() => { setSeleccionTemp(imagen ? [imagen] : []); setPickerAbierto(true); }}
            >
              {imagen ? 'Cambiar imagen' : 'Elegir imagen'}
            </Boton>
          </div>
        </div>
      </FormSeccion>

      <div className={styles.acciones}>
        <Boton variante="contorno" onClick={() => guardar('Borrador')}>Guardar borrador</Boton>
        <Boton variante="solido" onClick={() => guardar('Publicado')}>Publicar</Boton>
      </div>

      <PickerDrawer
        abierto={pickerAbierto}
        onCerrar={() => setPickerAbierto(false)}
        titulo="Elegir imagen destacada"
        items={bancoImagenes}
        claveItem={(src) => src}
        seleccionados={seleccionTemp}
        max={1}
        onToggle={(src) => setSeleccionTemp([src])}
        renderItem={(src) => <img src={src} alt="" className={styles.pickerImagen} />}
        onConfirmar={() => setImagen(seleccionTemp[0] || '')}
        columnas={2}
      />
    </div>
  );
}

export default FormularioBlog;
