from dataclasses import dataclass
from datetime import datetime
from threading import Lock


@dataclass
class Statics:
    numOfImageLoaded: int
    lastLoadingImageUrl: str
    lastLoadTime: datetime
    lastLoadingTime: float
    cacheHit: int
    bytesLoaded: int

    def __post_init__(self):
        self._threadLock = Lock()

    def report_image_loaded(self, lastLoadingImageUrl, lastLoadingTime, bytesLoaded):
        with self._threadLock:
            self.numOfImageLoaded += 1
            self.lastLoadingTime = lastLoadingTime
            self.lastLoadingImageUrl = lastLoadingImageUrl
            self.lastLoadTime = datetime.utcnow()
            self.bytesLoaded += bytesLoaded

    def report_cache_hit(self, url):
        with self._threadLock:
            self.numOfImageLoaded += 1
            self.lastLoadingImageUrl = url
            self.lastLoadTime = datetime.utcnow()
            self.lastLoadingTime = 0
            self.cacheHit += 1
