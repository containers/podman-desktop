#!/usr/bin/env node
const zipper = require('zip-local');
const path = require('path');
const package = require('../package.json');
const fs = require('fs');

const destFile = path.resolve(__dirname, `../${package.name}.cdix`);
const builtinDirectory = path.resolve(__dirname, '../builtin');
// remove the .cdix file before zipping
if (fs.existsSync(destFile)) {
    fs.rmSync(destFile);
}
// remove the builtin folder before zipping
if (fs.existsSync(builtinDirectory)) {
    fs.rmSync(builtinDirectory, { recursive: true, force: true });
}


zipper.sync.zip(path.resolve(__dirname, '../')).compress().save(destFile);



// create unzipped built-in
/*
mkdirp(unzippedDirectory).then(() => {
        zipper.sync.unzip(destFile).save(unzippedDirectory);
});
*/