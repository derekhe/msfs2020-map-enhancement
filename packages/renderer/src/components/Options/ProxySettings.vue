<template>
  <div class="card full bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Proxy Settings</h2>
      <p>If you need proxy to access google, please fill the proxy address. Format http://ipaddress:port</p>
      <p>Leave blank if you don't need proxy to access google</p>
      <div class="flex space-x-4 pt-4">
        <input type="text" placeholder="Search…" class="input input-bordered">
        <button class="btn">Test</button>
        <button class="btn">Clear</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProxySettings"
}
</script>

<style scoped>

</style>