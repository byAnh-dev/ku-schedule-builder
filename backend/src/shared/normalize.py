from __future__ import annotations

import re
from typing import Any, Mapping


_EMPTY_MARKERS = {"", "N/A", "NA", "NONE", "NULL"}


def normalize_text(value: Any) -> str | None:
    """Return trimmed text or None for empty/N-A style values."""
    if value is None:
        return None

    text = str(value).strip()
    if not text:
        return None

    if text.upper() in _EMPTY_MARKERS:
        return None

    return text


def normalize_course_code(raw_code: str | None) -> str:
    """Normalize course code while preserving subject/number shape expected by the frontend."""
    text = normalize_text(raw_code)
    if not text:
        return ""

    collapsed = re.sub(r"\s+", " ", text)
    match = re.match(r"^(?P<subject>[A-Za-z&]+)\s+(?P<number>[0-9]+[A-Za-z]?)$", collapsed)
    if not match:
        return collapsed.upper()

    subject = match.group("subject").upper()
    number = match.group("number")
    return f"{subject} {number}"


def normalize_course_row(row: Mapping[str, Any]) -> dict[str, Any]:
    """Map heterogeneous source keys into canonical camelCase backend fields."""
    course_code = normalize_course_code(row.get("courseCode") or row.get("CourseCode"))

    return {
        "courseCode": course_code,
        "courseName": normalize_text(row.get("courseName") or row.get("CourseName")),
        "seatAvailable": normalize_text(row.get("seatAvailable") or row.get("SeatAvailable")),
        "professor": normalize_text(row.get("professor") or row.get("Professor") or row.get("Instructor")),
        "prerequisite": normalize_text(row.get("prerequisite") or row.get("Prerequisite")),
        "sections": row.get("sections") or row.get("Sections") or {},
    }