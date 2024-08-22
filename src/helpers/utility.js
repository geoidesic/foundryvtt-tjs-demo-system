
import { LOG_PREFIX } from './constants.ts';

export const log = {
  ASSERT: 1, ERROR: 2, WARN: 3, INFO: 4, DEBUG: 5, VERBOSE: 6,
  set level(level) {
    this.a = (level >= this.ASSERT) ? console.assert.bind(window.console, LOG_PREFIX) : () => { };
    this.e = (level >= this.ERROR) ? console.error.bind(window.console, LOG_PREFIX) : () => { };
    this.w = (level >= this.WARN) ? console.warn.bind(window.console, LOG_PREFIX) : () => { };
    this.i = (level >= this.INFO) ? console.info.bind(window.console, LOG_PREFIX) : () => { };
    this.d = (level >= this.DEBUG) ? console.debug.bind(window.console, LOG_PREFIX) : () => { };
    this.v = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX) : () => { };
    this.loggingLevel = level;
  },
  get level() { return this.loggingLevel; }
};


export function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

export function isAttribute(val) {
  if (Object.keys(attributes).includes(val)) return true;
  return false;
}

export function ucfirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const isEmptyObj = (obj) => Object.keys(obj).length === 0

export const getPackFromUuid = async (uuid) => {
  const split = uuid.split(".");
  if (split[0] !== 'Compendium') {
    log.w('Not a compendium uuid', uuid)
    return false;
  }
  const packName = `${split[1]}.${split[2]}`;
  const pack = game.packs.get(packName);
  return pack;
}

export function getActorOwner(actor) {
  const owners = getOwners(actor);
  if (owners.length === 0) {
    return game.user;
  }
  if (owners.length === 1) {
    return owners[0];
  }

  let owner = owners.reduce((owner, currentOwner) => {
    if (!currentOwner.isGM) {
      owner = currentOwner;
    }
    return owner;
  }, null);

  if (!owner) {
    if (game.user.isGM) {
      return game.user;
    }
  }

  if (!owner) {
    return game.user;
  }

  return owner;
}


export function getOwners(actor) {
  return game.users.filter(u => actor.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))
}

export function getGMs() {
  return game.users.filter(u => u.isGM).map(u => u.id)
}

/**
 * This is necessary because of a wierd context difference between foundry and svelte
 * Foundry's update method interprets dot notation as data nodes and so creates a nested data structure from it if you use it as a key
 * Svelte's stores do not, they use it as a string literal.
 * If you're trying to use actor uuid as a storage key then this conversion becomes necessary
 * @param {string} uuid 
 * @returns {string} replaces dots with underscores
 */
export function encodeUuidString(uuid) {
  return uuid.replace(/\./g, "_");
}

export function decodeUuidString(uuid) {
  return uuid.replace(/_/g, "\.");
}

export function findKeysByValue(obj, value) {
  return Object.entries(obj)
    .filter(([key, val]) => val === value)
    .map(([key]) => key);
}

export function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "..." : str;
}
