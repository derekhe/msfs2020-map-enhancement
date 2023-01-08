<template>
  <n-alert title="Important" type="warning">
    <n-ul>
      <n-li>Run this mod before MSFS2020, otherwise default bing map may appear randomly</n-li>
      <n-li>If you enable rolling cache in game, please clear it before enable this mod</n-li>
      <n-li>Setup proxy if your access to google is blocked</n-li>
      <n-li>Disable any firewall and antivirus if you have trouble</n-li>
    </n-ul>
  </n-alert>
</template>

<script>

import { defineComponent } from "vue";

export default defineComponent({
  name: "Important",
});

</script>
