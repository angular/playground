import { FileSystem } from '../vfs';

let joc = jasmine.objectContaining;

describe("Virtual File System", () => {
    describe("instantiation", () => {
        it("should create a new FileSystem", () => {
            expect(new FileSystem()).toBeTruthy();
        });

        it("should start with blank filesystem", () => {
            expect(new FileSystem().fileSystem).toEqual({});
            expect(Object.keys(new FileSystem().fileSystem).length).toBe(0);
        });

    });
    describe("writeFile", () => {
        it("should add something", () => {
            let fs = new FileSystem();
            fs.writeFile("newFile.js", "");
            expect(Object.keys(fs.fileSystem).length).toEqual(1);
            expect(fs.fileSystem["newFile.js"]).toBeTruthy();
            expect(typeof fs.fileSystem["newFile.js"]).toEqual("object");

            fs.writeFile("newFile2.js", "");
            expect(Object.keys(fs.fileSystem).length).toEqual(2);
            expect(fs.fileSystem["newFile2.js"]).toBeTruthy();
            expect(typeof fs.fileSystem["newFile2.js"]).toEqual("object");
        });

        it("should add the correct thing", () => {
            let fs = new FileSystem();

            fs.writeFile("newFile.js", "");
            expect(fs.fileSystem["newFile.js"].fileName).toEqual("newFile.js");
            expect(fs.fileSystem["newFile.js"].text).toEqual("");

            fs.writeFile("newFile2.js", "console.log()");
            expect(fs.fileSystem["newFile2.js"].fileName).toEqual("newFile2.js");
            expect(fs.fileSystem["newFile2.js"].text).toEqual("console.log()");
        });

        it("should overwrite file data as necessary", () => {
            let fs = new FileSystem();

            fs.writeFile("newFile.js", "");
            expect(fs.fileSystem["newFile.js"].fileName).toEqual("newFile.js");
            expect(fs.fileSystem["newFile.js"].text).toEqual("");

            fs.writeFile("newFile.js", "console.log()");
            expect(fs.fileSystem["newFile.js"].text).toEqual("console.log()");
        });
    });

    describe("getCanonicalFileName", () => {
        it("should return the input filename", () => {
            let fs = new FileSystem();
            expect(fs.getCanonicalFileName("foo.js")).toEqual("foo.js");
        });
    });

    describe("getSourceFile", () => {
        it("should return undefined for nonexistent file", () => {
            let fs = new FileSystem();
            expect(fs.getSourceFile("f.js")).toBeFalsy();
        });

        it("should return some object", () => {
            let fs = new FileSystem();
            fs.writeFile("f.js", "");
            expect(typeof fs.getSourceFile("f.js")).toEqual("object");
        });

        it("should return the right object", () => {
            let fs = new FileSystem();
            fs.writeFile("f.js", "console.log()");
            expect(fs.getSourceFile("f.js")).toEqual(joc({
                "fileName": "f.js",
                "text": "console.log()"
            }));
        });
    });

    describe("getFileList", () => {
        it("should return blank array for no files", () => {
            let fs = new FileSystem();

            expect(fs.getFileList()).toEqual([]);
        });

        it("should properly return list of filenames", () => {
            let fs = new FileSystem();
            fs.writeFile("a", "");
            fs.writeFile("b", "");
            fs.writeFile("c", "");

            expect(fs.getFileList()).toEqual(["a", "b", "c"]);
        });
    });

    describe("readDirectory", () => {
        it("should return empty array", () => {
            let fs = new FileSystem();
            expect(fs.readDirectory()).toEqual([]);
        });
    });

    describe("deleteFile", () => {
        it("should properly delete file", () => {
            let fs = new FileSystem();
            fs.writeFile("a", "");

            fs.deleteFile("a");
            expect(fs.getSourceFile("a")).toBeFalsy();
        });
    });

    describe("fileExists", () => {
        it("should return false if file doesn't exists", () => {
            let fs = new FileSystem();

            expect(fs.fileExists("foo")).toBeFalsy();
        });

        it("should return true if file exists", () => {
            let fs = new FileSystem();
            fs.writeFile("a", "");
            expect(fs.fileExists("a")).toBeTruthy();
        });
    });

    describe("loadFilesIntoFileSystem", () => {
        it("should properly load in files", () => {
            let fs = new FileSystem();

            fs.loadFilesIntoFileSystem({
                "fileSystem": {
                    "/foo.js": {"text": "foo"},
                    "/bar.js": {"text": "bar"}
                }
            });

            expect(fs.getFileList()).toEqual(["/foo.js", "/bar.js"]);
            expect(fs.getSourceFile("/foo.js").text).toEqual("foo");
            expect(fs.getSourceFile("/bar.js").text).toEqual("bar");
        })
    })
});
