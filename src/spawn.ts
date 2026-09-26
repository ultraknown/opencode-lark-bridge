import { spawn } from "node:child_process"

export interface CommandResult {
  exitCode: number
  stdout: string
  stderr: string
}

export type ShellRunner = (command: string) => Promise<CommandResult>

export function runShellBun(command: string): Promise<CommandResult> {
  const proc = Bun.spawn(["bash", "-c", command], {
    stdout: "pipe",
    stderr: "pipe",
  })
  return proc.exited.then(async (exitCode) => ({
    exitCode,
    stdout: await new Response(proc.stdout).text(),
    stderr: await new Response(proc.stderr).text(),
  }))
}

export function runShellNode(command: string): Promise<CommandResult> {
  return new Promise((resolve) => {
    const proc = spawn("bash", ["-c", command])
    let stdout = ""
    let stderr = ""
    proc.stdout?.setEncoding("utf8")
    proc.stderr?.setEncoding("utf8")
    proc.stdout?.on("data", (chunk: string) => { stdout += chunk })
    proc.stderr?.on("data", (chunk: string) => { stderr += chunk })
    proc.once("error", (err) => { resolve({ exitCode: -1, stdout, stderr: `${stderr}${err.message}` }) })
    proc.once("close", (code) => { resolve({ exitCode: code ?? -1, stdout, stderr }) })
  })
}

function hasBunRuntime(): boolean {
  return typeof Bun !== "undefined"
}

export function createShellRunner(detect: () => boolean = hasBunRuntime): ShellRunner {
  return detect() ? runShellBun : runShellNode
}

export function runShell(command: string): Promise<CommandResult> {
  return createShellRunner()(command)
}
