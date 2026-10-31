#!/usr/bin/env bash
# ==============================================================================
# Antigravity × Sandra Core L7 Scaffolding Engine
# Author: @arquitecto-global (BUNKER TECHNOLOGIES SOLUTIONS C.A.)
# Usage: ./scripts/init-workspace.sh <module-slug> [intranet|extranet] [views|@pdf|@services|@core|@interface]
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

MODULE_SLUG=${1:-""}
PERIMETER=${2:-"intranet"}
LAYER=${3:-"views"}

if [ -z "$MODULE_SLUG" ]; then
  echo -e "${RED}❌ Error: Debe especificar el slug del módulo o servicio.${NC}"
  echo "Uso: ./scripts/init-workspace.sh <slug> [intranet|extranet] [views|@pdf|@services|@core|@interface]"
  exit 1
fi

if [[ "$PERIMETER" != "intranet" && "$PERIMETER" != "extranet" ]]; then
  echo -e "${RED}❌ Error: El perímetro debe ser 'intranet' o 'extranet'.${NC}"
  exit 1
fi

SRC_ROOT="projects/${PERIMETER}/src"

case "$LAYER" in
  views)
    BASE_DIR="${SRC_ROOT}/app/main/views/${MODULE_SLUG}"
    BOUNDARY_TYPE="internal-tactical"
    if [ "$PERIMETER" == "extranet" ]; then
      BOUNDARY_TYPE="dmz-extranet"
    fi
    ;;
  @pdf|@services|@core|@interface)
    BASE_DIR="${SRC_ROOT}/${LAYER}/${MODULE_SLUG}"
    BOUNDARY_TYPE="public-api"
    ;;
  *)
    echo -e "${RED}❌ Error: Capa no reconocida (${LAYER}). Use: views, @pdf, @services, @core, @interface${NC}"
    exit 1
    ;;
esac

if [ -d "$BASE_DIR" ]; then
  echo -e "${YELLOW}⚠️ Advertencia: El directorio ${BASE_DIR} ya existe. Cancelando.${NC}"
  exit 1
fi

echo -e "${CYAN}🚀 @arquitecto-global: Desplegando estructura hexagonal para [${MODULE_SLUG}] en [${BASE_DIR}]...${NC}"

# Creación de carpetas hexagonales y de presentación
mkdir -p "$BASE_DIR/domain"
mkdir -p "$BASE_DIR/application"
mkdir -p "$BASE_DIR/infrastructure"
mkdir -p "$BASE_DIR/components"

# Barrels por capa con marcas @antigravity
for SUBLAYER in domain application infrastructure components; do
  cat <<EOF > "$BASE_DIR/${SUBLAYER}/index.ts"
/**
 * @antigravity:ecosystem    sandra-l7
 * @antigravity:project      ${PERIMETER}
 * @antigravity:layer        ${LAYER}/${SUBLAYER}
 * @antigravity:boundary     ${BOUNDARY_TYPE}
 * @antigravity:security     dlp-protected
 * @antigravity:architect    @arquitecto-global
 * @antigravity:version      2.3.2
 */

export {};
EOF
done

# Archivo de Metadatos de Arquitectura y Gobernanza L7
cat <<EOF > "$BASE_DIR/antigravity.manifest.json"
{
  "project": "${PERIMETER}",
  "module": "${MODULE_SLUG}",
  "layer": "${LAYER}",
  "architect": "@arquitecto-global",
  "ecosystem": "sandra-core-l7",
  "version": "2.3.2",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "boundaries": {
    "allow_cross_perimeter_imports": false,
    "exposed_contracts": ["domain", "application"],
    "allowed_aliases": ["@core", "@services", "@interface", "@pdf", "@grados", "@environments"]
  },
  "security": {
    "zero_trust_hmac": true,
    "dlp_screen_protection": true
  },
  "sandra_contract": {
    "schema_registry": "documents/schemas-${PERIMETER}.json",
    "streaming_preferred": true
  }
}
EOF

# Punto de entrada público (Public API Barrel)
cat <<EOF > "$BASE_DIR/public-api.ts"
/**
 * @antigravity:ecosystem    sandra-l7
 * @antigravity:project      ${PERIMETER}
 * @antigravity:layer        ${LAYER}
 * @antigravity:boundary     public-api
 * @antigravity:security     dlp-protected
 * @antigravity:architect    @arquitecto-global
 * @antigravity:version      2.3.2
 */

export * from './domain';
export * from './application';
EOF

echo -e "${GREEN}✅ Arquitectura base creada exitosamente para [${MODULE_SLUG}] en [${BASE_DIR}].${NC}"

