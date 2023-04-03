<template>
  <n-h4>Cache</n-h4>
  <n-p>
    The internal cache is used to speed up satellite image loading speed when in game "Rolling Cache" is disabled.
    "Rolling Cache" may cause issue when you sometimes fly with Bing map and sometimes with others.
  </n-p>
  <n-p>
    "Rolling Cache" can be turned on while the mod's cache is on if you stick to one server provider.
  </n-p>
  <n-p>
    To change any options, you need to restart the injection to take effect.
  </n-p>
  <n-checkbox v-model:checked="cacheEnabled">Enable Cache</n-checkbox>
  <n-h4>Path</n-h4>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-input-group>
        <n-input v-model:value="cacheLocation" />
        <n-button type="primary" ghost @click="resetPath">Reset To Default</n-button>
      </n-input-group>
    </template>
    The default cache location is under the installation path. You can put it to another location. When you change
    the cache location, the old cache file will still there. Please delete it manually.
    Cache location should not contains any blank space otherwise image server will not start
  </n-tooltip>
  <n-button @click="clearCache" v-bind:style="{marginTop: '20px'}">Clear Cache</n-button>
  <n-h4>Cache Size</n-h4>
  <n-input-number v-model:value="cacheSizeGB" placeholder="Cache size"
                  v-bind:style="{width:'min-content', minWidth:'20%'}"
                  :min="1"
                  :max="200"
  >
    <template #suffix>
      GB
    </template>
  </n-input-number>
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

const getDefaultPath = () => {
  return ".\\cache";
};

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
      cacheEnabled: store.get("enableCache"),
      cacheSizeGB: store.get("cacheSizeGB", 10)
    };
  },
  methods: {
    resetPath() {
      this.cacheLocation = getDefaultPath();
    },
    async clearCache() {
      try {
        window.$message.info("Clearing cache, please wait");
        await got.delete("http://localhost:39871/cache");
        window.$message.info("Cache cleared");
      } catch (e) {
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
    },
    cacheSizeGB: function(val, oldVal){
      store.set("cacheSizeGB", val)
    }
  }
});

</script>