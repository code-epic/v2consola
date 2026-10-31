#!/usr/bin/env bash
# ==============================================================================
# Antigravity × Sandra Core L7 Boundary & Governance Validator
# Author: @arquitecto-global (BUNKER TECHNOLOGIES SOLUTIONS C.A.)
# Usage: ./scripts/validate-boundaries.sh [--strict]
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

STRICT_MODE=${1:-""}
ERRORS=0
WARNINGS=0

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN} 🛡️  @arquitecto-global: Auditoría de Límites y Seguridad Sandra L7   ${NC}"
echo -e "${CYAN}======================================================================${NC}"

# 1. Validar aislamiento perimetral (Intranet <-> Extranet)
echo -e "\n${CYAN}[1/5] Verificando aislamiento perimetral (Intranet <-> Extranet)...${NC}"
CROSS_INTRANET=$(grep -rnE "from ['\"].*projects/extranet" projects/intranet/src 2>/dev/null || true)
CROSS_EXTRANET=$(grep -rnE "from ['\"].*projects/intranet" projects/extranet/src 2>/dev/null || true)

if [ -n "$CROSS_INTRANET" ] || [ -n "$CROSS_EXTRANET" ]; then
  echo -e "${RED}❌ Violación de perímetro detectada (imports cruzados entre intranet y extranet):${NC}"
  [ -n "$CROSS_INTRANET" ] && echo "$CROSS_INTRANET"
  [ -n "$CROSS_EXTRANET" ] && echo "$CROSS_EXTRANET"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Perímetros 'intranet' y 'extranet' perfectamente aislados.${NC}"
fi

# 2. Validar imports relativos profundos hacia capas base (@core, @services, @pdf, @interface)
echo -e "\n${CYAN}[2/5] Auditando uso de Path Aliases (@core, @services, @pdf, @interface)...${NC}"
DEEP_REL_IMPORTS=$(grep -rnE "from ['\"](\.\./){2,}(@core|@services|@pdf|@interface)" projects/*/src/app 2>/dev/null || true)

if [ -n "$DEEP_REL_IMPORTS" ]; then
  COUNT_REL=$(echo "$DEEP_REL_IMPORTS" | wc -l | tr -d ' ')
  echo -e "${YELLOW}⚠️  Se detectaron ${COUNT_REL} imports relativos hacia capas globales en 'app/' (preferir alias @core, @services, @pdf, @interface).${NC}"
  echo "$DEEP_REL_IMPORTS" | head -n 10
  [ "$COUNT_REL" -gt 10 ] && echo "   ... y $((COUNT_REL - 10)) más."
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ Todos los módulos utilizan Path Aliases canónicos.${NC}"
fi

# 3. Validar encapsulamiento de motores documentales (@pdf)
echo -e "\n${CYAN}[3/5] Verificando encapsulamiento del motor documental (@pdf)...${NC}"
DIRECT_JSPDF=$(grep -rnE "from ['\"]jspdf" projects/*/src/app/main/views 2>/dev/null || true)

if [ -n "$DIRECT_JSPDF" ]; then
  COUNT_PDF=$(echo "$DIRECT_JSPDF" | wc -l | tr -d ' ')
  echo -e "${YELLOW}⚠️  Se detectaron ${COUNT_PDF} referencias directas a 'jspdf' en vistas de negocio (deben delegarse a src/@pdf/):${NC}"
  echo "$DIRECT_JSPDF" | head -n 10
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ Generación PDF debidamente encapsulada en la capa @pdf.${NC}"
fi

# 4. Validar ausencia de placeholders o secretos expuestos en producción
echo -e "\n${CYAN}[4/5] Verificando higiene de secretos Zero-Trust (APP_TOKEN, TRACKING_SECRET, APP_HASH)...${NC}"
EXPOSED_SECRETS=$(grep -rnE "(TRACKING_SECRET|APP_TOKEN|APP_HASH)\s*=\s*['\"][^'\$\"]+['\"]" projects/*/src/app 2>/dev/null || true)

if [ -n "$EXPOSED_SECRETS" ]; then
  echo -e "${RED}❌ Secretos hardcodeados detectados en código de aplicación:${NC}"
  echo "$EXPOSED_SECRETS"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Sin secretos hardcodeados en la capa de aplicación.${NC}"
fi

# 5. Validar manifiestos y marcas @antigravity en módulos nuevos
echo -e "\n${CYAN}[5/5] Verificando manifiestos 'antigravity.manifest.json' y marcas '@antigravity:*'...${NC}"
MANIFESTS=$(find projects -name "antigravity.manifest.json" 2>/dev/null || true)

if [ -z "$MANIFESTS" ]; then
  echo -e "${GREEN}ℹ️  Sin módulos bajo manifiesto aún (use ./scripts/init-workspace.sh para crear nuevos módulos).${NC}"
else
  for MANIFEST in $MANIFESTS; do
    MOD_DIR=$(dirname "$MANIFEST")
    if [ ! -f "${MOD_DIR}/public-api.ts" ]; then
      echo -e "${RED}❌ Falta 'public-api.ts' en módulo gobernado: ${MOD_DIR}${NC}"
      ERRORS=$((ERRORS + 1))
    elif ! grep -q "@antigravity:architect" "${MOD_DIR}/public-api.ts"; then
      echo -e "${RED}❌ Falta cabecera '@antigravity:*' en: ${MOD_DIR}/public-api.ts${NC}"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${GREEN}✅ Módulo validado: ${MOD_DIR}${NC}"
    fi
  done
fi

echo -e "\n${CYAN}======================================================================${NC}"
echo -e " Resumen: ${RED}${ERRORS} errores críticos${NC} | ${YELLOW}${WARNINGS} advertencias de deuda técnica${NC}"
echo -e "${CYAN}======================================================================${NC}"

if [ "$ERRORS" -gt 0 ]; then
  exit 1
fi

if [ "$STRICT_MODE" == "--strict" ] && [ "$WARNINGS" -gt 0 ]; then
  exit 1
fi

exit 0

