import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { getMinuteBundle } from "@/lib/queries";

function wrap(text: string, max = 88) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > max) {
      if (line) lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeApi("reports.read");
  if (authorization.response) return authorization.response;
  const bundle = await getMinuteBundle((await context.params).id);
  if (!bundle)
    return NextResponse.json({ error: "Acta no encontrada." }, { status: 404 });

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  let y = 740;

  function addLine(text: string, size = 10, isBold = false, gap = 15) {
    if (y < 70) {
      page = pdf.addPage([612, 792]);
      y = 740;
    }
    page.drawText(text, {
      x: 54,
      y,
      size,
      font: isBold ? bold : regular,
      color: rgb(0.09, 0.25, 0.21),
    });
    y -= gap;
  }

  addLine("ALCALDÍA DE AGUADAS", 9, true, 18);
  addLine("SIJAC AGUADAS", 18, true, 25);
  addLine(
    `ACTA ${bundle.minute.number} DE ${bundle.minute.year}`,
    15,
    true,
    24,
  );
  addLine(bundle.minute.juntaName, 11, true, 20);
  addLine(
    `Reunión: ${bundle.meeting.title} · ${new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      dateStyle: "long",
    }).format(new Date(bundle.meeting.startsAt))}`,
    9,
    false,
    17,
  );
  addLine(`Lugar: ${bundle.meeting.location}`, 9, false, 24);

  if (bundle.minute.summary) {
    addLine("RESUMEN", 11, true, 18);
    for (const line of wrap(bundle.minute.summary)) addLine(line);
    y -= 8;
  }

  for (const section of bundle.sections) {
    addLine(
      `${section.position}. ${section.heading.toLocaleUpperCase("es")}`,
      11,
      true,
      18,
    );
    for (const line of wrap(section.content)) addLine(line);
    y -= 9;
  }

  if (bundle.decisions.length) {
    addLine("DECISIONES", 11, true, 18);
    for (const [index, decision] of bundle.decisions.entries()) {
      for (const line of wrap(`${index + 1}. ${decision.description}`)) addLine(line);
    }
  }

  y -= 24;
  addLine("Documento generado por SIJAC Aguadas.", 8);
  addLine(
    `Fecha de consulta: ${new Intl.DateTimeFormat("es-CO", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(new Date())}`,
    8,
  );

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="acta-${bundle.minute.number}-${bundle.minute.year}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
