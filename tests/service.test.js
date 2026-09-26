const { createMemoryRepository } = require('../src/tasks/memoryRepository');
const service = require('../src/tasks/service');

let repo;
beforeEach(() => {
  repo = createMemoryRepository();
});

describe('createTask', () => {
  test('cree une tache non terminee avec un titre nettoye', async () => {
    const task = await service.createTask(repo, { title: '  Ecrire le Dockerfile  ' });
    expect(task).toEqual({ id: 1, title: 'Ecrire le Dockerfile', done: false });
  });

  test('refuse un titre vide', async () => {
    await expect(service.createTask(repo, { title: '   ' })).rejects.toThrow('title is required');
  });

  test('refuse un titre de plus de 200 caracteres', async () => {
    await expect(service.createTask(repo, { title: 'x'.repeat(201) })).rejects.toThrow('at most 200');
  });
});

describe('deleteTask', () => {
  test('renvoie true quand la tache existait', async () => {
    const task = await service.createTask(repo, { title: 'A supprimer' });
    expect(await service.deleteTask(repo, task.id)).toBe(true);
    expect(await service.listTasks(repo)).toEqual([]);
  });

  test('renvoie false pour un id inconnu', async () => {
    expect(await service.deleteTask(repo, 42)).toBe(false);
  });
});

