const got = require("got");

class MTGoogle {
  name = "mt.google.com";

  map(tileX, tileY, levelOfDetail) {
    return `https://mt.google.com/vt/lyrs=s&x=${tileX}&y=${tileY}&z=${levelOfDetail}`;
  }

  async isInvalid(content) {
    return false;
  }
}

class KHMGoogle {
  name = "khm.google.com";

  map(tileX, tileY, levelOfDetail) {
    return `https://khm.google.com/kh/v=908?x=${tileX}&y=${tileY}&z=${levelOfDetail}`;
  }

  async isInvalid(content) {
    return false;
  }
}

class ArcGIS {
  name = "ArcGIS";
  emptyContent = null;

  map(tileX, tileY, levelOfDetail) {
    return `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${levelOfDetail}/${tileY}/${tileX}`;
  }

  async isInvalid(content) {
    if (!this.emptyContent) {
      this.emptyContent = await got(
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/0/1/1",
        {
          timeout: {
            request: 15 * 1000,
          },
        }
      ).buffer();
    }

    return this.emptyContent.compare(content) === 0;
  }
}

module.exports = {
  MTGoogle,
  KHMGoogle,
  ArcGIS,
};
