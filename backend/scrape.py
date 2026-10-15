from playwright.sync_api import sync_playwright
import pandas as pd
import json
import sqlite3
from datetime import datetime
import time
import random

# ============ CONFIGURAÇÃO ============
ANO = "2026"
DB_NAME = "base_scouts_futebol_2026.db"   # banco separado p/ não somar com 2025

# unique-tournament IDs (os mesmos do script original)
CAMPEONATOS = [
    {"nome": "Argentina",         "id": 155},
    {"nome": "Brasil",            "id": 325},
    {"nome": "Colombia Apertura", "id": 11539},
    {"nome": "MLS",               "id": 242},
    {"nome": "Mexico Apertura",   "id": 11621},
    {"nome": "Mexico Clausura",   "id": 11620},
]
# Se quiser forçar um season ID manualmente, preencha aqui: {"Brasil": 12345}
SEASON_OVERRIDE = {}

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")


def calcular_idade(timestamp):
    if not timestamp:
        return "N/A"
    try:
        if timestamp > 10000000000:
            timestamp = timestamp / 1000
        nasc = datetime.fromtimestamp(timestamp)
        hoje = datetime.now()
        return hoje.year - nasc.year - ((hoje.month, hoje.day) < (nasc.month, nasc.day))
    except Exception:
        return "Erro"


def novo_browser(p):
    # Chrome instalado de verdade (menos detectável) e visível
    try:
        browser = p.chromium.launch(channel="chrome", headless=False,
                                    args=["--disable-blink-features=AutomationControlled"])
    except Exception:
        print("⚠️ Chrome não encontrado, usando Chromium do Playwright.")
        browser = p.chromium.launch(headless=False,
                                    args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(locale="pt-BR", viewport={"width": 1280, "height": 800})
    context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined})")
    page = context.new_page()
    # abre uma página real do torneio p/ gerar cookies/sessão
    page.goto("https://www.sofascore.com/pt/", wait_until="domcontentloaded", timeout=60000)
    time.sleep(4)
    return browser, page


def get_json(page, url, tentativas=3, pausa=(1.0, 2.0)):
    """Retorna dict ou None. Loga status HTTP em vez de engolir o erro."""
    # a API do site fica em www.sofascore.com/api/v1 (mesma origem da página aberta)
    url = url.replace("https://api.sofascore.com", "https://www.sofascore.com")
    js = """async (u) => {
        const r = await fetch(u, {credentials: 'include', headers: {'Accept': '*/*'}});
        return {status: r.status, body: await r.text()};
    }"""
    for t in range(1, tentativas + 1):
        try:
            time.sleep(random.uniform(*pausa))
            res = page.evaluate(js, url)
            status, body = res["status"], res["body"]
            if status == 404:
                return None
            if status in (403, 429):
                espera = 20 * t
                print(f"   ⚠️ HTTP {status} em {url} — aguardando {espera}s (tentativa {t})")
                time.sleep(espera)
                continue
            if not body or body.strip() in ("", "{}"):
                return None
            return json.loads(body)
        except Exception as e:
            print(f"   ⚠️ erro em {url}: {type(e).__name__}: {e} (tentativa {t})")
            time.sleep(3 * t)
    return None


def descobrir_season_id(page, camp):
    if camp["nome"] in SEASON_OVERRIDE:
        return SEASON_OVERRIDE[camp["nome"]]

    data = get_json(page, f"https://api.sofascore.com/api/v1/unique-tournament/{camp['id']}/seasons")
    if not data or not data.get("seasons"):
        print(f"❌ {camp['nome']}: não consegui listar temporadas.")
        return None

    seasons = data["seasons"]  # ordem: mais recente primeiro
    print(f"\n📅 {camp['nome']} — temporadas mais recentes:")
    for s in seasons[:4]:
        print(f"   id={s['id']}  year={s.get('year')}  name={s.get('name')}")

    for s in seasons:
        if ANO in str(s.get("year", "")) or ANO in str(s.get("name", "")):
            print(f"   ✅ usando season {s['id']} ({s.get('name')})")
            return s["id"]

    print(f"   ⚠️ nenhuma temporada com '{ANO}'. Defina em SEASON_OVERRIDE se necessário.")
    return None


def buscar_jogos(page, temporadas):
    jogos, vistos = [], set()
    try:
        conn = sqlite3.connect(DB_NAME)
        ids = pd.read_sql("SELECT DISTINCT game_id FROM scouts_bruto", conn)["game_id"].astype(str)
        vistos.update(ids)
        conn.close()
        print(f"ℹ️ {len(vistos)} jogos já no banco serão ignorados.")
    except Exception:
        pass

    def coletar(data, liga):
        for e in (data or {}).get("events", []):
            e_id = str(e["id"])
            if e.get("status", {}).get("type") == "finished" and e_id not in vistos:
                jogos.append({
                    "id": e_id, "liga": liga,
                    "timestamp": e.get("startTimestamp", 0),
                    "home_backup": e["homeTeam"]["name"],
                    "away_backup": e["awayTeam"]["name"],
                })
                vistos.add(e_id)

    for camp, season in temporadas:
        print(f"\n🔍 Calendário: {camp['nome']} (season {season})")
        base = f"https://api.sofascore.com/api/v1/unique-tournament/{camp['id']}/season/{season}/events"

        vazias = 0
        for r in range(1, 49):
            data = get_json(page, f"{base}/round/{r}")
            if not data or not data.get("events"):
                vazias += 1
                if vazias >= 3 and r > 5:   # rodadas acabaram
                    break
                continue
            vazias = 0
            coletar(data, camp["nome"])

        # blocos "last" pegam mata-mata/finais
        for bloco in range(0, 12):
            data = get_json(page, f"{base}/last/{bloco}")
            if not data or not data.get("events"):
                break
            coletar(data, camp["nome"])

        print(f"   → acumulado: {len(jogos)} jogos novos")
    return jogos


