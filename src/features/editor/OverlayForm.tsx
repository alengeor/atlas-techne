import { BrushSizeControl } from '../../components/BrushSizeControl';
import { BrushPicker } from '../../components/BrushPicker';
import type { BrushStyle } from '../../../shared/model';
import { useState } from 'react';
import { localized, type LocalizedText } from '../../../shared/model';
import { Dialog } from '../../components/Dialog';
import { LocalizedFields } from '../../components/LocalizedFields';
import { useLanguage } from '../../i18n/Language';

export function OverlayForm({ onClose, onApply }: { onClose: () => void; onApply: (title: LocalizedText, color: string, brushSize: number, brushStyle: BrushStyle) => void }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(localized());
  const [color, setColor] = useState('#e6b65e');
  const [brushSize, setBrushSize] = useState(12);
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('solid');
  return <Dialog title={t.drawOverlay} onClose={onClose}>
    <form onSubmit={e => { e.preventDefault(); if (title.es.trim()) onApply(title, color, brushSize, brushStyle); }}>
      <div className="dialog-body">
        <LocalizedFields title={title} onTitle={setTitle} /><BrushPicker value={brushStyle} color={color} size={brushSize} onChange={setBrushStyle} />
        <label>{t.overlayColor}<input type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
        <BrushSizeControl value={brushSize} onChange={setBrushSize} />
      </div>
      <footer className="dialog-footer"><button type="button" onClick={onClose}>{t.cancel}</button><button className="primary" type="submit" disabled={!title.es.trim()}>{t.startDrawing}</button></footer>
    </form>
  </Dialog>;
}