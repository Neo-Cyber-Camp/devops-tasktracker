const MAX_TITLE_LENGTH = 200;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new ValidationError('title is required');
  }
  const trimmed = title.trim();
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(`title must be at most ${MAX_TITLE_LENGTH} characters`);
  }
  return trimmed;
}

async function createTask(repo, { title } = {}) {
  return repo.insert({ title: validateTitle(title), done: false });
}

async function listTasks(repo, { done } = {}) {
  const tasks = await repo.findAll();
  if (done === undefined) return tasks;
  return tasks.filter((task) => task.done === done);
}

async function updateTask(repo, id, patch = {}) {
  const changes = {};
  if (patch.title !== undefined) changes.title = validateTitle(patch.title);
  if (patch.done !== undefined) {
    if (typeof patch.done !== 'boolean') throw new ValidationError('done must be a boolean');
    changes.done = patch.done;
  }
  return repo.update(id, changes);
}

async function deleteTask(repo, id) {
  return repo.remove(id);
}

async function countByStatus(repo) {
  const tasks = await repo.findAll();
  const done = tasks.filter((task) => task.done === true).length;
  return { done, todo: tasks.length - done };
}

module.exports = {
  MAX_TITLE_LENGTH,
  ValidationError,
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  countByStatus,
};
