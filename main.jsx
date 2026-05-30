const { useState, useEffect, useMemo, useRef } = React;

/* ---------- icons ---------- */
const Star = ({ filled, cls }) => (
  <svg viewBox="0 0 24 24" className={cls}>
    <path className={filled ? 'star-fill' : 'star-empty'} d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
);
const MiniStar = ({ color }) => (
  <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}>
    <path fill={color} d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
);

/* ---------- sample data ---------- */
const CATEGORIES = ['Service', 'Product', 'Staff', 'Atmosphere', 'Other'];
const CAT_COLOR = {
  Service: '#FF8A3D', Product: '#FB6B4B', Staff: '#2BB3A3', Atmosphere: '#7A5AE0', Other: '#8A8079',
};
const RATING_WORDS = ['', 'Not great', 'Could be better', "It was okay", 'Really good!', 'Loved it!'];

const hoursAgo = (h) => Date.now() - h * 3600 * 1000;
const SEED = [
  { r: 5, c: 'Staff', t: 'Mia at the counter remembered my usual from last week — totally made my morning. So warm and friendly!', at: hoursAgo(2) },
  { r: 5, c: 'Product', t: 'Best flat white in the neighborhood, hands down. The almond croissants are always fresh too.', at: hoursAgo(5) },
  { r: 4, c: 'Atmosphere', t: 'Love the cozy window seats and the playlist. Gets a little loud at peak times though.', at: hoursAgo(9) },
  { r: 2, c: 'Service', t: 'Waited almost 15 minutes for a single latte during the morning rush. Could really use more hands on deck.', at: hoursAgo(22) },
  { r: 3, c: 'Product', t: 'Coffee is solid but a bit pricey for what you get — $6 for a small oat latte adds up fast.', at: hoursAgo(28) },
  { r: 5, c: 'Staff', t: 'The whole team is so welcoming. They know the regulars by name and it shows.', at: hoursAgo(33) },
  { r: 4, c: 'Product', t: 'The banana bread is incredible. Wish there were a few more gluten-free options though.', at: hoursAgo(40) },
  { r: 1, c: 'Service', t: 'My order was wrong twice and nobody apologized. Pretty disappointing visit honestly.', at: hoursAgo(46) },
  { r: 5, c: 'Atmosphere', t: 'Perfect spot to work remotely — fast wifi, plenty of outlets, and lovely natural light.', at: hoursAgo(54) },
  { r: 3, c: 'Other', t: 'Nice place, but card-only payment caught me off guard. Maybe post a sign by the door?', at: hoursAgo(61) },
  { r: 4, c: 'Service', t: 'Quick and friendly most days. A mobile pickup option would be such a great addition.', at: hoursAgo(70) },
  { r: 2, c: 'Product', t: 'The muffin was a touch stale and the prices keep creeping up. Used to be my go-to spot.', at: hoursAgo(78) },
  { r: 5, c: 'Product', t: 'The seasonal lavender latte is a dream. Staff recommended it and they were so right!', at: hoursAgo(90) },
  { r: 4, c: 'Atmosphere', t: 'Charming little cafe. Only wish it were a touch bigger — hard to grab a table on weekends.', at: hoursAgo(102) },
  { r: 3, c: 'Service', t: 'Friendly staff but the weekend wait times are getting pretty long. Worth it for the coffee though.', at: hoursAgo(120) },
].map((x, i) => ({ id: 1000 - i, rating: x.r, category: x.c, comment: x.t, at: x.at }));

const timeAgo = (ts) => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
};

/* ---------- star rating input ---------- */
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div>
      <div className="stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} className="star-btn" aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>
            <Star filled={n <= shown} cls="" />
          </button>
        ))}
      </div>
      <div className="rating-caption" style={{ opacity: shown ? 1 : 0 }}>{RATING_WORDS[shown] || ''}</div>
    </div>
  );
}

/* ---------- form view ---------- */
function FormView({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!rating) return;
    onSubmit({ id: Date.now(), rating, category: category || 'Other', comment: comment.trim(), at: Date.now() });
    setDone(true);
  };
  const reset = () => { setRating(0); setCategory(''); setComment(''); setDone(false); };

  if (done) {
    return (
      <div className="form-wrap fade-in">
        <div className="card thanks">
          <div className="check">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2>Thanks so much! 🎉</h2>
          <p>Your feedback just landed with our team. It genuinely helps us make every visit better.</p>
          <button className="link-btn" onClick={reset}>Leave another response →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-wrap fade-in">
      <div className="form-hero">
        <div className="emoji">☕️</div>
        <h1>How was your visit?</h1>
        <p>It only takes a few seconds — and we read every single one.</p>
      </div>
      <div className="card form-card">
        <div className="field">
          <label className="field-label">Your rating</label>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div className="field">
          <label className="field-label">What's it about?</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled>Choose a category…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Tell us more <span className="opt">optional</span></label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you love? What could we do better?" maxLength={600} />
        </div>
        <button className="btn-primary" disabled={!rating} onClick={submit}>
          {rating ? 'Send feedback' : 'Pick a rating to continue'}
        </button>
      </div>
    </div>
  );
}

