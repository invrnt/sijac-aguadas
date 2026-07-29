import Link from "next/link";

export const metadata = { title: "Tratamiento de datos" };

export default function PrivacyPage() {
  return (
    <main id="contenido-principal" className="legal-page">
      <article>
        <p className="eyebrow">Uso institucional</p>
        <h1>Aviso de tratamiento de datos</h1>
        <p className="lead">
          SIJAC Aguadas almacena únicamente la información necesaria para la
          gestión institucional de las Juntas de Acción Comunal.
        </p>
        <h2>Finalidad</h2>
        <p>
          Los datos se utilizan para mantener fichas institucionales, gestionar
          procesos comunitarios, elaborar reportes autorizados y conservar
          trazabilidad administrativa.
        </p>
        <h2>Información restringida</h2>
        <p>
          Los documentos de identidad, datos de contacto y archivos privados
          solo pueden ser consultados por perfiles autorizados. Las descargas
          usan enlaces temporales y las acciones sensibles quedan auditadas.
        </p>
        <h2>Corrección y soporte</h2>
        <p>
          Las solicitudes de corrección deben dirigirse a la Oficina de
          Desarrollo Comunitario de la Alcaldía de Aguadas. La configuración
          productiva debe completar los datos oficiales del responsable del
          tratamiento antes de la puesta en servicio.
        </p>
        <Link className="button button-secondary" href="/">
          Volver al inicio
        </Link>
      </article>
    </main>
  );
}
