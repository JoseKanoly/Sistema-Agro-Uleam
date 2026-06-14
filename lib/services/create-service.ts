// Fábrica genérica de servicios mock. Mantiene estado en memoria (singleton por módulo)
// y simula latencia async. No hay base de datos, API, ni persistencia real.

export interface Identifiable {
  id: number
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function createService<T extends Identifiable>(seed: T[]) {
  // Copia mutable en memoria
  let data: T[] = seed.map((item) => ({ ...item }))

  return {
    getAll: async (): Promise<T[]> => delay(data.map((d) => ({ ...d }))),

    getById: async (id: number): Promise<T | undefined> => {
      const found = data.find((d) => d.id === id)
      return delay(found ? { ...found } : undefined)
    },

    create: async (item: Omit<T, "id">): Promise<T> => {
      const nextId = data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1
      const created = { ...(item as T), id: nextId }
      data = [created, ...data]
      return delay(created)
    },

    update: async (id: number, patch: Partial<T>): Promise<T | undefined> => {
      let updated: T | undefined
      data = data.map((d) => {
        if (d.id === id) {
          updated = { ...d, ...patch, id }
          return updated
        }
        return d
      })
      return delay(updated)
    },

    delete: async (id: number): Promise<boolean> => {
      const before = data.length
      data = data.filter((d) => d.id !== id)
      return delay(data.length < before)
    },
  }
}
