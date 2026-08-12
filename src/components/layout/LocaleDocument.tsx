"use client";

import { useEffect } from "react";

type LocaleDocumentProps = { lang: "en" | "ar"; dir: "ltr" | "rtl" };

export function LocaleDocument({ lang, dir }: LocaleDocumentProps) {
  useEffect(() => {
    const root = document.documentElement;
    const previousLang = root.lang;
    const previousDir = root.dir;
    root.lang = lang;
    root.dir = dir;
    return () => {
      root.lang = previousLang;
      root.dir = previousDir;
    };
  }, [dir, lang]);

  return null;
}
