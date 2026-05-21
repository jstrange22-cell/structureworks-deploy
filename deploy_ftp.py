"""Deploy the StructureWorks marketing site to Hostinger via FTP.

structureworkstn.com is the PRIMARY domain on the Cloud plan, so its document
root is ~/public_html (NOT ~/domains/structureworkstn.com/public_html).

Credentials come from environment / a git-ignored .env:
    SW_FTP_HOST, SW_FTP_USER, SW_FTP_PASS
    SW_FTP_PORT (default 21), SW_FTP_REMOTE_ROOT (default "public_html")
"""
import ftplib
import os
import socket
import sys
import time

SKIP_FILES = {
    "deploy-site.py", "deploy_ftp.py", ".env", ".env.example", ".gitignore",
    ".DS_Store", "Thumbs.db", "desktop.ini",
}
SKIP_DIRS = {".git", ".github", "__pycache__", "node_modules", "_dist", "scripts"}
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


def _connect():
    host = os.environ.get("SW_FTP_HOST")
    user = os.environ.get("SW_FTP_USER")
    password = os.environ.get("SW_FTP_PASS")
    port = int(os.environ.get("SW_FTP_PORT", "21"))
    ftp = ftplib.FTP()
    ftp.connect(host, port, timeout=120)
    ftp.login(user, password)
    ftp.set_pasv(True)
    return ftp


def store_with_retry(ftp_box, remote_dir_cwd, rel_dir, name, local_path, attempts=4):
    """STOR a file, recovering from intermittent passive-mode timeouts.

    Hostinger writes uploads to a temp `.in.<name>` then renames; a timed-out
    transfer leaves that orphan and blocks the next STOR with a 550. On retry we
    reconnect, reposition, and delete the orphan first.
    """
    for attempt in range(1, attempts + 1):
        ftp = ftp_box["ftp"]
        try:
            # Clear any orphan temp file from a prior failed attempt.
            try:
                ftp.delete(f".in.{name}.")
            except ftplib.error_perm:
                pass
            with open(local_path, "rb") as fh:
                ftp.storbinary(f"STOR {name}", fh)
            return
        except (socket.timeout, ftplib.error_temp, ftplib.error_perm, OSError) as exc:
            if attempt == attempts:
                raise
            print(f"    ! {name}: {exc} — reconnecting (attempt {attempt}/{attempts})")
            time.sleep(2 * attempt)
            try:
                ftp.close()
            except Exception:
                pass
            new = _connect()
            new.cwd(remote_dir_cwd)
            if rel_dir != ".":
                ensure_dir(new, rel_dir)
            # Best-effort orphan cleanup on the fresh connection too.
            try:
                new.delete(f".in.{name}.")
            except ftplib.error_perm:
                pass
            ftp_box["ftp"] = new


def main():
    _load_dotenv()
    host = os.environ.get("SW_FTP_HOST")
    user = os.environ.get("SW_FTP_USER")
    password = os.environ.get("SW_FTP_PASS")
    port = int(os.environ.get("SW_FTP_PORT", "21"))
    root = os.environ.get("SW_FTP_REMOTE_ROOT", "public_html")
    if not all([host, user, password]):
        sys.exit("Missing SW_FTP_HOST / SW_FTP_USER / SW_FTP_PASS in env or .env")

    ftp = _connect()
    print(f"Connected to {host}:{port} as {user}; login CWD={ftp.pwd()}")

    # Anchor at the FTP root so REMOTE_ROOT resolves absolutely (login CWD may
    # default to /public_html, which would otherwise nest the path wrongly).
    ftp.cwd("/")
    ensure_dir(ftp, root)
    root_cwd = ftp.pwd()
    print(f"Deploying into {root_cwd}")

    ftp_box = {"ftp": ftp}
    uploaded = skipped = 0
    for cur, dirs, files in os.walk(LOCAL_DIR):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel_dir = os.path.relpath(cur, LOCAL_DIR).replace("\\", "/")
        # Position into the matching remote directory.
        ftp_box["ftp"].cwd(root_cwd)
        if rel_dir != ".":
            ensure_dir(ftp_box["ftp"], rel_dir)
        for name in files:
            if name in SKIP_FILES:
                continue
            ext = os.path.splitext(name)[1].lower()
            if name != ".htaccess" and ext not in ALLOWED_EXT:
                skipped += 1
                continue
            local_path = os.path.join(cur, name)
            store_with_retry(ftp_box, root_cwd, rel_dir, name, local_path)
            rel = (rel_dir + "/" + name) if rel_dir != "." else name
            print(f"  + {rel}")
            uploaded += 1

    try:
        ftp_box["ftp"].quit()
    except Exception:
        pass
    print(f"\nDone. Uploaded {uploaded} files ({skipped} skipped).")


if __name__ == "__main__":
    main()
