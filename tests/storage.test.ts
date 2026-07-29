import { describe, expect, test } from "bun:test";
import {
  allowedFileTypes,
  maxFileSize,
  safeFileName,
} from "@/lib/storage";

describe("archivos privados", () => {
  test("permite formatos institucionales y rechaza ejecutables", () => {
    expect(allowedFileTypes.has("application/pdf")).toBe(true);
    expect(allowedFileTypes.has("image/jpeg")).toBe(true);
    expect(allowedFileTypes.has("application/x-msdownload")).toBe(false);
  });

  test("limita cada archivo a 10 MB", () => {
    expect(maxFileSize).toBe(10 * 1024 * 1024);
  });

  test("normaliza rutas sin segmentos peligrosos", () => {
    const result = safeFileName("../../Resolución ñ 01.pdf");
    expect(result).not.toContain("/");
    expect(result).not.toContain("ñ");
    expect(result.endsWith(".pdf")).toBe(true);
  });
});
