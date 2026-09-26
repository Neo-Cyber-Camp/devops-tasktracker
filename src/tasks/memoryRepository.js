function createMemoryRepository() {
  let nextId = 1;
  const rows = new Map();

  return {
    async insert(task) {
      const row = { id: nextId++, ...task };
      rows.set(row.id, row);
      return { ...row };
    },
    async findAll() {
      return [...rows.values()].map((row) => ({ ...row }));
    },
    async update(id, changes) {
      const row = rows.get(id);
      if (!row) return null;
      Object.assign(row, changes);
      return { ...row };
    },
    async remove(id) {
      return rows.delete(id);
    },
  };
}

module.exports = { createMemoryRepository };
