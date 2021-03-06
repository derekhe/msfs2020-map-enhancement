import concurrent
import os
import sys
from threading import Thread

from pygeotile.tile import Tile
from requests import Session
from shapely import geometry
from shapely.geometry import Polygon
from werkzeug import serving

sys.path.append(os.path.curdir)

from dummy_cache import DummyCache
from statics import Statics

from datetime import datetime

import io
import re
import requests
import urllib3
from PIL import Image, ImageEnhance
from providers import MTGoogle, KHMGoogle, ArcGIS, BingMap, MapBox
from flask import Flask, make_response, Response, request, jsonify
import argparse
from diskcache import FanoutCache
from concurrent.futures.thread import ThreadPoolExecutor
from log import logger
import json

urllib3.disable_warnings()
urllib3.PoolManager(num_pools=100)

app: Flask = Flask(__name__)
map_providers = None
last_image = None
offline_download_thread = None
cache = DummyCache()
server_configs = None
parser = argparse.ArgumentParser()
parser.add_argument('--config', default=None, required=False)
argv = parser.parse_args()

server_statics = Statics(numOfImageLoaded=0, lastLoadingImageUrl="", lastLoadTime=datetime.utcnow(), cacheHit=0,
                         bytesLoaded=0, lastLoadingTime=0)
connection_sessions = {}


class InvalidContentException(Exception):
    pass


def config_server():
    global map_providers, cache
    map_providers = [MTGoogle(), KHMGoogle(), ArcGIS(), BingMap(), MapBox(server_configs['mapboxAccessToken'])]
    for provider in map_providers:
        connection_sessions[provider.name] = Session()

    if server_configs['cacheEnabled']:
        cache = FanoutCache(
            server_configs['cacheLocation'], size_limit=int(server_configs['cacheSizeGB']) * 1024 * 1024 * 1024,
            shards=20)
    else:
        cache = DummyCache()


@app.route("/cache", methods=["DELETE"])
def clear_cache() -> Response:
    cache.clear()
    return Response(status=200)


@app.route("/configs", methods=['POST'])
def configs() -> Response:
    global server_configs

    server_configs = request.get_json(force=True)
    logger.info("Received config %s", server_configs)

    config_server()
    return jsonify(server_configs)


@app.route("/last-image")
def last_image() -> Response:
    response = make_response(last_image)
    response.headers["Content-Type"] = "image/jpeg"
    return response


@app.route("/statics")
def statics() -> Response:
    return jsonify(server_statics)

@app.route("/tiles/<tile_x>/<tile_y>/<level_of_detail>")
def tiles(tile_x: str, tile_y: str, level_of_detail: str) -> Response:
    url = f'https://mt.google.com/vt/lyrs=s&x={tile_x}&y={tile_y}&z={level_of_detail}'
    proxy_address = server_configs['proxyAddress']

    content = requests.get(
        url, proxies={"https": proxy_address, "http": proxy_address}, timeout=30,
        verify=False).content

    response = make_response(content)
    headers = {"Content-Type": "image/jpeg", "Last-Modified": "Sat, 24 Oct 2020 06:48:56 GMT", "ETag": "9580",
               "Server": "Microsoft-IIS/10.0", "X-VE-TFE": "BN00004E85", "X-VE-AZTBE": "BN000033DA", "X-VE-AC": "5035",
               "X-VE-ID": "4862_136744347",
               "X-VE-TILEMETA-CaptureDatesRang": "1/1/1999-12/31/2003",
               "X-VE-TILEMETA-CaptureDateMaxYY": "0312",
               "X-VE-TILEMETA-Product-IDs": "209"}
    for k, v in headers.items():
        response.headers[k] = v

    return response


@app.route("/cache/<tile_x>/<tile_y>/<level_of_detail>")
def cache_layer(tile_x: str, tile_y: str, level_of_detail: str) -> Response:
    url = f'https://mt.google.com/vt/lyrs=s&x={tile_x}&y={tile_y}&z={level_of_detail}'
    content = cache.get(url)

    if content is None:
        return Response(status=404)

    im = Image.new('RGB', (256, 256))
    im.paste((255, 0, 255), [0, 0, 256, 256])

    img_byte_arr = io.BytesIO()
    im.save(img_byte_arr, format='jpeg')
    output = img_byte_arr.getvalue()

    response = make_response(output)
    headers = {"Content-Type": "image/jpeg", "Last-Modified": "Sat, 24 Oct 2020 06:48:56 GMT", "ETag": "9580",
               "Server": "Microsoft-IIS/10.0", "X-VE-TFE": "BN00004E85", "X-VE-AZTBE": "BN000033DA", "X-VE-AC": "5035",
               "X-VE-ID": "4862_136744347",
               "X-VE-TILEMETA-CaptureDatesRang": "1/1/1999-12/31/2003",
               "X-VE-TILEMETA-CaptureDateMaxYY": "0312",
               "X-VE-TILEMETA-Product-IDs": "209"}
    for k, v in headers.items():
        response.headers[k] = v

    return response


