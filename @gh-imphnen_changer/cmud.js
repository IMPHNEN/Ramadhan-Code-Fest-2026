export class CMUDCore {
  constructor(config = {}) {
    this.dictionary = config.dictionary || {}
    this.pseudoWords = config.pseudoWords || []
    this.splitters = config.splitters || ["dan", "and"]
  }

  splitCommands(input) {
    const regex = new RegExp(`\\b(${this.splitters.join("|")})\\b`, "gi")
    return input.split(regex).filter(x => !this.splitters.includes(x.trim()))
  }

  collect(input) {
    return input
      .toLowerCase()
      .split(/\s+/)
      .filter(w => !this.pseudoWords.includes(w))
  }

  mean(tokens) {
    return tokens.map(word => ({
      word,
      type: this.dictionary[word] || "subject"
    }))
  }

  parseLineSpecifier(tokens) {
    let result = null

    tokens.forEach((t, i) => {
      if (t.word === "line") {
        const next = tokens[i + 1]?.word

        if (!next) return

        if (next === "all" || next === "semua") {
          result = "all"
        }

        // multi line: 2,4,6
        else if (/^\d+(,\d+)+$/.test(next)) {
          result = next.split(",").map(n => parseInt(n))
        }

        // range: 2-7
        else if (/^\d+-\d+$/.test(next)) {
          const [start, end] = next.split("-").map(n => parseInt(n))
          result = []
          for (let i = start; i <= end; i++) result.push(i)
        }

        // single line
        else if (!isNaN(next)) {
          result = [parseInt(next)]
        }
      }
    })

    return result
  }

  understand(tokens) {
    let action = null
    let connectorIndex = -1

    tokens.forEach((token, i) => {
      if (token.type === "action") action = "replace"
      if (token.type === "connector") connectorIndex = i
    })

    if (!action || connectorIndex === -1) return null

    const from = tokens
      .slice(0, connectorIndex)
      .find(t => t.type === "subject")?.word

    const to = tokens
      .slice(connectorIndex + 1)
      .find(t => t.type === "subject")?.word

    const line = this.parseLineSpecifier(tokens)

    if (!from || !to) return null

    return { action, from, to, line }
  }

  parse(input) {
    const commandParts = this.splitCommands(input)
    return commandParts.map(cmd => {
      const tokens = this.collect(cmd)
      const meanings = this.mean(tokens)
      return this.understand(meanings)
    }).filter(Boolean)
  }
}

export class CMUDReplacer {
  constructor(core) {
    this.core = core
    this.history = []
    this.future = []
  }

  applyReplace(command, text) {
    const regex = new RegExp(`\\b${command.from}\\b`, "g")
    const lines = text.split("\n")

    // replaceAll
    if (command.line === "all" || command.line === null) {
      return text.replace(regex, command.to)
    }

    // array of lines
    if (Array.isArray(command.line)) {
      command.line.forEach(lineNumber => {
        const index = lineNumber - 1
        if (lines[index]) {
          lines[index] = lines[index].replace(regex, command.to)
        }
      })
      return lines.join("\n")
    }

    return text
  }

  run(commandString, text) {
    const commands = this.core.parse(commandString)

    if (["undo", "ulang"].includes(commandString.trim().toLowerCase())) {
      return this.undo(text)
    }

    if (["recover"].includes(commandString.trim().toLowerCase())) {
      return this.recover(text)
    }

    let newText = text

    commands.forEach(cmd => {
      newText = this.applyReplace(cmd, newText)
    })

    if (newText !== text) {
      this.history.push(text)
      this.future = []
    }

    return newText
  }

  undo(currentText) {
    if (this.history.length === 0) return currentText
    const previous = this.history.pop()
    this.future.push(currentText)
    return previous
  }

  recover(currentText) {
    if (this.future.length === 0) return currentText
    const next = this.future.pop()
    this.history.push(currentText)
    return next
  }
}
