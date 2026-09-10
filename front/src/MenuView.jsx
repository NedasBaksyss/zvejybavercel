export default function MenuView({ rootRef }) {
  return (
    <div className="zv" ref={rootRef}>
      <div id="stage">
        <canvas id="scene" width="480" height="270" />

        <div id="ui">
          <section className="screen active" id="s-title">
            <div id="logo">
              <div className="word" id="logo-word" />
              <div className="sub" id="logo-sub" />
            </div>
            <nav id="menu" />
            <p id="who" hidden />
          </section>

          <section className="screen" id="s-auth">
            <div className="panel">
              <h2 id="auth-title" />

              <div className="tabs">
                <button
                  className="tab"
                  type="button"
                  data-mode="login"
                  aria-selected="true"
                />

                <button
                  className="tab"
                  type="button"
                  data-mode="register"
                  aria-selected="false"
                />
              </div>

              <div className="field">
                <span id="lbl-user" />
                <input id="f-user" autoComplete="username" maxLength={20} />
              </div>

              <div className="field" id="f-mail-wrap" hidden>
                <span id="lbl-mail" />
                <input
                  id="f-mail"
                  type="email"
                  autoComplete="email"
                  maxLength={60}
                />
              </div>

              <div className="field">
                <span id="lbl-pass" />
                <input
                  id="f-pass"
                  type="password"
                  autoComplete="current-password"
                  maxLength={40}
                />
              </div>

              <p className="msg" id="auth-msg" />

              <button className="btn" type="button" id="auth-go">
                Prisijungti
              </button>

              <button
                className="btn ghost"
                type="button"
                id="auth-out"
                hidden
              />
            </div>

            <p className="hint" id="hint-auth" />
          </section>
          <section className="screen" id="s-settings">
            <div className="panel">
              <h2 id="set-title" />
              <div id="opts" />
            </div>
            <p className="hint" id="hint-set" />
          </section>

          <section className="screen" id="s-credits">
            <div className="panel credits">
              <h2 id="cred-title" />
              <p id="cred-body" />
            </div>
            <p className="hint" id="hint-cred" />
          </section>

          <section className="screen" id="s-ask">
            <svg className="rod" viewBox="0 0 480 270" aria-hidden="true">
              <g transform="translate(46 258) rotate(-34.3)">
                <rect
                  className="grip"
                  x="-74"
                  y="-7"
                  width="62"
                  height="14"
                  rx="3"
                />
                <rect
                  className="seat"
                  x="-12"
                  y="-5"
                  width="24"
                  height="10"
                  rx="2"
                />
                <circle className="reel" cx="0" cy="14" r="12" />
                <circle className="hub" cx="0" cy="14" r="4" />
                <polygon className="blank" points="0,-5 418,-1 418,1 0,5" />
                <circle className="guide" cx="120" cy="8" r="5" />
                <circle className="guide" cx="205" cy="7" r="4.4" />
                <circle className="guide" cx="278" cy="6" r="3.8" />
                <circle className="guide" cx="340" cy="5.4" r="3.2" />
                <circle className="guide" cx="392" cy="5" r="2.6" />
              </g>
              <path className="line" d="M391 22 Q 472 96 446 264" />
            </svg>
            <div className="panel wide">
              <div className="phead">
                <h2 id="ask-title" />
                <button className="x" id="ask-x" type="button">
                  ✕
                </button>
              </div>
              <div className="cards">
                <button
                  className="card"
                  id="card-guest"
                  type="button"
                  aria-selected="true"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="11"
                      y="1"
                      width="2"
                      height="5"
                      fill="var(--pale)"
                    />
                    <path d="M5 13a7 7 0 0 1 14 0z" fill="var(--pale)" />
                    <path d="M19 13a7 7 0 0 1-14 0z" fill="var(--ember)" />
                  </svg>
                  <span className="cap" />
                  <span className="cdesc" />
                </button>
                <button
                  className="card"
                  id="card-account"
                  type="button"
                  aria-selected="false"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      fill="none"
                      stroke="var(--pale)"
                      strokeWidth="2"
                    />
                    <rect x="5" y="9" width="6" height="6" fill="var(--gold)" />
                    <rect
                      x="13"
                      y="9"
                      width="6"
                      height="2"
                      fill="var(--mist)"
                    />
                    <rect
                      x="13"
                      y="13"
                      width="6"
                      height="2"
                      fill="var(--mist)"
                    />
                  </svg>
                  <span className="cap" />
                  <span className="cdesc" />
                </button>
              </div>
              <div className="pfoot">
                <button className="btn slim" id="ask-go" type="button" />
                <button className="link" id="ask-cancel" type="button" />
              </div>
            </div>
            <p className="hint" id="hint-ask" />
          </section>

          <section className="screen" id="s-game">
            <div className="hud">
              <p className="line" id="game-line" />
              <p className="who" id="game-who" />
            </div>
            <p className="hint" id="hint-game" />
          </section>

          <section className="screen" id="s-pause">
            <div className="panel">
              <h2 id="pause-title" />
              <div className="choices" id="pause-list" />
            </div>
            <p className="hint" id="hint-pause" />
          </section>

          <section className="screen" id="s-confirm">
            <div className="panel">
              <h2 id="conf-title" />
              <p className="note" id="conf-body" />
              <div className="choices" id="conf-list" />
            </div>
          </section>

          <section className="screen" id="loading">
            <div className="box">
              <p className="what" id="load-what" />
              <div className="bar">
                <i id="load-bar" />
              </div>
              <p className="tip" id="load-tip" />
            </div>
          </section>

          <section className="screen" id="s-bye">
            <div className="panel">
              <h2 id="bye-title" />
              <p id="bye-body" />
            </div>
          </section>
        </div>
        <span id="build">v0.3.0</span>
      </div>
    </div>
  );
}
