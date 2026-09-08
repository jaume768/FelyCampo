import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    """
    Los contadores del throttling viven en la caché y son globales por IP. Sin limpiarlos,
    un test consumiría el cupo del siguiente y los fallos dependerían del orden.
    """
    cache.clear()
    yield
    cache.clear()
