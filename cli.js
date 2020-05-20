#!/usr/bin/env node
const { program } = require('commander');
// const crypto = require('crypto');
const cryptoUtils = require('./crypto_utils');
const fs = require('fs-extra');
const Path = require('path');
const { exec } = require('child_process');

const temple = `
const nodeco = require('./src/nodeco');
const path = require('path');

nodeco.run(path.join(__dirname, 'src'));
`;
const ignoredDir = ['node_modules'];
let OUTPUT_DIR_NAME = 'output';
let INDEX = 'index.js';

async function main(inputFile) {
    const cwd = process.cwd();

    const isExists = fs.existsSync(inputFile);
    if (!isExists) {
        console.error('input file does not exists!');
        process.exit(1);
    }

    // get output dir name from cli
    if (program.output) OUTPUT_DIR_NAME = program.output;

    const outputPath = Path.join(cwd, OUTPUT_DIR_NAME);

    // create output directory
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);
    if (!fs.existsSync(`${outputPath}/src`)) fs.mkdirSync(`${outputPath}/src`);

    // list files
    // const dir = fs.readdirSync(path);

    // copy files in Output
    // for (const i of dir) {
    //     if (i == OUTPUT) continue;
    //     copy(i);
    // }
    await compile({
        indexFile: inputFile,
        output: Path.join(outputPath, 'src'),
    });
    const encrypted = encrypt(
        fs.readFileSync(`${outputPath}/src/index.js`),
        program.secret
    );

    fs.writeFileSync(Path.normalize(`${outputPath}/src/index.jsco`), encrypted);
    fs.removeSync(Path.normalize(`${outputPath}/src/index.js`));
    fs.writeFileSync(Path.normalize(`${outputPath}/index.js`), temple);
    fs.writeFileSync(
        Path.normalize(`${outputPath}/.env`),
        `secret= ${program.secret}`
    );
    fs.copy(
        Path.join(__dirname, 'nodeco/index.js'),
        Path.join(outputPath, 'src/nodeco.js')
    );

    //TODO create readme.md file in output dir
}

function copy(path) {
    const { secret } = program;

    if (ignoredDir.includes(path))
        return fs.copy(path, `${OUTPUT_DIR_NAME}/src/${path}`);
    if (fs.lstatSync(path).isFile()) {
        const ex = Path.extname(path);
        if (ex == '.js') {
            // encrypt file
            const fileData = fs.readFileSync(path);
            const encrypted = encrypt(fileData, secret);
            path = path.substr(0, path.lastIndexOf('.')) + '.jsco';
            fs.writeFileSync(`${OUTPUT_DIR_NAME}/src/${path}`, encrypted);
        } else {
            fs.copy(path, `${OUTPUT_DIR_NAME}/src/${path}`);
        }
        return;
    }

    const items = fs.readdirSync(path);
    if (!fs.existsSync(`${OUTPUT_DIR_NAME}/src/${path}`))
        fs.mkdirSync(`${OUTPUT_DIR_NAME}/src/${path}`);

    for (const item of items) {
        let p = Path.join(path, item);
        copy(p);
    }
}

function compile({ indexFile, output }) {
    return new Promise((resolve, reject) => {
        exec(
            `node ${Path.join(
                __dirname,
                './compiler'
            )} build ${indexFile} -o ${output}`,
            (err, stdout) => {
                resolve();
            }
        );
    });
}

function encrypt(data, secret) {
    const key = cryptoUtils.getKeyFromPassword(
        Buffer.from(secret),
        cryptoUtils.getSalt()
    );
    let encrypted = cryptoUtils.encrypt(Buffer.from(data), key);

    return encrypted;
}

function decrypt(encrypted, secret) {
    let key = cryptoUtils.getKeyFromPassword(
        Buffer.from(secret),
        cryptoUtils.getSalt()
    );

    let decrepted = cryptoUtils.decrypt(encrypted, key);
    return decrepted;
}

program.arguments('<input-file>').action((dir) => main(dir));
program.requiredOption(
    '-s, --secret <secret>',
    'Specify secret key to encrypt project'
);
program.option(
    '-o --out <output>',
    'Output directory for build (defaults to output)'
);

program.parse(process.argv);
