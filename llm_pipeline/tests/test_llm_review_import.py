"""Smoke tests for the llm_review module."""

from pathlib import Path
import sys


def test_llm_review_can_be_imported():
    import importlib

    package_root = Path(__file__).resolve().parent.parent
    package_root_str = str(package_root)
    if package_root_str not in sys.path:
        sys.path.insert(0, package_root_str)

    module = importlib.import_module("llm_review")

    assert module.check_ready()
