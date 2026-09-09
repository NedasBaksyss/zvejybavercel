import React, { useState, useEffect } from "react";
import { getLanguage, setLanguage, translatePage, t } from "@/i18n/i18n";

export default function LanguageSwitcher({ className, style }) {
	const [lang, setLangState] = useState(typeof window !== "undefined" ? getLanguage() : "en");

	useEffect(() => {
		// ensure UI shows current language
		setLangState(getLanguage());
	}, []);

	const handleChange = (e) => {
		const l = e.target.value;
		setLanguage(l);
		setLangState(l);
		// translate the whole page immediately
		try {
			translatePage(document.body);
		} catch (err) {
			// ignore if running outside browser
		}
	};

	const handleToggle = () => {
		const l = lang === "en" ? "lt" : "en";
		setLanguage(l);
		setLangState(l);
		try {
			translatePage(document.body);
		} catch (err) {}
	};

	return (
		<div className={className} style={style}>
			<label style={{ marginRight: 8 }}>{t("language")}:</label>
			<select value={lang} onChange={handleChange}>
				<option value="en">EN - {t("english")}</option>
				<option value="lt">LT - {t("lithuanian")}</option>
			</select>
			<button type="button" onClick={handleToggle} style={{ marginLeft: 8 }}>
				{lang === "en" ? "LT" : "EN"}
			</button>
		</div>
	);
}
