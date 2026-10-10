#!/bin/zsh

# Install homebrew and absolutely bare minimum for the next step

if ! command -v brew &> /dev/null; then
  echo "Homebrew not found. Installing..."
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
  echo "Homebrew is already installed."
fi

if grep -q "/bin/brew shellenv" ~/.zprofile; then
  echo "Homebrew environment already set up in ~/.zprofile."
else
  echo "Setting up Homebrew environment in ~/.zprofile..."
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

brew install mise
exit 0
