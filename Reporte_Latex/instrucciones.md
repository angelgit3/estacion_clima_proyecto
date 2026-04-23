# Instrucciones para el Reporte LaTeX

He creado una estructura modular para tu reporte en la carpeta `Reporte_Latex`. Esta estructura es la recomendada para documentos académicos extensos.

## Estructura de Archivos
- `main.tex`: El archivo raíz. Debes compilar este archivo.
- `secciones/`: Contiene los archivos `.tex` de cada capítulo.
- `img/`: Contiene las imágenes que encontré en tu carpeta `/Reporte`.

## Cómo Compilar
1. **Overleaf (Recomendado)**:
   - Crea un nuevo proyecto en [Overleaf](https://www.overleaf.com/).
   - Sube todos los archivos y carpetas de `Reporte_Latex`.
   - Asegúrate de que `main.tex` esté seleccionado como el archivo principal y dale a "Recompile".

2. **Local (MiKTeX / TeX Live)**:
   - Abre `main.tex` con tu editor favorito (TeXstudio, VS Code con LaTeX Workshop, etc.).
   - Asegúrate de tener instalados los paquetes listados en el preámbulo (usualmente se descargan solos).
   - Compila usando `pdflatex` o `xelatex`.

## Notas sobre el Contenido
- He redactado una base sólida para la **Introducción**, **Marco Teórico**, **Desarrollo** y **Resultados** basada en tu código real (ESP32, Supabase, React).
- En la sección de **Resultados**, he dejado el espacio para las figuras. Puedes ajustar el nombre de los archivos en `resultados.tex` para que coincidan con tus capturas de pantalla (por ejemplo, renombrar `image.png` a `dashboard.png`).
- Los **Apéndices** incluyen fragmentos clave del código. Si quieres el código completo, puedes copiar y pegar el contenido de tus archivos `.ino` y `.jsx` en el entorno `lstlisting`.

¡Éxito con tu reporte, loco! Quedó una locura cósmica.
