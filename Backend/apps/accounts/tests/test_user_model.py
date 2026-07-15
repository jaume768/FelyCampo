import uuid

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


@pytest.mark.django_db
def test_create_user_uses_email_and_hashes_password():
    user = User.objects.create_user(email="Ana@Example.com", password="s3cret-pass")

    assert user.email == "Ana@example.com"  # dominio normalizado
    assert user.check_password("s3cret-pass")
    assert user.is_active is True
    assert user.is_staff is False
    assert user.is_superuser is False


@pytest.mark.django_db
def test_user_pk_is_uuid():
    user = User.objects.create_user(email="uuid@example.com", password="x")

    assert isinstance(user.pk, uuid.UUID)


@pytest.mark.django_db
def test_create_superuser_flags():
    admin = User.objects.create_superuser(email="admin@example.com", password="x")

    assert admin.is_staff is True
    assert admin.is_superuser is True


@pytest.mark.django_db
def test_create_user_without_email_fails():
    with pytest.raises(ValueError):
        User.objects.create_user(email="", password="x")


@pytest.mark.django_db
def test_email_is_unique():
    User.objects.create_user(email="dup@example.com", password="x")
    with pytest.raises(IntegrityError):
        User.objects.create_user(email="dup@example.com", password="y")
