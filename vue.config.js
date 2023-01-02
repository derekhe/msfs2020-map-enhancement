module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        extraResources: ["./extra/**", "./extra/nginx/temp/**"],
        productName: "MSFS2020 Map Enhancement",
        appId: "com.april1985.msfs2020-map-enhancement",
        win: {
          target: "nsis",
          requestedExecutionLevel: "requireAdministrator",
        },
        nsis: {
          guid: "6fd47695-9ae0-492c-a3a2-db9be0a547d4",
          oneClick: true,
          perMachine: true,
        },
        publish: ["github"],
      },
      preload: "src/preload.js",
    },
  },
};
