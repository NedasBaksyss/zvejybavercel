import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { translations } from "./translations";

const STORAGE_KEY = "app_language";
export const LanguageContext = createContext({
	lang: "en",
	setLanguage: () => {},
	toggleLanguage: () => {},
	t: (s) => s,
});

// Helper: preserve capitalization of first letter
function preserveCase(original, translated) {
	if (!original) return translated;
	if (original[0] === original[0].toUpperCase()) {
		return translated.charAt(0).toUpperCase() + translated.slice(1);
	}
	return translated;
}

// Translate each singular word using word boundary regex
function translateString(str, lang) {
	if (!str || lang === "en") return str;
	const map = translations[lang] || {};
	// Replace words (letters, digits and apostrophes/hyphens) using word boundary
	return str.replace(/\b([A-Za-zÀ-ÖØ-öø-ÿ0-9'’-]+)\b/g, (match) => {
		const key = match.toLowerCase();
		const translated = map[key];
		if (!translated) return match; // fallback to original if missing
		return preserveCase(match, translated);
	});
}

export function LanguageProvider({ children, defaultLang = "en" }) {
	const [lang, setLang] = useState(defaultLang);

	useEffect(() => {
		const stored = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
		if (stored) setLang(stored);
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(STORAGE_KEY, lang);
		}
	}, [lang]);

	const setLanguage = (l) => setLang(l);
	const toggleLanguage = () => setLang((prev) => (prev === "en" ? "lt" : "en"));

	const t = (text) => {
		// If text is not a string, return as-is
		if (typeof text !== "string") return text;
		// Translate each singular word
		return translateString(text, lang);
	};

	const value = useMemo(() => ({ lang, setLanguage, toggleLanguage, t }), [lang]);

	// Replace JSX with createElement to avoid parse errors in .js files
	return React.createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage() {
	return useContext(LanguageContext);
}

// This file was added previously. The user requested an undo, so the module has been emptied.
// If you prefer deletion, remove this file.
export {}; // placeholder - no exports
