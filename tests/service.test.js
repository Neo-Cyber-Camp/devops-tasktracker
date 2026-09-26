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

describe('listTasks', () => {
  beforeEach(async () => {
    await service.createTask(repo, { title: 'A' });
    const b = await service.createTask(repo, { title: 'B' });
    await service.updateTask(repo, b.id, { done: true });
  });

  test('renvoie toutes les taches sans filtre', async () => {
    expect((await service.listTasks(repo)).map((t) => t.title)).toEqual(['A', 'B']);
  });

  test('filtre les taches terminees', async () => {
    expect((await service.listTasks(repo, { done: true })).map((t) => t.title)).toEqual(['B']);
  });

  test('filtre les taches a faire', async () => {
    expect((await service.listTasks(repo, { done: false })).map((t) => t.title)).toEqual(['A']);
  });
});

describe('updateTask', () => {
  test('modifie le titre', async () => {
    const task = await service.createTask(repo, { title: 'Ancien' });
    expect(await service.updateTask(repo, task.id, { title: 'Nouveau' })).toEqual({ id: task.id, title: 'Nouveau', done: false });
  });

  test('marque une tache comme terminee', async () => {
    const task = await service.createTask(repo, { title: 'A finir' });
    expect((await service.updateTask(repo, task.id, { done: true })).done).toBe(true);
  });

  test('refuse un done qui n est pas un booleen', async () => {
    const task = await service.createTask(repo, { title: 'A' });
    await expect(service.updateTask(repo, task.id, { done: 'yes' })).rejects.toThrow('done must be a boolean');
  });

  test('renvoie null pour un id inconnu', async () => {
    expect(await service.updateTask(repo, 99, { title: 'X' })).toBeNull();
  });
});

describe('countByStatus', () => {
  test('renvoie zero pour une liste vide', async () => {
    expect(await service.countByStatus(repo)).toEqual({ done: 0, todo: 0 });
  });

  test('compte les taches terminees et a faire', async () => {
    await service.createTask(repo, { title: 'A' });
    await service.createTask(repo, { title: 'B' });
    const c = await service.createTask(repo, { title: 'C' });
    await service.updateTask(repo, c.id, { done: true });
    expect(await service.countByStatus(repo)).toEqual({ done: 1, todo: 2 });
  });
});
