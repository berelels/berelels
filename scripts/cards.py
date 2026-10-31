"""Generates black and white SVG cards (stats, streak, contribution graph) for the profile README."""
import json
import os
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

USER = os.environ.get("GH_USER", "berelels")
TOKEN = os.environ["GH_TOKEN"]
OUT = Path(__file__).resolve().parent.parent / "assets"

BG, BORDER, FG, MUTED, LINE = "#000000", "#555555", "#ffffff", "#9a9a9a", "#2a2a2a"
FONT = "font-family='Segoe UI, Ubuntu, Helvetica, Arial, sans-serif'"
W, H = 420, 195


def gql(query, **variables):
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=json.dumps({"query": query, "variables": variables}).encode(),
        headers={"Authorization": f"bearer {TOKEN}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as r:
        body = json.load(r)
    if "errors" in body:
        raise RuntimeError(body["errors"])
    return body["data"]["user"]


def fetch():
    base = gql(
        """query($login:String!){user(login:$login){
          name createdAt
          repositories(ownerAffiliations:OWNER, privacy:PUBLIC, first:100){totalCount nodes{stargazerCount}}
          contributionsCollection{totalCommitContributions totalPullRequestContributions totalIssueContributions}
        }}""",
        login=USER,
    )
    days = {}
    start = datetime.fromisoformat(base["createdAt"].replace("Z", "+00:00")).date()
    year = start.year
    while year <= date.today().year:
        cal = gql(
            """query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){
              contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{date contributionCount}}}}
            }}""",
            login=USER, **{"from": f"{year}-01-01T00:00:00Z", "to": f"{year}-12-31T23:59:59Z"},
        )
        for week in cal["contributionsCollection"]["contributionCalendar"]["weeks"]:
            for d in week["contributionDays"]:
                day = date.fromisoformat(d["date"])
                if start <= day <= date.today():
                    days[day] = d["contributionCount"]
        year += 1
    return base, dict(sorted(days.items()))


def streaks(days):
    longest = run = 0
    longest_range = (None, None)
    run_start = None
    for day, n in days.items():
        if n:
            run_start = run_start or day
            run += 1
            if run > longest:
                longest, longest_range = run, (run_start, day)
        else:
            run, run_start = 0, None
    today = date.today()
    cur, d = 0, today if days.get(today) else today - timedelta(days=1)
    cur_end = d
    while days.get(d):
        cur += 1
        d -= timedelta(days=1)
    return cur, (d + timedelta(days=1), cur_end), longest, longest_range


def fmt(d):
    return d.strftime("%b %-d") if d else "-"


def frame(body, w=W, h=H):
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}' viewBox='0 0 {w} {h}' {FONT}>"
        f"<rect x='0.5' y='0.5' width='{w - 1}' height='{h - 1}' rx='6' fill='{BG}' stroke='{BORDER}'/>"
        f"{body}</svg>"
    )


def stats_card(base, total):
    c = base["contributionsCollection"]
    rows = [
        ("Total stars earned", sum(r["stargazerCount"] for r in base["repositories"]["nodes"])),
        (f"Commits ({date.today().year})", c["totalCommitContributions"]),
        ("Pull requests", c["totalPullRequestContributions"]),
        ("Issues", c["totalIssueContributions"]),
        ("Public repos", base["repositories"]["totalCount"]),
        ("Total contributions", total),
    ]
    body = f"<text x='25' y='35' fill='{FG}' font-size='16' font-weight='600'>{base['name'] or USER}'s GitHub Stats</text>"
    for i, (label, value) in enumerate(rows):
        y = 68 + i * 22
        body += (
            f"<circle cx='30' cy='{y - 4}' r='3' fill='{FG}'/>"
            f"<text x='44' y='{y}' fill='{MUTED}' font-size='13'>{label}:</text>"
            f"<text x='{W - 25}' y='{y}' fill='{FG}' font-size='13' font-weight='600' text-anchor='end'>{value}</text>"
        )
    return frame(body)


