import { describe, expect, it } from 'vitest';
import { chooseLocale } from './Language';
import { es, en, pt } from './messages';

describe('language policy', () => {
  it('prefers valid stored language, then browser, then Spanish', () => {
    expect(chooseLocale('pt', 'en-US')).toBe('pt');
    expect(chooseLocale('invalid', 'pt-BR')).toBe('pt');
    expect(chooseLocale(null, 'fr-FR')).toBe('es');
  });
  it('has complete, nonempty system catalogs', () => {
    for (const catalog of [en, pt]) expect(Object.keys(catalog).sort()).toEqual(Object.keys(es).sort());
    for (const catalog of [es, pt, en]) expect(Object.values(catalog).every(v => v.trim().length > 0)).toBe(true);
  });
});
