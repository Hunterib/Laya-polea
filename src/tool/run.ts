

export class run {
    constructor() { }

    private static _runPlugin: string = null;

    static get Plugin() {
        return this._runPlugin;
    }

    static set Plugin(value) {
        this._runPlugin = value;
    }
}