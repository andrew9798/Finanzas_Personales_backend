import { z } from 'zod';  // ⭐ IMPORTANTE: con llaves {}

// Definir las categorías
export const categoriasIngresos = ['salario', 'venta', 'inversion', 'regalos', 'bizum', 'otros'];
export const categoriasGastos = ['alimentacion', 'transporte', 'vivienda', 'ocio', 'salud', 'educacion', 'inversion', 'otros'];

// Función para validar tipo de categoría
export function validarCategoria(categoria) {
  if (categoriasIngresos.includes(categoria)) {
    return 'ingreso';
  } else if (categoriasGastos.includes(categoria)) {
    return 'gasto';
  } else {
    return null;
  }
}

// ⭐ SCHEMA BASE (común para ambos) - USA z.string(), z.number()
const baseSchema = {
  concepto: z.string({ invalid_type_error: 'El concepto debe ser una cadena de texto' })
    .min(1, 'El concepto es obligatorio')
    .max(50, 'El concepto no puede exceder los 50 caracteres'),
  cantidad: z.number({ invalid_type_error: 'La cantidad debe ser un número' })
    .positive('La cantidad debe ser un número positivo')
    .max(1000000000, 'La cantidad no puede exceder 1,000,000,000'),
  fecha: z.string().refine(date => !isNaN(Date.parse(date)), { 
    message: 'La fecha debe ser una fecha válida' 
  })
};

// ⭐ SCHEMA PARA INGRESOS - USA z.object()
const ingresosSchema = z.object({
  ...baseSchema,
  categoria: z.enum(categoriasIngresos, {
    errorMap: () => ({ message: 'La categoría debe ser válida para ingresos' })
  })
});

// ⭐ SCHEMA PARA GASTOS - USA z.object()
const gastosSchema = z.object({
  ...baseSchema,
  categoria: z.enum(categoriasGastos, {
    errorMap: () => ({ message: 'La categoría debe ser válida para gastos' })
  })
}); 

// ⭐ FUNCIONES DE VALIDACIÓN SEPARADAS
export function validateIngreso(object) {
  return ingresosSchema.safeParse(object);
}

export function validateGasto(object) {
  return gastosSchema.safeParse(object);
}