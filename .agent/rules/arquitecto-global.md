# Regla de Gobernanza: @arquitecto-global (PGAM-EB / Sandra Core L7)

1. **Segregación Perimetral (`intranet` vs `extranet`):**
   - Nunca importes archivos directamente desde `projects/intranet` hacia `projects/extranet` ni viceversa.
   - Verifica siempre en qué perímetro (`intranet` puerto 4205 o `extranet` puerto 4206) debe residir una funcionalidad antes de modificar o crear archivos.

2. **Respeto de Capas y Path Aliases:**
   - Usa los alias `@core`, `@services`, `@pdf`, `@interface`, `@grados` y `@environments`.
   - Prohibido realizar imports relativos hacia las capas transversales (`../../@services/...`, `../../../@core/...`).
   - Prohibido instanciar `jsPDF` o `autoTable` directamente en componentes de `app/main/views/`; toda lógica documental pertenece a `src/@pdf/`.

3. **Contratos y Streaming Sandra Core L7:**
   - Toda operación hacia el backend Sandra debe estructurarse mediante la interfaz `IAPICore` (`funcion`, `parametros`, `valores`, `modulo`) a través de `ApiService`.
   - Las consultas de colecciones extensas deben utilizar `crudStream` (NDJSON/SSE con `AbortSignal` y firma `HMAC-SHA256`) o `postStream`.

4. **Seguridad Zero-Trust y DLP:**
   - Prohibido hardcodear `APP_TOKEN`, `TRACKING_SECRET` o `APP_HASH` en archivos versionados.
   - Todo nuevo archivo creado bajo las directrices de `@arquitecto-global` debe incluir el bloque de cabecera `@antigravity:*`.
   - Puedes ejecutar `./scripts/validate-boundaries.sh` para auditar el cumplimiento arquitectónico del workspace.

