export const FAQ_PAGE_URL = "https://github.com/derekhe/msfs2020-map-enhancement/wiki/FAQ";

export const enum MenuItems {
  HOME, OPTION, ABOUT, REPORT_ISSUE
}

export const MapProviders = {
  "mt.google.com": {
    key: "mt.google.com",
    description: "They provide the best resolution when flying low and seems very update to date. Both Google server's images are the same, choose the fastest from mt and khm server.\n" +
      "\n" +
      "In some places, google servers are blocked, you should setup a proxy."
  },
  "khm.google.com": {
    key: "khm.google.com",
    description: "They provide the best resolution when flying low and seems very update to date. Both Google server's images are the same, choose the fastest from mt and khm server.\n" +
      "\n" +
      "In some places, google servers are blocked, you should setup a proxy."
  },
  "Bing Map (Latest)": {
    key: "Bing Map (Latest)",
    description: "MSFS's bing map is quite old in the game, select this will replace the bing map to latest bing map (same as https://www.bing.com/maps/aerial)"
  },
  "ArcGIS": {
    key: "ArcGIS",
    description: "ArcGIS server provides more natural color than Google server in some areas, but it lacks high resolution data when flying low. Some areas have different satellite images in different resolution, so you will see image changes when flying low.\n" +
      "\n" +
      "ArcGIS server does not need to use a proxy."
  },
  "Mapbox": {
    key: "Mapbox",
    description: "Mapbox provide better and newer images in some places, please sign up a free key in https://account.mapbox.com/access-tokens and input it in config. Mapbox access token provides 200,000 tiles for free, please consider use the \"Rolling Cache\" in side game or enable the \"Cache\" inside this mod.\n" +
      "\n"
  }
};
