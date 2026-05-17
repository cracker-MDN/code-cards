import { FSharpSet__Contains, empty, ofList } from "./fable_modules/fable-library-js.4.24.0/Set.js";
import { singleton as singleton_1, reverse, cons, empty as empty_1, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { createObj, stringHash, equals, comparePrimitives } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { Union } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { union_type, string_type } from "./fable_modules/fable-library-js.4.24.0/Reflection.js";
import { item } from "./fable_modules/fable-library-js.4.24.0/Array.js";
import { isLetter, isLetterOrDigit, isDigit } from "./fable_modules/fable-library-js.4.24.0/Char.js";
import { Language } from "./Types.fs.js";
import { singleton, collect, delay, toList, contains } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { defaultOf } from "./fable_modules/Feliz.2.9.0/../.././fable_modules/fable-library-js.4.24.0/Util.js";
import { createElement } from "react";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";

const Keywords_fsharp = ofList(ofArray(["let", "in", "if", "then", "else", "elif", "match", "with", "for", "while", "do", "done", "open", "module", "namespace", "type", "and", "or", "not", "true", "false", "fun", "function", "rec", "mutable", "yield", "return", "of", "inherit", "member", "static", "abstract", "override", "interface", "new", "val", "when", "as", "null", "begin", "end", "try", "finally", "raise"]), {
    Compare: comparePrimitives,
});

const Keywords_python = ofList(ofArray(["def", "class", "if", "elif", "else", "for", "while", "return", "import", "from", "as", "try", "except", "finally", "with", "yield", "lambda", "pass", "break", "continue", "and", "or", "not", "in", "is", "True", "False", "None", "self", "raise", "global", "nonlocal", "assert", "del", "print"]), {
    Compare: comparePrimitives,
});

const Keywords_javascript = ofList(ofArray(["const", "let", "var", "function", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "class", "extends", "new", "this", "super", "import", "export", "from", "default", "try", "catch", "finally", "throw", "async", "await", "yield", "of", "in", "typeof", "instanceof", "null", "undefined", "true", "false", "void", "delete"]), {
    Compare: comparePrimitives,
});

const Keywords_csharp = ofList(ofArray(["using", "namespace", "class", "struct", "interface", "enum", "public", "private", "protected", "internal", "static", "void", "int", "string", "bool", "float", "double", "var", "new", "return", "if", "else", "for", "foreach", "while", "do", "switch", "case", "break", "continue", "try", "catch", "finally", "throw", "async", "await", "null", "true", "false", "this", "base", "readonly", "override", "virtual", "abstract", "sealed", "partial"]), {
    Compare: comparePrimitives,
});

const Keywords_sql = ofList(ofArray(["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "AND", "OR", "NOT", "IN", "IS", "NULL", "AS", "ORDER", "BY", "GROUP", "HAVING", "LIMIT", "OFFSET", "UNION", "INTO", "VALUES", "SET", "DISTINCT", "COUNT", "SUM", "AVG", "MAX", "MIN", "LIKE", "BETWEEN", "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END", "ASC", "DESC"]), {
    Compare: comparePrimitives,
});

function Keywords_forLanguage(lang) {
    switch (lang.tag) {
        case 0:
            return Keywords_fsharp;
        case 1:
            return Keywords_python;
        case 2:
            return Keywords_javascript;
        case 3:
            return Keywords_csharp;
        case 4:
            return Keywords_sql;
        default:
            return empty({
                Compare: comparePrimitives,
            });
    }
}

class Token extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Keyword", "StringLit", "Comment", "Number", "Punctuation", "Plain"];
    }
}

