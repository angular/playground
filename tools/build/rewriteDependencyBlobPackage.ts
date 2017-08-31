import {angularVersionsConfig} from "../../src/environments/angularVersions";
const fs = require('fs');

const packageJsonLocation = "src/assets/compiler/dependency-blob/package.json";

const angularPackages = [
  "@angular/animations",
  "@angular/common",
  "@angular/compiler",
  "@angular/core",
  "@angular/forms",
  "@angular/http",
  "@angular/platform-browser",
  "@angular/platform-browser-dynamic",
  "@angular/router",
  "@angular/compiler-cli",
  "@angular/language-service",
];

const materialPackages = [
  "@angular/material",
  "@angular/cdk"
];

const packageJson = JSON.parse(fs.readFileSync(packageJsonLocation));

for (const pkg of angularPackages) {
  packageJson["dependencies"][pkg] = angularVersionsConfig['@angular'].replace('@', '');
}

for(const pkg of materialPackages) {
  packageJson["dependencies"][pkg] = angularVersionsConfig['material'].replace('@', '');
}

fs.writeFileSync(packageJsonLocation, JSON.stringify(packageJson, null, '  '));
