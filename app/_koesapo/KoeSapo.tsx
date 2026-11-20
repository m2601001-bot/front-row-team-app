"use client";

import { useEffect } from "react";
import { initKoeSapo } from "./koesapo-app";

export default function KoeSapo() {
  useEffect(() => {
    initKoeSapo();
  }, []);

  return (
    <>
      <div className="wrap">
        <header>
          <div className="logo">
            <span className="mascot" id="mascot"></span>
            <h1>
              こえサポ<small>きもちを声にするアプリ ／ チーム Front Row</small>
            </h1>
          </div>
          <button id="stopBtn" title="読み上げを止める">⏹ 止める</button>
        </header>

        {/* 設定 */}
        <section className="card" aria-label="設定">
          <p className="label">いまの気持ち（声のトーン）</p>
          <div className="row" id="tones">
            <button className="tone" data-tone="happy" aria-pressed="false"><span className="face">😊</span>楽しい</button>
            <button className="tone" data-tone="normal" aria-pressed="true"><span className="face">🙂</span>ふつう</button>
            <button className="tone" data-tone="sad" aria-pressed="false"><span className="face">😢</span>悲しい</button>
            <button className="tone" data-tone="angry" aria-pressed="false"><span className="face">😠</span>怒ってる</button>
          </div>
          <div className="strength">
            <span className="hint">気持ちの強さ</span>
            <input type="range" id="strength" min="1" max="3" step="1" defaultValue="2" aria-label="気持ちの強さ" />
            <span className="hint" id="strengthLabel" style={{ minWidth: "4em" }}>ふつう</span>
          </div>
          <label className="hint" style={{ display: "block", marginTop: 6 }}>
            <input type="checkbox" id="emoteText" defaultChecked /> 言い方にも気持ちを込める（！や…を付けて、声の抑揚を出す）
          </label>
          <p className="label" style={{ marginTop: 12 }}>話す言葉</p>
          <div className="row">
            <select id="lang" aria-label="話す言葉" defaultValue="ja">
              <option value="ja">日本語</option>
              <option value="en">English（英語）</option>
              <option value="zh">中文（中国語）</option>
              <option value="ko">한국어（韓国語）</option>
              <option value="vi">Tiếng Việt（ベトナム語）</option>
              <option value="ne">नेपाली（ネパール語）</option>
              <option value="ro">Română（ルーマニア語）</option>
            </select>
            <label className="hint">
              <input type="checkbox" id="showBig" defaultChecked /> 押したら画面に大きく表示
            </label>
          </div>
          <p className="label" style={{ marginTop: 12 }}>声のえらび方</p>
          <div className="row">
            <select id="voice" aria-label="声" style={{ maxWidth: "100%" }}></select>
            <button id="tryVoice" style={{ padding: "8px 14px", fontSize: 15 }}>▶ 試しに聞く</button>
          </div>
          <p className="hint" id="voiceNote" style={{ margin: "6px 0 0" }}></p>
          <p className="hint" id="aiNote" style={{ margin: "8px 0 0" }}>日本語以外を選ぶと、AIが翻訳してから読み上げます。</p>
        </section>

        {/* メイン：フレーズボタン */}
        <section className="card" aria-label="よく使う言葉">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <p className="label" style={{ margin: 0 }}>よく使う言葉（押すと話します）</p>
            <button id="editBtn" style={{ padding: "6px 12px", fontSize: 14 }}>編集</button>
          </div>
          <div className="tabs" id="tabs" role="tablist"></div>
          <div className="grid" id="grid"></div>
        </section>

        {/* キーボード入力 */}
        <section className="card" aria-label="入力して話す">
          <p className="label">入力して話す</p>
          <textarea id="input" placeholder="ここに言いたいことを入力…"></textarea>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="primary" id="speakBtn">▶ 読み上げ</button>
            <button id="fixBtn">AIで自然な日本語に直す</button>
            <button id="saveBtn">ボタンに追加</button>
          </div>
          <div className="ai-out" id="aiOut" aria-live="polite"></div>
        </section>

        {/* 履歴 */}
        <section className="card history" aria-label="話した履歴">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <p className="label" style={{ margin: 0 }}>話した履歴</p>
            <button id="clearHist" style={{ padding: "4px 10px", fontSize: 14 }}>消す</button>
          </div>
          <ul id="hist"></ul>
        </section>
      </div>

      <div id="big" role="dialog" aria-label="大きく表示">
        <div id="bigTone"></div>
        <div className="bubble">
          <p id="bigText"></p>
          <div className="sub" id="bigSub"></div>
        </div>
        <span className="mascot mascot-big"></span>
        <div className="row">
          <button id="bigAgain">もう一度話す</button>
          <button id="bigClose">閉じる</button>
        </div>
      </div>

      <div className="modal" id="addModal">
        <div className="box">
          <p className="label">新しいボタンを追加</p>
          <label className="hint">
            言葉<input id="newText" placeholder="例：お水をください" />
          </label>
          <label className="hint">
            カテゴリー<select id="newCat" style={{ width: "100%", margin: "6px 0 12px" }}></select>
          </label>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button id="addCancel">やめる</button>
            <button className="primary" id="addOk">追加</button>
          </div>
        </div>
      </div>

      <div className="status" id="status" role="status"></div>
    </>
  );
}
