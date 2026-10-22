"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileBarChart,
  History,
  House,
  KeyRound,
  Lightbulb,
  Lock,
  Rocket,
  Search,
  Settings,
  Smartphone,
  Users,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { canTransition } from "@/lib/permissions";

type View = "consulta" | "edicion";
type Block =
  | { t: "p"; text: string }
  | { t: "steps"; items: string[] }
  | { t: "list"; items: string[] }
  | { t: "tip"; text: string }
  | { t: "warn"; text: string }
  | { t: "table"; head: string[]; rows: string[][] };

type Section = {
  id: string;
  title: string;
  icon: typeof House;
  summary: string;
  href?: string;
  /** Solo se muestra a quien puede modificar información. */
  editOnly?: boolean;
  /** Bloques que solo aparecen en la vista de edición. */
  blocks: (Block & { edit?: boolean })[];
};

const juntasBlocks: Section["blocks"] = [
  {
    t: "steps",
    items: [
      "Abra «Buscar juntas». Verá todas las JAC con su ubicación, zona y estado.",
      "Escriba en el buscador: funciona con código, nombre, NIT, personería jurídica, barrio o vereda.",
      "Afine con los filtros de estado (activas, inactivas, archivadas) y zona (urbana o rural).",
      "Pulse «Limpiar» para volver a ver todo.",
      "Abra una junta para ver su ficha.",
    ],
  },
  {
    t: "p",
    text: "El contador sobre la tabla indica cuántos resultados coinciden. «Exportar CSV» descarga exactamente lo que está filtrado en pantalla, listo para abrir en Excel.",
  },
  {
    t: "table",
    head: ["Pestaña de la ficha", "Qué encontrará"],
    rows: [
      ["Información general", "Código, ubicación, zona, afiliados, NIT, personería jurídica, contacto y completitud de la ficha."],
      ["Dignatarios", "Personas y cargos de la directiva, con periodo y vigencia. El documento de identidad puede aparecer enmascarado."],
      ["Convenios", "Acuerdos con entidades: fechas, valor y estado."],
      ["Documentos", "Soportes cargados (resoluciones, actas, fotos). Se descargan con un enlace temporal."],
    ],
  },
  { t: "tip", text: "«Imprimir ficha» genera una versión limpia para papel o PDF desde el diálogo de impresión del navegador." },
  {
    t: "p",
    edit: true,
    text: "Con permisos de edición, la ficha muestra además el botón «Editar», los botones «Registrar» de dignatarios y convenios, y la carga de documentos.",
  },
];

