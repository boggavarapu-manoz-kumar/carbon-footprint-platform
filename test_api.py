import urllib.request
import json
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("http://localhost:8080/api/v1/auth/login", data=json.dumps({"email":"manozkumarboggavarapu@gmail.com","password":"password"}).encode('utf-8'), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req, context=ctx)
token = json.loads(res.read())['data']['token']

req2 = urllib.request.Request("http://localhost:8080/api/v1/admin/analytics/daily?year=2026", headers={'Authorization': 'Bearer ' + token})
res2 = urllib.request.urlopen(req2, context=ctx)
data = json.loads(res2.read())
print(json.dumps(data.get('data', {}).get('categoryData', []), indent=2))