@app.route("/tiles/a<path>")
def quad_tiles(path: str) -> Response:
    quadkey = re.findall(r"(\d+).jpeg", path)[0]

    try:
        if server_configs['enableHighLOD']:
            content = tiles_high_lod(quadkey)
        else:
            content = tiles_normal_lod(quadkey)

        im = Image.open(io.BytesIO(content))

        enhancer = ImageEnhance.Brightness(im)
        im = enhancer.enhance(0.7)
        img_byte_arr = io.BytesIO()
        im.save(img_byte_arr, format='jpeg')
        output = img_byte_arr.getvalue()
    except InvalidContentException:
        return Response(status=404)
    except:
        return Response(status=500)

    global last_image
    last_image = output

    response = make_response(output)
    headers = {"Content-Type": "image/jpeg", "Last-Modified": "Sat, 24 Oct 2020 06:48:56 GMT", "ETag": "9580",
               "Server": "Microsoft-IIS/10.0", "X-VE-TFE": "BN00004E85", "X-VE-AZTBE": "BN000033DA", "X-VE-AC": "5035",
               "X-VE-ID": "4862_136744347",
               "X-VE-TILEMETA-CaptureDatesRang": "1/1/1999-12/31/2003",
               "X-VE-TILEMETA-CaptureDateMaxYY": "0312",
               "X-VE-TILEMETA-Product-IDs": "209"}
    for k, v in headers.items():
        response.headers[k] = v

    return response


def get_selected_map_provider():
    return list(filter(lambda x: x.name == server_configs['selectedServer'], map_providers))[0]


def download_from_url(url):
    content = cache.get(url)

    if content is None:
        proxy_address = server_configs['proxyAddress']
        logger.info("Downloading from: %s, %s", url, proxy_address)
        provider = get_selected_map_provider()
        resp = connection_sessions[provider.name].get(
            url, proxies={"https": proxy_address, "http": proxy_address}, timeout=30,
            verify=False)

        logger.info("Downloaded from: %s, speed: %f", url, resp.elapsed.total_seconds())

        content = resp.content
        if (resp.status_code != 200) or provider.is_invalid_content(content):
            raise InvalidContentException

        cache.set(url, content)
        server_statics.report_image_loaded(url, resp.elapsed.total_seconds(), len(content))
    else:
        server_statics.report_cache_hit(url)
        print("Use cached:", url)

    return content


def tiles_normal_lod(quadkey):
    return download_from_url(get_selected_map_provider().quadkey_url(quadkey))


def tiles_high_lod(quadkey):
    urls = get_selected_map_provider().next_level_urls(quadkey)

    images = {}

    with ThreadPoolExecutor() as executor:
        future_to_url = {executor.submit(download_from_url, url): url for url in urls}

        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                images[url] = Image.open(io.BytesIO(future.result()))
            except Exception as exc:
                print('%r generated an exception: %s' % (url, exc))

    output = Image.new('RGB', (256 * 2, 256 * 2))
    output.paste(images[urls[0]], (0, 0))
    output.paste(images[urls[1]], (256, 0))
    output.paste(images[urls[2]], (0, 256))
    output.paste(images[urls[3]], (256, 256))

    img_byte_arr = io.BytesIO()
    output.save(img_byte_arr, format='jpeg')
    img_byte_arr = img_byte_arr.getvalue()

    return img_byte_arr


@app.route("/offlinedownload", methods=['POST'])
def offline_download():
    body = request.get_json()

    regions = []
    for feature in body['features']:
        regions.append(feature['geometry']['coordinates'][0])

    offline_download_thread = Thread(target=offline_download_worker, args=(regions,))
    offline_download_thread.start()

    return jsonify({})


def offline_download_worker(regions):
    for region in regions:
        polygon = Polygon(region)
        with ThreadPoolExecutor(max_workers=50) as exec:
            for zoom_level in range(6, 16):
                left_top = Tile.for_latitude_longitude(polygon.bounds[1], polygon.bounds[0], zoom_level)
                right_bottom = Tile.for_latitude_longitude(polygon.bounds[3], polygon.bounds[2], zoom_level)
                print(left_top.google, right_bottom.google)
                for tile_x in range(left_top.google[0], right_bottom.google[0] + 1):
                    for tile_y in range(right_bottom.google[1], left_top.google[1] + 1):
                        point_min, point_max = Tile.from_google(tile_x, tile_y, zoom_level).bounds

                        pmin = geometry.Point(point_min.longitude, point_min.latitude)
                        pmax = geometry.Point(point_max.longitude, point_max.latitude)

                        if polygon.contains(pmin) or polygon.contains(pmax):
                            exec.submit(download_from_url,
                                        get_selected_map_provider().tile_url(tile_x, tile_y, zoom_level))


def disable_endpoint_logs():
    disabled_endpoints = ('/statics', '/last-image.*?')

    parent_log_request = serving.WSGIRequestHandler.log_request

    def log_request(self, *args, **kwargs):
        if not any(re.match(f"{de}$", self.path) for de in disabled_endpoints):
            parent_log_request(self, *args, **kwargs)

    serving.WSGIRequestHandler.log_request = log_request


logger.info("Started with config %s", argv)

if argv.config is not None:
    server_configs = json.loads(argv.config)
else:
    logger.info("Use default config")
    server_configs = {"autoStartGame": True, "autoStartMod": False, "gameStore": "MS Store",
                      "selectedServer": "Bing Map (Latest)", "mapboxAccessToken": None, "enableHighLOD": True,
                      "proxyAddress": "", "cacheLocation": "D:\\cache", "cacheEnabled": True, "cacheSizeGB": "100",
                      "firstTime": False}

logger.info("Start with %s", server_configs)
config_server()

disable_endpoint_logs()
app.run(port=39871, threaded=True)
