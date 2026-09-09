import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export function LanguageSwitcher({ className, style }) {
	const { lang, setLanguage, t } = useLanguage();

	const handleChange = (e) => {
		setLanguage(e.target.value);
	};

	// Use createElement to avoid JSX parsing errors in .js files
	return React.createElement(
		"div",
		{ className, style },
		React.createElement("label", { style: { marginRight: 8 } }, `${t("language")}:`),
		React.createElement(
			"select",
			{ value: lang, onChange: handleChange },
			React.createElement("option", { value: "en" }, `EN - ${t("english")}`),
			React.createElement("option", { value: "lt" }, `LT - ${t("lithuanian")}`)
		)
	);
}
