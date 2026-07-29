import { describe, expect, test } from "bun:test";
import { can, canTransition, requirePermission } from "@/lib/permissions";

describe("matriz de permisos", () => {
  test("Consulta puede leer e imprimir, pero no modificar", () => {
    expect(can("consulta", "juntas.read")).toBe(true);
    expect(can("consulta", "reports.read")).toBe(true);
    expect(can("consulta", "juntas.write")).toBe(false);
    expect(can("consulta", "users.manage")).toBe(false);
  });

  test("Administrador puede gestionar recursos sensibles", () => {
    expect(can("admin", "juntas.archive")).toBe(true);
    expect(can("admin", "files.write")).toBe(true);
    expect(can("admin", "audit.read")).toBe(true);
  });

  test("una acción no concedida se rechaza", () => {
    expect(() => requirePermission("consulta", "settings.manage")).toThrow(
      "FORBIDDEN",
    );
  });
});

describe("transiciones de estado", () => {
  test("las actas siguen el flujo permitido", () => {
    expect(canTransition("acta", "borrador", "en_revision")).toBe(true);
    expect(canTransition("acta", "borrador", "cerrada")).toBe(false);
    expect(canTransition("acta", "cerrada", "en_revision")).toBe(true);
  });

  test("un compromiso completado no vuelve a abrirse", () => {
    expect(canTransition("compromiso", "completado", "en_curso")).toBe(false);
  });

  test("una reunión no puede saltar de borrador a finalizada", () => {
    expect(canTransition("reunion", "borrador", "finalizada")).toBe(false);
  });
});
