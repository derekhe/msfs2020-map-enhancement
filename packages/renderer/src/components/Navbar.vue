<template>
  <div class="navbar bg-base-100 titlebar">
    <a class="btn btn-ghost normal-case text-xl">MSFS2020 Map Enhancement ({{appVersion}})</a>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  data(){
    return {
      appVersion: window.require('@electron/remote').app.getVersion()
    }
  }
}
</script>

<style scoped>

</style>