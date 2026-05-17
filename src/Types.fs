module CodeCards.Types

open System

/// Supported programming languages for syntax highlighting
type Language =
    | FSharp
    | Python
    | JavaScript
    | CSharp
    | SQL
    | HTML
    | CSS
    | PlainText

    member this.Label =
        match this with
        | FSharp -> "F#"
        | Python -> "Python"
        | JavaScript -> "JavaScript"
        | CSharp -> "C#"
        | SQL -> "SQL"
        | HTML -> "HTML"
        | CSS -> "CSS"
        | PlainText -> "Plain Text"

    member this.Code =
        match this with
        | FSharp -> "fsharp"
        | Python -> "python"
        | JavaScript -> "javascript"
        | CSharp -> "csharp"
        | SQL -> "sql"
        | HTML -> "html"
        | CSS -> "css"
        | PlainText -> "plaintext"

/// All available languages
module Languages =
    let all = [ FSharp; Python; JavaScript; CSharp; SQL; HTML; CSS; PlainText ]

    let fromCode (code: string) =
        all |> List.tryFind (fun l -> l.Code = code) |> Option.defaultValue PlainText

/// Card difficulty rating after review
type Difficulty =
    | Again     // Complete blackout, reset
    | Hard      // Significant difficulty
    | Good      // Correct with some effort
    | Easy      // Effortless recall

/// Spaced repetition data for a card
type SRData =
    { Interval: float       // Days until next review
      EaseFactor: float     // Multiplier (minimum 1.3)
      Repetitions: int      // Consecutive correct reviews
      NextReview: DateTime  // When the card is due
      LastReviewed: DateTime option }

    static member New =
        { Interval = 0.0
          EaseFactor = 2.5
          Repetitions = 0
          NextReview = DateTime.Now
          LastReviewed = None }

/// Mastery level based on SR data
type MasteryLevel =
    | New
    | Learning
    | Reviewing
    | Mastered

/// A single flashcard
type Card =
    { Id: Guid
      Front: string           // Question or prompt
      Back: string            // Answer or explanation
      CodeSnippet: string     // Optional code example
      Language: Language       // Language for syntax highlighting
      Tags: string list       // Tags for filtering
      SRData: SRData          // Spaced repetition state
      CreatedAt: DateTime }

/// A deck (collection) of flashcards
type Deck =
    { Id: Guid
      Name: string
      Description: string
      Color: string
      Icon: string
      Cards: Card list
      CreatedAt: DateTime }

/// Review session result for a single card
type ReviewResult =
    { CardId: Guid
      DeckId: Guid
      Difficulty: Difficulty
      ReviewedAt: DateTime }

/// Daily study stats
type DailyStats =
    { Date: DateTime
      CardsReviewed: int
      CorrectCount: int }

/// Active view in the application
type ActiveView =
    | DeckListView
    | DeckDetailView of Guid
    | CardEditorView of deckId: Guid * cardId: Guid option
    | ReviewView of Guid
    | StatsView

/// Card side being shown in review
type CardSide =
    | FrontSide
    | BackSide

/// Card editor form state
type CardFormState =
    { Front: string
      Back: string
      CodeSnippet: string
      Language: Language
      Tags: string }

    static member Empty =
        { Front = ""
          Back = ""
          CodeSnippet = ""
          Language = FSharp
          Tags = "" }

    static member FromCard (card: Card) =
        { Front = card.Front
          Back = card.Back
          CodeSnippet = card.CodeSnippet
          Language = card.Language
          Tags = card.Tags |> String.concat ", " }

/// Deck editor form state
type DeckFormState =
    { Name: string
      Description: string
      Color: string
      Icon: string }

    static member Empty =
        { Name = ""
          Description = ""
          Color = "#6366f1"
          Icon = "\U0001F4BB" }

/// Root application model
type Model =
    { Decks: Deck list
      ReviewHistory: ReviewResult list
      ActiveView: ActiveView
      // Review state
      CurrentCardIndex: int
      CardSide: CardSide
      SessionResults: ReviewResult list
      // Forms
      CardForm: CardFormState
      DeckForm: DeckFormState
      ShowDeckForm: bool
      EditingDeckId: Guid option
      // Filters
      SearchQuery: string
      SelectedTags: string list }

/// All possible messages
type Msg =
    // Navigation
    | SetView of ActiveView
    | GoBack
    // Deck management
    | SetDeckName of string
    | SetDeckDescription of string
    | SetDeckColor of string
    | SetDeckIcon of string
    | ToggleDeckForm
    | EditDeck of Guid
    | SaveDeck
    | DeleteDeck of Guid
    | CancelDeckEdit
    // Card management
    | SetCardFront of string
    | SetCardBack of string
    | SetCardCode of string
    | SetCardLanguage of Language
    | SetCardTags of string
    | SaveCard of Guid   // deckId
    | DeleteCard of Guid * Guid  // deckId * cardId
    | CancelCardEdit
    // Review
    | StartReview of Guid
    | FlipCard
    | RateCard of Difficulty
    | NextCard
    | EndReview
    // Filters
    | SetSearchQuery of string
    | ToggleTag of string
    // Data
    | ImportDeck of string
    | ExportDeck of Guid

/// Preset deck colors
module Colors =
    let palette =
        [| "#6366f1"; "#8b5cf6"; "#ec4899"; "#ef4444"
           "#f97316"; "#eab308"; "#22c55e"; "#06b6d4"
           "#3b82f6"; "#a855f7"; "#14b8a6"; "#f43f5e" |]

/// Preset deck icons
module Icons =
    let all =
        [| "\U0001F4BB"; "\U0001F40D"; "\U0001F310"; "\U0001F4CA"
           "\U0001F527"; "\U0001F3AF"; "\U0001F4D6"; "\U0001F680"
           "\u2699\uFE0F"; "\U0001F9EA"; "\U0001F5C3\uFE0F"; "\U0001F4A1"
           "\U0001F916"; "\U0001F50D"; "\U0001F4DD"; "\U0001F3C6" |]

/// Helper to get mastery level from SR data
module Mastery =
    let level (sr: SRData) =
        if sr.Repetitions = 0 then New
        elif sr.Repetitions < 3 then Learning
        elif sr.Interval < 21.0 then Reviewing
        else Mastered

    let label (level: MasteryLevel) =
        match level with
        | New -> "New"
        | Learning -> "Learning"
        | Reviewing -> "Reviewing"
        | Mastered -> "Mastered"

    let color (level: MasteryLevel) =
        match level with
        | New -> "#94a3b8"
        | Learning -> "#f59e0b"
        | Reviewing -> "#3b82f6"
        | Mastered -> "#22c55e"
