<template>
  <div class="carousel w-full">
    <PlayItem title="Bing (Latest)" description="Bing description"
              image="https://mspoweruser.com/wp-content/uploads/2017/05/rsz_yellowknifecanada.png" current-id="1"
              prev-id="4" next-id="2" />
    <PlayItem title="Google" description="Google description"
              image="https://mspoweruser.com/wp-content/uploads/2017/05/rsz_yellowknifecanada.png"
              current-id="2" prev-id="1" next-id="3" />
    <PlayItem title="ArcGIS" description="ArcGIS description"
              image="https://mspoweruser.com/wp-content/uploads/2017/05/rsz_yellowknifecanada.png"
              current-id="3" prev-id="2" next-id="4" />
    <PlayItem title="MapBox" description="MapBox description"
              image="https://mspoweruser.com/wp-content/uploads/2017/05/rsz_yellowknifecanada.png"
              current-id="4" prev-id="3" next-id="1" />
  </div>
</template>

<script>

import PlayItem from "./PlayItem.vue";

export default {
  name: "Start",
  components: { PlayItem }
};
</script>

<style scoped>

</style>