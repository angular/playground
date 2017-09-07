# Playground

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.1.2.

## Development Process

### Before Development

Before starting the development server or building the application, make sure that you have run `npm install` and executed `./build.sh`. This will ensure that all of the dependencies are properly set up.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files. Be sure to have run `./build.sh` prior to this command.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build. Be sure to have run `./build.sh` prior to this command.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io). Be sure to have run `./build.sh` prior to this command.

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.
Be sure to have run `./build.sh` prior to this command.

## Managing Runtime Dependencies of the AOT Compiler and in-playground compiled apps

### Targeting a Specific Angular Version in dependencies loaded in the playground

To target a specific Angular version in the playground, set the version in `src/environments/angularVersions.ts`, then re-run `./build.sh`. Angular versions must be in the format `@#` where `#` is the code of the specific version (e.g. `@4.3.4` or `@2.0.0-beta.10`).

### Adding packages to dependencies loaded in the playground

The playground requires that dependencies of the AOT compiler and of AOT compiled apps are loaded in two places in the playground:

1. In the compiler dependency blob - this blob contains `*.d.ts`, `package.json`, and `*.metadata.json` files for all packages required by the compiler. This "blob" is loaded by the compiler worker thread, the Monaco editor, and the Angular language service.

2. In the SystemJS config hardcoded into the index.html file of AOT compiled applications created in the playground. At runtime of the application, SystemJS handles loading of all the required runtime dependencies from unpkg.com and the virtual file system in use by the compiler.

To add dependencies to the compiler dependency blob:

- Add the package to the `package.json` file in `src/assets/compiler/dependency-blob`. It may be necessary to update the `package-lock.json` file in that same directory as well.
- Additionally, add the package name to `/tools/build/rewriteDependencyBlobPackage.ts`. Upon run of `./build.sh`, this script enforces that the package versions listed in the `package.json` previously mentioned are consistent with the package versions specified in `src/environments/angularVersions.ts`.

To add dependencies to the SystemJS config:

- Modify the default value of `/index.html` that is written in `src/app/virtual-fs.service.ts` to include the appropriate location of a umd (or similar) bundle that provides runtime dependencies for the package in question

Currently, the playground does not support dynamic (i.e. at runtime) addition of packages to a project. This is only supported at build time of the entire playground.
