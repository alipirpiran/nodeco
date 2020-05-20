# nodeco

<p align="center">
 <a href="https://github.com/alipirpiran/nodeco/blob/master/LICENSE">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg">
 </a>
 <a href="https://github.com/alipirpiran/nodeco">
  <img src="https://badges.frapsoft.com/os/v2/open-source.png?v=103">
 </a>
 <a href="https://t.me/mralpr">
  <img src="https://img.shields.io/badge/Chat%20on-telegram-blue" alt="Telegram">
  </a>
 </p>
 <br />
 
 nodeco, command-line tool to compile, encrypt node.js project.
 
# Usage

## Instalation
    npm i -g nodeco

## Usage
    Usage: nodeco [options] <input-file>

    Options:
    -s, --secret <secret>  Specify secret key to encrypt project
    -o --out <output>      Output directory for build (defaults to output)
    -h, --help             display help for command

Eg:

    nodeco index.js -s MySecret -o output

## Run compiled project
    node output/index.js

## Notes
* after running command it creates output directory (defaults to output).

``` bash

├── index.js
└── src
    ├── index.jsco
    └── nodeco.js
```
* Your project compiles and encrypted to src/index.jsco.
* Secret is saved in .env file.
* index.js file get secret from .env, and run project

