from __future__ import annotations

from flask import Blueprint, jsonify

from src.shared.errors import NotImplementedErrorApi


api = Blueprint("api", __name__)


@api.get("/health")
def health_check():
    return jsonify({"data": {"status": "ok"}})


@api.get("/api/v1/courses/search")
def search_courses_v1():
    raise NotImplementedErrorApi("Course search slice is not implemented yet")


@api.get("/search")
def search_courses_alias():
    raise NotImplementedErrorApi("Course search slice is not implemented yet")


def register_routes(app) -> None:
    app.register_blueprint(api)