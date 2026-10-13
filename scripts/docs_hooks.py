"""MkDocs hooks for the Praxis documentation site.

Repository Markdown links to files outside ``docs/`` (README, source code,
examples) are rewritten to their GitHub location so the same Markdown works
both on GitHub and on the published site.
"""

import posixpath
import re
from pathlib import Path


_LINK = re.compile(r"(\]\()([^)\s]+)(\))")
_EXTERNAL = ("http://", "https://", "mailto:", "#", "/")


def _rewrite(
    target: str, page_dir: str, docs_dir: Path, repo_root: Path, base: str
) -> str:
    if target.startswith(_EXTERNAL):
        return target
    path, sep, fragment = target.partition("#")
    resolved = posixpath.normpath(posixpath.join(page_dir, path))
    if not resolved.startswith("../"):
        # Inside docs/: a directory README is served as that directory's index.
        if posixpath.basename(resolved) == "README.md":
            index = posixpath.join(posixpath.dirname(resolved), "index.md")
            if (docs_dir / index).exists():
                return posixpath.relpath(index, page_dir) + sep + fragment
        return target
    repo_path = posixpath.normpath(posixpath.join("docs", resolved))
    kind = "tree" if (repo_root / repo_path).is_dir() else "blob"
    return f"{base}/{kind}/main/{repo_path}{sep}{fragment}"


def on_page_markdown(markdown, page, config, **_kwargs):
    docs_dir = Path(config["docs_dir"])
    repo_root = docs_dir.parent
    base = config["repo_url"].rstrip("/")
    page_dir = posixpath.dirname(page.file.src_uri)

    def replace(match):
        return (
            match.group(1)
            + _rewrite(match.group(2), page_dir, docs_dir, repo_root, base)
            + match.group(3)
        )

    out, in_fence = [], False
    for line in markdown.splitlines(keepends=True):
        if line.lstrip().startswith(("```", "~~~")):
            in_fence = not in_fence
        out.append(line if in_fence else _LINK.sub(replace, line))
    return "".join(out)