const sections: Section[] = [
  {
    id: "acceso",
    title: "Ingresar y recuperar el acceso",
    icon: KeyRound,
    summary: "Cómo iniciar sesión, qué hacer si olvidó su contraseña y cómo cerrar la sesión.",
    blocks: [
      {
        t: "steps",
        items: [
          "Abra la página de inicio y pulse «Iniciar sesión».",
          "Escriba su correo electrónico o su nombre de usuario y su contraseña.",
          "Pulse «Ingresar». Llegará al Inicio con sus indicadores.",
        ],
      },
      {
        t: "p",
        text: "Si es su primera vez, recibirá una invitación por correo con un enlace para crear su propia contraseña. El enlace es temporal y de un solo uso.",
      },
      {
        t: "steps",
        items: [
          "¿Olvidó la contraseña? En el inicio de sesión pulse «Recuperar acceso».",
          "Escriba el correo de su cuenta. Por seguridad, la respuesta es la misma exista o no la cuenta.",
          "Abra el correo recibido, pulse el enlace y defina una contraseña nueva.",
        ],
      },
      {
        t: "tip",
        text: "Revise la carpeta de spam si el correo no llega en unos minutos. Si tampoco aparece, pida a un administrador que verifique su cuenta.",
      },
      {
        t: "warn",
        text: "Tras varios intentos fallidos el sistema limita temporalmente nuevos intentos. Si su cuenta fue suspendida no podrá ingresar hasta que un administrador la reactive.",
      },
      {
        t: "p",
        text: "Para salir, use «Cerrar sesión» al pie del menú lateral. Hágalo siempre en equipos compartidos.",
      },
    ],
  },
  {
    id: "navegacion",
    title: "Moverse por la aplicación",
    icon: Smartphone,
    summary: "El menú lateral, la barra inferior del móvil, la instalación como app y el uso sin conexión.",
    blocks: [
      {
        t: "p",
        text: "En computador verá el menú lateral con los módulos agrupados en «Gestión» (y «Administración» si es administrador). En el teléfono, el menú pasa a una barra inferior con los accesos principales; el resto está en «Más».",
      },
      {
        t: "table",
        head: ["Módulo", "Para qué sirve"],
        rows: [
          ["Inicio", "Indicadores, actividad reciente y acciones rápidas."],
          ["Buscar juntas", "Directorio y ficha completa de cada JAC."],
          ["Reuniones", "Agenda, asistentes y convocatorias."],
          ["Actas", "Documentos formales de las reuniones, con PDF."],
          ["Compromisos", "Tareas con responsable y fecha límite."],
          ["Actividades", "Eventos y programas comunitarios."],
          ["Reportes", "Exportación a CSV e impresión."],
          ["Manual", "Esta guía de uso."],
        ],
      },
      {
        t: "tip",
        text: "SIJAC es una PWA: en Chrome o Edge puede instalarla desde el menú del navegador («Instalar aplicación») y en Android/iOS con «Añadir a pantalla de inicio». Si pierde la conexión verá una página de aviso; los datos siempre requieren internet.",
      },
    ],
  },
  {
    id: "inicio",
    title: "Inicio: su panel general",
    icon: House,
    href: "/panel",
    summary: "Qué significan los indicadores y para qué sirven las acciones rápidas.",
    blocks: [
      {
        t: "list",
        items: [
          "Juntas registradas: total de JAC en el sistema.",
          "Juntas activas: las que están en operación normal.",
          "Afiliados reportados: suma de afiliados declarados en las fichas.",
          "Compromisos abiertos: tareas que aún no se completan ni cancelan.",
          "Actividad reciente: últimos cambios hechos en el sistema.",
          "Próximas reuniones y Actividades: lo siguiente en el calendario, con su estado.",
        ],
      },
      {
        t: "p",
        text: "«Acciones rápidas» lleva directamente a buscar una junta, generar un reporte y, si tiene permisos de edición, a registrar una JAC o crear una reunión.",
      },
      { t: "tip", text: "Empiece cada día por Inicio: los compromisos abiertos y las reuniones próximas le dicen qué requiere atención." },
    ],
  },
  {
    id: "juntas",
    title: "Buscar juntas y consultar su ficha",
    icon: Search,
    href: "/juntas",
    summary: "Búsqueda, filtros, exportación y las cuatro pestañas de la ficha de cada JAC.",
    blocks: juntasBlocks,
  },
  {
    id: "registrar-junta",
    title: "Registrar, editar y archivar una JAC",
    icon: Rocket,
    href: "/juntas/nueva",
    editOnly: true,
    summary: "Cómo crear la ficha de una junta, completarla bien y retirarla sin perder su historia.",
    blocks: [
      {
        t: "steps",
        items: [
          "Desde Inicio o desde «Buscar juntas» pulse «Registrar JAC».",
          "Complete identificación (código y nombre), ubicación (barrio o vereda, zona), afiliados y datos jurídicos (NIT, personería, resolución).",
          "Añada el contacto: dirección, teléfono y correo.",
          "Pulse guardar. El sistema valida los campos y avisa si detecta un posible duplicado.",
        ],
      },
      { t: "tip", text: "Cuantos más campos complete, mayor será la «completitud» de la ficha. El reporte «Calidad de información» muestra qué fichas faltan por completar." },
      { t: "p", text: "Para modificar datos abra la ficha y pulse «Editar». Cada cambio queda en la auditoría." },
      {
        t: "warn",
        text: "Archivar retira la junta de los listados por defecto, pero conserva dignatarios, convenios, documentos y trazabilidad. Nada se elimina. Una junta archivada puede volver a activarse.",
      },
    ],
  },
  {
    id: "dignatarios-convenios",
    title: "Dignatarios, convenios y documentos",
    icon: Users,
    editOnly: true,
    summary: "Mantenga al día la directiva, los acuerdos y los soportes de cada junta.",
    blocks: [
      {
        t: "steps",
        items: [
          "Abra la ficha de la junta y entre a la pestaña Dignatarios o Convenios.",
          "Pulse «Registrar» y complete el formulario.",
          "Pulse «Guardar dignatario» o «Guardar convenio». El registro aparece de inmediato.",
          "En la pestaña Documentos elija el archivo, complete los datos y pulse «Cargar archivo».",
        ],
      },
      {
        t: "table",
        head: ["Registro", "Datos principales"],
        rows: [
          ["Dignatario", "Nombre, cargo, documento, periodo y vigencia."],
          ["Convenio", "Nombre, entidad, fechas, valor, estado y observaciones."],
          ["Documento", "Archivo, tipo y descripción."],
        ],
      },
      {
        t: "table",
        head: ["Regla de carga", "Detalle"],
        rows: [
          ["Formatos", "PDF, JPG, PNG, WebP, Word (.docx) y Excel (.xlsx)."],
          ["Tamaño", "Máximo 10 MB por archivo."],
          ["Privacidad", "Los archivos son privados: solo se abren con sesión iniciada, mediante enlaces temporales."],
        ],
      },
      { t: "warn", text: "Suba solo los soportes necesarios. Evite escaneos con datos personales que no se requieran." },
    ],
  },
  {
    id: "reuniones",
    title: "Reuniones: agenda y asistencia",
    icon: CalendarDays,
    href: "/reuniones",
    summary: "Consulte las reuniones y, si puede editar, prográmelas y registre quién asistió.",
    blocks: [
      {
        t: "p",
        text: "En «Reuniones» verá tarjetas con título, junta, lugar, fecha y estado. Use el buscador (título, junta, lugar) y el filtro de estado. Pulse «Abrir reunión» para ver el detalle.",
      },
      {
        t: "p",
        text: "El detalle muestra fecha y hora (hora de Colombia), lugar, número de asistentes registrados, estado, el orden del día y la lista de asistencia. «Imprimir convocatoria» genera una hoja lista para repartir.",
      },
      {
        t: "steps",
        edit: true,
        items: [
          "Pulse «Registrar» (o «Nueva reunión» en Inicio).",
          "Elija la junta, escriba el título, el tipo (ordinaria, extraordinaria o directiva), fecha, hora y lugar.",
          "Guarde: la reunión queda en estado «borrador».",
          "Abra la reunión y añada los puntos del orden del día en el orden en que se tratarán.",
          "Registre cada asistente con nombre, documento, cargo o representación y su asistencia.",
        ],
      },
      { t: "tip", edit: true, text: "Registre la asistencia el mismo día: le servirá después para redactar el acta con el quórum correcto." },
    ],
  },
  {
    id: "actas",
    title: "Actas: redactar y descargar",
    icon: BookOpenText,
    href: "/actas",
    summary: "De una reunión finalizada a un acta formal en PDF.",
    blocks: [
      {
        t: "p",
        text: "Las actas son el registro formal de lo ocurrido en una reunión. Cada acta pertenece a una reunión y a una junta, y tiene número, año y estado.",
      },
      {
        t: "steps",
        items: [
          "Abra «Actas» y busque por número, junta o contenido.",
          "Pulse «Abrir acta» para leer el desarrollo (secciones) y las decisiones adoptadas.",
          "Use «Descargar PDF» para obtener el documento o «Imprimir acta» para imprimirlo.",
        ],
      },
      {
        t: "steps",
        edit: true,
        items: [
          "Solo se puede crear un acta de una reunión en estado «finalizada».",
          "En «Actas» pulse «Registrar», elija la reunión, escriba número (por ejemplo 015), año y resumen.",
          "Abra el acta y use «Agregar sección» para el desarrollo narrativo (informes, proposiciones, varios).",
          "Use «Agregar decisión» para cada determinación, con su resultado (por ejemplo «Aprobada por mayoría»).",
        ],
      },
      { t: "warn", edit: true, text: "Un acta en estado «cerrada» ya no admite cambios de contenido." },
    ],
  },
  {
    id: "compromisos",
    title: "Compromisos y actividades",
    icon: ClipboardCheck,
    href: "/compromisos",
    summary: "Seguimiento de tareas y de eventos comunitarios, con búsqueda y filtros.",
    blocks: [
      {
        t: "p",
        text: "Compromisos son tareas con responsable y fecha límite surgidas de reuniones o de la gestión. Actividades son eventos o programas (jornadas, talleres, obras) con lugar, fecha y beneficiarios estimados. Ambos módulos funcionan igual: tarjetas, buscador y filtro por estado.",
      },
      {
        t: "steps",
        edit: true,
        items: [
          "Pulse «Registrar» en el módulo.",
          "Elija la junta y complete título, responsable y fecha límite (compromiso) o fecha, lugar y beneficiarios (actividad).",
          "Guarde. Un compromiso nace «pendiente» y una actividad «planeada».",
        ],
      },
      { t: "tip", text: "En las reuniones de seguimiento filtre por «bloqueado» o «aplazada»: son los registros que necesitan una decisión." },
      { t: "p", text: "Para ver el avance de las actividades y compromisos en conjunto, use el reporte correspondiente en Reportes." },
    ],
  },
  {
    id: "estados",
    title: "Estados y su ciclo de vida",
    icon: Activity,
    summary: "Qué significa cada etiqueta de color y qué cambios de estado son posibles. Pruébelo abajo.",
    blocks: [
      {
        t: "p",
        text: "Cada registro tiene un estado que indica en qué punto del proceso está. El sistema solo admite caminos válidos: por ejemplo, un acta no puede pasar de «borrador» a «cerrada» sin ser aprobada.",
      },
      {
        t: "list",
        items: [
          "Verde: terminado o en buen estado (activa, vigente, aprobada, completada).",
          "Ámbar: pendiente de una acción (borrador, convocada, en revisión, aplazada).",
          "Azul: en marcha (en curso, en ejecución, suspendido).",
          "Rojo: detenido o fuera de uso (archivada, cancelada, anulada, bloqueado).",
        ],
      },
    ],
  },
  {
    id: "reportes",
    title: "Reportes, impresión y exportación",
    icon: FileBarChart,
    href: "/reportes",
    summary: "Los cinco reportes disponibles y cómo llevarlos a Excel o a papel.",
    blocks: [
      {
        t: "table",
        head: ["Reporte", "Contenido"],
        rows: [
          ["Directorio de JAC", "Código, nombre, ubicación, estado y datos de contacto autorizados."],
          ["Dignatarios vigentes", "Cargos actuales; el documento sale enmascarado."],
          ["Compromisos abiertos", "Responsables, fechas límite, estado y avance."],
          ["Actividades comunitarias", "Programación, estado, lugar y beneficiarios."],
          ["Calidad de información", "Completitud de cada ficha para priorizar su depuración."],
        ],
      },
      {
        t: "steps",
        items: [
          "Abra «Reportes» y elija la tarjeta del reporte.",
          "Pulse «CSV» para descargar un archivo que se abre bien en Excel (con tildes) o «Imprimir» para papel o PDF.",
        ],
      },
      { t: "tip", text: "El nombre del CSV lleva la fecha (sijac-juntas-2026-10-21.csv): así puede archivar descargas sin confundirlas." },
    ],
  },
  {
    id: "usuarios",
    title: "Administrar usuarios",
    icon: Users,
    href: "/administracion/usuarios",
    editOnly: true,
    summary: "Invitar personas, asignar roles, suspender y reactivar cuentas. Solo administradores.",
    blocks: [
      {
        t: "table",
        head: ["Rol", "Puede"],
        rows: [
          ["Consulta", "Ver juntas, reuniones, actas, compromisos, actividades y reportes; imprimir, exportar y descargar documentos."],
          ["Administrador", "Todo lo anterior, más crear y modificar información, cargar documentos, gestionar usuarios, configuración y auditoría."],
        ],
      },
      {
        t: "steps",
        items: [
          "En «Usuarios» pulse «Crear o invitar cuenta».",
          "Escriba nombre completo, correo, nombre de usuario y rol.",
          "Pulse «Crear invitación»: la persona recibe un correo con un enlace para fijar su contraseña.",
          "Para quitar el acceso use «Suspender»; para devolverlo, «Reactivar».",
        ],
      },
      { t: "warn", text: "El último administrador activo no puede suspenderse, para no perder nunca el control del sistema. Asigne a cada persona el rol mínimo necesario." },
    ],
  },
  {
    id: "auditoria",
    title: "Auditoría y configuración",
    icon: History,
    href: "/administracion/auditoria",
    editOnly: true,
    summary: "Quién hizo qué y cuándo, y los parámetros institucionales. Solo administradores.",
    blocks: [
      {
        t: "p",
        text: "«Auditoría» lista las acciones sensibles: actor, acción, entidad, fecha y, cuando aplica, valores anteriores y nuevos. Úsela para aclarar un cambio o investigar un incidente.",
      },
      {
        t: "table",
        head: ["Ajuste en Configuración", "Efecto"],
        rows: [
          ["Nombre de la entidad / oficina", "Identificación institucional de la aplicación."],
          ["Logo institucional", "Imagen de identidad de la entidad."],
          ["Visibilidad del documento de identidad", "Enmascarado para Consulta, solo Administrador, o completo para roles internos."],
          ["Límite por archivo", "5, 10 o 20 MB."],
          ["Tipos de documento permitidos", "Formatos aceptados al cargar soportes."],
        ],
      },
    ],
  },
  {
    id: "privacidad",
    title: "Seguridad y buenas prácticas",
    icon: Lock,
    summary: "Hábitos sencillos que protegen la información de la comunidad.",
    blocks: [
      {
        t: "list",
        items: [
          "No comparta su contraseña ni use la cuenta de otra persona.",
          "Cierre sesión en equipos compartidos o públicos.",
          "Los documentos son privados: comparta su contenido por canales institucionales, no reenviando enlaces de descarga.",
          "Trate los datos personales (documentos de identidad, teléfonos) conforme a la política de privacidad.",
          "Reporte datos incorrectos o accesos sospechosos a un administrador.",
          "Todo cambio sensible queda en la auditoría, con su autor.",
        ],
      },
    ],
  },
];