/* ---------- dashboard ---------- */
const RATING_VAR = { 5: 'var(--r5)', 4: 'var(--r4)', 3: 'var(--r3)', 2: 'var(--r2)', 1: 'var(--r1)' };

function StatCards({ responses }) {
  const total = responses.length;
  const avg = total ? responses.reduce((s, r) => s + r.rating, 0) / total : 0;
  const positive = total ? Math.round((responses.filter((r) => r.rating >= 4).length / total) * 100) : 0;
  return (
    <div className="stat-grid">
      <div className="card stat">
        <div className="k">Total responses</div>
        <div className="v">{total}</div>
      </div>
      <div className="card stat">
        <div className="k">Average rating</div>
        <div className="v">{avg.toFixed(1)}
          <span className="ministars">
            {[1,2,3,4,5].map((n) => <MiniStar key={n} color={n <= Math.round(avg) ? 'var(--gold)' : '#EBE2D8'} />)}
          </span>
        </div>
      </div>
      <div className="card stat">
        <div className="k">Positive (4★+)</div>
        <div className="v">{positive}<small>%</small></div>
      </div>
    </div>
  );
}

function RatingChart({ responses }) {
  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, c: responses.filter((r) => r.rating === n).length }));
  const max = Math.max(1, ...counts.map((x) => x.c));
  return (
    <div className="card panel">
      <div className="panel-title">
        <span className="ico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>
        Ratings distribution
      </div>
      <div className="bars">
        {counts.map(({ n, c }) => (
          <div className="bar-row" key={n}>
            <span className="bar-label">{n}<svg viewBox="0 0 24 24"><path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z"/></svg></span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(c / max) * 100}%`, background: RATING_VAR[n] }} /></div>
            <span className="bar-count">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AISection({ responses }) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null });
  const withComments = responses.filter((r) => r.comment && r.comment.length > 2);

  const analyze = async () => {
    setState({ status: 'loading', data: null, error: null });
    const list = withComments.map((r) => `[${r.rating}★ · ${r.category}] ${r.comment}`).join('\n');
    const prompt = `You are analyzing customer feedback for a small neighborhood cafe. Below are ${withComments.length} customer comments, each with its star rating and category.\n\nCOMMENTS:\n${list}\n\nReturn ONLY valid JSON (no markdown, no code fences) with exactly this shape:\n{\n  "summary": "one short paragraph (2-4 sentences) in plain, friendly language summarizing the overall feedback, what customers love and what they want improved",\n  "themes": [{ "theme": "short 1-3 word label", "count": <number of comments that mention this theme>, "sentiment": "positive" | "negative" | "mixed" }]\n}\nInclude 3 to 6 themes, ordered by count descending. Counts must reflect how many of the comments above relate to each theme.`;
    try {
      const raw = await window.claude.complete(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);
      if (!parsed.summary || !Array.isArray(parsed.themes)) throw new Error('bad shape');
      setState({ status: 'done', data: parsed, error: null });
    } catch (e) {
      setState({ status: 'error', data: null, error: 'Something went wrong analyzing the feedback. Please try again.' });
    }
  };

  const sentColor = (s) => s === 'positive' ? 'var(--r5)' : s === 'negative' ? 'var(--r1)' : 'var(--r3)';

  return (
    <div className="card ai-card">
      <div className="ai-head">
        <span className="ai-badge"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4L12 3z"/><path d="M5 18l.9 2.1L8 21l-2.1.9L5 24l-.9-2.1L2 21l2.1-.9L5 18z"/></svg></span>
        <div>
          <h2>What customers are saying</h2>
          <p>AI summary of {withComments.length} written comment{withComments.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {withComments.length < 3 ? (
        <div className="ai-empty">You'll need at least 3 written comments before we can summarize the themes. Check back once a few more roll in! ✨</div>
      ) : (
        <>
          {state.status !== 'done' && (
            <button className="btn-ai" onClick={analyze} disabled={state.status === 'loading'}>
              {state.status === 'loading' ? <><span className="dots"><i></i><i></i><i></i></span> Reading the feedback…</> : <><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4L12 3z"/></svg> Summarize feedback</>}
            </button>
          )}
          {state.status === 'error' && <div className="ai-error">{state.error}</div>}
          {state.status === 'done' && state.data && (
            <div className="fade-in">
              <p className="ai-summary">{state.data.summary}</p>
              <div className="ai-themes">
                {state.data.themes.map((th, i) => (
                  <div className="theme-row" key={i}>
                    <span className="theme-dot" style={{ background: sentColor(th.sentiment) }} />
                    <span className="theme-name">{th.theme}</span>
                    <span className="theme-count"><span className="pill">{th.count} mention{th.count === 1 ? '' : 's'}</span></span>
                  </div>
                ))}
              </div>
              <button className="btn-ai" style={{ marginTop: 16, background: 'transparent', color: 'var(--accent)', boxShadow: 'none', border: '2px solid color-mix(in srgb, var(--accent) 35%, transparent)' }} onClick={analyze}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Re-run analysis
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CommentsList({ responses }) {
  const sorted = [...responses].sort((a, b) => b.at - a.at);
  return (
    <div className="card panel">
      <div className="panel-title">
        <span className="ico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>
        Recent comments
      </div>
      <div className="comments">
        {sorted.map((r) => (
          <div className="cmt" key={r.id}>
            <div className="cmt-top">
              <span className="cmt-stars">{[1,2,3,4,5].map((n) => <span key={n} style={{ width: 15, height: 15, display: 'inline-block' }}><MiniStar color={n <= r.rating ? 'var(--gold)' : '#EBE2D8'} /></span>)}</span>
              <span className="badge" style={{ background: `color-mix(in srgb, ${CAT_COLOR[r.category]} 15%, white)`, color: CAT_COLOR[r.category] }}>{r.category}</span>
              <span className="cmt-time">{timeAgo(r.at)}</span>
            </div>
            <div className={`cmt-text ${r.comment ? '' : 'empty'}`}>{r.comment || 'No comment left — rating only.'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ responses }) {
  return (
    <div className="fade-in">
      <div className="dash-head">
        <div>
          <h1>Feedback dashboard</h1>
          <div className="sub">A live look at what your customers think</div>
        </div>
      </div>
      <StatCards responses={responses} />
      <RatingChart responses={responses} />
      <AISection responses={responses} />
      <CommentsList responses={responses} />
    </div>
  );
}

/* ---------- tweaks ---------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#FB6B4B",
  "accent": "#2BB3A3",
  "bg": "#FFF8F2",
  "font": "Nunito",
  "headFont": "Baloo 2",
  "radius": 22
}/*EDITMODE-END*/;

const FONT_STACK = (f) => `'${f}', system-ui, sans-serif`;

/* ---------- app ---------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState('form');
  const [responses, setResponses] = useState(SEED);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--primary', t.primary);
    r.style.setProperty('--primary-soft', `color-mix(in srgb, ${t.primary} 16%, white)`);
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--bg', t.bg);
    r.style.setProperty('--radius', `${t.radius}px`);
    r.style.setProperty('--font-body', FONT_STACK(t.font));
    r.style.setProperty('--font-head', FONT_STACK(t.headFont));
  }, [t]);

  const addResponse = (resp) => setResponses((prev) => [resp, ...prev]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="logo">☕</div>
            <div>
              <div className="brand-name">Cafe Customer Feedback</div>
              <div className="brand-sub">{view === 'form' ? 'Share your experience' : 'Internal view'}</div>
            </div>
          </div>
          <div className="tabs">
            <button className={`tab ${view === 'form' ? 'active' : ''}`} onClick={() => setView('form')}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Leave feedback</span>
            </button>
            <button className={`tab ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </header>
      <main>
        {view === 'form' ? <FormView onSubmit={addResponse} /> : <Dashboard responses={responses} />}
      </main>

      <TweaksPanel>
        <TweakSection label="Brand colors" />
        <TweakColor label="Primary" value={t.primary} options={['#FB6B4B', '#F2542D', '#E8488B', '#7A5AE0', '#2BB3A3']} onChange={(v) => setTweak('primary', v)} />
        <TweakColor label="AI accent" value={t.accent} options={['#2BB3A3', '#3B82F6', '#7A5AE0', '#F59E0B', '#22A06B']} onChange={(v) => setTweak('accent', v)} />
        <TweakColor label="Background" value={t.bg} options={['#FFF8F2', '#FFFFFF', '#FBF6FF', '#F2FBF7', '#FFF7E8']} onChange={(v) => setTweak('bg', v)} />
        <TweakSection label="Type & shape" />
        <TweakSelect label="Body font" value={t.font} options={['Nunito', 'Quicksand', 'Fredoka']} onChange={(v) => setTweak('font', v)} />
        <TweakSelect label="Heading font" value={t.headFont} options={['Baloo 2', 'Fredoka', 'Quicksand', 'Nunito']} onChange={(v) => setTweak('headFont', v)} />
        <TweakSlider label="Roundness" value={t.radius} min={8} max={30} unit="px" onChange={(v) => setTweak('radius', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
