# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v2.11.0] - 2020-09-10

CID: `bafybeicitin4p7ggmyjaubqpi3xwnagrwarsy6hiihraafk5rcrxqxju6m`

---

### ✨ Features

- feat: CLI Tutor Mode (#1572) (thank you @jay-dee7 🙏 ) 
- feat: build and publish a tarball on release (#1543) (thank you @thelamer 🙏 )
- feat: add cube animation as loading indicator (#1570)
- feat: welcome page (#1571)
- feat: migration to the new IPFS API with async (for) await (#1569)
- feat: Messaging continuity when node connection lost (#1577)
- feat: add animation for add peer connection (#1596)
- feat: improve breadcrumbs functionality (#1599)
- feat: improved support for remote API (#1613)

### 🛠 Fixes and Maintenance

- fix: responsive navbar on small devices (#1547)
- chore: update dependencies (#1552)
- chore: add docker section to readme (#1560)
- fix: make explore page 'view on gateway' point to gateway (#1559)
- refactor: switch multiaddrs from /ipfs/Qm to /p2p/Qm (#1564) (thank you @bertrandfalguiere 🙏 )
- fix: update Import button name (#1567)
- feat: Streamline navbar (#1550)
- feat: replace redux-bundle with ipfs-provider (#1563)
- fix: tweak map height for sub-940px-high windows (#1566) 
- fix: file upload without buffering (#1534)
- fix: view in gateway url now validates if url is acessible (#1591)
- chore: update ipfs-geoip (#1608)
- chore: consolidate repeat-use i18n keys (#1604)
- fix: multiple item download with go-ipfs 0.5+ (#1611)
- fix: fast pin.ls check (#1619)
- chore: update translations

## [v2.10.2] - 2020-07-16
CID: `bafybeihpetclqvwb4qnmumvcn7nh4pxrtugrlpw4jgjpqicdxsv7opdm6e`

---
### 🛠 Fixes and Maintenance

- Remove self-ref files page link in "no files" screen (#1531)
- fix: small arrow fill (#1532)
- fix: console error when no API available (#1443)
- fix: use classname instead of class in react components
- chore: update translations
## [v2.10.1] - 2020-06-23
CID: `bafybeibnnxd4etu4tq5fuhu3z5p4rfu3buabfkeyr3o3s4h6wtesvvw6mu`

---
### 🛠 Fixes and Maintenance

- chore: update In-App CORS instructions to match README (#1525)
- chore: add icons stories (#1524)
- fix: file import buttons size
## [v2.10.0] - 2020-06-22
CID: `bafybeid6luolenf4fcsuaw5rgdwpqbyerce4x3mi3hxfdtp5pwco7h7qyq`

---

### ✨ Features

- feat: created/fixed a11y issues across every component (#1512)

### 🛠 Fixes and Maintenance

- fix: a11y issues in files page (#1512)
- fix(i18n): IPLD explorer translation (#1515) 
- fix(i18n): restoring translation of remaining strings (#1516)
- fix: improve shell component ux (#1487) 
- fix: bootstrapPeers can be null (#1517)
- chore: update puppeteer (#1521)
- chore(i18n): sync locales
- fix(ci): more robust e2e (#1523)
- fix(ci): increase timeout for E2E Peers screen tests (#1518)
## [v2.9.0] - 2020-05-28
CID: `bafybeigkbbjnltbd4ewfj7elajsbnjwinyk6tiilczkqsibf3o7dcr6nn4`

---

### ✨ Features

- feat: add files progress feedback (#1495) 
- feat: add windows cmd & powershell init scripts (#1496) 
- feat(i18n): add Catalan locale and a link to IPFS Translation Project (#1499)

### 🛠 Fixes and Maintenance

- fix: update languages.json using lol (#1483) 
- fix(i18n): 'File name' → 'Name' (#1485) 
- fix: improve shell component ux (#1487) 
- chore: change add to import (#1486) 
- chore(i18n): sync locales (TODO)
## [v2.8.0] - 2020-04-28
CID: `bafybeicp23nbcxtt2k2twyfivcbrc6kr3l5lnaiv3ozvwbemtrb7v52r6i`

---

### ✨ Features

-  feat: add hover and clusters to peers map (#1444) 

### 🛠 Fixes and Maintenance

- fix: drag n drop now works if outside the file area (#1468)
- fix: miscellaneous help texts (#1465)
- fix: accessibility contrast (#1467) 
- fix: bandwi(d)th typo (https://github.com/ipfs-shipyard/ipfs-webui/pull/1474)
- refactor: remove ipfs-desktop settings (#1445) 
- chore(i18n): sync locales (31f041df4a0079c5cc279026b0a715e5c759d0d1)
## [v2.7.5] - 2020-04-17
CID: `waiting`

---

### 🛠 Fixes and Maintenance

- fix: start on login (#1381)
- fix: translated tour guides for all pages (#1442)
- fix(files): do not double-decode paths in infoFromPath (#1407)
## [v2.7.4] - 2020-04-14
CID: `bafybeigxqbvc6qxk2wkdyzpkh7mr7zh5pxbvpjb6a6mxdtpwhlqaf4qj5a`

---

### ✨ Features

- Useful PDF viewer (#1435)

### 🛠 Fixes and Maintenance

- fix: support POST-only HTTP API (clean way) (#1432)
## [v2.7.3] - 2020-04-04
CID: `bafybeihpkhgv3jfnyx5qcexded7agjpwbgvtc3o6lnk6n3cs37fh4xx4fe`

---

### ✨ Features

-  i18n: add `it`, `ja`, `ru`, sync locales (#1399) 

### 🛠 Fixes and Maintenance

- fix: support POST-only HTTP API (#1430)
