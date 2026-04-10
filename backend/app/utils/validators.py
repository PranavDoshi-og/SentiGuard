"""
SentiGuard - URL Validator
"""

import re
import urllib.parse


URL_REGEX = re.compile(
    r'^(https?://)'                         # scheme
    r'([a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=%]+)'  # rest
    r'$'
)


def is_valid_url(url: str) -> bool:
    """
    Basic URL validation. Accepts http and https URLs.
    Does NOT make a network request.
    """
    if not url or len(url) > 2048:
        return False
    try:
        parsed = urllib.parse.urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False
