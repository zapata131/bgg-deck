import { create } from 'zustand';

type Language = 'en' | 'es';

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "collection.title": "My Collection",
    "collection.fetch": "Fetch Collection",
    "collection.refresh": "Refresh",
    "collection.loading": "Loading...",
    "collection.username_placeholder": "BGG Username",
    "collection.print_selected": "Print Selected",
    "collection.no_games": "No games found.",
    "collection.error_generic": "An unknown error occurred",
    "print.title": "Print Preview",
    "print.download_pdf": "Download PDF",
    "print.print": "Print",
    "print.loading": "Loading print preview...",
    "print.no_selection": "No games selected.",
  },
  es: {
    "collection.title": "Mi Colección",
    "collection.fetch": "Obtener Colección",
    "collection.refresh": "Actualizar",
    "collection.loading": "Cargando...",
    "collection.username_placeholder": "Usuario BGG",
    "collection.print_selected": "Imprimir Seleccionados",
    "collection.no_games": "No se encontraron juegos.",
    "collection.error_generic": "Ocurrió un error desconocido",
    "print.title": "Vista Previa de Impresión",
    "print.download_pdf": "Descargar PDF",
    "print.print": "Imprimir",
    "print.loading": "Cargando vista previa...",
    "print.no_selection": "No hay juegos seleccionados.",
  },
};

export const useI18n = create<I18nStore>((set, get) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  t: (key) => {
    const lang = get().language;
    const dict = translations[lang] as Record<string, string>;
    return dict[key] || key;
  },
}));
