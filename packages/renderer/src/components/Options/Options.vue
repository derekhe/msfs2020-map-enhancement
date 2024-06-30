<template>
  <div class="space-y-4">
    <GameOptions />
    <MapOptions />
    <CacheOptions />
    <ProxySettings />
    <Privacy />
    <ResetToDefault />
  </div>
</template>

<script>

import GameOptions from "./GameOptions.vue";
import MapOptions from "./MapOptions.vue";
import CacheOptions from "./CacheOptions.vue";
import ProxySettings from "./ProxySettings.vue";
import ResetToDefault from "./ResetToDefault.vue";
import Privacy from "./Privacy.vue";

export default {
  name: "Options",
  components: { Privacy, ResetToDefault, MapOptions, GameOptions, CacheOptions, ProxySettings }
};
</script>

<style scoped></style>