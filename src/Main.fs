module CodeCards.Main

open Feliz
open Browser
open CodeCards.Types
open CodeCards.App

/// Root React component
[<ReactComponent>]
let AppComponent () =
    let (model, dispatch) = React.useReducer ((fun model msg -> update msg model), init ())

    // Keyboard shortcuts for review
    React.useEffect (
        (fun () ->
            let handler (e: Types.KeyboardEvent) =
                match model.ActiveView with
                | ReviewView _ ->
                    match e.key with
                    | " " | "Enter" ->
                        if model.CardSide = FrontSide then
                            e.preventDefault ()
                            dispatch FlipCard
                    | "1" -> if model.CardSide = BackSide then dispatch (RateCard Again)
                    | "2" -> if model.CardSide = BackSide then dispatch (RateCard Hard)
                    | "3" -> if model.CardSide = BackSide then dispatch (RateCard Good)
                    | "4" -> if model.CardSide = BackSide then dispatch (RateCard Easy)
                    | "Escape" -> dispatch EndReview
                    | _ -> ()
                | _ -> ()

            let wrappedHandler = unbox<Types.Event -> unit> handler
            document.addEventListener ("keydown", wrappedHandler)
            { new System.IDisposable with
                member _.Dispose() =
                    document.removeEventListener ("keydown", wrappedHandler) }
        ),
        [| box model.ActiveView; box model.CardSide |]
    )

    // Update page title
    React.useEffect (
        (fun () ->
            let title =
                match model.ActiveView with
                | DeckListView -> "My Decks"
                | DeckDetailView _ -> "Deck"
                | CardEditorView _ -> "Edit Card"
                | ReviewView _ -> "Study Session"
                | StatsView -> "Statistics"
            document.title <- sprintf "%s | CodeCards" title
        ),
        [| box model.ActiveView |]
    )

    view model dispatch

/// Mount the application
let root = ReactDOM.createRoot (document.getElementById "app")
root.render (AppComponent ())
