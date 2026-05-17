module CodeCards.CodeHighlight

open Feliz
open CodeCards.Types

/// Keyword sets for different languages
module private Keywords =
    let fsharp =
        Set.ofList [ "let"; "in"; "if"; "then"; "else"; "elif"; "match"; "with"
                     "for"; "while"; "do"; "done"; "open"; "module"; "namespace"
                     "type"; "and"; "or"; "not"; "true"; "false"; "fun"; "function"
                     "rec"; "mutable"; "yield"; "return"; "of"; "inherit"; "member"
                     "static"; "abstract"; "override"; "interface"; "new"; "val"
                     "when"; "as"; "null"; "begin"; "end"; "try"; "finally"; "raise" ]

    let python =
        Set.ofList [ "def"; "class"; "if"; "elif"; "else"; "for"; "while"; "return"
                     "import"; "from"; "as"; "try"; "except"; "finally"; "with"
                     "yield"; "lambda"; "pass"; "break"; "continue"; "and"; "or"
                     "not"; "in"; "is"; "True"; "False"; "None"; "self"; "raise"
                     "global"; "nonlocal"; "assert"; "del"; "print" ]

    let javascript =
        Set.ofList [ "const"; "let"; "var"; "function"; "return"; "if"; "else"
                     "for"; "while"; "do"; "switch"; "case"; "break"; "continue"
                     "class"; "extends"; "new"; "this"; "super"; "import"; "export"
                     "from"; "default"; "try"; "catch"; "finally"; "throw"; "async"
                     "await"; "yield"; "of"; "in"; "typeof"; "instanceof"; "null"
                     "undefined"; "true"; "false"; "void"; "delete" ]

    let csharp =
        Set.ofList [ "using"; "namespace"; "class"; "struct"; "interface"; "enum"
                     "public"; "private"; "protected"; "internal"; "static"; "void"
                     "int"; "string"; "bool"; "float"; "double"; "var"; "new"; "return"
                     "if"; "else"; "for"; "foreach"; "while"; "do"; "switch"; "case"
                     "break"; "continue"; "try"; "catch"; "finally"; "throw"; "async"
                     "await"; "null"; "true"; "false"; "this"; "base"; "readonly"
                     "override"; "virtual"; "abstract"; "sealed"; "partial" ]

    let sql =
        Set.ofList [ "SELECT"; "FROM"; "WHERE"; "INSERT"; "UPDATE"; "DELETE"; "CREATE"
                     "TABLE"; "ALTER"; "DROP"; "INDEX"; "JOIN"; "LEFT"; "RIGHT"; "INNER"
                     "OUTER"; "ON"; "AND"; "OR"; "NOT"; "IN"; "IS"; "NULL"; "AS"; "ORDER"
                     "BY"; "GROUP"; "HAVING"; "LIMIT"; "OFFSET"; "UNION"; "INTO"; "VALUES"
                     "SET"; "DISTINCT"; "COUNT"; "SUM"; "AVG"; "MAX"; "MIN"; "LIKE"
                     "BETWEEN"; "EXISTS"; "CASE"; "WHEN"; "THEN"; "ELSE"; "END"; "ASC"; "DESC" ]

    let forLanguage (lang: Language) =
        match lang with
        | FSharp -> fsharp
        | Python -> python
        | JavaScript -> javascript
        | CSharp -> csharp
        | SQL -> sql
        | _ -> Set.empty

/// Token types for highlighting
type private Token =
    | Keyword of string
    | StringLit of string
    | Comment of string
    | Number of string
    | Punctuation of string
    | Plain of string

/// Simple tokenizer — splits code into tokens for highlighting
let private tokenize (lang: Language) (code: string) : Token list =
    let keywords = Keywords.forLanguage lang
    let mutable tokens = []
    let mutable i = 0
    let chars = code.ToCharArray()
    let len = chars.Length

    let peek () = if i < len then Some chars.[i] else None
    let advance () = i <- i + 1

    let readWhile pred =
        let start = i
        while i < len && pred chars.[i] do advance ()
        code.[start..i-1]

    while i < len do
        match chars.[i] with
        // String literals
        | '"' ->
            let start = i
            advance ()
            while i < len && chars.[i] <> '"' do advance ()
            if i < len then advance ()
            tokens <- StringLit(code.[start..i-1]) :: tokens

        | '\'' when lang <> FSharp ->
            let start = i
            advance ()
            while i < len && chars.[i] <> '\'' do advance ()
            if i < len then advance ()
            tokens <- StringLit(code.[start..i-1]) :: tokens

        // Comments
        | '/' when i + 1 < len && chars.[i+1] = '/' ->
            let rest = readWhile (fun c -> c <> '\n')
            tokens <- Comment(rest) :: tokens

        | '#' when (lang = Python) ->
            let rest = readWhile (fun c -> c <> '\n')
            tokens <- Comment(rest) :: tokens

        // Numbers
        | c when System.Char.IsDigit(c) ->
            let num = readWhile (fun c -> System.Char.IsDigit(c) || c = '.')
            tokens <- Number(num) :: tokens

        // Words (identifiers / keywords)
        | c when System.Char.IsLetter(c) || c = '_' ->
            let word = readWhile (fun c -> System.Char.IsLetterOrDigit(c) || c = '_')
            if keywords.Contains word then
                tokens <- Keyword(word) :: tokens
            else
                tokens <- Plain(word) :: tokens

        // Punctuation
        | c when "(){}[]<>.,;:=+-*/%&|!?@^~" |> Seq.contains c ->
            tokens <- Punctuation(string c) :: tokens
            advance ()

        // Whitespace and other
        | c ->
            tokens <- Plain(string c) :: tokens
            advance ()

    tokens |> List.rev

/// Render a highlighted code block
let render (language: Language) (code: string) =
    if code = "" then Html.none
    else
        let tokens = tokenize language code
        Html.pre [
            prop.className "code-block"
            prop.children [
                Html.code [
                    prop.children [
                        for token in tokens do
                            match token with
                            | Keyword s ->
                                Html.span [ prop.className "tok-keyword"; prop.text s ]
                            | StringLit s ->
                                Html.span [ prop.className "tok-string"; prop.text s ]
                            | Comment s ->
                                Html.span [ prop.className "tok-comment"; prop.text s ]
                            | Number s ->
                                Html.span [ prop.className "tok-number"; prop.text s ]
                            | Punctuation s ->
                                Html.span [ prop.className "tok-punct"; prop.text s ]
                            | Plain s ->
                                Html.text s
                    ]
                ]
            ]
        ]
