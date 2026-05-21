"""Deploy the StructureWorks marketing site to Hostinger via FTP.

structureworkstn.com is the PRIMARY domain on the Cloud plan, so its document
root is ~/public_html (NOT ~/domains/structureworkstn.com/public_html).

Credentials come from environment / a git-ignored .env:
    SW_FTP_HOST, SW_FTP_USER, SW_FTP_PASS
    SW_FTP_PORT (default 21), SW_FTP_REMOTE_ROOT (default "public_html")
"""
import ftplib
import os
import sys

SKIP_FILES = {
    "deploy-site.py", "deploy_ftp.py", ".env", ".env.example", ".gitignore",
    ".DS_Store", "Thumbs.db", "desktop.ini",
}
SKIP_DIRS = {".git", "__pycache__", "node_modules", "_dist"}
ALLOWED_EXT = {
    ".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
    ".webp", ".woff", ".woff2", ".ttf", ".json", ".xml", ".txt", ".php", ".map",
}

LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_dotenv():
    path = os.path.join(LOCAL_DIR, ".env")
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def ensure_dir(ftp, path):
    """Create remote directory tree (relative to CWD) if missing."""
    parts = [p for p in path.split("/") if p]
    for part in parts:
        try:
            ftp.cwd(part)
        except ftplib.error_perm:
            ftp.mkd(part)
            ftp.cwd(part)


def main():
    _load_dotenv()
    host = os.environ.get("SW_FTP_HOST")
    user = os.environ.get("SW_FTP_USER")
    password = os.environ.get("SW_FTP_PASS")
    port = int(os.environ.get("SW_FTP_PORT", "21"))
    root = os.environ.get("SW_FTP_REMOTE_ROOT", "public_html")
    if not all([host, user, password]):
        sys.exit("Missing SW_FTP_HOST / SW_FTP_USER / SW_FTP_PASS in env or .env")

    ftp = ftplib.FTP()
    ftp.connect(host, port, timeout=60)
    ftp.login(user, password)
    ftp.set_pasv(True)
    print(f"Connected to {host}:{port} as {user}; login CWD={ftp.pwd()}")

    # Anchor at the FTP root so REMOTE_ROOT resolves absolutely (login CWD may
    # default to /public_html, which would otherwise nest the path wrongly).
    ftp.cwd("/")
    ensure_dir(ftp, root)
    root_cwd = ftp.pwd()
    print(f"Deploying into {root_cwd}")

    uploaded = skipped = 0
    for cur, dirs, files in os.walk(LOCAL_DIR):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel_dir = os.path.relpath(cur, LOCAL_DIR).replace("\\", "/")
        # Position into the matching remote directory.
        ftp.cwd(root_cwd)
        if rel_dir != ".":
            ensure_dir(ftp, rel_dir)
        for name in files:
            if name in SKIP_FILES:
                continue
            ext = os.path.splitext(name)[1].lower()
            if name != ".htaccess" and ext not in ALLOWED_EXT:
                skipped += 1
                continue
            local_path = os.path.join(cur, name)
            with open(local_path, "rb") as fh:
                ftp.storbinary(f"STOR {name}", fh)
            rel = (rel_dir + "/" + name) if rel_dir != "." else name
            print(f"  + {rel}")
            uploaded += 1

    ftp.quit()
    print(f"\nDone. Uploaded {uploaded} files ({skipped} skipped).")


if __name__ == "__main__":
    main()