const faqs: { q: string; a: string }[] = [
  { q: "No encuentro una junta que sé que existe.", a: "Pulse «Limpiar» para quitar filtros y revise que no esté archivada: el filtro de estado puede estar ocultándola. Pruebe buscando por código o NIT en vez del nombre." },
  { q: "No veo los botones para crear o editar.", a: "Su cuenta tiene el rol Consulta, que es de solo lectura. Si necesita editar, solicite el cambio de rol a un administrador." },
  { q: "No me deja crear un acta.", a: "Las actas solo se crean sobre reuniones en estado «finalizada». Verifique que la reunión haya terminado y que exista." },
  { q: "El archivo no se carga.", a: "Revise que sea PDF, imagen (JPG/PNG/WebP), Word o Excel y que pese menos del límite (10 MB por defecto). Comprima el PDF o la imagen si es necesario." },
  { q: "¿Puedo borrar una junta o un acta?", a: "No se elimina información: se archiva o se anula para conservar la trazabilidad. Esto protege la historia de cada junta." },
  { q: "¿Los datos que veo son reales?", a: "Si en la barra superior aparece «Datos de demostración», está en modo demo con información ficticia. En producción verá «Sesión segura»." },
  { q: "¿Por qué algunos documentos de identidad aparecen con puntos (••••)?", a: "Es una medida de privacidad: según la configuración, el rol Consulta ve el documento enmascarado." },
  { q: "La página se ve cortada o no carga.", a: "Actualice la página. Si aparece la pantalla «Sin conexión», revise su internet: la aplicación necesita conexión para consultar datos." },
];

