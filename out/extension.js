"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const translation_js_1 = require("translation.js");
const change_case_1 = require("change-case");
const CONFIG = vscode_1.workspace.getConfiguration('varTranslation');
const translationEngine = CONFIG.translationEngine;
function activate(context) {
    const disposable = vscode_1.commands.registerCommand('extension.varTranslation', vscodeTranslate);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function vscodeTranslate() {
    return __awaiter(this, void 0, void 0, function* () {
        //获取编辑器
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        //获取选中文字
        const selection = editor.selection;
        let srcText = editor.document.getText(selection);
        if (!srcText) {
            return;
        }
        try {
            const engine = getTheTranslationEngine();
            const lang = yield determineLanguage(srcText, engine);
            //非英语需要翻译
            if (lang !== 'en') {
                const translationResult = yield translate(engine, srcText, lang);
                if (translationResult && translationResult.result) {
                    srcText = translationResult.result[0];
                }
            }
            const result = yield Select(srcText);
            if (!result) {
                return;
            }
            //替换文案
            editor.edit(builder => builder.replace(selection, result));
        }
        catch (err) {
            vscode_1.window.showInformationMessage('some thing error; maybe Network Error;try change engine restart');
        }
    });
}
/**
 * 用户选择选择转换形式
 * @param word 需要转换的单词
 * @return  用户选择
 */
function Select(word) {
    return __awaiter(this, void 0, void 0, function* () {
        var items = [];
        var opts = { matchOnDescription: true, placeHolder: 'choose replace 选择替换' };
        items.push({ label: change_case_1.camelCase(word), description: 'camelCase 小驼峰' });
        items.push({ label: change_case_1.snakeCase(word), description: 'snakeCase 下划线' });
        const selections = yield vscode_1.window.showQuickPick(items, opts);
        if (!selections) {
            return;
        }
        return selections.label;
    });
}
/**
 * 获取翻译引擎配置
 * @return 引擎
 */
function getTheTranslationEngine() {
    let engine = translation_js_1.google;
    if (translationEngine === 'google') {
        engine = translation_js_1.google;
    }
    if (translationEngine === 'youdao') {
        engine = translation_js_1.youdao;
    }
    if (translationEngine === 'baidu') {
        engine = translation_js_1.baidu;
    }
    return engine;
}
/**
 * 判断目标语言
 */
function determineLanguage(srcText, engine) {
    return __awaiter(this, void 0, void 0, function* () {
        let lang;
        //正则快速判断英文
        if (/^[a-zA-Z\d\s\-\_]+$/.test(srcText)) {
            lang = 'en';
        }
        else if (translationEngine === 'google') {
            lang = yield engine.detect({ text: srcText, com: true });
        }
        else {
            lang = yield engine.detect(srcText);
        }
        return lang;
    });
}
function translate(engine, srcText, lang) {
    return __awaiter(this, void 0, void 0, function* () {
        if (translationEngine === 'google') {
            return engine.translate({ text: srcText, from: lang, to: 'en', com: true });
        }
        return engine.translate({ text: srcText, from: lang, to: 'en' });
    });
}
//# sourceMappingURL=extension.js.map