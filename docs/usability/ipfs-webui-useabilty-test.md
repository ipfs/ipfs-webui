# IPFS Web UI Usability Testing

The app should make the following actions **easy** to complete

- Add a file and share it with a friend
- See the files in your repository
- Determine if the node is connected to the network and operating normally
- Diagnose when your IPFS daemon isn't running and fix it
- Find the peer ID of the node you are connected to
- Find IPLD info about an IPFS path and browse a link
- Discover and try out experimental IPFS features _missing_ [ipfs-webui#814](https://github.com/ipfs-shipyard/ipfs-webui/issues/814)
- Find the total size of your IPFS repo _missing_

More holistically, it should give a feeling of being connected to a network of peers.
It must not give a sense of "uploading to the cloud", as that is a significant cause
of confusion about how IPFS works, and it's dangerously misleading.

The app ensure that the following actions are **possible** to complete

- Determine the peer ID of the node
- Determine how it is connected to IPFS
- Find which network addresses it's bound to

## Goal of the usability test

- Find any problems prevent any of the participants from completing the tasks
- Gather structured feedback on the v2 redesign

## Methods

- 45 min interview with PL folk, some developers, some not.
- Notes, no recording
- Remote or in-person
- Include a retrospective design crit

## Test Script

- Visit webui.ipfs.io and find the peer ID of your node
  _Do they have a daemon running already?_
  _Do they follow the prompts to start their daemon?_
  _Do they have to go and download go-ipfs first?_

- Add a picture you'd like to share to your IPFS node
- Copy the share link and send it to me via (whatever works best for both)
  - _Do they figure out where the add files feature is?_
  - _Do they manage to upload the file?_
  - _Do they find and copy the share link?_
  - _Do they try drag-and-drop? or do they use the add button or..._
  - _Are you able to get the file from ipfs webui at your end_

- I'll send you a share link. Download the file to your desktop
  - _Do they find the download link?_
  - _Do they get the file?_

- Add the file and and explore it the IPLD data behind it. What node type is it?

- Explore the "Project Apollo Archives" IPLD dataset, follow the "albums" link, and find picture to view on the IPFS gateway
  - _Do they click through the album link?_
  - _Do they find a jpg?_
  _ _Do they find the View on IPFS Gateway link?_

- Pick a dataset from https://archives.ipfs.io/ and explore it the IPLD structure behind it.
  - _Do they? ...this requires copy and pasting the cid from the website into the explore form_

- How many peers is your node connected to?
  _Do they find out? How do they feel about that?_


## Questions / Musings

- How do we test for discoverability? (https://github.com/ipfs-shipyard/ipfs-webui/issues/815)
  - how does a new user even find the webui? The daemon doesn't log out an address for it on start up.
  - If we test for that with new users, I think we'd find most wouldn't know where to look.
  - this is probably just another UX issue, and we need to fix it. I think I'm loathed to test it right now as the UX is so bad it's not worth testing yet.

- How do we check for mis-conceptions the app might dispell or reinforce?
  - IPFS is not a Backup / upload to the cloud service. It's still up to you to ensure your files are on more than one machine.
  - Files are not private. It's up to you to encrypt them... but they are obscure, and only those you share the link with, or those that already have them will be able to find them from you.

---

Credit: cribbed from https://github.com/18F/myusa-ux/edit/master/research/usability/sprint22_research-plan.md
