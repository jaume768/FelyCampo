import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_liveness_ok_without_touching_db(django_assert_num_queries):
    # Liveness no debe consultar la base de datos.
    with django_assert_num_queries(0):
        response = APIClient().get("/api/v1/health/live/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.django_db
def test_readiness_ok():
    response = APIClient().get("/api/v1/health/ready/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


@pytest.mark.django_db
def test_health_alias_matches_readiness():
    response = APIClient().get("/api/v1/health/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


@pytest.mark.django_db
def test_schema_is_served():
    response = APIClient().get("/api/v1/schema/")

    assert response.status_code == 200
