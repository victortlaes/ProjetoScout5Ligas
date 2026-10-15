"""
Consolida as bases de scouts.

PARTE 1: reconstrói a tabela `scouts` do banco 2026 a partir do `scouts_bruto`,
         agrupando SOMENTE por player_id (1 linha por jogador).
PARTE 2: junta 2026 + base antiga numa base completa nova (a antiga NÃO é alterada).

Regras de agregação:
  - estatísticas de contagem (gols, passes, desarmes, minutos, jogos...) -> SOMA
  - rating -> MÉDIA PONDERADA pelos minutos jogados
  - nome, time, liga, posição, idade, altura, nacionalidade, foto -> valor mais recente
  - valor_mercado -> valor mais recente diferente de zero

Uso:
  python consolidar_bases.py
  python consolidar_bases.py --antigo base_scouts_futebol.db --novo base_scouts_futebol_2026.db --completo base_scouts_futebol_completa.db
"""
import argparse
import os
import shutil
import sqlite3

import numpy as np
import pandas as pd

# Colunas de identificação/metadados (não são somadas)
COLS_FIXAS = ["nome", "url_foto", "time", "liga", "posicao",
              "nacionalidade", "idade", "altura", "valor_mercado"]
COLS_IGNORAR = {"player_id", "game_id", "timestamp", "_prio", "temporada", *COLS_FIXAS,
                "pos_oficial", "time_atual", "liga_atual"}
COLS_MEDIA_PONDERADA = ["rating"]   # demais colunas numéricas são somadas
COL_PESO = "minutesPlayed"


# ---------------------------------------------------------------- utilidades
def ler_tabela(db, tabela):
    if not os.path.exists(db):
        return None
    conn = sqlite3.connect(db)
    try:
        existe = conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (tabela,)
        ).fetchone()
        return pd.read_sql(f"SELECT * FROM {tabela}", conn) if existe else None
    finally:
        conn.close()


def agregar(df):
    """df precisa estar ordenado do registro MAIS RECENTE para o mais antigo."""
    df = df.copy()

    for c in COLS_FIXAS:
        if c not in df.columns:
            df[c] = np.nan

    # limpa lixo do scraper
    for c in ("nome", "url_foto", "time", "liga", "posicao", "nacionalidade"):
        df[c] = df[c].replace({"N/A": np.nan, "": np.nan})
    for c in ("idade", "altura", "valor_mercado"):
        df[c] = pd.to_numeric(df[c], errors="coerce").replace(0, np.nan)

    if "temporada" not in df.columns:
        df["temporada"] = "2025"
    df["temporada"] = df["temporada"].astype(str).str.strip().replace("", "2025")

    stat_cols = [c for c in df.columns if c not in COLS_IGNORAR]
    for c in stat_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    g = df.groupby(["player_id", "temporada"])

    # metadados: primeiro valor não nulo (= mais recente, pois df está ordenado)
    fixas = g[COLS_FIXAS].first()
    fixas["valor_mercado"] = fixas["valor_mercado"].fillna(0)
    fixas["altura"] = fixas["altura"].fillna(0)
    fixas["idade"] = fixas["idade"].round(0)

    # soma das estatísticas
    soma_cols = [c for c in stat_cols if c not in COLS_MEDIA_PONDERADA]
    soma = g[soma_cols].sum()

    # média ponderada pelos minutos
    medias = pd.DataFrame(index=soma.index)
    for c in COLS_MEDIA_PONDERADA:
        if c not in df.columns:
            continue
        if COL_PESO in df.columns:
            peso = df[COL_PESO].fillna(0)
            valido = df[c].notna() & (peso > 0)
            num = (df[c] * peso).where(valido).groupby([df["player_id"], df["temporada"]]).sum()
            den = peso.where(valido).groupby([df["player_id"], df["temporada"]]).sum()
            medias[c] = (num / den).where(den > 0)
        else:
            medias[c] = g[c].mean()

    out = pd.concat([fixas, soma, medias], axis=1).reset_index().round(2)

    ordem = ["player_id", "nome", "url_foto", "time", "liga", "posicao", "temporada",
             "nacionalidade", "idade", "altura", "matches", "valor_mercado"]
    ordem = [c for c in ordem if c in out.columns]
    ordem += [c for c in out.columns if c not in ordem]
    return out[ordem]