def extrair_jogo(page, jogo):
    inc = get_json(page, f"https://api.sofascore.com/api/v1/event/{jogo['id']}/incidents", pausa=(3.0, 5.0)) or {}
    cartoes = {}
    for i in inc.get("incidents", []):
        if i.get("incidentType") == "card":
            pid = i.get("player", {}).get("id")
            tipo = i.get("incidentClass")
            if pid:
                c = cartoes.setdefault(pid, {"amarelo": 0, "vermelho": 0})
                if tipo == "yellow":
                    c["amarelo"] += 1
                elif tipo in ("red", "yellowRed"):
                    c["vermelho"] += 1

    lineup = get_json(page, f"https://api.sofascore.com/api/v1/event/{jogo['id']}/lineups", pausa=(1.5, 3.0))
    if not lineup:
        return []

    linhas = []
    for lado in ("home", "away"):
        nome_time = (lineup.get(lado, {}).get("team", {}).get("name")
                     or (jogo["home_backup"] if lado == "home" else jogo["away_backup"]))
        for pd_ in lineup.get(lado, {}).get("players", []):
            stats = pd_.get("statistics", {})
            if not stats or stats.get("minutesPlayed", 0) <= 0:
                continue
            info = pd_.get("player", {})
            pid = info.get("id")
            mv = info.get("proposedMarketValueRaw")
            linhas.append({
                "game_id": jogo["id"], "player_id": pid, "nome": info.get("name"),
                "temporada": ANO,
                "liga": jogo["liga"],
                "url_foto": f"https://sofascore.com/api/v1/player/{pid}/image",
                "time": nome_time,
                "nacionalidade": info.get("country", {}).get("name", "N/A"),
                "posicao": pd_.get("position") or info.get("position", "N/A"),
                "idade": calcular_idade(info.get("dateOfBirthTimestamp")),
                "altura": round(info.get("height", 0) / 100, 2),
                "valor_mercado": mv.get("value", 0) if mv else 0,
                "matches": 1,
                "cartao_amarelo": cartoes.get(pid, {}).get("amarelo", 0),
                "cartao_vermelho": cartoes.get(pid, {}).get("vermelho", 0),
                "timestamp": jogo["timestamp"],
                **{k: v for k, v in stats.items() if not isinstance(v, dict)},
            })
    return linhas


def consolidar(df_novo):
    conn = sqlite3.connect(DB_NAME)
    try:
        df_total = pd.concat([pd.read_sql("SELECT * FROM scouts_bruto", conn), df_novo], ignore_index=True)
    except Exception:
        df_total = df_novo

    df_total = df_total.drop_duplicates(subset=["player_id", "game_id"], keep="last")
    df_total.to_sql("scouts_bruto", conn, if_exists="replace", index=False)

    print("📊 Consolidando base...")
    df_rec = df_total.sort_values("timestamp", ascending=False).drop_duplicates("player_id")
    df_fixa = df_rec[["player_id", "time", "url_foto", "posicao", "liga"]].rename(
        columns={"time": "time_atual", "posicao": "pos_oficial", "liga": "liga_atual"})

    cols_meta = ["game_id", "player_id", "nome", "url_foto", "time", "posicao", "liga",
                 "pos_oficial", "time_atual", "liga_atual", "idade", "nacionalidade",
                 "altura", "timestamp"]
    agg = {c: "sum" for c in df_total.columns if c not in cols_meta}
    if "rating" in agg:
        agg["rating"] = "mean"

    df_final = (df_total.groupby(["player_id", "nome", "idade", "nacionalidade", "altura"])
                .agg({**agg, "valor_mercado": "max"}).reset_index())
    df_final = (df_final.merge(df_fixa, on="player_id")
                .rename(columns={"time_atual": "time", "pos_oficial": "posicao", "liga_atual": "liga"})
                .round(2))
    df_final["temporada"] = ANO

    cols = ["player_id", "nome", "url_foto", "time", "liga", "posicao", "temporada", "nacionalidade",
            "idade", "altura", "matches", "valor_mercado"]
    cols += [c for c in df_final.columns if c not in cols]
    df_final[cols].to_sql("scouts", conn, if_exists="replace", index=False)
    conn.close()
    print(f"💾 CONCLUÍDO! {len(df_final)} jogadores em {DB_NAME}")


def extrair_consolidado():
    with sync_playwright() as p:
        browser, page = novo_browser(p)
        try:
            temporadas = []
            for camp in CAMPEONATOS:
                sid = descobrir_season_id(page, camp)
                if sid:
                    temporadas.append((camp, sid))
            if not temporadas:
                print("❌ Nenhuma temporada encontrada. Verifique bloqueio (403) ou use SEASON_OVERRIDE.")
                return

            jogos = buscar_jogos(page, temporadas)
            if not jogos:
                print("✅ Nenhum jogo novo para extrair.")
                return

            print(f"\n🚀 Extraindo {len(jogos)} partidas...")
            linhas = []
            for i, jogo in enumerate(jogos, 1):
                linhas.extend(extrair_jogo(page, jogo))
                if i % 10 == 0:
                    print(f"✅ {i}/{len(jogos)} jogos ({len(linhas)} linhas)")
                if i % 50 == 0 and linhas:   # checkpoint
                    consolidar(pd.DataFrame(linhas))
                    linhas = []
        finally:
            try:
                browser.close()
            except Exception:
                pass

    if linhas:
        consolidar(pd.DataFrame(linhas))


if __name__ == "__main__":
    extrair_consolidado()