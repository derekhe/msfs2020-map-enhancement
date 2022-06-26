import abc
import hashlib
from log import logger


def tileXY_to_quad_key(tile_x: int, tile_y: int, level_of_detail: int) -> str:
    quad_key = ""
    for i in range(level_of_detail, 0, -1):
        digit = 0
        mask = 1 << (i - 1)
        if tile_x & mask != 0:
            digit += 1

        if tile_y & mask != 0:
            digit += 2

        quad_key += str(digit)
    return quad_key


def quad_key_to_tileXY(quad_key: str) -> tuple[int, int, int]:
    tile_x = tile_y = 0
    level_of_detail = len(quad_key)
    for i in range(level_of_detail, 0, -1):
        mask = 1 << (i - 1)
        t = quad_key[level_of_detail - i]
        if t == '1':
            tile_x |= mask
        if t == '2':
            tile_y |= mask
        if t == '3':
            tile_x |= mask
            tile_y |= mask
    return tile_x, tile_y, level_of_detail


class MapProvider:
    def __init__(self, name):
        self.name = name

    def is_invalid_content(self, content):
        return False

    @abc.abstractmethod
    def quadkey_url(self, quad_key):
        pass

    @abc.abstractmethod
    def tile_url(self, tile_x, tile_y, level_of_detail):
        pass

    def next_level_urls(self, quad_key):
        x, y, z = quad_key_to_tileXY(quad_key)
        quads = [tileXY_to_quad_key(x * 2, y * 2, z + 1),
                 tileXY_to_quad_key(x * 2 + 1, y * 2, z + 1),
                 tileXY_to_quad_key(x * 2, y * 2 + 1, z + 1), tileXY_to_quad_key(x * 2 + 1, y * 2 + 1, z + 1)]

        return list(map(lambda q: self.quadkey_url(q), quads))


class TileBasedMapProvider(MapProvider):
    def quadkey_url(self, quad_key):
        tile_x, tile_y, level_of_detail = quad_key_to_tileXY(quad_key)
        return self.tile_url(tile_x, tile_y, level_of_detail)


class MTGoogle(TileBasedMapProvider):
    def tile_url(self, tile_x, tile_y, level_of_detail):
        return f'https://mt.google.com/vt/lyrs=s&x={tile_x}&y={tile_y}&z={level_of_detail}'

    def __init__(self):
        super().__init__("mt.google.com")


class KHMGoogle(TileBasedMapProvider):
    def __init__(self):
        super().__init__("khm.google.com")

    def tile_url(self, tile_x, tile_y, level_of_detail):
        return f"https://khm.google.com/kh/v=908?x={tile_x}&y={tile_y}&z={level_of_detail}"


class MapBox(TileBasedMapProvider):
    def __init__(self, access_token):
        super().__init__("Mapbox")
        self.access_token = access_token

    def tile_url(self, tile_x, tile_y, level_of_detail):
        return f"https://api.mapbox.com/v4/mapbox.satellite/{level_of_detail}/{tile_x}/{tile_y}.jpg?sku=cky8e1hd40jus15nzunvf7q4u&access_token={self.access_token}"


class ArcGIS(TileBasedMapProvider):
    def __init__(self):
        super().__init__("ArcGIS")
        self.emptyContent = None

    def tile_url(self, tile_x, tile_y, level_of_detail):
        return f"https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{level_of_detail}/{tile_y}/{tile_x}"

    def is_invalid_content(self, content):
        self.sig = hashlib.md5()
        self.sig.update(content)
        hexdigest = self.sig.hexdigest()

        logger.info("Check sum %s", hexdigest)
        return hexdigest == 'f27d9de7f80c13501f470595e327aa6d'


class BingMap(MapProvider):
    def __init__(self):
        super().__init__("Bing Map (Latest)")

    def quadkey_url(self, quad_key):
        return f"https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/{quad_key}?mkt=en-US&it=A&shading=t&n=z&og=1722"

    def tile_url(self, tile_x, tile_y, level_of_detail):
        quad_key = tileXY_to_quad_key(tile_x, tile_y, level_of_detail)
        return f"https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/{quad_key}?mkt=en-US&it=A&shading=t&n=z&og=1722"
