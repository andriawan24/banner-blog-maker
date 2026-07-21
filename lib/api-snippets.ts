// Shared multi-language request-snippet builder for the banner render API.
// Used by both the editor's (removed) inline preview and the standalone
// /api-docs page, so the two never drift out of sync.

export const API_LANGS = ["cURL", "JavaScript", "Python", "Kotlin", "Go"] as const;
export type ApiLang = (typeof API_LANGS)[number];
export const API_ENDPOINT = "https://api.banner-studio.app/v1/banners";

// Render a copy-pasteable request in the chosen language for the given payload.
export function buildSnippet(lang: ApiLang, payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload, null, 2);
  const jsonInline = JSON.stringify(payload);

  switch (lang) {
    case "cURL":
      return [
        `curl -X POST ${API_ENDPOINT} \\`,
        `  -H "Authorization: Bearer $BANNER_API_KEY" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d '${jsonInline}' \\`,
        `  --output banner.${payload.format}`,
      ].join("\n");

    case "JavaScript":
      return [
        `const res = await fetch("${API_ENDPOINT}", {`,
        `  method: "POST",`,
        `  headers: {`,
        `    Authorization: \`Bearer \${process.env.BANNER_API_KEY}\`,`,
        `    "Content-Type": "application/json",`,
        `  },`,
        `  body: JSON.stringify(${indent(json, 2)}),`,
        `});`,
        ``,
        `const blob = await res.blob();`,
      ].join("\n");

    case "Python":
      return [
        `import os, requests`,
        ``,
        `res = requests.post(`,
        `    "${API_ENDPOINT}",`,
        `    headers={"Authorization": f"Bearer {os.environ['BANNER_API_KEY']}"},`,
        `    json=${pyDict(payload)},`,
        `)`,
        `open("banner.${payload.format}", "wb").write(res.content)`,
      ].join("\n");

    case "Kotlin":
      return [
        `val client = OkHttpClient()`,
        `val body = """${jsonInline}"""`,
        `    .toRequestBody("application/json".toMediaType())`,
        ``,
        `val request = Request.Builder()`,
        `    .url("${API_ENDPOINT}")`,
        `    .header("Authorization", "Bearer " + System.getenv("BANNER_API_KEY"))`,
        `    .post(body)`,
        `    .build()`,
        ``,
        `client.newCall(request).execute().use { res ->`,
        `    File("banner.${payload.format}").writeBytes(res.body!!.bytes())`,
        `}`,
      ].join("\n");

    case "Go":
      return [
        `package main`,
        ``,
        `import (`,
        `\t"bytes"`,
        `\t"io"`,
        `\t"net/http"`,
        `\t"os"`,
        `)`,
        ``,
        `func main() {`,
        `\tbody := []byte(\`${jsonInline}\`)`,
        `\treq, _ := http.NewRequest("POST", "${API_ENDPOINT}", bytes.NewReader(body))`,
        `\treq.Header.Set("Authorization", "Bearer "+os.Getenv("BANNER_API_KEY"))`,
        `\treq.Header.Set("Content-Type", "application/json")`,
        ``,
        `\tres, _ := http.DefaultClient.Do(req)`,
        `\tdefer res.Body.Close()`,
        `\tout, _ := os.Create("banner.${payload.format}")`,
        `\tio.Copy(out, res.Body)`,
        `}`,
      ].join("\n");
  }
}

// Indent every line after the first by `n` spaces — keeps inlined JSON aligned.
function indent(s: string, n: number): string {
  const pad = " ".repeat(n);
  return s.split("\n").map((l, i) => (i === 0 ? l : pad + l)).join("\n");
}

// Render a JSON payload as a Python dict literal (True/False/None, not JSON).
function pyDict(payload: Record<string, unknown>): string {
  return JSON.stringify(payload, null, 4)
    .replace(/\btrue\b/g, "True")
    .replace(/\bfalse\b/g, "False")
    .replace(/\bnull\b/g, "None")
    .split("\n")
    .map((l, i) => (i === 0 ? l : "    " + l))
    .join("\n");
}