def salvar(df, db, tabela):
    conn = sqlite3.connect(db)
    df.to_sql(tabela, conn, if_exists="replace", index=False)
    conn.close()


def normalizar_bruto(df):
    df = df.copy()
    df["game_id"] = df["game_id"].astype(str)
    return df


# --------------------------------------------------------------------- main
def main(db_antigo, db_novo, db_completo):
    # ===================== PARTE 1: corrigir a base 2026 =====================
    bruto26 = ler_tabela(db_novo, "scouts_bruto")
    if bruto26 is None or bruto26.empty:
        raise SystemExit(f"❌ {db_novo} não tem tabela scouts_bruto.")
    bruto26 = normalizar_bruto(bruto26)
    bruto26 = bruto26.drop_duplicates(subset=["player_id", "game_id"], keep="last")
    bruto26 = bruto26.sort_values("timestamp", ascending=False)

    antes = ler_tabela(db_novo, "scouts")
    shutil.copy(db_novo, db_novo.replace(".db", "_backup.db"))
    print(f"💾 backup criado: {db_novo.replace('.db', '_backup.db')}")

    scouts26 = agregar(bruto26)
    assert not scouts26.duplicated(subset=["player_id", "temporada"]).any()
    salvar(scouts26, db_novo, "scouts")
    print(f"✅ PARTE 1: scouts 2026 recalculada -> {len(scouts26)} jogadores únicos"
          + (f" (antes: {len(antes)} linhas)" if antes is not None else ""))

    # ============== PARTE 2: juntar 2026 + base antiga =======================
    bruto_antigo = ler_tabela(db_antigo, "scouts_bruto")

    if bruto_antigo is not None and not bruto_antigo.empty:
        # caminho preferido: juntar no nível de jogo (evita contar jogo 2x)
        bruto_antigo = normalizar_bruto(bruto_antigo)
        bruto_all = pd.concat([bruto26, bruto_antigo], ignore_index=True)
        bruto_all = bruto_all.drop_duplicates(subset=["player_id", "game_id"], keep="first")
        bruto_all = bruto_all.sort_values("timestamp", ascending=False)
        completa = agregar(bruto_all)
        print(f"ℹ️ Junção por jogo: {len(bruto26)} (2026) + {len(bruto_antigo)} (antigo) "
              f"-> {len(bruto_all)} registros jogador-jogo")
    else:
        # alternativa: a base antiga só tem a tabela agregada `scouts`
        scouts_antiga = ler_tabela(db_antigo, "scouts")
        if scouts_antiga is None:
            raise SystemExit(f"❌ {db_antigo} não tem scouts_bruto nem scouts.")
        print("⚠️ Base antiga sem scouts_bruto: somando as tabelas `scouts` "
              "(se houver jogos repetidos entre elas, serão contados 2x).")
        scouts26_p = scouts26.copy()
        scouts26_p["_prio"] = 1
        scouts_antiga["_prio"] = 0
        juntas = pd.concat([scouts26_p, scouts_antiga], ignore_index=True)
        juntas = juntas.sort_values("_prio", ascending=False)  # 2026 primeiro
        completa = agregar(juntas)
        bruto_all = None

    assert not completa.duplicated(subset=["player_id", "temporada"]).any()
    if os.path.exists(db_completo):
        os.remove(db_completo)
    salvar(completa, db_completo, "scouts")
    if bruto_all is not None:
        salvar(bruto_all, db_completo, "scouts_bruto")

    print(f"✅ PARTE 2: base completa -> {len(completa)} jogadores em {db_completo}")

    # checagem rápida
    exemplo = completa.sort_values("matches", ascending=False).head(3)[
        ["player_id", "nome", "time", "matches", "minutesPlayed", "rating"]
    ]
    print("\nTop 3 por jogos (conferência):")
    print(exemplo.to_string(index=False))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--antigo", default="backend/base_scouts_futebol.db")
    ap.add_argument("--novo", default="backend/base_scouts_futebol_2026.db")
    ap.add_argument("--completo", default="backend/base_scouts_futebol_completa.db")
    a = ap.parse_args()
    main(a.antigo, a.novo, a.completo)