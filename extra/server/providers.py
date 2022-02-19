import abc

import requests


class MapProvider:
    def __init__(self, name):
        self.name = name

    def is_invalid_content(self, content):
        return False

    @abc.abstractmethod
    def map(self, quad_key):
        pass


class TileBasedMapProvider(MapProvider):
    def quad_key_to_tileXY(self, quad_key: str) -> tuple[int, int, int]:
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


class MTGoogle(TileBasedMapProvider):
    def __init__(self):
        super().__init__("mt.google.com")

    def map(self, quad_key):
        tile_x, tile_y, level_of_detail = self.quad_key_to_tileXY(quad_key)
        return f'https://mt.google.com/vt/lyrs=s&x={tile_x}&y={tile_y}&z={level_of_detail}'


class KHMGoogle(TileBasedMapProvider):
    def __init__(self):
        super().__init__("khm.google.com")

    def map(self, quad_key):
        tile_x, tile_y, level_of_detail = self.quad_key_to_tileXY(quad_key)
        return f"https://khm.google.com/kh/v=908?x={tile_x}&y={tile_y}&z={level_of_detail}"


class MapBox(TileBasedMapProvider):
    def __init__(self, access_token):
        super().__init__("Mapbox")
        self.access_token = access_token

    def map(self, quad_key):
        tile_x, tile_y, level_of_detail = self.quad_key_to_tileXY(quad_key)
        return f"https://api.mapbox.com/v4/mapbox.satellite/{level_of_detail}/{tile_x}/{tile_y}.jpg?sku=cky8e1hd40jus15nzunvf7q4u&access_token={self.access_token}"


class ArcGIS(TileBasedMapProvider):
    def __init__(self):
        super().__init__("ArcGIS")
        self.emptyContent = None

    def map(self, quad_key):
        tile_x, tile_y, level_of_detail = self.quad_key_to_tileXY(quad_key)
        return f"https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{level_of_detail}/{tile_y}/{tile_x}"

    def is_invalid_content(self, content):
        if self.emptyContent is None:
            self.emptyContent = requests.get(
                "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/0/1/1",
                timeout=15).content

        return content == self.emptyContent


class BingMap(MapProvider):
    def __init__(self):
        super().__init__("Bing Map (Latest)")

    def map(self, quad_key):
        return f"https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/{quad_key}?mkt=en-US&it=A&shading=t&n=z&og=1722"
