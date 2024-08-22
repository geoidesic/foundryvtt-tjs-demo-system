<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";
  import { ripple } from "@typhonjs-fvtt/runtime/svelte/action/animate";

  // List of tabs
  export let tabs = [];

  // type of sheet
  export let sheet;

  // The active tab
  export let activeTab = void 0;

  export let efx = ripple();
</script>

<!--List of tabs-->
<div class="tabs">
  <!--Tab List-->
  <div class="tabs-list">
    <!--For each tab-->
    {#each tabs as tab, idx}
      <button
        class={activeTab === tab.id ? "active " : ""}
        on:click={() => {
          activeTab = tab.id;
        }}
        on:mousedown={preventDefault}
        use:efx
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!--Tab Content-->
  <div class="tab-content">
    {#each tabs as tab}
      {#if tab.id === activeTab}
        <svelte:component this={tab.component} {sheet} />
      {/if}
    {/each}
  </div>
</div>

<style lang="sass">
  @import "../../styles/Mixins.sass"

  .tab-content 
    @include flex-column
    flex: 2
    height: 100%
    width: 100%

  .tabs 
    @include flex-column
    @include flex-group-top
    @include border
    height: 100%
    width: 100%

    .tabs-list 
      @include flex-row
      @include flex-space-evenly
      @include border-bottom
      @include panel-1
      list-style: none
      width: 100%
      margin: 0
      padding: 0.25rem
      height: 100%
      flex: 0

      button 
        @include button
        --button-border-radius: 5px
        --button-line-height: var(--tab-line-height)
        --button-font-size: var(--tab-font-size)
        position: relative
        overflow: hidden
        clip-path: var(--tjs-icon-button-clip-path, none)
        transform-style: preserve-3d
        height: 100%
        font-weight: normal
        margin: 0 2px
        width: 100%

        &:not(:first-child) 
          border-left: none

        &:hover 
          color: var(--player-contrast)
          box-shadow: none
          &:not(:disabled) 
            clip-path: var(--tjs-icon-button-clip-path-hover, var(--tjs-icon-button-clip-path, none))

        &.active 
          background: var(--player-color)
          color: var(--player-contrast)

</style>
