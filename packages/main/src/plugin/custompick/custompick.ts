import { CustomPick, CustomPickItem, Disposable, Event, QuickInputButton, QuickPickItem } from "@podman-desktop/api";
import { Emitter } from "../events/emitter.js";

export class CustomPickImpl implements CustomPick<CustomPickItem> {
    private _title: string | undefined;
    private _description: string | undefined;
    private _icon: string | { light: string; dark: string; } | undefined;
    private _items: CustomPickItem[] = [];
    private _buttons: QuickInputButton[] = [];
    private _canSelectMany: boolean = false;
    private _disposable: Disposable;
    private readonly _onDidAccept = new Emitter<void>();
    private readonly _onDidChangeSelection = new Emitter<CustomPickItem[]>();

    constructor() {
        this._disposable = Disposable.from(this._onDidAccept, this._onDidChangeSelection);
    }

    readonly onDidAccept: Event<void> = this._onDidAccept.event;
    readonly onDidChangeSelection: Event<CustomPickItem[]> = this._onDidChangeSelection.event;

    get title() {
        return this._title;
    }

    set title(title: string | undefined) {
        this._title = title;
    }

    get description() {
        return this._description;
    }

    set description(description: string | undefined) {
        this._description = description;
    }

    get icon() {
        return this._icon;
    }

    set icon(icon: string | { light: string; dark: string; } | undefined) {
        this._icon = icon;
    }

    get items() {
        return this._items;
    }

    set items(items: CustomPickItem[]) {
        this._items = items;
    }

    get buttons() {
        return this._buttons;
    }

    set buttons(buttons: QuickInputButton[]) {
        this._buttons = buttons;
    }

    get canSelectMany() {
        return this._canSelectMany;
    }

    set canSelectMany(canSelectMany: boolean) {
        this._canSelectMany = canSelectMany;
    }

    show(): void {
        throw new Error("Method not implemented.");
    }
    hide(): void {
        throw new Error("Method not implemented.");
    }
    dispose(): void {
        this._disposable.dispose();
    }

}