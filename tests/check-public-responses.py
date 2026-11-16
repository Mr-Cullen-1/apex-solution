"""Read-only local HTTP checks. Does not substitute for browser interaction tests."""
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import ProxyHandler, Request, build_opener
from urllib.error import HTTPError

base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3123"
opener = build_opener(ProxyHandler({}))
paths = ["/", "/about", "/brands", "/contact", "/service-areas", "/services", "/reviews"]
paths += ["/services/" + p for p in ["appliance-repair", "cooling", "heating", "water-heater-repair"]]
paths += ["/services/cooling/" + p for p in ["ac-repair", "ac-installation", "ac-maintenance", "ac-replacement"]]
paths += ["/services/heating/" + p for p in ["furnace-repair", "heat-pumps", "heating-maintenance", "boiler-repair"]]

class Headings(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.links, self.title, self.h1 = {}, {}, "", 0
        self.in_title = False
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta": self.meta[a.get("name", a.get("property", ""))] = a.get("content", "")
        if tag == "link": self.links[a.get("rel", "")] = a.get("href", "")
        if tag == "title": self.in_title = True
        if tag == "h1": self.h1 += 1
        if "id" in a: self.ids.add(a["id"])
    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
    def handle_data(self, value):
        if self.in_title: self.title += value

report = {"base": base, "public_pages": [], "supporting": [], "api_validation": []}
for path in paths:
    with opener.open(base + path, timeout=30) as response:
        html = response.read().decode()
        page = Headings(); page.feed(html)
        assert response.status == 200, path
        assert page.h1 == 1, (path, "H1", page.h1)
        assert "main-content" in page.ids, (path, "skip target")
        assert urlparse(page.links["canonical"]).path.rstrip("/") == path.rstrip("/"), (path, "canonical")
        assert "noindex" not in page.meta.get("robots", ""), (path, "robots")
        assert page.title.count("Apex Home Services") == 1, (path, page.title)
        assert page.meta.get("twitter:title") == page.meta.get("og:title"), (path, "social title")
        assert page.meta.get("twitter:description") == page.meta.get("og:description"), (path, "social description")
        if path == "/":
            assert "Rhode Island" in html and "Pennsylvania" not in html
            assert "house-stage" in html and "tel:+15165860826" in html
        report["public_pages"].append({"path": path, "status": response.status, "title": page.title, "h1_count": page.h1, "canonical": page.links["canonical"], "twitter_title": page.meta.get("twitter:title")})

sitemap = opener.open(base + "/sitemap.xml", timeout=30).read().decode()
for path in paths:
    assert any(urlparse(part.split("</loc>")[0]).path.rstrip("/") == path.rstrip("/") for part in sitemap.split("<loc>")[1:]), (path, "sitemap")
assert sitemap.count("<loc>") == len(paths)

for path in ["/review", "/admin/login", "/admin/forgot-password", "/admin/reset-password"]:
    with opener.open(base + path, timeout=30) as response:
        page = Headings(); page.feed(response.read().decode())
        assert "noindex" in page.meta.get("robots", ""), path
        assert "main-content" in page.ids, path
        report["supporting"].append({"path": path, "status": response.status, "noindex": True})
for path in ["/admin", "/admin/admins", "/admin/campaign-links", "/admin/create-request", "/admin/customers", "/admin/requests", "/admin/reviews"]:
    with opener.open(base + path, timeout=30) as response:
        assert "/admin/login" in response.url, (path, response.url)
        report["supporting"].append({"path": path, "redirected_to_login": True})
with opener.open(base + "/book?service=ac-repair", timeout=30) as response:
    assert "service=ac-repair" in response.url and "book=1" in response.url, response.url
    report["supporting"].append({"path": "/book?service=ac-repair", "context_redirect_preserved": True})

# Invalid bodies fail before the persistence or notification adapter is called.
for body in [b"{", json.dumps({"fullName": "Validation fixture", "phone": "-------", "zipCode": "06810", "message": "Invalid phone test"}).encode()]:
    try:
        opener.open(Request(base + "/api/book-now", data=body, headers={"Content-Type": "application/json"}), timeout=30)
        raise AssertionError("Invalid booking was accepted")
    except HTTPError as error:
        result = json.loads(error.read())
        assert error.code == 400 and result["status"] == "invalid", result
        report["api_validation"].append({"http_status": error.code, "status": result["status"], "error_fields": list(result["errors"])})

folder = Path("docs/audits/ui-ux-2026-11-16")
folder.mkdir(parents=True, exist_ok=True)
(folder / "http-validation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(f"PASS: {len(paths)} public pages, {len(report['supporting'])} supporting checks, sitemap and 2 invalid API requests. No valid lead submitted.")
