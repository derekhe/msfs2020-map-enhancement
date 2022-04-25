import {reactive} from 'vue'

export const enum selectedMenu {
    HOME, OPTION, ABOUT
}

export const uiState = reactive({
    selectedMenu: selectedMenu.HOME
})