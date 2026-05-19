module CodeCards.ReviewSession

open System
open Feliz
open CodeCards.Types
open CodeCards.SpacedRepetition

/// Progress bar for the review session
let private progressBar (current: int) (total: int) (color: string) =
    let pct = if total = 0 then 0.0 else float (current) / float total * 100.0
    Html.div [
        prop.className "review-progress"
        prop.children [
            Html.div [
                prop.className "review-progress-bar"
                prop.style [
                    style.width (length.percent pct)
                    style.backgroundColor color
                ]
            ]
            Html.span [
                prop.className "review-progress-text"
                prop.text (sprintf "%d / %d" current total)
            ]
        ]
    ]

/// Difficulty rating buttons
let private ratingButtons (dispatch: Msg -> unit) =
    Html.div [
        prop.className "rating-buttons"
        prop.children [
            Html.button [
                prop.className "rate-btn rate-again"
                prop.onClick (fun _ -> dispatch (RateCard Again))
                prop.children [
                    Html.span [ prop.className "rate-label"; prop.text "Again" ]
                    Html.span [ prop.className "rate-hint"; prop.text "< 1 min" ]
                ]
            ]
            Html.button [
                prop.className "rate-btn rate-hard"
                prop.onClick (fun _ -> dispatch (RateCard Hard))
                prop.children [
                    Html.span [ prop.className "rate-label"; prop.text "Hard" ]
                    Html.span [ prop.className "rate-hint"; prop.text "1 day" ]
                ]
            ]
            Html.button [
                prop.className "rate-btn rate-good"
                prop.onClick (fun _ -> dispatch (RateCard Good))
                prop.children [
                    Html.span [ prop.className "rate-label"; prop.text "Good" ]
                    Html.span [ prop.className "rate-hint"; prop.text "3 days" ]
                ]
            ]
            Html.button [
                prop.className "rate-btn rate-easy"
                prop.onClick (fun _ -> dispatch (RateCard Easy))
                prop.children [
                    Html.span [ prop.className "rate-label"; prop.text "Easy" ]
                    Html.span [ prop.className "rate-hint"; prop.text "7 days" ]
                ]
            ]
        ]
    ]

/// Session complete summary
let private sessionComplete (results: ReviewResult list) (deck: Deck) (dispatch: Msg -> unit) =
    let total = List.length results
    let correct = results |> List.filter (fun r -> r.Difficulty <> Again) |> List.length
    let pct = if total = 0 then 0.0 else float correct / float total * 100.0

    Html.div [
        prop.className "session-complete"
        prop.children [
            Html.div [ prop.className "complete-icon"; prop.text "\U0001F389" ]
            Html.h2 [ prop.text "Session Complete!" ]
            Html.p [
                prop.className "complete-stats"
                prop.text (sprintf "%d/%d correct (%.0f%%)" correct total pct)
            ]
            Html.div [
                prop.className "result-breakdown"
                prop.children [
                    let groups = results |> List.countBy (fun r -> r.Difficulty)
                    for (diff, count) in groups do
                        let (label, color) =
                            match diff with
                            | Again -> ("Again", "#ef4444")
                            | Hard -> ("Hard", "#f59e0b")
                            | Good -> ("Good", "#3b82f6")
                            | Easy -> ("Easy", "#22c55e")
                        Html.div [
                            prop.className "result-item"
                            prop.children [
                                Html.div [
                                    prop.className "result-dot"
                                    prop.style [ style.backgroundColor color ]
                                ]
                                Html.span [ prop.text (sprintf "%s: %d" label count) ]
                            ]
                        ]
                ]
            ]
            Html.div [
                prop.className "complete-actions"
                prop.children [
                    Html.button [
                        prop.className "btn btn-primary btn-large"
                        prop.text "Back to Deck"
                        prop.onClick (fun _ -> dispatch (SetView (DeckDetailView deck.Id)))
                    ]
                    let remaining = dueCards deck.Cards |> List.length
                    if remaining > 0 then
                        Html.button [
                            prop.className "btn btn-secondary btn-large"
                            prop.text (sprintf "Continue (%d more)" remaining)
                            prop.onClick (fun _ -> dispatch (StartReview deck.Id))
                        ]
                ]
            ]
        ]
    ]

