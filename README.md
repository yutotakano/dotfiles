# dotfiles

This repository contains my personal machine configuration, managed using
[chezmoi](https://www.chezmoi.io/). While it is a public repo, it is primarily
so I can clone it without authentication from a new system, and not because it
has much public value. These dotfiles may not work as-is on your systems.

## New Machine Setup

1. Install chezmoi.
2. Place the `age` secret key at `~/.config/chezmoi/key.txt`.
3. Then run:

  ```
  chezmoi init --apply yutotakano
  ```

## Notes

- OS-specific scripts are in `.chezmoiscripts`
- Files are provisioned between `run_before` and `run_after`.
- Use `chezmoi add --encrypt <file>` for age encryption.
