const got = require("got");

class MapProvider {
  async isInvalid(content) {
    return false;
  }
}

class TileBasedMapProvider extends MapProvider {
  quadKeyToTileXY(quadKey) {
    let tileX = 0;
    let tileY = 0;
    const levelOfDetail = quadKey.length;

    for (let i = levelOfDetail; i > 0; i -= 1) {
      const mask = 1 << (i - 1);
      const t = quadKey[levelOfDetail - i];
      if (t === "1") {
        tileX |= mask;
      }
      if (t === "2") {
        tileY |= mask;
      }
      if (t === "3") {
        tileX |= mask;
        tileY |= mask;
      }
    }

    return { tileX, tileY, levelOfDetail };
  }
}

class MTGoogle extends TileBasedMapProvider {
  name = "mt.google.com";

  map(quadKey) {
    const { tileX, tileY, levelOfDetail } = this.quadKeyToTileXY(quadKey);
    return `https://mt.google.com/vt/lyrs=s&x=${tileX}&y=${tileY}&z=${levelOfDetail}`;
  }
}

class KHMGoogle extends TileBasedMapProvider {
  name = "khm.google.com";

  map(quadKey) {
    return `https://khm.google.com/kh/v=908?x=${tileX}&y=${tileY}&z=${levelOfDetail}`;
  }
}

class MapBox extends TileBasedMapProvider {
  name = "Mapbox"

  constructor(accessToken) {
    super();
    this.accessToken = accessToken
  }

  map(quadKey) {
    const { tileX, tileY, levelOfDetail } = this.quadKeyToTileXY(quadKey);
    return `https://api.mapbox.com/v4/mapbox.satellite/${levelOfDetail}/${tileX}/${tileY}.jpg?sku=cky8e1hd40jus15nzunvf7q4u&access_token=${this.accessToken}`;
  }
}

class ArcGIS extends TileBasedMapProvider {
  name = "ArcGIS";
  emptyContent = null;

  map(quadKey) {
    const { tileX, tileY, levelOfDetail } = this.quadKeyToTileXY(quadKey);
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

class BingMap extends MapProvider {
  name = "Bing Map (Latest)";

  map(quadKey) {
    return `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/${quadKey}?mkt=en-US&it=A&shading=t&n=z&og=1722`;
  }
}

module.exports = {
  TileBasedMapProvider,
  MTGoogle,
  KHMGoogle,
  ArcGIS,
  BingMap,
  MapBox
};
