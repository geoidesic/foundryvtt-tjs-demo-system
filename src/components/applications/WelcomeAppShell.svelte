<script>
  import { onMount, getContext } from "svelte";
  import { fade, scale }        from 'svelte/transition';
  import { ApplicationShell }   from '#runtime/svelte/component/core';
  import { localize } from "#runtime/svelte/helper";
  import { SYSTEM_ID, SYSTEM_CODE } from "~/src/helpers/constants";

  export let elementRoot = void 0;
  export let version = void 0;

  const application = getContext('#external').application;

  const handleChange = (event) => {
    game.settings.set(SYSTEM_ID, 'dontShowWelcome', event.target.checked);
  }


  let draggable = application.reactive.draggable;
  draggable = true

  $: application.reactive.draggable = draggable;
  $: dontShowWelcome = game.settings.get(SYSTEM_ID, 'dontShowWelcome');

  onMount(async () => {
  });
  
</script>

<svelte:options accessors={true}/>

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    main
      .logo-background
        .texture
        img(src="systems/<SYSTEM_ID>/assets/logo.png" alt="Logo" style="border: none; width: auto;")
      p Welcome to the {localize(`${SYSTEM_CODE}.Title`)}!
      h1 Introduction
      p The 
        a(href="https://www.square-enix-shop.com/ffxivttrpg/en/freetrial.html") {localize(`${SYSTEM_CODE}.Title`)}
        | was released mid-year 2024 
      h1 Help
      p 
        span If you have any issues, please report them on the 
        a(href="https://github.com/geoidesic/<SYSTEM_ID>/issues") github
        span &nbsp;page.
      .flexrow.inset.justify-flexrow-vertical(data-tooltip="{localize('FF15.Setting.DontShowWelcome.Hint')}")
        .flex0
          input(type="checkbox" on:change="{handleChange}" label="{localize('FF15.Setting.DontShowWelcome.Name')}" bind:checked="{dontShowWelcome}") 
        .flex
          span {localize('FF15.Setting.DontShowWelcome.Name')}
    footer
      .flex2.right
        img.pt-sm.white(src="systems/<SYSTEM_ID>/assets/round-table-games-logo.svg" alt="Round Table Games Logo" height="50" width="50" style="fill: white; border: none; width: auto;")
      .flex2.left.pt-sm
        h4 FF15 FoundryVTT system is created by 
        a(href="https://www.round-table.games") Round Table Games ©2024
</template>
<style lang="sass">
  @import "../../styles/Mixins.sass"
 
  main
    @include inset
    overflow-y: auto
    margin-bottom: 5em
    z-index: 1

    .logo-background
      width: 100%
      background-color: rgb(200, 240, 240)
      position: relative
      overflow: hidden

      .texture
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background-image: url("systems/<SYSTEM_ID>/assets/diamonds.png")
        background-size: 80%
        background-repeat: repeat
        opacity: 0.05
        z-index: 1

      img
        position: relative
        display: block
        margin: auto
        z-index: 2
        



  .white
    filter: invert(1)
    
  footer
    display: grid
    grid-column-gap: 1rem
    grid-template-columns: 1fr 1.5fr
    position: fixed
    bottom: 0
    left: 0
    right: 0
    background-color: #333
    color: white
    text-align: center
    padding: 1em
    font-size: 0.8em
    z-index: 3
    img
      min-width: 70px
    a
      color: white
      text-decoration: underline
      &:hover
        color: #ccc
</style>
