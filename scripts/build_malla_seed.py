"""Parse ULEAM malla PDFs and emit curriculum JSON + SQL seed."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).parent
OUT_JSON = ROOT / "malla-curriculum.json"
OUT_SQL = ROOT / "seed-carreras-materias.sql"

PDFS = {
    "agroindustrial": {
        "path": Path(r"c:\Users\joset\Downloads\mall CARRERA INGENIERIA AGROINDUSTRIAL.pdf"),
        "nombre": "Ingeniería Agroindustrial",
        "siglas": "IAgroind",
        "facultad": "Facultad de Ciencias Agropecuarias",
        "parser": "agroindustrial",
    },
    "agropecuaria": {
        "path": Path(r"c:\Users\joset\Downloads\malla CARRERA INGENIERÍA AGROPECUARIA.pdf"),
        "nombre": "Ingeniería Agropecuaria",
        "siglas": "IAgropec",
        "facultad": "Facultad de Ciencias Agropecuarias",
        "parser": "standard",
    },
    "agronegocios": {
        "path": Path(r"c:\Users\joset\Downloads\malla CARRERA AGRONEGOCIOS.pdf"),
        "nombre": "Agronegocios",
        "siglas": "AgNeg",
        "facultad": "Facultad de Ciencias Agropecuarias",
        "parser": "compact",
    },
}

SUBJECT_NAMES: dict[str, str] = {
    "AGRIND-101": "Química Inorgánica",
    "AGRIND-103": "Fundamentos de Física",
    "PAM-5202": "Metodología de la Investigación",
    "PAM-1202": "Cálculo Diferencial",
    "AGRIND-104": "Introducción a la Agroindustria",
    "9901V01-R22": "Cátedra Alfaro",
    "PAM-2501": "Química Orgánica",
    "PAM-2212.1": "Física",
    "PAM-1209": "Estadística",
    "PAM-1202.1": "Cálculo Integral",
    "PAM-2302": "Biología",
    "9901V02-R22": "Economía Global",
    "AGRIND-303": "Química Analítica",
    "AGRIND-304": "Termodinámica",
    "AGRIND-405": "Diseño Experimental",
    "PAM-1219": "Ecuaciones Diferenciales",
    "PAM-2414": "Microbiología",
    "9901V03-R22": "Innovación, Liderazgo y Emprendimiento",
    "AGRIND-305": "Análisis Instrumental",
    "AGRIND-501": "Cálculos de Ingeniería",
    "AGRIND-505": "Investigación Operativa",
    "AGRIND-404": "Bromatología",
    "AGRIND-502": "Biotecnología",
    "AGRIND-401A": "Química de los Alimentos",
    "AGRIND-402": "Nutrición",
    "AGRIND-701": "Transferencia de Calor",
    "AGRIND-803A": "Análisis Sensorial",
    "AGRIND-406": "Contabilidad",
    "AGRIND-504": "Poscosecha",
    "AGRIND-503": "Industrialización de Frutas y Hortalizas",
    "AGRIND-601": "Ingeniería de Materiales",
    "AGRIND-604": "Conservación y Procesamiento de Lácteos",
    "AGRIND-707": "Industrias Cárnicas",
    "AGRIND-607": "Industrias Pesqueras",
    "AGRIND-801": "Industrias de Granos y Cereales",
    "AGRIND-506": "Industrias de Bebidas",
    "AGRIND-603": "Industrias de Aceites y Grasas",
    "AGRIND-705": "Desarrollo y Evaluación de Productos",
    "AGRIND-904": "Diseño y Evaluación de Proyectos",
    "AGRIND-901": "Gestión de la Calidad",
    "AGRIND-703": "Gestión de Residuos y Subproductos",
    "AGRIND-802": "Prácticas Preprofesionales de Agroindustria",
    "AGRIND-803": "Comercialización Agroindustrial",
    "AGRIND-804A": "Gestión Ambiental",
    "PAM-6301.1": "Prácticas de Servicio Comunitario I",
    "PAM-6301.2": "Prácticas de Servicio Comunitario II",
    "AGRIND-1003": "Marco Legal Agroindustrial",
    "AGRIND-1007": "Proyecto Integrador Agroindustrial",
    "AGRIND-903": "Gestión de Residuos y Subproductos II",
    "AGR-101": "Biología",
    "AGR-102": "Química General",
    "AGR-103": "Matemática",
    "AGR-104": "Metodología de la Investigación",
    "AGR-105": "Introducción a las Ciencias Agropecuarias",
    "AGR-106": "Cátedra Alfaro",
    "AGR-201": "Botánica General",
    "AGR-202": "Química Orgánica",
    "AGR-203": "Física",
    "AGR-204": "Microbiología",
    "AGR-205": "Zoología General",
    "AGR-206": "Meteorología",
    "AGR-301": "Botánica Sistemática",
    "AGR-302": "Ciencias del Suelo",
    "AGR-303": "Topografía",
    "AGR-304": "Sanidad Vegetal",
    "AGR-305": "Anatomía y Fisiología Animal",
    "AGR-306": "Economía Global",
    "AGR-401": "Fitogenética y Mejoramiento",
    "AGR-402": "Construcciones Agropecuarias",
    "AGR-403": "Sistemas de Información Geográfica",
    "AGR-404": "Nutrición Vegetal",
    "AGR-405": "Sanidad Animal",
    "AGR-406": "Agroecología y Humedad de Suelos",
    "AGR-501": "Innovación, Liderazgo y Emprendimiento",
    "AGR-502": "Economía Agropecuaria",
    "AGR-503": "Sistemas de Riego y Drenaje",
    "AGR-504": "Agroforestería",
    "AGR-505": "Métodos Estadísticos y Experimental",
    "AGR-506": "Mecanización Agrícola",
    "AGR-601": "Fundamentos de la Agricultura",
    "AGR-602": "Agricultura de Precisión",
    "AGR-603": "Práctica Comunitaria SVCP-VIR001",
    "AGR-604": "Pastos y Forrajes",
    "AGR-605": "Sistemas de Ciclo Corto",
    "AGR-606": "Sistemas de Producción Perenne",
    "AGR-701": "Nutrición Animal",
    "AGR-702": "Producción Animal",
    "AGR-703": "Sistemas de Producción Apícola",
    "AGR-704": "Sistemas de Producción Avícola",
    "AGR-705": "Sistemas de Especies Menores",
    "AGR-706": "Sistemas de Producción Porcícola",
    "AGR-801": "Gestión Agropecuaria y Administrativa",
    "AGR-802": "Preparación y Presentación de Proyectos",
    "AGR-803": "Desarrollo Local",
    "AGR-804": "Biotecnología",
    "FIP-6302-1": "Prácticas Preprofesionales I",
    "FIP-6302-2": "Prácticas Preprofesionales II",
    "AGR-901": "Sociología Rural",
    "AGR-902": "Prácticas Preprofesionales Agropecuarias",
    "AGR-903": "Diseño y Evaluación de Proyectos",
    "AGR-904": "Marco Legal Agropecuario",
    "AGRN-101": "Biología",
    "AGRN-102": "Matemática",
    "AGRN-103": "Química",
    "AGRN-104": "Introducción a los Negocios Agrícolas",
    "INST-CAAL": "Cátedra Alfaro",
    "AGRN-106": "Investigación Aplicada a los Negocios Agrícolas",
    "AGRN-201": "Botánica",
    "AGRN-202": "Matemática Financiera",
    "AGRN-203": "Estadística",
    "INST-ECGL": "Economía Global",
    "AGRN-205": "Agricultura Alternativa y Colaborativa",
    "AGRN-206": "Ciencias del Suelo",
    "AGRN-301": "Contabilidad Agrícola",
    "AGRN-302": "Administración de la Producción",
    "AGRN-303": "Legislación y Política Nacional",
    "AGRN-304": "Sistemas Pecuarios y Acuicultura",
    "AGRN-305": "Sistemas de Producción Agrícola",
    "AGRN-306": "Optimización del Riego",
    "AGRN-401": "Contabilidad Financiera",
    "AGRN-402": "Teoría Macro y Microeconómica",
    "INST-INEL": "Emprendimiento, Innovación y Creatividad",
    "AGRN-404": "Biotecnología Agrícola",
    "AGRN-405": "Manejo Postcosecha",
    "AGRN-406": "Sistemas de Información Geográfica",
    "AGRN-501": "Economía Agrícola",
    "AGRN-502": "Prácticas Comunitarias de Servicio",
    "AGRN-503": "Inventarios y Cadena de Suministro",
    "AGRN-504": "Gerencia Financiera",
    "AGRN-505": "Sistemas Agroindustriales",
    "AGRN-506": "Agricultura de Precisión",
    "AGRN-601": "Economía Solidaria Popular",
    "AGRN-602": "Prácticas Comunitarias de Servicio II",
    "AGRN-603": "Bioproductos y Biocomercio",
    "AGRN-604": "Bioeconomía",
    "AGRN-605": "Técnicas de Negociación",
    "AGRN-606": "Desarrollo Territorial Rural",
    "AGRN-701": "Comercio Agroalimentario",
    "AGRN-702": "Prácticas Preprofesionales Agronegocios",
    "AGRN-703": "Clasificación y Normalización",
    "AGRN-704": "Comercio Agrícola Exterior",
    "AGRN-801": "Gestión Humana",
    "AGRN-802": "Prácticas Preprofesionales Agronegocios II",
    "AGRN-803": "Gerencia de Proyectos",
    "AGRN-804": "Sistemas Integrados de Gestión",
    "INST-UBSAR-6301.1": "Prácticas de Servicio Comunitario I",
    "INST-UBSAR-6301.2": "Prácticas de Servicio Comunitario II",
    "AGRN-901": "Marketing Agroalimentario",
    "AGRN-902": "Prácticas Preprofesionales Agronegocios III",
    "AGRN-903": "Gerencia de Proyectos II",
    "AGRN-904": "Sistemas Integrados de Gestión II",
}

# Horas verificadas manualmente desde las mallas PDF (ACD, APE, AA, Créditos)
AGROINDUSTRIAL_HOURS: dict[str, tuple[int, int, int, int]] = {
    "AGRIND-101": (64, 80, 0, 3),
    "AGRIND-103": (64, 80, 0, 3),
    "PAM-5202": (64, 32, 0, 2),
    "PAM-1202": (64, 80, 0, 3),
    "AGRIND-104": (64, 32, 0, 2),
    "9901V01-R22": (0, 0, 96, 2),
    "PAM-2501": (64, 80, 0, 3),
    "PAM-2212.1": (64, 80, 0, 3),
    "PAM-1209": (64, 32, 0, 2),
    "PAM-1202.1": (64, 80, 0, 3),
    "PAM-2302": (64, 32, 0, 2),
    "9901V02-R22": (0, 0, 96, 2),
    "AGRIND-303": (64, 32, 0, 2),
    "AGRIND-304": (48, 48, 0, 2),
    "AGRIND-405": (64, 32, 0, 2),
    "PAM-1219": (64, 80, 0, 3),
    "PAM-2414": (0, 80, 112, 4),
    "9901V03-R22": (0, 0, 96, 2),
    "AGRIND-305": (96, 48, 0, 3),
    "AGRIND-501": (48, 48, 0, 2),
    "AGRIND-505": (48, 96, 0, 3),
    "AGRIND-404": (32, 32, 32, 2),
    "AGRIND-502": (32, 32, 32, 2),
    "AGRIND-401A": (32, 32, 80, 3),
    "AGRIND-402": (48, 48, 0, 2),
    "AGRIND-701": (48, 48, 0, 2),
    "AGRIND-803A": (48, 96, 0, 3),
    "AGRIND-406": (48, 48, 0, 2),
    "AGRIND-504": (48, 16, 80, 3),
    "AGRIND-503": (32, 32, 80, 3),
    "AGRIND-601": (64, 32, 0, 2),
    "AGRIND-604": (32, 32, 32, 2),
    "AGRIND-707": (32, 32, 128, 4),
    "AGRIND-607": (48, 48, 0, 2),
    "AGRIND-801": (48, 48, 0, 2),
    "AGRIND-506": (48, 48, 0, 2),
    "AGRIND-603": (48, 48, 0, 2),
    "AGRIND-705": (48, 48, 0, 2),
    "AGRIND-904": (48, 48, 0, 2),
    "AGRIND-901": (96, 48, 0, 3),
    "AGRIND-703": (32, 32, 32, 2),
    "AGRIND-802": (144, 96, 0, 5),
    "AGRIND-803": (48, 48, 0, 2),
    "AGRIND-804A": (32, 32, 32, 2),
    "PAM-6301.1": (16, 16, 64, 2),
    "PAM-6301.2": (16, 16, 160, 4),
    "AGRIND-1003": (144, 96, 0, 5),
    "AGRIND-1007": (96, 48, 0, 3),
    "AGRIND-903": (96, 48, 0, 3),
}

AGROPECUARIA_EXTRA: dict[str, tuple[int, int, int, int]] = {
    "AGR-804": (48, 32, 16, 2),
    "FIP-6302-1": (16, 16, 160, 4),
    "AGR-901": (32, 32, 32, 2),
    "AGR-902": (48, 32, 16, 5),
    "AGR-903": (32, 32, 32, 2),
    "AGR-904": (48, 48, 48, 3),
    "FIP-6302-2": (16, 16, 160, 4),
}

AGRONEGOCIOS_EXTRA: dict[str, tuple[int, int, int, int]] = {
    "AGRN-502": (48, 32, 16, 2),
    "AGRN-503": (64, 32, 48, 3),
    "AGRN-504": (48, 32, 16, 2),
    "AGRN-505": (48, 48, 48, 3),
    "AGRN-506": (48, 32, 16, 2),
    "AGRN-601": (48, 32, 16, 2),
    "AGRN-602": (48, 48, 48, 4),
    "AGRN-603": (48, 48, 48, 3),
    "AGRN-604": (48, 16, 32, 2),
    "AGRN-605": (48, 32, 16, 2),
    "AGRN-606": (48, 16, 32, 2),
}

COD_RE = re.compile(r"COD:\s*([A-Z0-9.\-]+)")

STANDARD_RE = re.compile(
    r"A\s*(\d)\s*C\s*(\d)\s*D\s*A\s*(\d)\s*P\s*(\d)\s*E\s*A\s*(\d)\s*A\s*(\d)\s*Cr[eé]d\s*(\d+)",
    re.IGNORECASE,
)

COMPACT_RE = re.compile(r"(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+TOTAL\s+HRS", re.IGNORECASE)


def concat2(a: str, b: str) -> int:
    return int(f"{a}{b}")


def parse_standard(text: str) -> list[dict]:
    blocks = []
    for m in STANDARD_RE.finditer(text):
        acd = concat2(m.group(1), m.group(2))
        ape = concat2(m.group(3), m.group(4))
        aa = concat2(m.group(5), m.group(6))
        creditos = int(m.group(7))
        blocks.append({"acd": acd, "ape": ape, "aa": aa, "creditos": creditos, "horas": acd + ape + aa})
    return blocks


def parse_compact(text: str) -> list[dict]:
    matches: list[tuple[int, dict]] = []
    for m in COMPACT_RE.finditer(text):
        acd, ape, aa, creditos = map(int, m.groups())
        matches.append((m.start(), {"acd": acd, "ape": ape, "aa": aa, "creditos": creditos, "horas": acd + ape + aa}))
    for m in STANDARD_RE.finditer(text):
        acd = concat2(m.group(1), m.group(2))
        ape = concat2(m.group(3), m.group(4))
        aa = concat2(m.group(5), m.group(6))
        creditos = int(m.group(7))
        matches.append((m.start(), {"acd": acd, "ape": ape, "aa": aa, "creditos": creditos, "horas": acd + ape + aa}))
    matches.sort(key=lambda item: item[0])
    return [block for _, block in matches]


def block_from_tuple(values: tuple[int, int, int, int]) -> dict:
    acd, ape, aa, creditos = values
    return {"acd": acd, "ape": ape, "aa": aa, "creditos": creditos, "horas": acd + ape + aa}


def parse_career(key: str, meta: dict) -> dict:
    with pdfplumber.open(meta["path"]) as pdf:
        text = re.sub(r"\s+", " ", "\n".join((p.extract_text() or "") for p in pdf.pages))

    codes = COD_RE.findall(text)
    parser = meta["parser"]

    if parser == "agroindustrial":
        acd_blocks = [block_from_tuple(AGROINDUSTRIAL_HOURS[c]) for c in codes if c in AGROINDUSTRIAL_HOURS]
    elif parser == "compact":
        acd_blocks = parse_compact(text)
        if len(acd_blocks) < len(codes):
            acd_blocks = parse_standard(text) or acd_blocks
    else:
        acd_blocks = parse_standard(text)

    materias = []
    extra_maps = {
        "agroindustrial": AGROINDUSTRIAL_HOURS,
        "standard": AGROPECUARIA_EXTRA,
        "compact": AGRONEGOCIOS_EXTRA,
    }
    extra = extra_maps.get(parser, {})

    for idx, codigo in enumerate(codes):
        hours = acd_blocks[idx] if idx < len(acd_blocks) else block_from_tuple((0, 0, 0, 0))
        if codigo in extra:
            hours = block_from_tuple(extra[codigo])
        materias.append(
            {
                "codigo": codigo,
                "nombre": SUBJECT_NAMES.get(codigo, codigo),
                "nivel": min((idx // 6) + 1, 10),
                **hours,
            }
        )

    return {
        "key": key,
        "nombre": meta["nombre"],
        "siglas": meta["siglas"],
        "facultad": meta["facultad"],
        "materias": materias,
    }


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def build_sql(carreras: list[dict]) -> str:
    lines = [
        "-- Seed: 3 carreras ULEAM con mallas curriculares",
        "BEGIN;",
        "",
        "UPDATE perfiles SET \"carreraId\" = NULL WHERE \"carreraId\" IS NOT NULL;",
        "UPDATE proyectos_vinculacion SET \"carreraId\" = NULL WHERE \"carreraId\" IS NOT NULL;",
        "UPDATE proyectos_investigacion SET \"carreraId\" = NULL WHERE \"carreraId\" IS NOT NULL;",
        "UPDATE temas_titulacion SET \"carreraId\" = NULL WHERE \"carreraId\" IS NOT NULL;",
        "UPDATE laboratorios SET \"carreraId\" = NULL WHERE \"carreraId\" IS NOT NULL;",
        "UPDATE practicas SET \"carreraId\" = NULL, \"materiaId\" = NULL WHERE \"carreraId\" IS NOT NULL OR \"materiaId\" IS NOT NULL;",
        "DELETE FROM matriculas;",
        "DELETE FROM faltas;",
        "DELETE FROM silabos;",
        "DELETE FROM informes;",
        "DELETE FROM materias;",
        "DELETE FROM carreras;",
        "ALTER SEQUENCE carreras_id_seq RESTART WITH 1;",
        "ALTER SEQUENCE materias_id_seq RESTART WITH 1;",
        "",
    ]

    for carrera in carreras:
        lines.append(
            "INSERT INTO carreras (nombre, siglas, facultad, coordinador, activa) VALUES "
            f"('{sql_escape(carrera['nombre'])}', '{sql_escape(carrera['siglas'])}', "
            f"'{sql_escape(carrera['facultad'])}', 'Por asignar', TRUE);"
        )

    lines.append("")
    for carrera_idx, carrera in enumerate(carreras, start=1):
        for materia in carrera["materias"]:
            lines.append(
                "INSERT INTO materias (\"carreraId\", nombre, codigo, creditos, nivel, acd, ape, aa, horas, activa) VALUES "
                f"({carrera_idx}, '{sql_escape(materia['nombre'])}', '{sql_escape(materia['codigo'])}', "
                f"{materia['creditos']}, {materia['nivel']}, {materia['acd']}, {materia['ape']}, "
                f"{materia['aa']}, {materia['horas']}, TRUE);"
            )

    lines.extend(["", "COMMIT;", ""])
    return "\n".join(lines)


def main() -> None:
    carreras = [parse_career(key, meta) for key, meta in PDFS.items()]
    OUT_JSON.write_text(json.dumps(carreras, indent=2, ensure_ascii=False), encoding="utf-8")
    OUT_SQL.write_text(build_sql(carreras), encoding="utf-8")

    lib_data = ROOT.parent / "lib" / "data" / "malla-curriculum.json"
    lib_data.parent.mkdir(parents=True, exist_ok=True)
    lib_data.write_text(json.dumps(carreras, indent=2, ensure_ascii=False), encoding="utf-8")

    for c in carreras:
        missing = [m for m in c["materias"] if m["horas"] == 0]
        print(f"{c['nombre']}: {len(c['materias'])} materias ({len(missing)} sin horas)")
    print(f"JSON -> {OUT_JSON}")
    print(f"SQL  -> {OUT_SQL}")


if __name__ == "__main__":
    main()