def streak_card(days):
    total = sum(days.values())
    cur, cur_range, longest, longest_range = streaks(days)
    first = next(iter(days), None)
    col = W / 3
    def column(i, value, label, sub, big=False):
        x = col * i + col / 2
        weight = "700" if big else "400"
        return (
            f"<text x='{x}' y='92' fill='{FG}' font-size='28' font-weight='{weight}' text-anchor='middle'>{value}</text>"
            f"<text x='{x}' y='138' fill='{FG}' font-size='13' font-weight='{weight}' text-anchor='middle'>{label}</text>"
            f"<text x='{x}' y='160' fill='{MUTED}' font-size='11' text-anchor='middle'>{sub}</text>"
        )
    body = (
        f"<line x1='{col}' y1='30' x2='{col}' y2='{H - 30}' stroke='{BORDER}'/>"
        f"<line x1='{col * 2}' y1='30' x2='{col * 2}' y2='{H - 30}' stroke='{BORDER}'/>"
        f"<circle cx='{W / 2}' cy='82' r='34' fill='none' stroke='{FG}' stroke-width='4'/>"
        + column(0, total, "Total Contributions", f"{fmt(first)}, {first.year} - Present" if first else "-")
        + column(1, cur, "Current Streak", f"{fmt(cur_range[0])} - {fmt(cur_range[1])}" if cur else "-", big=True)
        + column(2, longest, "Longest Streak", f"{fmt(longest_range[0])} - {fmt(longest_range[1])}")
    )
    return frame(body)


def graph_card(base, days, n=31):
    w, h = 850, 300
    left, right, top, bottom = 55, 25, 55, 55
    recent = list(days.items())[-n:]
    peak = max([c for _, c in recent] + [1])
    step = (w - left - right) / (len(recent) - 1)
    pts = [(left + i * step, h - bottom - c / peak * (h - top - bottom)) for i, (_, c) in enumerate(recent)]
    body = f"<text x='{w / 2}' y='32' fill='{FG}' font-size='16' font-weight='600' text-anchor='middle'>{base['name'] or USER}'s Contribution Graph</text>"
    for k in range(5):
        y = h - bottom - k / 4 * (h - top - bottom)
        body += (
            f"<line x1='{left}' y1='{y}' x2='{w - right}' y2='{y}' stroke='{LINE}'/>"
            f"<text x='{left - 10}' y='{y + 4}' fill='{MUTED}' font-size='11' text-anchor='end'>{round(peak * k / 4)}</text>"
        )
    for i, (day, _) in enumerate(recent):
        body += f"<text x='{pts[i][0]}' y='{h - bottom + 20}' fill='{MUTED}' font-size='10' text-anchor='middle'>{day.day}</text>"
    line = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    body += (
        f"<polygon points='{left},{h - bottom} {line} {w - right},{h - bottom}' fill='#1c1c1c'/>"
        f"<polyline points='{line}' fill='none' stroke='{FG}' stroke-width='2'/>"
        + "".join(f"<circle cx='{x:.1f}' cy='{y:.1f}' r='3' fill='{FG}'/>" for x, y in pts)
        + f"<text x='{w / 2}' y='{h - 12}' fill='{MUTED}' font-size='12' text-anchor='middle'>Days</text>"
        f"<text x='18' y='{h / 2}' fill='{MUTED}' font-size='12' text-anchor='middle' transform='rotate(-90 18 {h / 2})'>Contributions</text>"
    )
    return frame(body, w, h)


if __name__ == "__main__":
    base, days = fetch()
    OUT.mkdir(exist_ok=True)
    (OUT / "stats.svg").write_text(stats_card(base, sum(days.values())))
    (OUT / "streak.svg").write_text(streak_card(days))
    (OUT / "graph.svg").write_text(graph_card(base, days))
