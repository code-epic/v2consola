#!/bin/bash

# Este script busca todos los archivos .js en la carpeta dist y elimina SOLO el texto
# de los comentarios sourceMappingURL, sin borrar la línea completa.
# Esto evita romper el código minificado que comparte línea con el mapa.

DIST_DIR="dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: Directorio $DIST_DIR no encontrado."
  exit 1
fi

echo "Limpiando referencias a mapas de origen de forma segura en $DIST_DIR..."

# Usamos perl para una sustitución segura que no borra la línea completa
# Borra tanto //# como /*# sourceMappingURL
find "$DIST_DIR" -name "*.js" -exec perl -pi -e 's/\/\/[#@]\s*sourceMappingURL=\S*//g' {} +
find "$DIST_DIR" -name "*.js" -exec perl -pi -e 's/\/\*#\s*sourceMappingURL=.*?\*\///g' {} +

echo "Limpieza completada."
