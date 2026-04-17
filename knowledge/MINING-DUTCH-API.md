## Mining Dutch API

- Public API: https://www.mining-dutch.nl/api/status/
- User API: /pools/{coin}.php?page=api&action=getuserstatus&api_key=KEY&id=ID
- Authenticated endpoints: getuserstatus, getuserbalance, getuserhashrate, getuserworkers, getusertransactions, getdashboarddata
- Algorithms: SHA-256 (ALPHA+BRAVO), Scrypt (DG MAX)
- API key stored in env_architecture on all 3 servers
- Credentials stored in env_architecture on all 3 servers
- MCP Memory entity: MiningDutch
