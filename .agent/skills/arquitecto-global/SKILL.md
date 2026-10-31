---
name: arquitecto-global
description: >-
  Directriz maestra de arquitectura @arquitecto-global para el ecosistema PGAM-EB / Sandra Core L7.
  Úsese cuando el usuario solicite crear nuevos módulos, vistas, motores @pdf, servicios Sandra L7,
  auditar límites de arquitectura entre intranet y extranet, o delegar tareas a sub-agentes.
---

# Skill: @arquitecto-global (Enterprise Military Architect & Monorepo Controller)

Este skill define el protocolo operativo de **`@arquitecto-global`** para diseñar, generar y auditar código dentro del monorepo **PGAM-EB (`@ejercito`)**.

## Flujo de Trabajo Obligatorio

### 1. Evaluación de Impacto y Perímetro
Antes de crear o modificar módulos, identifica:
- **Perímetro:** `intranet` (Administración táctica interna: `personnel`, `permanent-evaluation-board` / JUPE, `payroll`, `mechanized`, `audit`) o `extranet` (Portal externo DMZ: `evaluations`, `discipline`, `award`, `ra2`, `verification`).
- **Capa:** `views` (módulo de negocio), `@pdf` (motor documental), `@services` (comunicación L7/seguridad), `@core` (UI transversal) o `@interface` (modelos y contratos).
- **Contrato L7:** Verifica o registra la función de Sandra Core en `documents/schemas-intranet.json` o `documents/schemas-extranet.json`.

### 2. Scaffolding Automatizado de Módulos
Para crear la estructura base de un nuevo módulo o servicio con sus capas hexagonales (`domain`, `application`, `infrastructure`, `components`), manifiesto `antigravity.manifest.json` y `public-api.ts`:

```bash
./scripts/init-workspace.sh <slug-del-modulo> <intranet|extranet> <views|@pdf|@services|@core|@interface>
```

### 3. Estándar de Marcas (`@antigravity:*`)
Asegúrate de que todo archivo fuente nuevo incluya el encabezado canónico:

```ts
/**
 * @antigravity:ecosystem    <sandra-l7 | intranet | extranet | capacitor-mobile | pdf-engine>
 * @antigravity:project      <intranet | extranet | shared-kernel>
 * @antigravity:layer        <@core | @services | @interface | @pdf | views | seguridad>
 * @antigravity:boundary     <public-api | internal-tactical | dmz-extranet | zero-trust>
 * @antigravity:security     <dlp-protected | totp-required | coordinates-card | standard>
 * @antigravity:architect    @arquitecto-global
 * @antigravity:version      2.3.2
 */
```

### 4. Auditoría de Límites y Seguridad (`validate-boundaries.sh`)
Después de realizar cambios estructurales o antes de aprobar el trabajo de un sub-agente, ejecuta el validador de arquitectura:

```bash
./scripts/validate-boundaries.sh
```

Este script verifica:
1. Aislamiento total entre `projects/intranet` y `projects/extranet`.
2. Uso de alias (`@core`, `@services`, `@pdf`, `@interface`, `@grados`, `@environments`) en lugar de rutas relativas profundas hacia capas base.
3. Encapsulamiento de `jspdf` / `jspdf-autotable` exclusivamente dentro de `@pdf/`.
4. Ausencia de secretos (`APP_TOKEN`, `TRACKING_SECRET`, `APP_HASH`) en texto plano.
5. Integridad de manifiestos `antigravity.manifest.json` y cabeceras `@antigravity:*`.

