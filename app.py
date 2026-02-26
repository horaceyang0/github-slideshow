import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import requests
import yfinance as yf
import yaml

MOF_JGB_CSV_EN = "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/jgbcme.csv"
MOF_JGB_CSV_JP = "https://www.mof.go.jp/jgbs/reference/interest_rate/jgbcm.csv"


def load_config(path: str = "config.yaml") -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


@st.cache_data(ttl=3600)
def fetch_mof_yield_curve() -> pd.DataFrame:
    txt = None
    for url in [MOF_JGB_CSV_EN, MOF_JGB_CSV_JP]:
        r = requests.get(url, timeout=20)
        if r.status_code == 200 and len(r.text) > 100:
            txt = r.text
            break

    if txt is None:
        raise RuntimeError("MOF JGB CSV fetch failed")

    from io import StringIO

    df = pd.read_csv(StringIO(txt), header=0)
    date_col = df.columns[0]
    df = df.rename(columns={date_col: "date"})
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    wanted = [
        "1 year",
        "2 year",
        "3 year",
        "5 year",
        "10 year",
        "20 year",
        "30 year",
        "40 year",
        "1年",
        "2年",
        "3年",
        "5年",
        "10年",
        "20年",
        "30年",
        "40年",
    ]
    cols = ["date"] + [c for c in df.columns if c in wanted]
    df = df[cols].copy()

    rename_map = {
        "1年": "1Y",
        "2年": "2Y",
        "3年": "3Y",
        "5年": "5Y",
        "10年": "10Y",
        "20年": "20Y",
        "30年": "30Y",
        "40年": "40Y",
        "1 year": "1Y",
        "2 year": "2Y",
        "3 year": "3Y",
        "5 year": "5Y",
        "10 year": "10Y",
        "20 year": "20Y",
        "30 year": "30Y",
        "40 year": "40Y",
    }
    df = df.rename(columns=rename_map)

    for c in [x for x in df.columns if x != "date"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    df = df.sort_values("date").dropna(
        how="all", subset=[c for c in df.columns if c != "date"]
    )
    return df


@st.cache_data(ttl=3600)
def fetch_proxy_bank_price(ticker: str = "1615.T") -> pd.DataFrame:
    data = yf.download(ticker, period="6mo", interval="1d", auto_adjust=True, progress=False)
    if data.empty:
        return pd.DataFrame()

    out = data[["Close"]].reset_index().rename(columns={"Date": "date", "Close": "close"})
    out["ret_1w"] = out["close"].pct_change(5) * 100.0
    return out


def piecewise_score(value, rule: dict):
    maxp = rule["max_points"]
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return None

    if "green_max" in rule:
        g, o, r = rule["green_max"], rule["orange_max"], rule["red_max"]
        if value <= g:
            return 0
        if value <= o:
            return int(round(maxp * 0.5))
        if value <= r:
            return int(round(maxp * 0.8))
        return maxp

    if "green_min" in rule:
        g, o, r = rule["green_min"], rule["orange_min"], rule["red_min"]
        if value >= g:
            return 0
        if value >= o:
            return int(round(maxp * 0.5))
        if value >= r:
            return int(round(maxp * 0.8))
        return maxp

    return None


def compute_scores(cfg: dict, metrics: dict):
    weights = cfg["weights"]
    scoring = cfg["scoring"]

    module_scores = {}

    for module, rules in scoring.items():
        pts = 0
        maxpts = 0
        for k, rule in rules.items():
            sc = piecewise_score(metrics.get(k), rule)
            if sc is None:
                continue
            pts += sc
            maxpts += rule["max_points"]
        module_scores[module] = (pts, maxpts)

    total = 0.0
    total_w = 0.0
    for module, w in weights.items():
        pts, maxpts = module_scores.get(module, (0, 0))
        if maxpts <= 0:
            continue
        total += (pts / maxpts) * w
        total_w += w

    total_score = (total / total_w) * 100 if total_w > 0 else None
    return total_score, module_scores


st.set_page_config(page_title="Japan Regional Banks Risk Dashboard (V3)", layout="wide")
cfg = load_config()

st.title("🇯🇵 日本地方银行系统性风险仪表盘 V3")
st.caption("数据：MOF JGB CSV（自动） + 市场/信用/对冲指标（可接口或手动输入）。")

st.sidebar.header("手动/付费数据输入（每周五填一次）")
iv20y = st.sidebar.number_input("20Y JGB ATM IV (%)", min_value=0.0, max_value=100.0, value=0.0, step=0.1)
uloss_cet1 = st.sidebar.number_input("未实现亏损 / CET1 (%)", min_value=0.0, max_value=500.0, value=0.0, step=0.5)
deposit_beta = st.sidebar.number_input("存款β (0-1)", min_value=0.0, max_value=2.0, value=0.0, step=0.01)
sme_yoy = st.sidebar.number_input("SME 破产同比 (%)", min_value=-100.0, max_value=500.0, value=0.0, step=0.1)
cds_fin = st.sidebar.number_input("金融 CDS (bp)", min_value=0.0, max_value=1000.0, value=0.0, step=1.0)
proxy_ticker = st.sidebar.text_input("银行板块代理Ticker（默认 1615.T）", value="1615.T")

col1, col2 = st.columns([1, 1])
with col1:
    st.subheader("自动数据：JGB 收益率曲线（财务省）")
    try:
        yc = fetch_mof_yield_curve()
        st.success(f"已抓取：{yc['date'].max().date()}（最新基准日）")
        latest = yc.iloc[-1].to_dict()

        jgb10 = latest.get("10Y", np.nan)
        jgb40 = latest.get("40Y", np.nan)
        slope_10_40_bp = (jgb40 - jgb10) * 100 if pd.notna(jgb10) and pd.notna(jgb40) else np.nan

        curve_cols = [c for c in ["1Y", "2Y", "3Y", "5Y", "10Y", "20Y", "30Y", "40Y"] if c in yc.columns]
        if curve_cols:
            last_row = yc.iloc[-1][curve_cols].reset_index()
            last_row.columns = ["tenor", "yield"]
            fig = px.line(last_row, x="tenor", y="yield", markers=True)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.warning("收益率列未识别到（可能 CSV 列名变化）。")
    except Exception as e:
        st.error(f"抓取失败：{e}")
        slope_10_40_bp = np.nan
        jgb40 = np.nan

with col2:
    st.subheader("市场代理：银行板块指数/ETF（Proxy）")
    pxdf = fetch_proxy_bank_price(proxy_ticker)
    if pxdf.empty:
        st.warning("代理行情抓取失败：请更换 ticker 或检查网络。")
        bank_wow = np.nan
    else:
        bank_wow = float(pxdf["ret_1w"].iloc[-1]) if pd.notna(pxdf["ret_1w"].iloc[-1]) else np.nan
        fig2 = px.line(pxdf, x="date", y="close")
        st.plotly_chart(fig2, use_container_width=True)
        st.caption("注：此处为代理（Proxy）市场定价，非官方“地银指数”原值。")

metrics = {
    "jgb40y": float(jgb40) if pd.notna(jgb40) else np.nan,
    "slope_10_40_bp": float(slope_10_40_bp) if pd.notna(slope_10_40_bp) else np.nan,
    "iv20y": float(iv20y) if iv20y > 0 else np.nan,
    "uloss_cet1": float(uloss_cet1) if uloss_cet1 > 0 else np.nan,
    "deposit_beta": float(deposit_beta) if deposit_beta > 0 else np.nan,
    "sme_bankruptcy_yoy": float(sme_yoy) if sme_yoy != 0 else np.nan,
    "cds_financial_bp": float(cds_fin) if cds_fin > 0 else np.nan,
    "bank_index_wow_pct": float(bank_wow) if pd.notna(bank_wow) else np.nan,
}

total_score, module_scores = compute_scores(cfg, metrics)

st.divider()
st.subheader("Risk Score Summary")

k1, k2, k3 = st.columns(3)
if total_score is None:
    k1.metric("总分（V3）", "N/A")
else:
    k1.metric("总分（V3）", f"{total_score:.1f} / 100")

k2.metric("JGB 40Y (%)", f"{metrics['jgb40y']:.3f}" if pd.notna(metrics["jgb40y"]) else "N/A")
k3.metric(
    "10Y-40Y 期限利差 (bp)",
    f"{metrics['slope_10_40_bp']:.0f}" if pd.notna(metrics["slope_10_40_bp"]) else "N/A",
)

rows = [{"module": m, "points": pts, "max": mx} for m, (pts, mx) in module_scores.items()]
dfm = pd.DataFrame(rows)
st.dataframe(dfm, use_container_width=True)

st.caption("提示：若某模块数据缺失，会导致该模块不参与计算；建议周更时把付费指标/内部指标填齐。")
