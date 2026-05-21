"""Deploy StructureWorks company website to Hostinger server root.

Credentials are read from environment variables (or a local .env file that is
git-ignored). Required: SW_SFTP_HOST, SW_SFTP_USER, SW_SFTP_PASS.
Optional: SW_SFTP_PORT (default 65002), SW_SFTP_REMOTE_ROOT.
"""
import paramiko
import os
import sys
import stat


def _load_dotenv():
    """Load KEY=VALUE pairs from a sibling .env file if present (no dependency)."""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()

HOST = os.environ.get("SW_SFTP_HOST")
PORT = int(os.environ.get("SW_SFTP_PORT", "65002"))
USER = os.environ.get("SW_SFTP_USER")
PASS = os.environ.get("SW_SFTP_PASS")
REMOTE_ROOT = os.environ.get(
    "SW_SFTP_REMOTE_ROOT",
    "/home/u959857201/domains/structureworkstn.com/public_html",
)

if not all([HOST, USER, PASS]):
    sys.exit(
        "Missing SFTP credentials. Set SW_SFTP_HOST, SW_SFTP_USER, SW_SFTP_PASS "
        "in the environment or in a local .env file next to deploy-site.py."
    )

LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))

# Files/dirs to skip
SKIP = {
    "deploy-site.py",
    ".git",
    "__pycache__",
    "node_modules",
    ".DS_Store",
    "Thumbs.db",
}

# Only upload these extensions + .htaccess
ALLOWED_EXT = {
    ".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif",
    ".svg", ".ico", ".webp", ".woff", ".woff2", ".ttf",
    ".json", ".xml", ".txt", ".php", ".map",
}


def ensure_remote_dir(sftp, remote_dir):
    """Create remote directory if it doesn't exist."""
    dirs_to_create = []
    current = remote_dir
    while current != "/":
        try:
            sftp.stat(current)
            break
        except FileNotFoundError:
            dirs_to_create.append(current)
            current = os.path.dirname(current)
    for d in reversed(dirs_to_create):
        print(f"  MKDIR {d}")
        sftp.mkdir(d)


def main():
    transport = paramiko.Transport((HOST, PORT))
    transport.connect(username=USER, password=PASS)
    sftp = paramiko.SFTPClient.from_transport(transport)

    uploaded = 0
    skipped = 0

    for root, dirs, files in os.walk(LOCAL_DIR):
        # Filter out skipped directories
        dirs[:] = [d for d in dirs if d not in SKIP]

        for filename in files:
            if filename in SKIP:
                continue

            local_path = os.path.join(root, filename)
            rel_path = os.path.relpath(local_path, LOCAL_DIR).replace("\\", "/")

            # Check extension (allow .htaccess specifically)
            _, ext = os.path.splitext(filename)
            if filename != ".htaccess" and ext.lower() not in ALLOWED_EXT:
                skipped += 1
                continue

            remote_path = f"{REMOTE_ROOT}/{rel_path}"
            remote_dir = os.path.dirname(remote_path)

            # Ensure remote directory exists
            if remote_dir != REMOTE_ROOT:
                ensure_remote_dir(sftp, remote_dir)

            print(f"  Uploading {rel_path} -> {remote_path}")
            sftp.put(local_path, remote_path)
            uploaded += 1

    print(f"\nDone! Uploaded {uploaded} files ({skipped} skipped)")
    print(f"Website deployed to structureworkstn.com")

    sftp.close()
    transport.close()


if __name__ == "__main__":
    main()
