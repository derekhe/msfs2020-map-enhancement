<template>
  <n-h4>Cache</n-h4>
  <n-p>
    The internal cache is used to speed up satellite image loading speed when in game "Rolling Cache" is disabled.
    "Rolling Cache" may cause issue when you sometimes fly with Bing map and sometimes with others.
  </n-p>
  <n-checkbox v-model:checked="cacheEnabled">Enable Cache</n-checkbox>
  <n-h4>Cache Location</n-h4>
  <n-p>The default cache location is under the installation path. You can put it to another location. When you change the cache location, the old cache file will still there. Please delete it manually.</n-p>
  <n-p>Cache location should not contains any blank space otherwise image server will not start</n-p>
  <n-space vertical size="large">
    <n-input-group style="{width:'100%'}">
      <n-input v-model:value="cacheLocation"  style="{width:'60%'}" />
      <n-button type="primary" ghost @click="resetPath">Reset To Default</n-button>
    </n-input-group>
    <n-button @click="clearCache">Clear Cache</n-button>
  </n-space>
</template>

<script>
import Store from "electron-store";
import electron from "electron";

const store = new Store();

import { defineComponent } from "vue";
import got from "got";

const getDirectory = (path) => {
  return path.substring(0, path.lastIndexOf("\\") + 1);
};

const getDefaultPath = ()=>{
  return ".\\cache";
}

export default defineComponent({
  name: "CacheSetting",
  data() {
    if (store.get("cacheLocation") === undefined) {
      store.set("cacheLocation", getDefaultPath());
    }

    if (store.get("enableCache") === undefined) {
      store.set("enableCache", false);
    }

    return {
      cacheLocation: store.get("cacheLocation"),
      cacheEnabled: store.get("enableCache")
    };
  },
  methods: {
    resetPath() {
      this.cacheLocation = getDefaultPath();
    },
    async clearCache() {
      try {
        await got.delete("http://localhost:39871/cache");
        window.$message.info("Cache cleared");
      }
      catch(e){
        window.$message.error("Please start injection and then clear cache");
      }
    }
  },
  watch: {
    cacheEnabled: function(val, oldVal) {
      store.set("enableCache", val);
    },
    cacheLocation: function(val, oldVal) {
      store.set("cacheLocation", val);
    }
  }
});

</script>