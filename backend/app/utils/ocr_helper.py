"""
SentiGuard - OCR Helper Utility
────────────────────────────────
Provides robust, multi-strategy Optical Character Recognition:
1. Tesseract OCR (via pytesseract with automatic Windows search paths)
2. Windows Native OCR (Windows.Media.Ocr.OcrEngine via lightweight runner)
3. Graceful fallback with clear diagnostic logging
"""

import os
import subprocess
import tempfile
from typing import Any
from PIL import Image

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
            timeout=8
        )
        if proc.returncode == 0:
            return proc.stdout.strip()
        else:
            logger.warning(f"Windows OCR returned non-zero code {proc.returncode}: {proc.stderr}")
            return ""
    except Exception as e:
        logger.warning(f"Windows OCR invocation failed: {e}")
        return ""


def extract_text_from_image(image_path: str) -> dict[str, Any]:
    """
    Extracts text from an image using the best available engine:
    1. Tesseract OCR (if available)
    2. Windows Native OCR (Windows.Media.Ocr)
    3. Fallback
    """
    # 1. Try Tesseract
    tess_cmd = get_tesseract_cmd()
    if tess_cmd:
        try:
            with Image.open(image_path) as img:
                gray = img.convert("L")
                text = pytesseract.image_to_string(gray).strip()
                if text:
                    return {
                        "text": text,
                        "engine": f"Tesseract OCR ({tess_cmd})",
                        "ocr_available": True
                    }
        except Exception as e:
            logger.warning(f"Tesseract extraction error: {e}")

    # 2. Try Windows Native OCR
    if os.name == "nt":
        native_text = run_windows_native_ocr(image_path)
        if native_text:
            return {
                "text": native_text,
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

