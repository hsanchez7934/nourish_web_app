export const NAV_STORAGE_KEY = 'nourish-nav'

export const navInitScript = `(function(){try{var stored=localStorage.getItem(${JSON.stringify(NAV_STORAGE_KEY)});var desktop=window.matchMedia('(min-width:1024px)').matches;var expanded=stored==='expanded'||(stored!=='collapsed'&&desktop);document.documentElement.dataset.nav=expanded?'expanded':'collapsed';}catch(e){document.documentElement.dataset.nav='collapsed';}})();`