const glossary: [string, string][] = [
  ["JAC", "Junta de Acción Comunal: organización comunitaria de un barrio o vereda."],
  ["Dignatario", "Persona que ocupa un cargo en la directiva de una JAC."],
  ["Personería jurídica", "Reconocimiento legal que permite a la JAC actuar como entidad."],
  ["NIT", "Número de identificación tributaria de la junta."],
  ["Convenio", "Acuerdo formal entre una JAC y otra entidad."],
  ["Acta", "Documento formal que registra lo tratado y decidido en una reunión."],
  ["Quórum", "Número mínimo de asistentes para que una reunión decida válidamente."],
  ["Compromiso", "Tarea asumida por una persona con fecha límite."],
  ["Completitud", "Porcentaje de campos de la ficha que ya están diligenciados."],
  ["CSV", "Archivo de datos tabulares que se abre con Excel o Google Sheets."],
  ["PWA", "Aplicación web que se puede instalar como app en el teléfono o computador."],
];

const checklist = [
  "Iniciar sesión y reconocer el menú lateral",
  "Buscar una junta por nombre y filtrarla por zona",
  "Abrir una ficha y revisar sus cuatro pestañas",
  "Exportar un listado a CSV",
  "Abrir una reunión y revisar su agenda",
  "Descargar un acta en PDF",
  "Generar un reporte e imprimirlo",
];

