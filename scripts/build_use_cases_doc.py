from pathlib import Path
import re

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "CASOS_DE_USO.md"
OUTPUT = ROOT / "docs" / "SIJAC_Aguadas_Casos_de_Uso.docx"

EMERALD = "176B50"
EMERALD_DARK = "164D3C"
GOLD = "B88927"
INK = "26372F"
MUTED = "66756E"
LIGHT = "EDF3EF"
WHITE = "FFFFFF"
USABLE_DXA = 9360


def set_font(run, size=None, color=INK, bold=None, italic=None, name="Calibri"):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    if size:
        run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=100, start=120, bottom=100, end=120):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for edge, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{edge}"))
        if node is None:
            node = OxmlElement(f"w:{edge}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_table_geometry(table, widths):
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr
    layout = tbl_pr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tbl_pr.append(layout)
    layout.set(qn("w:type"), "fixed")
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(sum(widths)))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = OxmlElement("w:tblInd")
    tbl_ind.set(qn("w:w"), "120")
    tbl_ind.set(qn("w:type"), "dxa")
    tbl_pr.append(tbl_ind)
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            tc_w = cell._tc.get_or_add_tcPr().find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                cell._tc.get_or_add_tcPr().append(tc_w)
            tc_w.set(qn("w:w"), str(widths[idx]))
            tc_w.set(qn("w:type"), "dxa")
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def add_page_field(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Página ")
    set_font(run, size=9, color=MUTED)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    paragraph._p.append(fld)


def configure_document(doc):
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.right_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(11)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25

    tokens = {
        "Heading 1": (16, EMERALD_DARK, 18, 10),
        "Heading 2": (13, EMERALD, 14, 7),
        "Heading 3": (12, EMERALD_DARK, 10, 5),
    }
    for style_name, (size, color, before, after) in tokens.items():
        style = doc.styles[style_name]
        style.font.name = "Calibri"
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(color)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True

    for style_name in ("List Bullet", "List Number"):
        style = doc.styles[style_name]
        style.font.name = "Calibri"
        style.font.size = Pt(11)
        style.paragraph_format.left_indent = Inches(0.375)
        style.paragraph_format.first_line_indent = Inches(-0.188)
        style.paragraph_format.space_after = Pt(4)
        style.paragraph_format.line_spacing = 1.25

    header = section.header.paragraphs[0]
    header.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = header.add_run("SIJAC AGUADAS  |  CATÁLOGO DE CASOS DE USO")
    set_font(run, size=8.5, color=MUTED, bold=True)
    add_page_field(section.footer.paragraphs[0])


def add_cover(doc):
    doc.add_paragraph().paragraph_format.space_after = Pt(84)
    kicker = doc.add_paragraph()
    kicker.alignment = WD_ALIGN_PARAGRAPH.CENTER
    kicker.paragraph_format.space_after = Pt(18)
    set_font(kicker.add_run("GUÍA FUNCIONAL"), size=11, color=GOLD, bold=True)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(8)
    set_font(title.add_run("SIJAC Aguadas"), size=30, color=EMERALD_DARK, bold=True)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.paragraph_format.space_after = Pt(24)
    set_font(
        subtitle.add_run("Catálogo de funcionalidades y casos de uso"),
        size=15,
        color=EMERALD,
    )

    lead = doc.add_paragraph()
    lead.alignment = WD_ALIGN_PARAGRAPH.CENTER
    lead.paragraph_format.space_after = Pt(108)
    set_font(
        lead.add_run(
            "Sistema de Información de Juntas de Acción Comunal de Aguadas"
        ),
        size=11,
        color=MUTED,
        italic=True,
    )

    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_font(meta.add_run("Aguadas, Caldas · Julio de 2026"), size=10, color=GOLD, bold=True)
    doc.add_page_break()


def add_markdown_paragraph(doc, line):
    p = doc.add_paragraph()
    for part in re.split(r"(\*\*.*?\*\*)", line):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            run = p.add_run(part[2:-2])
            set_font(run, bold=True)
        else:
            set_font(p.add_run(part))
    return p


def add_table(doc, rows):
    table = doc.add_table(rows=len(rows), cols=len(rows[0]))
    table.style = "Table Grid"
    if len(rows[0]) == 2:
        widths = [2700, 6660]
    elif len(rows[0]) == 4:
        widths = [3960, 1800, 1800, 1800]
    else:
        base = USABLE_DXA // len(rows[0])
        widths = [base] * len(rows[0])
        widths[-1] += USABLE_DXA - sum(widths)
    for r_idx, values in enumerate(rows):
        for c_idx, value in enumerate(values):
            cell = table.cell(r_idx, c_idx)
            cell.text = ""
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            if c_idx > 0 and len(rows[0]) > 2:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(value)
            set_font(
                run,
                size=9.5,
                color=WHITE if r_idx == 0 else INK,
                bold=r_idx == 0,
            )
            if r_idx == 0:
                set_cell_shading(cell, EMERALD_DARK)
            elif r_idx % 2 == 0:
                set_cell_shading(cell, LIGHT)
    set_repeat_table_header(table.rows[0])
    set_table_geometry(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def build():
    doc = Document()
    configure_document(doc)
    add_cover(doc)
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    start = next(i for i, line in enumerate(lines) if line == "## 1. Propósito")
    i = start
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                values = [v.strip() for v in lines[i].strip().strip("|").split("|")]
                if not all(set(v) <= {"-", ":"} for v in values):
                    rows.append(values)
                i += 1
            add_table(doc, rows)
            continue
        if line.startswith("### "):
            p = doc.add_paragraph(line[4:], style="Heading 2")
            p.paragraph_format.keep_with_next = True
        elif line.startswith("## "):
            p = doc.add_paragraph(line[3:], style="Heading 1")
            if line != "## 1. Propósito":
                p.paragraph_format.page_break_before = True
        elif re.match(r"^\d+\.\s", line):
            p = doc.add_paragraph(re.sub(r"^\d+\.\s", "", line), style="List Number")
            p.paragraph_format.keep_together = True
        elif line.startswith("- "):
            p = doc.add_paragraph(line[2:], style="List Bullet")
            p.paragraph_format.keep_together = True
        else:
            p = add_markdown_paragraph(doc, line)
            if line.startswith("**"):
                p.paragraph_format.keep_with_next = True
        i += 1

    core = doc.core_properties
    core.title = "SIJAC Aguadas - Catálogo de funcionalidades y casos de uso"
    core.subject = "Casos de uso de la aplicación SIJAC Aguadas"
    core.author = "SIJAC Aguadas"
    core.keywords = "SIJAC, Aguadas, Juntas de Acción Comunal, casos de uso"
    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build()
