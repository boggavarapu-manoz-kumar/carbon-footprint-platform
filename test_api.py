import urllib.request
import json
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("http://localhost:8081/api/v1/admin/auth/login", data=json.dumps({"email":"manozkumarboggavarapu@gmail.com","password":"password","deviceFingerprint":"abcdef1234567890abcdef1234567890"}).encode('utf-8'), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req, context=ctx)
res_json = json.loads(res.read())
token = res_json.get('access_token') or res_json.get('accessToken')

req2 = urllib.request.Request("http://localhost:8081/api/v1/admin/analytics/daily?year=2026", headers={'Authorization': 'Bearer ' + token})
res2 = urllib.request.urlopen(req2, context=ctx)
data = json.loads(res2.read())
print(json.dumps(data.get('data', {}).get('categoryData', []), indent=2))
