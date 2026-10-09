import * as migration_20261009_032750_initial from './20261009_032750_initial';
import * as migration_20261009_113839_login_username from './20261009_113839_login_username';

export const migrations = [
  {
    up: migration_20261009_032750_initial.up,
    down: migration_20261009_032750_initial.down,
    name: '20261009_032750_initial',
  },
  {
    up: migration_20261009_113839_login_username.up,
    down: migration_20261009_113839_login_username.down,
    name: '20261009_113839_login_username'
  },
];
