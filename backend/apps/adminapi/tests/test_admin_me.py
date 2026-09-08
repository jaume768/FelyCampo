import pytest
from rest_framework.test import APIClient

URL = "/api/v1/admin/me/"


@pytest.mark.django_db
def test_anonimo_403():
    response = APIClient().get(URL)

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "not_authenticated"


@pytest.mark.django_db
def test_cliente_no_staff_403(django_user_model):
    user = django_user_model.objects.create_user(email="clienta@felycampo.test", password="x")
    client = APIClient()
    client.force_authenticate(user)

    response = client.get(URL)

    assert response.status_code == 403


@pytest.mark.django_db
def test_staff_200_con_sus_datos(django_user_model):
    staff = django_user_model.objects.create_user(
        email="staff@felycampo.test", password="x", is_staff=True, first_name="Ana"
    )
    client = APIClient()
    client.force_authenticate(staff)

    response = client.get(URL)

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "staff@felycampo.test"
    assert data["is_staff"] is True
    assert data["first_name"] == "Ana"
