import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const change = (e) => i18n.changeLanguage(e.target.value);
  return (
    <select onChange={change} value={i18n.language} className="text-sm border rounded px-2 py-1">
      <option value="en">EN</option>
      <option value="hi">HI</option>
      <option value="mr">MR</option>
    </select>
  );
}


