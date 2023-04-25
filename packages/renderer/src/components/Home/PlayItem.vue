<template>
  <div v-bind:id="currentId" class="carousel-item relative w-full">
    <div class="card w-full bg-base-100 shadow-xl">
      <figure class="px-10 pt-10">
        <img :src=image alt="Shoes"
             class="rounded-xl"/>
      </figure>
      <div class="card-body items-center text-center">
        <h2 class="card-title">{{ title }}</h2>
        <p>{{ description }}
        </p>
        <div class="card-actions">
          <button class="btn btn-primary">Fly with {{ title }}</button>
        </div>
      </div>
    </div>

    <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
      <a :href="'#' + prevId" class="btn btn-circle">❮</a>
      <a :href="'#' + nextId" class="btn btn-circle">❯</a>
    </div>
  </div>
</template>

<script>

export default {
  name: "PlayItem",
  props: ['title', 'description', 'currentId', 'nextId', 'prevId', 'image']
}
</script>

<style scoped>

</style>