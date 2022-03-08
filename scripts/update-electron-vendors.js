const {writeFile} = require('fs/promises');
const {execSync} = require('child_process');
const electron = require('electron');
const path = require('path');

/**
 * Returns versions of electron vendors
 * The performance of this feature is very poor and can be improved
 * @see https://github.com/electron/electron/issues/28006
 *
 * @returns {NodeJS.ProcessVersions}
 */
function getVendors() {
  const output = execSync(`${electron} -p "JSON.stringify(process.versions)"`, {
    env: {'ELECTRON_RUN_AS_NODE': '1'},
    encoding: 'utf-8',
  });

  return JSON.parse(output);
}

function updateVendors() {
  const electronRelease = getVendors();

  const nodeMajorVersion = electronRelease.node.split('.')[0];
  const chromeMajorVersion = electronRelease.v8.split('.')[0] + electronRelease.v8.split('.')[1];

  const browserslistrcPath = path.resolve(process.cwd(), '.browserslistrc');

  return Promise.all([
    writeFile('./.electron-vendors.cache.json',
      JSON.stringify({
        chrome: chromeMajorVersion,
        node: nodeMajorVersion,
      }, null, 2) + '\n',
    ),

    writeFile(browserslistrcPath, `Chrome ${chromeMajorVersion}\n`, 'utf8'),
  ]);
}

updateVendors().catch(err => {
  console.error(err);
  process.exit(1);
});
