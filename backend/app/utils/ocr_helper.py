"""
SentiGuard - OCR Helper Utility
────────────────────────────────
Provides robust, multi-strategy Optical Character Recognition:
1. Tesseract OCR (via pytesseract with automatic Windows search paths)
2. Windows Native OCR (Windows.Media.Ocr.OcrEngine via lightweight runner)
3. Graceful fallback with clear diagnostic logging
"""

import os
import re
import subprocess
import tempfile
from typing import Any
from PIL import Image, ImageOps, ImageEnhance

try:
    import pytesseract
except ImportError:
    pytesseract = None

from app.utils.logger import setup_logger

logger = setup_logger("sentiguard.utils.ocr")

TESSERACT_SEARCH_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
    os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe"),
]

# Cache to avoid re-running checks repeatedly
_TESSERACT_FOUND = None


def normalize_ocr_text(text: str) -> str:
    """Cleans up common optical character recognition anomalies."""
    if not text:
        return ""
    # Fix broken URL schemes caused by OCR font confusion
    t = re.sub(r'(?i)https?[l|:;,\s]+[/\\]+', 'https://', text)
    t = re.sub(r'(?i)httpü', 'http://', t)
    t = re.sub(r'(?i)httpsü', 'https://', t)
    t = re.sub(r'(?i)hxxps?://', 'https://', t)
    # Fix separated domain TLDs caused by OCR kerning
    t = re.sub(r'\s*\.\s*(com|xyz|org|net|io|top|site|info|online|co|us|biz)\b', r'.\1', t, flags=re.IGNORECASE)
    return t.strip()


def preprocess_image_for_ocr(image_path: str) -> str:
    """
    Normalizes, sharpens, and upscales small/low-resolution images
    for dramatically higher OCR recognition accuracy.
    """
    try:
        with Image.open(image_path) as img:
            w, h = img.size
            scale = 1.0
            if max(w, h) < 1600 or min(w, h) < 600:
                scale = max(1.5, min(3.0, 1600.0 / max(w, h, 1)))

            new_w, new_h = int(w * scale), int(h * scale)
            processed = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            processed = ImageOps.grayscale(processed)
            processed = ImageEnhance.Contrast(processed).enhance(1.6)

            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            processed.save(tmp.name, format="PNG")
            return tmp.name
    except Exception as e:
        logger.warning(f"Image preprocessing for OCR failed: {e}")
        return image_path


def get_tesseract_cmd() -> str | None:
    global _TESSERACT_FOUND
    if _TESSERACT_FOUND is not None:
        return _TESSERACT_FOUND

    if pytesseract is None:
        _TESSERACT_FOUND = None
        return None

    # Test default command
    try:
        pytesseract.get_tesseract_version()
        _TESSERACT_FOUND = "tesseract"
        return "tesseract"
    except Exception:
        pass

    # Search common paths
    for path in TESSERACT_SEARCH_PATHS:
        if os.path.isfile(path):
            pytesseract.pytesseract.tesseract_cmd = path
            try:
                pytesseract.get_tesseract_version()
                _TESSERACT_FOUND = path
                logger.info(f"Configured Tesseract binary at: {path}")
                return path
            except Exception:
                continue

    _TESSERACT_FOUND = None
    return None


def run_windows_native_ocr(image_path: str) -> str:
    """Invokes Windows 10/11 native Windows.Media.Ocr engine via PowerShell."""
    abs_path = os.path.abspath(image_path).replace("'", "''")
    ps_script = f"""
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {{ $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' }}[0]
    function Await($WinRtTask, $ResultType) {{
        $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
        $netTask = $asTask.Invoke($null, @($WinRtTask))
        $netTask.Wait(-1) | Out-Null
        $netTask.Result
    }}
    [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
    [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
    [Windows.Media.Ocr.OcrEngine, Windows.Foundation.UniversalApiContract, ContentType = WindowsRuntime] | Out-Null

    $fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync('{abs_path}')
    $file = Await $fileTask ([Windows.Storage.StorageFile])
    $streamTask = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = Await $streamTask ([Windows.Storage.Streams.IRandomAccessStream])
    $decoderTask = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = Await $decoderTask ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmapTask = $decoder.GetSoftwareBitmapAsync()
    $bitmap = Await $bitmapTask ([Windows.Graphics.Imaging.SoftwareBitmap])
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if ($engine) {{
        $ocrTask = $engine.RecognizeAsync($bitmap)
        $result = Await $ocrTask ([Windows.Media.Ocr.OcrResult])
        foreach ($line in $result.Lines) {{
            Write-Output $line.Text
        }}
    }}
    """
    try:
        proc = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_script],
            capture_output=True,
            text=True,
            timeout=15
        )
        if proc.returncode == 0:
            return normalize_ocr_text(proc.stdout)
        else:
            logger.warning(f"Windows OCR returned non-zero code {proc.returncode}: {proc.stderr}")
            return ""
    except Exception as e:
        logger.warning(f"Windows OCR invocation failed: {e}")
        return ""


def extract_text_from_image(image_path: str) -> dict[str, Any]:
    """
    Extracts text from an image using the best available engine:
    1. Preprocesses & enhances image (upscale + contrast) for high fidelity
    2. Tesseract OCR (if available)
    3. Windows Native OCR (Windows.Media.Ocr)
    4. Fallback
    """
    enhanced_path = preprocess_image_for_ocr(image_path)
    cleanup_needed = enhanced_path != image_path

    try:
        # 1. Try Tesseract
        tess_cmd = get_tesseract_cmd()
        if tess_cmd:
            try:
                with Image.open(enhanced_path) as img:
                    gray = img.convert("L")
                    text = pytesseract.image_to_string(gray).strip()
                    if text:
                        return {
                            "text": normalize_ocr_text(text),
                            "engine": f"Tesseract OCR ({tess_cmd})",
                            "ocr_available": True
                        }
            except Exception as e:
                logger.warning(f"Tesseract extraction error: {e}")

        # 2. Try Windows Native OCR
        if os.name == "nt":
            native_text = run_windows_native_ocr(enhanced_path)
            if not native_text and enhanced_path != image_path:
                # Retry on raw file if enhanced returned nothing
                native_text = run_windows_native_ocr(image_path)
            if native_text:
                return {
                    "text": normalize_ocr_text(native_text),
                    "engine": "Windows Native OCR (Windows.Media.Ocr)",
                    "ocr_available": True
                }

        # 3. No OCR engine available
        return {
            "text": "",
            "engine": "None",
            "ocr_available": False,
            "reason": "Neither Tesseract binary nor Windows Media OCR produced text"
        }
    finally:
        if cleanup_needed and os.path.exists(enhanced_path):
            try:
                os.unlink(enhanced_path)
            except Exception:
                pass

