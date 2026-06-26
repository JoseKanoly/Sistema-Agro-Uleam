"""Extract career curriculum data from ULEAM malla PDFs."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber

PDFS = {
    "agroindustrial": Path(r"c:\Users\joset\Downloads\mall CARRERA INGENIERIA AGROINDUSTRIAL.pdf"),
    "agropecuaria": Path(r"c:\Users\joset\Downloads\malla CARRERA INGENIERÍA AGROPECUARIA.pdf"),
    "agronegocios": Path(r"c:\Users\joset\Downloads\malla CARRERA AGRONEGOCIOS.pdf"),
}

COD_RE = re.compile(r"COD:\s*([A-Z0-9.\-]+)")
ACD_LINE_RE = re.compile(
    r"A\s*(\d+)\s*C\s*(\d+)\s*D\s*A\s*(\d+)\s*P\s*E\s*(\d+)\s*A\s*A\s*(\d+)\s*Cr[eé]d\s*(\d+)\s*itos",
    re.IGNORECASE,
)


def normalize_text(text: str) -> str:
    text = text.replace("\u00ad", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_codes(text: str) -> list[str]:
    return COD_RE.findall(text)


def extract_acd_blocks(text: str) -> list[dict]:
    blocks = []
    for m in ACD_LINE_RE.finditer(text):
        blocks.append(
            {
                "acd": int(m.group(1) + m.group(2)),
                "ape": int(m.group(3) + m.group(4)),
                "aa": int(m.group(5)),
                "creditos": int(m.group(6)),
            }
        )
    return blocks


def main() -> None:
    out_dir = Path(__file__).parent / "malla_data"
    out_dir.mkdir(exist_ok=True)

    summary = {}
    for key, path in PDFS.items():
        if not path.exists():
            print(f"Missing: {path}")
            continue
        with pdfplumber.open(path) as pdf:
            text = normalize_text("\n".join((p.extract_text() or "") for p in pdf.pages))
        codes = extract_codes(text)
        acd_blocks = extract_acd_blocks(text)
        (out_dir / f"{key}.txt").write_text(text, encoding="utf-8")
        summary[key] = {"codes": len(codes), "acd_blocks": len(acd_blocks), "codes_list": codes[:20]}
        print(f"\n=== {key.upper()} ===")
        print(f"Codes found: {len(codes)}")
        print(f"ACD blocks found: {len(acd_blocks)}")
        print("First 15 codes:", codes[:15])
        print("First 5 ACD blocks:", acd_blocks[:5])

    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
