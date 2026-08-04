import { useEffect } from 'react';
import { i18n } from '#imports';
import { localStorage } from '@/lib/browser-api';

const styles = `
  :root {
    color-scheme: light;
    --bg: #f4f7fb;
    --panel: #ffffff;
    --text: #172033;
    --muted: #667085;
    --border: #dfe5ee;
    --accent: #16a34a;
    --accent-dark: #15803d;
    --success: #15803d;
    --success-bg: #f0fdf4;
    --details-bg: #fafbfc;
    --shadow: 0 18px 50px rgba(23, 32, 51, 0.12);
  }

  * { box-sizing: border-box; }

  html, body, #root {
    margin: 0;
    min-height: 100%;
  }

  body {
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background:
      radial-gradient(circle at top left, rgba(34, 197, 94, 0.10), transparent 32rem),
      var(--bg);
    color: var(--text);
  }

  .page-shell {
    display: grid;
    place-items: center;
    min-height: 100vh;
    padding: 24px;
  }

  .page {
    width: min(100%, 760px);
  }

  .panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 22px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .topbar {
    height: 8px;
    background: linear-gradient(90deg, var(--accent), #4ade80);
  }

  .content {
    padding: 44px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 38px;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--accent);
    color: #ffffff;
    font-weight: 800;
    font-size: 20px;
    letter-spacing: -1px;
  }

  .brand-name {
    font-size: 22px;
    font-weight: 750;
    letter-spacing: -0.5px;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
    padding: 7px 11px;
    border-radius: 999px;
    background: var(--success-bg);
    color: var(--success);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: currentColor;
  }

  h1 {
    margin: 0 0 16px;
    font-size: clamp(34px, 7vw, 48px);
    line-height: 1.05;
    letter-spacing: -0.04em;
  }

  .lead {
    margin: 0;
    max-width: 620px;
    color: var(--muted);
    font-size: 18px;
    line-height: 1.65;
  }

  .details {
    margin-top: 30px;
    padding: 18px 20px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--details-bg);
  }

  .details strong {
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
  }

  .details span {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    padding: 0 18px;
    border-radius: 11px;
    border: none;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
  }

  .button:hover {
    transform: translateY(-1px);
  }

  .button-primary {
    background: var(--accent);
    color: #ffffff;
  }

  .button-primary:hover {
    background: var(--accent-dark);
  }

  .footer {
    padding: 20px 44px 24px;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 600px) {
    .content { padding: 30px 24px; }
    .footer { padding: 18px 24px 22px; }
    .brand { margin-bottom: 28px; }
    .actions { flex-direction: column; }
    .button { width: 100%; }
  }
`;

export default function OnboardingApp() {
  useEffect(() => {
    void localStorage.set({ onboardingCompleted: true });
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <>
      <style>{styles}</style>
      <main className="page-shell">
        <div className="page">
          <section className="panel" aria-labelledby="page-title">
            <div className="topbar" />

            <div className="content">
              <div className="brand" aria-label="ProcessPro">
                <div className="brand-mark" aria-hidden="true">
                  PP
                </div>
                <div className="brand-name">ProcessPro</div>
              </div>

              <div className="status">
                <span className="status-dot" aria-hidden="true" />
                {i18n.t('onboarding.statusBadge')}
              </div>

              <h1 id="page-title">{i18n.t('onboarding.installedTitle')}</h1>

              <p className="lead">{i18n.t('onboarding.installedMessage')}</p>

              <div className="details">
                <strong>{i18n.t('onboarding.nextStepsTitle')}</strong>
                <span>{i18n.t('onboarding.nextStepsMessage')}</span>
              </div>

              <div className="actions">
                <button type="button" className="button button-primary" onClick={handleClose}>
                  {i18n.t('onboarding.closeTab')}
                </button>
              </div>
            </div>

            <footer className="footer">{i18n.t('onboarding.footerNote')}</footer>
          </section>
        </div>
      </main>
    </>
  );
}
