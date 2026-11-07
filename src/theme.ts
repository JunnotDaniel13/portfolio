export const themeScript = `try{document.documentElement.classList.add('js');var t=localStorage.getItem('portfolio-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`

export type ThemeChoice = 'system' | 'light' | 'dark'
export const themeStorageKey = 'portfolio-theme'
