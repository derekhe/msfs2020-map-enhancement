<template>
  <div class="card full bg-base-100 shadow-xl ">
    <div class="card-body">
      <h2 class="card-title">Start options</h2>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Auto start mod and game</span>
          <input type="checkbox" checked="checked" class="checkbox">
        </label>
      </div>
      <p>Game Store</p>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">MS Store</span>
          <input type="radio" name="radio-6" class="radio checked:bg-red-500" checked>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Steam</span>
          <input type="radio" name="radio-6" class="radio checked:bg-blue-500" checked>
        </label>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "GameOptions"
}
</script>

<style scoped>

</style>