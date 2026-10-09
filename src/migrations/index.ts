import * as migration_20261009_032750_initial from './20261009_032750_initial'

export const migrations = [
  {
    up: migration_20261009_032750_initial.up,
    down: migration_20261009_032750_initial.down,
    name: '20261009_032750_initial',
  },
]