/// Main review view
let view (deckId: Guid) (model: Model) (dispatch: Msg -> unit) =
    let deck = model.Decks |> List.tryFind (fun d -> d.Id = deckId)

    match deck with
    | None ->
        Html.div [
            prop.className "review-page"
            prop.children [ Html.p [ prop.text "Deck not found." ] ]
        ]
    | Some deck ->
        let studyCards = getStudySession 20 deck.Cards
        let totalCards = List.length studyCards

        if totalCards = 0 && model.SessionResults.IsEmpty then
            Html.div [
                prop.className "review-page"
                prop.children [
                    Html.div [
                        prop.className "empty-state"
                        prop.children [
                            Html.div [ prop.className "empty-icon"; prop.text "\u2705" ]
                            Html.h3 [ prop.text "All caught up!" ]
                            Html.p [ prop.text "No cards are due for review." ]
                            Html.button [
                                prop.className "btn btn-primary"
                                prop.text "Back to Deck"
                                prop.onClick (fun _ -> dispatch (SetView (DeckDetailView deck.Id)))
                            ]
                        ]
                    ]
                ]
            ]
        elif model.CurrentCardIndex >= totalCards then
            // Session complete
            Html.div [
                prop.className "review-page"
                prop.children [ sessionComplete model.SessionResults deck dispatch ]
            ]
        else
            let card = studyCards.[model.CurrentCardIndex]
            let mastery = Mastery.level card.SRData

            Html.div [
                prop.className "review-page"
                prop.children [
                    // Header
                    Html.div [
                        prop.className "review-header"
                        prop.children [
                            Html.button [
                                prop.className "btn-back"
                                prop.text "\u2190 End"
                                prop.onClick (fun _ -> dispatch EndReview)
                            ]
                            Html.span [
                                prop.className "review-deck-name"
                                prop.text deck.Name
                            ]
                        ]
                    ]

                    progressBar (model.CurrentCardIndex + 1) totalCards deck.Color

                    // Mastery indicator
                    Html.div [
                        prop.className "card-mastery-tag"
                        prop.style [ style.backgroundColor (Mastery.color mastery) ]
                        prop.text (Mastery.label mastery)
                    ]

                    // Card
                    Html.div [
                        prop.className (if model.CardSide = BackSide then "review-card flipped" else "review-card")
                        prop.onClick (fun _ -> if model.CardSide = FrontSide then dispatch FlipCard)
                        prop.children [
                            match model.CardSide with
                            | FrontSide ->
                                Html.div [
                                    prop.className "card-content front"
                                    prop.children [
                                        Html.p [ prop.className "card-text"; prop.text card.Front ]
                                        if card.CodeSnippet <> "" then
                                            CodeHighlight.render card.Language card.CodeSnippet
                                        Html.p [ prop.className "flip-hint"; prop.text "Tap to reveal answer" ]
                                    ]
                                ]
                            | BackSide ->
                                Html.div [
                                    prop.className "card-content back"
                                    prop.children [
                                        Html.p [ prop.className "card-question-echo"; prop.text card.Front ]
                                        Html.hr []
                                        Html.p [ prop.className "card-text"; prop.text card.Back ]
                                        if card.CodeSnippet <> "" then
                                            CodeHighlight.render card.Language card.CodeSnippet
                                    ]
                                ]
                        ]
                    ]

                    // Rating buttons (only when back side is showing)
                    if model.CardSide = BackSide then
                        ratingButtons dispatch
                    else
                        Html.button [
                            prop.className "btn btn-primary btn-large btn-flip"
                            prop.text "Show Answer"
                            prop.onClick (fun _ -> dispatch FlipCard)
                        ]

                    // Tags
                    if not card.Tags.IsEmpty then
                        Html.div [
                            prop.className "card-tags"
                            prop.children [
                                for tag in card.Tags do
                                    Html.span [ prop.className "tag"; prop.text tag ]
                            ]
                        ]

                    // Keyboard shortcut hints
                    Html.div [
                        prop.className "keyboard-hints"
                        prop.children [
                            Html.span [ prop.className "kbd-hint"; prop.text "Space" ]
                            Html.span [ prop.className "kbd-sep"; prop.text "= flip" ]
                            Html.span [ prop.className "kbd-divider"; prop.text "·" ]
                            Html.span [ prop.className "kbd-hint"; prop.text "1–4" ]
                            Html.span [ prop.className "kbd-sep"; prop.text "= rate" ]
                            Html.span [ prop.className "kbd-divider"; prop.text "·" ]
                            Html.span [ prop.className "kbd-hint"; prop.text "Esc" ]
                            Html.span [ prop.className "kbd-sep"; prop.text "= end" ]
                        ]
                    ]
                ]
            ]
