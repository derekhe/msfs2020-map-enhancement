import logging.handlers
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

console = logging.StreamHandler()
logger.addHandler(console)

os.makedirs("./logs", exist_ok=True)
file_rotating_file = logging.handlers.RotatingFileHandler("./logs/image_server.log", maxBytes=1024 * 1024 * 10,
                                                          backupCount=3)
file_rotating_file.setLevel(logging.INFO)
logger.addHandler(file_rotating_file)
