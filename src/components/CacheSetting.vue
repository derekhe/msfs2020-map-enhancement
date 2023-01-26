<template>
  <n-space vertical>
    <n-checkbox v-model:checked="cacheEnabled">Enable Cache</n-checkbox>
    <n-p>Cache Location</n-p>
    <n-input-group style="{width:100%}">
      <n-input v-model:value="cacheLocation" autosize style="{min-width:60%}"/>
      <n-button type="primary" ghost @click="resetPath">Reset To Default</n-button>
    </n-input-group>
    <n-button>Clear Cache</n-button>
  </n-space>
</template>

<script>
import Store from "electron-store";
import electron from "electron";

const store = new Store();

import { defineComponent } from "vue";

export default defineComponent({
  name: "CacheSetting",
  data() {
    if (store.get("cacheLocation") === undefined) {
      store.set("cacheLocation", electron.remote.app.getAppPath() + "\\cache.sqlite");
    }

    if (store.get("cacheEnabled") === undefined) {
      store.set("cacheEnabled", true);
    }

    return {
      cacheLocation: store.get("cacheLocation"),
      cacheEnabled: store.get("cacheEnabled")
    };
  },
  methods: {
    resetPath() {
      this.cacheLocation = electron.remote.app.getAppPath() + "\\cache.sqlite";
    }
  },
  watch: {
    cacheEnabled: function(val, oldVal) {
      store.set("cacheEnabled", val);
    },
    cacheLocation: function(val, oldVal) {
      store.set("cacheLocation", val);
    }
  }
});

</script>