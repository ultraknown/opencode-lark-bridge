import { describe, it, expect } from "bun:test"
import { createShellRunner, runShell, runShellNode } from "../src/spawn"

describe("runShell", () => {
  it("captures stdout and a zero exit code", async () => {
    const result = await runShell("echo hello")
    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe("hello")
  })

  it("captures stderr and a non-zero exit code", async () => {
    const result = await runShell("echo oops 1>&2; exit 3")
    expect(result.exitCode).toBe(3)
    expect(result.stderr).toContain("oops")
  })
})

describe("createShellRunner", () => {
  it("routes to the node runner when no Bun runtime is present", async () => {
    const runner = createShellRunner(() => false)
    const result = await runner("echo from-node")
    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe("from-node")
  })

  it("routes to the bun runner when a Bun runtime is present", async () => {
    const runner = createShellRunner(() => true)
    const result = await runner("echo from-bun")
    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe("from-bun")
  })
})

describe("runShellNode", () => {
  it("runs a command without the Bun global", async () => {
    const result = await runShellNode("echo plain-node")
    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe("plain-node")
  })

  it("reports a non-zero exit code for a missing binary", async () => {
    const result = await runShellNode("opencode-lark-bridge-no-such-binary")
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain("not found")
  })
})
