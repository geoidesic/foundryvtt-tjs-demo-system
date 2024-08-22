import ActorSheetShell from "./ActorSheetShell.svelte";
import SvelteDocumentSheet from "~/src/documents/DocumentSheet";
import { SYSTEM_CODE } from "~/src/helpers/constants";

export default class FF15ActorSheet extends SvelteDocumentSheet {

  /**
   * Default Application options
   *
   * @returns {object} options - Application options.
   * @see https://foundryvtt.com/api/Application.html#options
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 440,
      height: 828,
      minWidth: 626,
      classes: [SYSTEM_CODE],
      dragDrop: [{ dragSelector: ".directory-list .item", dropSelector: null }],
      svelte: {
        class: ActorSheetShell,
        target: document.body,
      },
    });
  }

  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    const canConfigure = game.user.isGM || (this.reactive.document.isOwner && game.user.can("TOKEN_CONFIGURE"));
    if (this.reactive.document.documentName === "Actor") {
      if (canConfigure) {
        buttons.splice(1, 0, {
          label: this.token ? "Token" : "TOKEN.TitlePrototype",
          class: "configure-token",
          icon: "fas fa-user-circle",
          onclick: (ev) => this._onConfigureToken(ev),
        });
      }
    }
    return buttons;
  }

  /**
   * Drag&Drop handling
   */
  _canDragStart(selector) {
    return true;
  }
  _canDragDrop(selector) {
    return this.reactive.document.isOwner || game.user.isGM;
  }
  _onDragOver(event) { }

  _onDragStart(event) {
    {
      const li = event.currentTarget;
      if (event.target.classList.contains("content-link")) {
        return;
      }

      // Create drag data
      let dragData;

      // Owned Items
      if (li.dataset.itemId) {
        const item = this.actor.items.get(li.dataset.itemId);
        dragData = item.toDragData();
      }

      // Active Effect
      if (li.dataset.effectId) {
        const effect = this.actor.effects.get(li.dataset.effectId);
        dragData = effect.toDragData();
      }

      if (!dragData) {
        return;
      }

      // Set data transfer
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
  }

  async _onDrop(event) {

    const data = TextEditor.getDragEventData(event);
    const actor = this.reactive.document;
    console.log('event', event);
    console.log('data', data);
    console.log('actor', actor);

    if (actor.documentName !== "Actor") {
      return;
    }
    /**
     * A hook event that fires when some useful data is dropped onto an ActorSheet.
     * @function dropActorSheetData
     * @memberof hookEvents
     * @param {Actor} actor      The Actor
     * @param {ActorSheet} sheet The ActorSheet application
     * @param {object} data      The data that has been dropped onto the sheet
     */
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if (allowed === false) {
      return;
    }

    // Handle different data types
    switch (data.type) {
      case "ActiveEffect": {
        return this._onDropActiveEffect(event, data);
      }
      case "Actor": {
        return this._onDropActor(event, data);
      }
      case "Item": {
        return this._onDropItem(event, data);
      }

      case "Folder": {
        return this._onDropFolder(event, data);
      }
      default: {
        console.error(`Surge | Impossible type "${data.type}" in _onDrop.`);
        return;
      }
    }
  }

  async _onDropActiveEffect(event, data) {
    console.log('_onDropActiveEffect');

    console.log('data', data);
    const actor = this.reactive.document;

    const effect = await ActiveEffect.implementation.fromDropData(data);
    console.log('effect', effect);

    if (!actor.isOwner || !effect) {
      return false;
    }
    if (actor.uuid === effect.parent.uuid) {
      return false;
    }
    return ActiveEffect.create(effect.toObject(), { parent: actor });
  }

  async _onDropActor(event, data) {
    const actor = this.reactive.document;

    if (!actor.isOwner) {
      return false;
    }
  }

  async _onDropItem(event, data, ignoreValidation = false) {
    console.log('_onDropItem', data);
    const actor = this.reactive.document;

    if (!actor.isOwner) {
      return false;
    }
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    console.log('itemData', itemData);

    console.log('itemData.type', itemData.type);

    const itemEffects = Array.from(itemData.effects);
    console.log('itemEffects', itemEffects);


    // Handle item sorting within the same Actor
    if (actor.uuid === item.parent?.uuid) {
      return this._onSortItem(event, itemData);
    }

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }

  async _onDropFolder(event, data) {
    const actor = this.reactive.document;

    const folder = await Folder.implementation.fromDropData(data);
    if (!folder && data.documentName !== "Item" && !actor.isOwner && data.uuid != "Compendium.surge.skills.Folder.CcxCapkN4Pvspsen") {
      return [];
    }

    if (folder.contents.length) {
      for (let item of folder.contents) {
        await this._onDropItem(event, item, true);
      }
    }
  }

  async _onDropItemCreate(itemData) {
    const actor = this.reactive.document;

    
  }

  _onSortItem(event, itemData) {
    const actor = this.reactive.document;

    // Get the drag source and drop target
    const items = actor.items;
    const source = items.get(itemData._id);
    const dropTarget = event.target.closest("[data-item-id]");
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (source.id === target.id) {
      return;
    }

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== source.id) {
        siblings.push(items.get(el.dataset.itemId));
      }
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(source, { target, siblings });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target.data._id;
      return update;
    });

    // Perform the update
    return actor.updateEmbeddedDocuments("Item", updateData);
  }

  _onConfigureToken(event) {
    if (event) {
      event.preventDefault();
    }
    const actor = this.reactive.document;
    const token = actor.isToken ? actor.token : actor.prototypeToken;
    new CONFIG.Token.prototypeSheetClass(token, {
      left: Math.max(this.position.left - 560 - 10, 10),
      top: this.position.top,
    }).render(true);
  }
}

