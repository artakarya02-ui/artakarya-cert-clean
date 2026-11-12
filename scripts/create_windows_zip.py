#!/usr/bin/env python3
"""
ARTAKARYA CERTIFICATE SYSTEM - PRODUCTION WINDOWS-COMPATIBLE ZIP PACKAGER
Generates ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip with 100% Windows File Explorer
compatibility:
- Explicit directory entries in hierarchical order before child files
- Standard MS-DOS attributes: 0x10 (directory), 0x20 (archive file)
- PKZIP 2.0 specification (no Zip64, standard Deflate)
- Clean relative paths without leading slashes or dots
- Universal extraction on Windows 10/11 Explorer, macOS, and Linux
"""

import os
import sys
import zipfile
import shutil
import tempfile

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ZIP_OUTPUT_NAME = 'ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip'
ZIP_OUTPUT_PATH = os.path.join(BASE_DIR, ZIP_OUTPUT_NAME)
PUBLIC_ZIP_PATH = os.path.join(BASE_DIR, 'public', ZIP_OUTPUT_NAME)

FIXED_DATETIME = (2026, 11, 7, 10, 0, 0)

EXCLUDE_DIRS = {'.git', '.aistudio', 'node_modules', '.cache', '__pycache__', 'scripts'}
EXCLUDE_EXTS = {'.zip', '.pyc', '.py'}

def collect_project_files():
    files_list = []
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
        for f in files:
            if any(f.endswith(ext) for ext in EXCLUDE_EXTS):
                continue
            if f == 'create_windows_zip.py':
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, BASE_DIR).replace('\\', '/')
            if rel_path.startswith('./'):
                rel_path = rel_path[2:]
            # Do not pack any zip file itself
            if rel_path.endswith('.zip'):
                continue
            files_list.append(rel_path)
    files_list.sort()
    return files_list

def create_windows_compatible_zip():
    print(f"[ARTAKARYA] Collecting project files from {BASE_DIR}...")
    files = collect_project_files()
    print(f"[ARTAKARYA] Found {len(files)} files to package.")

    # 1. Determine all unique directory paths
    all_dirs = set()
    for f in files:
        parts = f.split('/')
        for i in range(1, len(parts)):
            d = '/'.join(parts[:i]) + '/'
            all_dirs.add(d)

    # Sort directories by depth first, then alphabetically
    sorted_dirs = sorted(list(all_dirs), key=lambda x: (x.count('/'), x))
    print(f"[ARTAKARYA] Creating {len(sorted_dirs)} explicit directory entries:")
    for d in sorted_dirs:
        print(f"  + dir:  {d}")

    # Temporary file for atomic creation
    temp_zip = os.path.join(tempfile.gettempdir(), f"artakarya_build_{os.getpid()}.zip")
    if os.path.exists(temp_zip):
        os.remove(temp_zip)

    try:
        with zipfile.ZipFile(temp_zip, 'w', compression=zipfile.ZIP_DEFLATED, allowZip64=False) as zf:
            # First, write all directories with explicit DOS 0x10 attribute
            for d in sorted_dirs:
                zinfo = zipfile.ZipInfo(d, FIXED_DATETIME)
                zinfo.compress_type = zipfile.ZIP_STORED
                # DOS Directory attribute (0x10) + Unix directory permission (0o40755)
                # Lower 16 bits = 0x10 (DOS Directory), Upper 16 bits = 0o40755
                zinfo.external_attr = (0o40755 << 16) | 0x10
                zinfo.create_system = 0  # MS-DOS format
                zinfo.extract_version = 20  # PKZIP 2.0
                zinfo.create_version = 20
                zinfo.flag_bits = 0x0800  # UTF-8 filename flag
                zf.writestr(zinfo, b'')

            # Next, write all files with explicit DOS 0x20 attribute
            for rel_path in files:
                full_path = os.path.join(BASE_DIR, rel_path)
                with open(full_path, 'rb') as fp:
                    data = fp.read()

                zinfo = zipfile.ZipInfo(rel_path, FIXED_DATETIME)
                zinfo.compress_type = zipfile.ZIP_DEFLATED
                # DOS Archive attribute (0x20) + Unix regular file permission (0o100644)
                zinfo.external_attr = (0o100644 << 16) | 0x20
                zinfo.create_system = 0  # MS-DOS format
                zinfo.extract_version = 20  # PKZIP 2.0
                zinfo.create_version = 20
                zinfo.flag_bits = 0x0800  # UTF-8 filename flag
                zf.writestr(zinfo, data)
                print(f"  + file: {rel_path} ({len(data)} bytes)")

        # Verify the generated zip before saving
        print(f"[ARTAKARYA] Verifying integrity of temporary zip {temp_zip}...")
        with zipfile.ZipFile(temp_zip, 'r') as verify_zf:
            test_res = verify_zf.testzip()
            if test_res is not None:
                raise RuntimeError(f"Corrupted entry detected: {test_res}")
            
            infolist = verify_zf.infolist()
            dirs_count = sum(1 for i in infolist if i.is_dir())
            files_count = sum(1 for i in infolist if not i.is_dir())
            print(f"[ARTAKARYA] Verified: {dirs_count} directories, {files_count} files.")
            if dirs_count != len(sorted_dirs) or files_count != len(files):
                raise RuntimeError(f"Count mismatch! Expected {len(files)} files, got {files_count}")

        # Atomic copy to root and public directories
        shutil.copy2(temp_zip, ZIP_OUTPUT_PATH)
        os.makedirs(os.path.dirname(PUBLIC_ZIP_PATH), exist_ok=True)
        shutil.copy2(temp_zip, PUBLIC_ZIP_PATH)

        final_size = os.path.getsize(ZIP_OUTPUT_PATH)
        print(f"[ARTAKARYA] SUCCESS! Created {ZIP_OUTPUT_PATH} ({final_size} bytes / {final_size/1024:.1f} KB)")
        print(f"[ARTAKARYA] Mirrored to {PUBLIC_ZIP_PATH}")
        return final_size

    finally:
        if os.path.exists(temp_zip):
            os.remove(temp_zip)

if __name__ == '__main__':
    create_windows_compatible_zip()
