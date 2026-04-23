# Configuración de Base de Datos para myDAQ

Para que el script de Python pueda guardar los datos del micrófono electret conectado al NI myDAQ, necesitamos agregar una nueva columna a la tabla `mediciones` en Supabase.

## Instrucciones

1. Entrá a tu cuenta de Supabase y abrí el proyecto `Estación Meteorológica`.
2. En el menú lateral izquierdo, andá a **SQL Editor** (el ícono que tiene una `>_`).
3. Hacé clic en **New query**.
4. Pegá el siguiente código SQL en el editor en blanco:

```sql
-- Agregar columna para el myDAQ
ALTER TABLE public.mediciones 
ADD COLUMN ruido_mydaq FLOAT;

-- Opcional: Agregar un comentario para documentarlo
COMMENT ON COLUMN public.mediciones.ruido_mydaq IS 'Nivel de ruido en dB procesado vía Python desde NI myDAQ (ai0)';
```

5. Hacé clic en el botón verde **Run** (o apretá `Ctrl + Enter`).
6. Si dice "Success", ¡ya está todo listo! 

Ahora el script de Python (`lector_ruido.py`) ya puede empezar a insertar datos directamente a esta columna, y el Dashboard lo dibujará automáticamente en la nueva pestaña.
