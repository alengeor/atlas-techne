import { useState } from 'react';
import { localized, type LocalizedText } from '../../../shared/model';
import { Dialog } from '../../components/Dialog';
import { LocalizedFields } from '../../components/LocalizedFields';
import { useLanguage } from '../../i18n/Language';

export function OverlayForm({ onClose, onApply }: { onClose: () => void; onApply: (title: LocalizedText, color: string, brushSize: number) => void }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(localized());
  const [color, setColor] = useState('#e6b65e');
  const [brushSize, setBrushSize] = useState(12);
  return <Dialog title={t.drawOverlay} onClose={onClose}>
    <form onSubmit={e => { e.preventDefault(); if (title.es.trim()) onApply(title, color, brushSize); }}>
      <div className="dialog-body">
        <LocalizedFields title={title} onTitle={setTitle} />
        <label>{t.overlayColor}<input type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
        <label>{t.brushSize}<input type="range" min="1" max="80" step="1" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} /><output>{brushSize}px</output></label>
      </div>
      <footer className="dialog-footer"><button type="button" onClick={onClose}>{t.cancel}</button><button className="primary" type="submit" disabled={!title.es.trim()}>{t.startDrawing}</button></footer>
    </form>
  </Dialog>;
}