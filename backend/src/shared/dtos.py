from __future__ import annotations

from typing import Any, NotRequired, TypedDict


class CourseSearchItemDTO(TypedDict):
    courseCode: str
    courseName: str
    seatAvailable: str | int
    professor: str | None
    prerequisite: str | None
    sections: NotRequired[Any]


class ErrorDetailDTO(TypedDict):
    field: str
    issue: str


class ErrorBodyDTO(TypedDict):
    code: str
    message: str
    details: NotRequired[list[ErrorDetailDTO]]
    requestId: NotRequired[str]


class ErrorResponseDTO(TypedDict):
    error: ErrorBodyDTO


class SuccessResponseDTO(TypedDict):
    data: Any
    meta: NotRequired[dict[str, Any]]