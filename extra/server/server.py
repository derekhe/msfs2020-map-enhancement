import ast
import concurrent
import os
import sys

sys.path.append(os.path.curdir)

from config import Config
from dummy_cache import DummyCache
from statics import Statics

from datetime import datetime

import PIL
import io
import re
import requests
import traceback
import urllib3
from PIL import Image, ImageEnhance
from providers import MTGoogle, KHMGoogle, ArcGIS, BingMap, MapBox
from flask import Flask, make_response, Response, request, jsonify
import argparse
from diskcache import Cache, FanoutCache
from concurrent.futures.thread import ThreadPoolExecutor
from log import logger

urllib3.disable_warnings()

parser = argparse.ArgumentParser()
parser.add_argument('--proxyAddress', default=None, required=False)
parser.add_argument('--selectedServer', default="mt.google.com")
parser.add_argument('--cacheLocation', default="./cache", required=False)
parser.add_argument('--cacheEnabled', default=False, required=False)
parser.add_argument('--cacheSizeGB', default=10, required=False)
parser.add_argument('--mapboxAccessToken', default="", required=False)
parser.add_argument('--enableHighLOD', default=False, required=False)
argv = parser.parse_args()

app: Flask = Flask(__name__)

server_configs = Config(proxyAddress=argv.proxyAddress, selectedServer=argv.selectedServer,
                        cacheLocation=argv.cacheLocation,
                        cacheEnabled=argv.cacheEnabled == 'true',
                        cacheSizeGB=argv.cacheSizeGB,
                        mapboxAccessToken=argv.mapboxAccessToken,
                        enableHighLOD=argv.enableHighLOD == 'true')

server_statics = Statics(numOfImageLoaded=0, lastLoadingImageUrl="", lastLoadTime=datetime.utcnow())

logger.info("Server started")
logger.info("Started with configs %s", server_configs.__dict__)

map_providers = [MTGoogle(), KHMGoogle(), ArcGIS(), BingMap(), MapBox(server_configs.mapboxAccessToken)]
last_image = None

if server_configs.cacheEnabled:
    cache = FanoutCache(
        server_configs.cacheLocation, size_limit=int(server_configs.cacheSizeGB) * 1024 * 1024 * 1024, shards=20)
else:
    cache = DummyCache()


@app.route("/health")
def health() -> str:
    return "alive"


@app.route("/cache", methods=["DELETE"])
def clear_cache() -> Response:
    cache.clear()
    return Response(status=200)


@app.route("/configs", methods=['POST'])
def configs() -> Response:
    global server_configs
    new_configs = request.get_json(force=True)

    if 'selectedServer' in new_configs:
        server_configs.selectedServer = new_configs['selectedServer']

    if 'proxyAddress' in new_configs:
        server_configs.proxyAddress = new_configs['proxyAddress']

    logger.info("Updated configs %s", server_configs.__dict__)

    return jsonify(server_configs)


@app.route("/last-image")
def last_image() -> Response:
    response = make_response(last_image)
    response.headers["Content-Type"] = "image/jpeg"
    return response


@app.route("/statics")
def statics() -> Response:
    return jsonify(server_statics)


@app.route('/tiles/mtx<dummy>')
def mtx(dummy: str = None) -> Response:
    logger.info("Handing request to %s", request.url)
    request_header = {}
    for k, v in request.headers:
        request_header[k] = v

    logger.info("Downloading from: %s", request.url)

    url = request.url.replace(request.host, "kh.ssl.ak.tiles.virtualearth.net.edgekey.net").replace("http://",
                                                                                                    "https://")

    remote_response = requests.get(
        url, proxies={"https": server_configs.proxyAddress, "http": server_configs.proxyAddress}, timeout=30,
        verify=False, headers=request_header)

    response = make_response(remote_response.content)
    for k, v in remote_response.headers.items():
        response.headers[k] = v
    return response


@app.route("/tiles/a<path>")
def tiles(path: str) -> Response:
    quadkey = re.findall(r"(\d+).jpeg", path)[0]
    map_provider = list(filter(lambda x: x.name == server_configs.selectedServer, map_providers))[0]

    if server_configs.enableHighLOD:
        content = tiles_high_lod(quadkey, map_provider)
    else:
        content = tiles_normal_lod(quadkey, map_provider)

    try:
        im = Image.open(io.BytesIO(content))

        enhancer = ImageEnhance.Brightness(im)
        im = enhancer.enhance(0.7)
        img_byte_arr = io.BytesIO()
        im.save(img_byte_arr, format='jpeg')
        output = img_byte_arr.getvalue()
    except FileNotFoundError or PIL.UnidentifiedImageError or ValueError or TypeError:
        logger.error("Image adjust failed, use original picture")
        output = content
        traceback.print_exc()

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

    global server_statics
    server_statics.numOfImageLoaded += 1
    server_statics.lastLoadingImageUrl = map_provider.map(quadkey)
    server_statics.lastLoadTime = datetime.utcnow()

    return response


def download_from_url(url, map_provider):
    content = cache.get(url)

    if content is None:
        logger.info("Downloading from: %s, %s", url, server_configs.proxyAddress)
        resp = requests.get(
            url, proxies={"https": server_configs.proxyAddress, "http": server_configs.proxyAddress}, timeout=30,
            verify=False)

        logger.info("Downloaded from: %s, speed: %f", url, resp.elapsed.total_seconds())

        content = resp.content
        if (resp.status_code != 200) or map_provider.is_invalid_content(content):
            return Response(status=404)

        cache.set(url, content)
    else:
        print("Use cached:", url)

    return content


def tiles_normal_lod(quadkey, map_provider):
    url = map_provider.map(quadkey)

    return download_from_url(url, map_provider)


def tiles_high_lod(quadkey, map_provider):
    urls = map_provider.next_level_urls(quadkey)

    images = {}

    with ThreadPoolExecutor() as executor:
        future_to_url = {executor.submit(download_from_url, url, map_provider): url for url in urls}

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


app.run(port=39871, threaded=True)