const entities = {
  junta: { label: "Junta (JAC)", states: ["activa", "inactiva", "archivada"] },
  convenio: { label: "Convenio", states: ["pendiente", "vigente", "suspendido", "finalizado"] },
  reunion: { label: "Reunión", states: ["borrador", "convocada", "en_curso", "finalizada", "cancelada"] },
  acta: { label: "Acta", states: ["borrador", "en_revision", "aprobada", "cerrada", "anulada"] },
  compromiso: { label: "Compromiso", states: ["pendiente", "en_curso", "bloqueado", "completado", "cancelado"] },
  actividad: { label: "Actividad", states: ["planeada", "en_ejecucion", "aplazada", "completada", "cancelada"] },
} as const;
type EntityKey = keyof typeof entities;

const meaning: Record<string, string> = {
  activa: "Opera con normalidad.",
  inactiva: "Existe pero está sin operación.",
  archivada: "Retirada de listados; conserva su historia.",
  pendiente: "Registrado, aún no inicia.",
  vigente: "Acuerdo en ejecución.",
  suspendido: "Detenido temporalmente.",
  finalizado: "Terminado.",
  borrador: "Se está preparando.",
  convocada: "Citada; se espera la fecha.",
  en_curso: "Se está realizando.",
  finalizada: "Ya ocurrió; permite redactar su acta.",
  cancelada: "No se realizará.",
  en_revision: "Esperando verificación.",
  aprobada: "Validada formalmente.",
  cerrada: "Definitiva; sin más cambios.",
  anulada: "Invalidada.",
  bloqueado: "Detenido por un impedimento.",
  completado: "Cumplido.",
  cancelado: "Descartado.",
  planeada: "Programada.",
  en_ejecucion: "Se está ejecutando.",
  aplazada: "Pospuesta.",
  completada: "Realizada.",
};