function Token_$reflection() {
    return union_type("CodeCards.CodeHighlight.Token", [], Token, () => [[["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]]]);
}

function tokenize(lang, code) {
    let c, c_1, c_2, c_3, c_4, c_5, c_6, c_7, c_8, c_9, c_10, c_11;
    const keywords = Keywords_forLanguage(lang);
    let tokens = empty_1();
    let i = 0;
    const chars = code.split("");
    const len = chars.length | 0;
    const peek = () => {
        if (i < len) {
            return item(i, chars);
        }
        else {
            return undefined;
        }
    };
    const advance = () => {
        i = ((i + 1) | 0);
    };
    const readWhile = (pred) => {
        const start = i | 0;
        while ((i < len) && pred(item(i, chars))) {
            advance();
        }
        return code.slice(start, (i - 1) + 1);
    };
    while (i < len) {
        const matchValue = item(i, chars);
        let matchResult, c_14, c_16, c_18, c_19;
        switch (matchValue) {
            case "\"": {
                matchResult = 0;
                break;
            }
            case "#": {
                if (equals(lang, new Language(1, []))) {
                    matchResult = 3;
                }
                else if ((c = matchValue, isDigit(c))) {
                    matchResult = 4;
                    c_14 = matchValue;
                }
                else if ((c_1 = matchValue, isLetter(c_1) ? true : (c_1 === "_"))) {
                    matchResult = 5;
                    c_16 = matchValue;
                }
                else if ((c_2 = matchValue, contains(c_2, "(){}[]<>.,;:=+-*/%&|!?@^~".split(""), {
                    Equals: (x, y) => (x === y),
                    GetHashCode: stringHash,
                }))) {
                    matchResult = 6;
                    c_18 = matchValue;
                }
                else {
                    matchResult = 7;
                    c_19 = matchValue;
                }
                break;
            }
            case "\'": {
                if (!equals(lang, new Language(0, []))) {
                    matchResult = 1;
                }
                else if ((c_3 = matchValue, isDigit(c_3))) {
                    matchResult = 4;
                    c_14 = matchValue;
                }
                else if ((c_4 = matchValue, isLetter(c_4) ? true : (c_4 === "_"))) {
                    matchResult = 5;
                    c_16 = matchValue;
                }
                else if ((c_5 = matchValue, contains(c_5, "(){}[]<>.,;:=+-*/%&|!?@^~".split(""), {
                    Equals: (x_1, y_1) => (x_1 === y_1),
                    GetHashCode: stringHash,
                }))) {
                    matchResult = 6;
                    c_18 = matchValue;
                }
                else {
                    matchResult = 7;
                    c_19 = matchValue;
                }
                break;
            }
            case "/": {
                if (((i + 1) < len) && (item(i + 1, chars) === "/")) {
                    matchResult = 2;
                }
                else if ((c_6 = matchValue, isDigit(c_6))) {
                    matchResult = 4;
                    c_14 = matchValue;
                }
                else if ((c_7 = matchValue, isLetter(c_7) ? true : (c_7 === "_"))) {
                    matchResult = 5;
                    c_16 = matchValue;
                }
                else if ((c_8 = matchValue, contains(c_8, "(){}[]<>.,;:=+-*/%&|!?@^~".split(""), {
                    Equals: (x_2, y_2) => (x_2 === y_2),
                    GetHashCode: stringHash,
                }))) {
                    matchResult = 6;
                    c_18 = matchValue;
                }
                else {
                    matchResult = 7;
                    c_19 = matchValue;
                }
                break;
            }
            default:
                if ((c_9 = matchValue, isDigit(c_9))) {
                    matchResult = 4;
                    c_14 = matchValue;
                }
                else if ((c_10 = matchValue, isLetter(c_10) ? true : (c_10 === "_"))) {
                    matchResult = 5;
                    c_16 = matchValue;
                }
                else if ((c_11 = matchValue, contains(c_11, "(){}[]<>.,;:=+-*/%&|!?@^~".split(""), {
                    Equals: (x_3, y_3) => (x_3 === y_3),
                    GetHashCode: stringHash,
                }))) {
                    matchResult = 6;
                    c_18 = matchValue;
                }
                else {
                    matchResult = 7;
                    c_19 = matchValue;
                }
        }
        switch (matchResult) {
            case 0: {
                const start_1 = i | 0;
                advance();
                while ((i < len) && (item(i, chars) !== "\"")) {
                    advance();
                }
                if (i < len) {
                    advance();
                }
                tokens = cons(new Token(1, [code.slice(start_1, (i - 1) + 1)]), tokens);
                break;
            }
            case 1: {
                const start_2 = i | 0;
                advance();
                while ((i < len) && (item(i, chars) !== "\'")) {
                    advance();
                }
                if (i < len) {
                    advance();
                }
                tokens = cons(new Token(1, [code.slice(start_2, (i - 1) + 1)]), tokens);
                break;
            }
            case 2: {
                const rest = readWhile((c_12) => (c_12 !== "\n"));
                tokens = cons(new Token(2, [rest]), tokens);
                break;
            }
            case 3: {
                const rest_1 = readWhile((c_13) => (c_13 !== "\n"));
                tokens = cons(new Token(2, [rest_1]), tokens);
                break;
            }
            case 4: {
                const num = readWhile((c_15) => (isDigit(c_15) ? true : (c_15 === ".")));
                tokens = cons(new Token(3, [num]), tokens);
                break;
            }
            case 5: {
                const word = readWhile((c_17) => (isLetterOrDigit(c_17) ? true : (c_17 === "_")));
                if (FSharpSet__Contains(keywords, word)) {
                    tokens = cons(new Token(0, [word]), tokens);
                }
                else {
                    tokens = cons(new Token(5, [word]), tokens);
                }
                break;
            }
            case 6: {
                tokens = cons(new Token(4, [c_18]), tokens);
                advance();
                break;
            }
            case 7: {
                tokens = cons(new Token(5, [c_19]), tokens);
                advance();
                break;
            }
        }
    }
    return reverse(tokens);
}

/**
 * Render a highlighted code block
 */
export function render(language, code) {
    let elems_1, elems;
    if (code === "") {
        return defaultOf();
    }
    else {
        const tokens = tokenize(language, code);
        return createElement("pre", createObj(ofArray([["className", "code-block"], (elems_1 = [createElement("code", createObj(singleton_1((elems = toList(delay(() => collect((token) => {
            const matchValue = token;
            switch (matchValue.tag) {
                case 1: {
                    const s_1 = matchValue.fields[0];
                    return singleton(createElement("span", {
                        className: "tok-string",
                        children: s_1,
                    }));
                }
                case 2: {
                    const s_2 = matchValue.fields[0];
                    return singleton(createElement("span", {
                        className: "tok-comment",
                        children: s_2,
                    }));
                }
                case 3: {
                    const s_3 = matchValue.fields[0];
                    return singleton(createElement("span", {
                        className: "tok-number",
                        children: s_3,
                    }));
                }
                case 4: {
                    const s_4 = matchValue.fields[0];
                    return singleton(createElement("span", {
                        className: "tok-punct",
                        children: s_4,
                    }));
                }
                case 5: {
                    const s_5 = matchValue.fields[0];
                    return singleton(s_5);
                }
                default: {
                    const s = matchValue.fields[0];
                    return singleton(createElement("span", {
                        className: "tok-keyword",
                        children: s,
                    }));
                }
            }
        }, tokens))), ["children", reactApi.Children.toArray(Array.from(elems))]))))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
    }
}

