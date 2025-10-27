import ingresosData from '../data/ingresos.json' with { type: 'json' };
const ingresos = ingresosData;


export default class ingresosModel {

    // Endpoint para obtener todos los ingresos
    static async getAll() {
        return ingresos;
    }

    // Endpoint para obtener ingresos filtrados por mes y año
    static async getByMonthYear(anyo, mes) {
        const ingresosFiltrados = ingresos.filter(ingreso => {
            const fecha = new Date(ingreso.fecha);
            return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anyo);
        });
        return ingresosFiltrados;
    }

    // Endpoint para crear un ingreso
    static async create(nuevoIngreso) {
        ingresos.push(nuevoIngreso);
    }

    // Endpoint para actualizar un ingreso
    static async update(id, updatedIngreso) {
        const ingresoIndex = ingresos.findIndex(i => String(i.id) === String(id));
        if (ingresoIndex !== -1) {
            ingresos[ingresoIndex] = { ...ingresos[ingresoIndex], ...updatedIngreso };
        }
    }

    // Endpoint para eliminar un ingreso
    static async delete(id) {
        const ingresoIndex = ingresos.findIndex(i => String(i.id) === String(id));
        if (ingresoIndex !== -1) {
            ingresos.splice(ingresoIndex, 1);
        }
    }
}