function StateSimulator() {
  const [entity, setEntity] = useState<EntityKey>("acta");
  const [current, setCurrent] = useState<string>("borrador");
  const [trail, setTrail] = useState<string[]>(["borrador"]);
  const def = entities[entity];
  const next = def.states.filter((s) => canTransition(entity, current, s));

  function pick(key: EntityKey) {
    setEntity(key);
    setCurrent(entities[key].states[0]);
    setTrail([entities[key].states[0]]);
  }
  function go(state: string) {
    setCurrent(state);
    setTrail((t) => [...t, state]);
  }

  return (
    <div className="manual-sim">
      <div className="manual-sim-head">
        <strong>Simulador de estados</strong>
        <span>Elija un tipo de registro y pulse los estados permitidos para recorrer su ciclo.</span>
      </div>
      <div className="manual-chips" role="tablist" aria-label="Tipo de registro">
        {(Object.keys(entities) as EntityKey[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={entity === key}
            className={`manual-chip ${entity === key ? "manual-chip-active" : ""}`}
            onClick={() => pick(key)}
          >
            {entities[key].label}
          </button>
        ))}
      </div>
      <div className="manual-sim-body">
        <div>
          <p className="manual-sim-label">Estado actual</p>
          <StatusBadge status={current} />
          <p className="manual-sim-meaning">{meaning[current]}</p>
        </div>
        <div>
          <p className="manual-sim-label">Puede pasar a</p>
          {next.length ? (
            <div className="manual-chips">
              {next.map((s) => (
                <button key={s} type="button" className="manual-chip" onClick={() => go(s)}>
                  <ArrowRight size={13} aria-hidden="true" /> {s.replaceAll("_", " ")}
                </button>
              ))}
            </div>
          ) : (
            <p className="manual-sim-meaning">Estado final: ya no admite cambios.</p>
          )}
        </div>
      </div>
      <div className="manual-trail" aria-live="polite">
        {trail.map((s, i) => (
          <span key={i}>
            {i > 0 && <ArrowRight size={12} aria-hidden="true" />}
            {s.replaceAll("_", " ")}
          </span>
        ))}
        {trail.length > 1 && (
          <button
            type="button"
            className="manual-reset"
            onClick={() => {
              setCurrent(def.states[0]);
              setTrail([def.states[0]]);
            }}
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "p":
      return <p>{block.text}</p>;
    case "steps":
      return (
        <ol className="manual-steps">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "list":
      return (
        <ul className="manual-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div className="manual-note manual-tip">
          <Lightbulb size={17} aria-hidden="true" />
          <p>{block.text}</p>
        </div>
      );
    case "warn":
      return (
        <div className="manual-note manual-warn">
          <AlertTriangle size={17} aria-hidden="true" />
          <p>{block.text}</p>
        </div>
      );
    case "table":
      return (
        <div className="manual-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i}>{i === 0 ? <strong>{cell}</strong> : cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

const STORAGE_KEY = "sijac-manual-checklist";
const progressListeners = new Set<() => void>();

function subscribeProgress(listener: () => void) {
  progressListeners.add(listener);
  return () => {
    progressListeners.delete(listener);
  };
}

function readProgress() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export function ManualClient({ initialRole }: { initialRole: View }) {
  const [view, setView] = useState<View>(initialRole);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(sections[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const saved = useSyncExternalStore(subscribeProgress, readProgress, () => "[]");
  const done = useMemo<number[]>(() => {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }, [saved]);

  function toggle(index: number) {
    const next = done.includes(index)
      ? done.filter((i) => i !== index)
      : [...done, index];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // El progreso es solo una comodidad; sin almacenamiento se ignora.
    }
    progressListeners.forEach((listener) => listener());
  }

  const normalized = query.trim().toLocaleLowerCase("es");
  const visible = useMemo(
    () =>
      sections.filter((section) => {
        if (section.editOnly && view === "consulta") return false;
        if (!normalized) return true;
        return JSON.stringify([section.title, section.summary, section.blocks])
          .toLocaleLowerCase("es")
          .includes(normalized);
      }),
    [normalized, view],
  );
  const filteredFaqs = faqs.filter(
    (f) => !normalized || `${f.q} ${f.a}`.toLocaleLowerCase("es").includes(normalized),
  );
  const filteredGlossary = glossary.filter(
    ([term, def]) => !normalized || `${term} ${def}`.toLocaleLowerCase("es").includes(normalized),
  );

  useEffect(() => {
    const targets = [...document.querySelectorAll<HTMLElement>("[data-manual-section]")];
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visible.length, view]);

  const progress = Math.round((done.length / checklist.length) * 100);
  const nothing = !visible.length && !filteredFaqs.length && !filteredGlossary.length;

  return (
    <div className="manual">
      <div className="manual-toolbar">
        <label className="search-field">
          <span className="sr-only">Buscar en el manual</span>
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en el manual: «acta», «CSV», «contraseña»…"
          />
          {query && (
            <button type="button" className="icon-button" aria-label="Borrar búsqueda" onClick={() => setQuery("")}>
              <X size={15} />
            </button>
          )}
        </label>
        <div className="manual-switch" role="group" aria-label="Ver el manual según mi rol">
          <button
            type="button"
            aria-pressed={view === "consulta"}
            className={view === "consulta" ? "manual-switch-active" : ""}
            onClick={() => setView("consulta")}
          >
            Consulta
          </button>
          <button
            type="button"
            aria-pressed={view === "edicion"}
            className={view === "edicion" ? "manual-switch-active" : ""}
            onClick={() => setView("edicion")}
          >
            Edición y administración
          </button>
        </div>
      </div>

      <div className="manual-layout">
        <aside className="manual-toc" aria-label="Contenido del manual">
          <p className="nav-label">Contenido</p>
          <ul>
            {visible.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={activeId === s.id ? "manual-toc-active" : ""}>
                  <s.icon size={15} aria-hidden="true" />
                  {s.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#faq">Preguntas frecuentes</a>
            </li>
            <li>
              <a href="#glosario">Glosario</a>
            </li>
          </ul>
        </aside>

        <div className="manual-content">
          {!query && (
            <section className="card card-padded manual-start" aria-labelledby="start-title">
              <div className="manual-start-head">
                <div>
                  <h2 id="start-title">Primeros pasos</h2>
                  <p>Marque lo que ya domina. Su avance se guarda en este navegador.</p>
                </div>
                <strong className="manual-progress-num">{progress}%</strong>
              </div>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <ul className="manual-checklist">
                {checklist.map((item, i) => (
                  <li key={item}>
                    <label>
                      <input type="checkbox" checked={done.includes(i)} onChange={() => toggle(i)} />
                      <span className="manual-check" aria-hidden="true">
                        <Check size={13} />
                      </span>
                      <span>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {progress === 100 && (
                <p className="manual-done">¡Listo! Ya domina lo esencial de SIJAC Aguadas.</p>
              )}
            </section>
          )}

          {view === "consulta" && !query && (
            <div className="manual-note manual-tip">
              <Lock size={17} aria-hidden="true" />
              <p>
                Está viendo la guía para el rol <strong>Consulta</strong> (solo lectura). Cambie a
                «Edición y administración» para ver cómo registrar y modificar información.
              </p>
            </div>
          )}

          {visible.map((section) => (
            <section
              key={section.id}
              id={section.id}
              data-manual-section
              className="card card-padded manual-section"
            >
              <header className="manual-section-head">
                <span className="report-icon">
                  <section.icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2>
                    {section.title}
                    {section.editOnly && <span className="manual-badge">Requiere permisos</span>}
                  </h2>
                  <p>{section.summary}</p>
                </div>
              </header>
              {section.blocks.map((block, i) => {
                if (block.edit && view === "consulta") return null;
                return (
                  <div key={i} className={block.edit ? "manual-edit" : undefined}>
                    {block.edit && <span className="manual-edit-tag">Con permisos de edición</span>}
                    <BlockView block={block} />
                  </div>
                );
              })}
              {section.id === "estados" && <StateSimulator />}
              {section.href && (
                <Link className="button button-secondary button-small manual-go" href={section.href}>
                  Ir al módulo <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </section>
          ))}

          {!!filteredFaqs.length && (
            <section id="faq" data-manual-section className="card card-padded manual-section">
              <header className="manual-section-head">
                <span className="report-icon">
                  <Settings size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2>Preguntas frecuentes</h2>
                  <p>Soluciones rápidas a las dudas más comunes.</p>
                </div>
              </header>
              <div className="manual-faq">
                {filteredFaqs.map((f, i) => {
                  const open = openFaq === i || !!normalized;
                  return (
                    <div key={f.q} className="manual-faq-item">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        {f.q}
                        <ChevronDown size={17} className={open ? "manual-rot" : ""} aria-hidden="true" />
                      </button>
                      {open && <p>{f.a}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {!!filteredGlossary.length && (
            <section id="glosario" data-manual-section className="card card-padded manual-section">
              <header className="manual-section-head">
                <span className="report-icon">
                  <BookOpenText size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2>Glosario</h2>
                  <p>Términos que encontrará en la aplicación.</p>
                </div>
              </header>
              <dl className="manual-glossary">
                {filteredGlossary.map(([term, def]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {nothing && (
            <div className="card card-padded manual-empty">
              <Search size={22} aria-hidden="true" />
              <h2>Sin resultados</h2>
              <p>No encontramos «{query}». Pruebe con otra palabra o borre la búsqueda.</p>
              <button className="button button-secondary" type="button" onClick={() => setQuery("")}>
                Ver todo el manual
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
