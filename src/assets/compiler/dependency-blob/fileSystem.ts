export class SourceFile {
    fileName: string;
    text = '';

    /**
     * Constructor for a SourceFile
     * @class SourceFile
     * @classdesc A representation of a file stored in the file system
     */
    constructor(_fileName: string) {
        this.fileName = _fileName;
    }
};

/**
 * The FileSystem itself
 * @class FileSystem
 * @classdec Stores a representation of the file system
 */
export class FileSystem {
    /**
     * Internal dictionary used to maintain the file system
     * @member
     * @private
     */
    private fileSystem: { [fileName: string]: SourceFile } = {};

    /**
     * Check if a file exists
     * @method
     */
    fileExists(fileName: string): boolean {
        return fileName in this.fileSystem;
    }

    /**
     * Get a source file from the file system
     * @method
     */
    getSourceFile(fileName: string): SourceFile {
        return this.fileSystem[fileName];
    }

    /**
     * Get the canonical file name from a given filename - used for compatibility
     * with Angular compiler host
     * @method
     */
    getCanonicalFileName(fileName: string): string {
        return fileName;
    }

    /**
     * Writes a file to the filesystem with the given filename and data
     * @method
     */
    writeFile(fileName: string, data: string): void {
        if (this.getSourceFile(fileName)) {
            this.getSourceFile(fileName).text = data;
        } else {
            const file: SourceFile = new SourceFile(fileName);
            file.text = data;
            this.fileSystem[fileName] = file;
        }
    }

    getFileList(): string[] {
        return Object.keys(this.fileSystem);
    }
};
