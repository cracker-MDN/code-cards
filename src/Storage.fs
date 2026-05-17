module CodeCards.Storage

open System
open Fable.Core
open Browser
open Thoth.Json
open CodeCards.Types

/// JSON encoders
module Encode =
    let language (l: Language) = Encode.string l.Code

    let srData (sr: SRData) =
        Encode.object
            [ "interval", Encode.float sr.Interval
              "easeFactor", Encode.float sr.EaseFactor
              "repetitions", Encode.int sr.Repetitions
              "nextReview", Encode.datetime sr.NextReview
              "lastReviewed",
                match sr.LastReviewed with
                | Some dt -> Encode.datetime dt
                | None -> Encode.nil ]

    let card (c: Card) =
        Encode.object
            [ "id", Encode.guid c.Id
              "front", Encode.string c.Front
              "back", Encode.string c.Back
              "codeSnippet", Encode.string c.CodeSnippet
              "language", language c.Language
              "tags", c.Tags |> List.map Encode.string |> Encode.list
              "srData", srData c.SRData
              "createdAt", Encode.datetime c.CreatedAt ]

    let deck (d: Deck) =
        Encode.object
            [ "id", Encode.guid d.Id
              "name", Encode.string d.Name
              "description", Encode.string d.Description
              "color", Encode.string d.Color
              "icon", Encode.string d.Icon
              "cards", d.Cards |> List.map card |> Encode.list
              "createdAt", Encode.datetime d.CreatedAt ]

    let reviewResult (r: ReviewResult) =
        Encode.object
            [ "cardId", Encode.guid r.CardId
              "deckId", Encode.guid r.DeckId
              "difficulty", Encode.string (
                match r.Difficulty with
                | Again -> "again"
                | Hard -> "hard"
                | Good -> "good"
                | Easy -> "easy")
              "reviewedAt", Encode.datetime r.ReviewedAt ]

/// JSON decoders
module Decode =
    let language: Decoder<Language> =
        Decode.string |> Decode.map Languages.fromCode

    let srData: Decoder<SRData> =
        Decode.object (fun get ->
            { Interval = get.Required.Field "interval" Decode.float
              EaseFactor = get.Required.Field "easeFactor" Decode.float
              Repetitions = get.Required.Field "repetitions" Decode.int
              NextReview = get.Required.Field "nextReview" Decode.datetime
              LastReviewed = get.Optional.Field "lastReviewed" Decode.datetime })

    let card: Decoder<Card> =
        Decode.object (fun get ->
            { Id = get.Required.Field "id" Decode.guid
              Front = get.Required.Field "front" Decode.string
              Back = get.Required.Field "back" Decode.string
              CodeSnippet = get.Required.Field "codeSnippet" Decode.string
              Language = get.Required.Field "language" language
              Tags = get.Required.Field "tags" (Decode.list Decode.string)
              SRData = get.Required.Field "srData" srData
              CreatedAt = get.Required.Field "createdAt" Decode.datetime })

    let deck: Decoder<Deck> =
        Decode.object (fun get ->
            { Id = get.Required.Field "id" Decode.guid
              Name = get.Required.Field "name" Decode.string
              Description = get.Required.Field "description" Decode.string
              Color = get.Required.Field "color" Decode.string
              Icon = get.Required.Field "icon" Decode.string
              Cards = get.Required.Field "cards" (Decode.list card)
              CreatedAt = get.Required.Field "createdAt" Decode.datetime })

    let difficulty: Decoder<Difficulty> =
        Decode.string |> Decode.andThen (fun s ->
            match s with
            | "again" -> Decode.succeed Again
            | "hard" -> Decode.succeed Hard
            | "good" -> Decode.succeed Good
            | "easy" -> Decode.succeed Easy
            | _ -> Decode.succeed Good)

    let reviewResult: Decoder<ReviewResult> =
        Decode.object (fun get ->
            { CardId = get.Required.Field "cardId" Decode.guid
              DeckId = get.Required.Field "deckId" Decode.guid
              Difficulty = get.Required.Field "difficulty" difficulty
              ReviewedAt = get.Required.Field "reviewedAt" Decode.datetime })

/// Storage keys
[<Literal>]
let private DecksKey = "codecards_decks"
[<Literal>]
let private HistoryKey = "codecards_history"

let private save key value = window.localStorage.setItem(key, value)
let private load key = window.localStorage.getItem key |> Option.ofObj

/// Save and load decks
let saveDecks (decks: Deck list) =
    decks |> List.map Encode.deck |> Encode.list |> Encode.toString 0 |> save DecksKey

let loadDecks () : Deck list =
    load DecksKey
    |> Option.bind (fun json ->
        match Decode.fromString (Decode.list Decode.deck) json with
        | Ok d -> Some d | Error _ -> None)
    |> Option.defaultValue []

/// Save and load review history
let saveHistory (history: ReviewResult list) =
    history |> List.map Encode.reviewResult |> Encode.list |> Encode.toString 0 |> save HistoryKey

let loadHistory () : ReviewResult list =
    load HistoryKey
    |> Option.bind (fun json ->
        match Decode.fromString (Decode.list Decode.reviewResult) json with
        | Ok h -> Some h | Error _ -> None)
    |> Option.defaultValue []

/// Export a deck as JSON string
let exportDeck (deck: Deck) : string =
    deck |> Encode.deck |> Encode.toString 2

/// Import a deck from JSON string
let importDeck (json: string) : Deck option =
    match Decode.fromString Decode.deck json with
    | Ok d -> Some { d with Id = Guid.NewGuid(); CreatedAt = DateTime.Now }
    | Error _ -> None
