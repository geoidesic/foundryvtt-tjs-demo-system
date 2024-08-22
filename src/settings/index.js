import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import { localize } from "#runtime/svelte/helper";

export function registerSettings() {

  /** User settings */
  dontShowWelcome();

}


function dontShowWelcome() {
  game.settings.register(SYSTEM_ID, 'dontShowWelcome', {
    name: localize(`${SYSTEM_CODE}.Setting.DontShowWelcome.Name`),
    hint: localize(`${SYSTEM_CODE}.Setting.DontShowWelcome.Hint`),
    scope: 'user',
    config: true,
    default: false,
    type: Boolean,
  });
}