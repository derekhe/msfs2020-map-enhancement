from dataclasses import dataclass


@dataclass
class Config:
    proxyAddress: str
    selectedServer: str
    cacheLocation: str
    cacheEnabled: bool
    mapboxAccessToken: str