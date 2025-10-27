import gastosData from '../data/gastos.json' with { type: 'json' };
const gastos = gastosData;

export class gastosModel {

    // Endpoint para obtener todos los gastos
    static async getAll() {
        return gastos;
    }

    // Endpoint para obtener gastos filtrados por mes y año
    static async getByMonthYear(anyo, mes) {
        const gastosFiltrados = gastos.filter(gasto => {
            const fecha = new Date(gasto.fecha);
            return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anyo);
        });
        return gastosFiltrados;
    }

    // Endpoint para crear un gasto
    static async create(nuevoGasto) {
        gastos.push(nuevoGasto);
    }

    // Endpoint para actualizar un gasto
    static async update(id, updatedGasto) {
        const gastoIndex = gastos.findIndex(g => String(g.id) === String(id));
        if (gastoIndex !== -1) {
            gastos[gastoIndex] = { ...gastos[gastoIndex], ...updatedGasto };
        }
    }
    
    // Endpoint para eliminar un gasto
    static async delete(id) {
        const gastoIndex = gastos.findIndex(g => String(g.id) === String(id));
        if (gastoIndex !== -1) {
            gastos.splice(gastoIndex, 1);
        }
    }
}
