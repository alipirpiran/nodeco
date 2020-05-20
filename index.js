require('dotenv');
const fs = require('fs-extra');
const Path = require('path');
const cryptoUtils = require('./crypto_utils');

const OUTPUT = '.output';
const ignoredDir = ['node_modules'];

let base_dir;

/**
 * @param  {string} dir path to encrypted project
 * @returns {void}
 */
function run(dir) {
    base_dir = dir;

    // const outputPath = Path.join(dir, '..', OUTPUT);
    // if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

    // list files
    // const items = fs.readdirSync(dir);

    // for (const i of items) {
    //     if (i == OUTPUT) continue;
    //     copy(Path.join(dir, i));
    // }

    const env = fs.readFileSync(Path.join(base_dir, '..', '.env'));
    const { secret } = require('dotenv').parse(env);

    const indexFilePath = Path.join(dir, 'index.jsco');
    if (!fs.existsSync(indexFilePath)) {
        console.log('index.jsco not found!');
        process.exit(1);
    }

    // decrypt file
    const fileData = fs.readFileSync(indexFilePath);
    const decrypted = decrypt(fileData, secret);
    const indexFileJSPath =
        indexFilePath.substr(0, indexFilePath.lastIndexOf('.')) + '.js';

    // fs.writeFileSync(
    //     Path.join(outputPath, indexFileJSPath.split(base_dir)[1]),
    //     decrypted
    // );

    eval(decrypted);
}

function copy(path) {
    const env = fs.readFileSync(Path.join(base_dir, '..', '.env'));
    const { secret } = require('dotenv').parse(env);

    if (ignoredDir.includes(Path.basename(path))) {
        return fs.copy(
            path,
            Path.join(base_dir, '..', OUTPUT, path.split(base_dir)[1])
        );
    }

    if (fs.statSync(path).isFile()) {
        const ex = Path.extname(path);
        if (ex == '.jsco') {
            // decrypt file
            const fileData = fs.readFileSync(path);
            const decrypted = decrypt(fileData, secret);
            path = path.substr(0, path.lastIndexOf('.')) + '.js';

            fs.writeFileSync(
                Path.join(base_dir, '..', OUTPUT, path.split(base_dir)[1]),
                decrypted
            );
        } else {
            fs.copy(
                path,
                Path.join(base_dir, '..', OUTPUT, path.split(base_dir)[1])
            );
        }
        return;
    }

    const items = fs.readdirSync(path);
    if (
        !fs.existsSync(
            Path.join(base_dir, '..', OUTPUT, path.split(base_dir)[1])
        )
    )
        fs.mkdirSync(
            Path.join(base_dir, '..', OUTPUT, path.split(base_dir)[1])
        );

    for (const item of items) {
        let p = Path.join(path, item);
        copy(p);
    }
}

function decrypt(encrypted, secret) {
    let key = cryptoUtils.getKeyFromPassword(
        Buffer.from(secret),
        cryptoUtils.getSalt()
    );

    let decrepted = cryptoUtils.decrypt(encrypted, key);
    return decrepted;
}

module.exports = {
    run,
};
