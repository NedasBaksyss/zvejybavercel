import { translations } from "./translations";

const STORAGE_KEY = "app_language";
let currentLang = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) || "en";

export function getLanguage() {
	return currentLang;
}

export function setLanguage(lang) {
	currentLang = lang;
	if (typeof window !== "undefined") {
		window.localStorage.setItem(STORAGE_KEY, lang);
	}
}

// preserve capitalization of first letter
function preserveCase(original, translated) {
	if (!original) return translated;
	if (original[0] === original[0].toUpperCase()) {
		return translated.charAt(0).toUpperCase() + translated.slice(1);
	}
	return translated;
}

export function t(text) {
	if (typeof text !== "string" || currentLang === "en") return text;
	const map = translations[currentLang] || {};
	return text.replace(/\b([A-Za-zÀ-ÖØ-öø-ÿ0-9'’-]+)\b/g, (match) => {
		const key = match.toLowerCase();
		const translated = map[key];
		if (!translated) return match;
		return preserveCase(match, translated);
	});
}

// translate a DOM Text node's content
function translateTextNode(node) {
	const orig = node.nodeValue;
	const translated = t(orig);
	if (translated !== orig) node.nodeValue = translated;
}

// translate common attributes on an Element
function translateAttributes(el) {
	const attrs = ["placeholder", "title", "alt", "aria-label", "value"];
	for (const name of attrs) {
		if (el.hasAttribute && el.hasAttribute(name)) {
			const v = el.getAttribute(name);
			if (v && typeof v === "string") {
				const nv = t(v);
				if (nv !== v) el.setAttribute(name, nv);
			}
		}
	}
}

// Walk DOM and translate text nodes and attributes
export function translatePage(root = document.body) {
	if (!root) return;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
	let node;
	// translate attributes for root element first if element
	if (root.nodeType === 1) translateAttributes(root);
	while ((node = walker.nextNode())) {
		if (node.nodeType === Node.TEXT_NODE) {
			// skip script/style tags by checking parent type
			const parentTag = node.parentNode && node.parentNode.nodeName && node.parentNode.nodeName.toLowerCase();
			if (parentTag === "script" || parentTag === "style" || parentTag === "noscript") continue;
			const text = node.nodeValue.trim();
			if (!text) continue;
			translateTextNode(node);
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			translateAttributes(node);
		}
	}
}
