import os
import subprocess
import sys

if os.path.exists(os.path.expandvars(r"%appdata%\mpv\scripts\mpv-twitch-chat")):
    print("mpv-twitch-chat script already exists.")
    sys.exit(0)

subprocess.run(
    [
        "git",
        "clone",
        "git@github.com:CrendKing/mpv-twitch-chat.git",
        os.path.expandvars(r"%appdata%\mpv\scripts\mpv-twitch-chat"),
    ],
    check=True,
)

subprocess.run(
    [
        "git",
        "apply",
        os.path.expandvars(
            r"%appdata%\mpv\scripts\prevent_error_with_one_comment.patch"
        ),
    ],
    cwd=os.path.expandvars(r"%appdata%\mpv\scripts\mpv-twitch-chat"),
    check=True,
)
