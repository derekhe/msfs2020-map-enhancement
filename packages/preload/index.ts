import { domReady } from "./utils";
import { useLoading } from "./loading";
import { ipcRenderer } from "electron";

const { appendLoading, removeLoading } = useLoading();

window.removeLoading = removeLoading;
domReady().then(appendLoading);

// @ts-ignore
window.ipcRenderer = ipcRenderer;