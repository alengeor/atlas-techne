import { useState } from 'react';
import { localized, markerCategorySchema, type MarkerCategory } from '../../../shared/model';
import { Dialog } from '../../components/Dialog';
import { LocalizedFields } from '../../components/LocalizedFields';
import { useLanguage } from '../../i18n/Language';

export function MarkerCategoryForm({ category, onApply, onClose }: {
  category?: MarkerCategory; onApply: (category: MarkerCategory) => void; onClose: () => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<MarkerCategory>(() => category ? structuredClone(category) : {
    id: crypto.randomUUID(), title: localized(), color: '#e6b65e', visibleByDefault: true,
  });
  const [error, setError] = useState(false);
  return <Dialog title={category ? t.editCategory : t.addCategory} onClose={onClose}>
    <form onSubmit={event => {
      event.preventDefault();
      const parsed = markerCategorySchema.safeParse(form);
      if (!parsed.success || !form.title.es.trim()) { setError(true); return; }
      onApply(parsed.data);
    }}>
      <div className="dialog-body">
        <LocalizedFields title={form.title} onTitle={title => setForm({ ...form, title })} />
        <label>{t.categoryColor}<input type="color" className="category-color-input" value={form.color} onChange={event => setForm({ ...form, color: event.target.value })} /></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.visibleByDefault} onChange={event => setForm({ ...form, visibleByDefault: event.target.checked })} />{t.categoryVisibleByDefault}</label>
        {error && <p className="form-error" role="alert">{t.categoryRequired}</p>}
      </div>
      <footer className="dialog-footer"><div className="button-row"><button type="button" onClick={onClose}>{t.cancel}</button><button className="primary" type="submit">{t.apply}</button></div></footer>
    </form>
  </Dialog>;
}
