import { createElement } from "react";
import React from "react";
import { view, update as update_1, init } from "./App.fs.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { useEffectWithDeps } from "./fable_modules/Feliz.2.9.0/./ReactInterop.js";
import { equals } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { Difficulty, Msg, CardSide } from "./Types.fs.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { createRoot } from "react-dom/client";

/**
 * Root React component
 */
export function AppComponent() {
    let patternInput;
    const arg_1 = init();
    patternInput = reactApi.useReducer((model, msg) => update_1(msg, model), arg_1);
    const model_1 = patternInput[0];
    const dispatch = patternInput[1];
    useEffectWithDeps(() => {
        const handler = (e) => {
            if (model_1.ActiveView.tag === 3) {
                const matchValue_1 = e.key;
                switch (matchValue_1) {
                    case " ":
                    case "Enter": {
                        if (equals(model_1.CardSide, new CardSide(0, []))) {
                            e.preventDefault();
                            dispatch(new Msg(20, []));
                        }
                        break;
                    }
                    case "1": {
                        if (equals(model_1.CardSide, new CardSide(1, []))) {
                            dispatch(new Msg(21, [new Difficulty(0, [])]));
                        }
                        break;
                    }
                    case "2": {
                        if (equals(model_1.CardSide, new CardSide(1, []))) {
                            dispatch(new Msg(21, [new Difficulty(1, [])]));
                        }
                        break;
                    }
                    case "3": {
                        if (equals(model_1.CardSide, new CardSide(1, []))) {
                            dispatch(new Msg(21, [new Difficulty(2, [])]));
                        }
                        break;
                    }
                    case "4": {
                        if (equals(model_1.CardSide, new CardSide(1, []))) {
                            dispatch(new Msg(21, [new Difficulty(3, [])]));
                        }
                        break;
                    }
                    case "Escape": {
                        dispatch(new Msg(23, []));
                        break;
                    }
                    default:
                        undefined;
                }
            }
        };
        const wrappedHandler = (arg_2) => {
            handler(arg_2);
        };
        document.addEventListener("keydown", wrappedHandler);
        return {
            Dispose() {
                document.removeEventListener("keydown", wrappedHandler);
            },
        };
    }, [model_1.ActiveView, model_1.CardSide]);
    const dependencies_1 = [model_1.ActiveView];
    reactApi.useEffect(() => {
        let title;
        const matchValue_2 = model_1.ActiveView;
        title = ((matchValue_2.tag === 1) ? "Deck" : ((matchValue_2.tag === 2) ? "Edit Card" : ((matchValue_2.tag === 3) ? "Study Session" : ((matchValue_2.tag === 4) ? "Statistics" : "My Decks"))));
        document.title = toText(printf("%s | CodeCards"))(title);
    }, dependencies_1);
    return view(model_1, dispatch);
}

export const root = createRoot(document.getElementById("app"));

root.render(createElement(AppComponent, null));

