export function generateFileKey(originalName: string): string {
  if (!originalName) throw new Error("Filename is required");

  const parts = originalName.split(".");
  const ext = parts.pop() ?? "jpg";
  const base = parts.join(".").replace(/\s+/g, "-");

  const timestamp = Date.now();
  return `tasks/${base}-${timestamp}.${ext}`;
}
