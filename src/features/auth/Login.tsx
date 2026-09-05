import { useState } from 'react';
import { Dialog } from '../../components/Dialog';
import { useLanguage } from '../../i18n/Language';
import { api } from '../../api/client';
import type { Session } from '../../../shared/api';
import { apiMessage } from '../../i18n/apiErrors';

export function Login({ onClose, onSession }: { onClose: () => void; onSession: (session: Session) => void }) {
  const { t } = useLanguage();
  const [username, setUsername] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>(null);
  return <Dialog title={t.editorLogin} onClose={() => { if (!busy) onClose(); }}>
    <form onSubmit={e => { e.preventDefault(); setBusy(true); setError(null); void api.login(username, password).then(onSession).catch(setError).finally(() => setBusy(false)); }}>
      <div className="dialog-body"><label>{t.username}<input autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} /></label>
        <label>{t.password}<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error !== null && <p role="alert" className="form-error">{apiMessage(error, t)}</p>}
      </div><footer className="dialog-footer"><button type="button" onClick={onClose} disabled={busy}>{t.cancel}</button><button className="primary" type="submit" disabled={busy}>{busy ? t.loading : t.login}</button></footer>
    </form>
  </Dialog>;
}
