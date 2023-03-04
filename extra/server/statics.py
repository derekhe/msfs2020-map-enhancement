from dataclasses import dataclass
from datetime import datetime


@dataclass
class Statics:
    numOfImageLoaded: int
    lastLoadingImageUrl: str
    lastLoadTime: datetime