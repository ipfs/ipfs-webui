# IPFS Web UI Usability Test

@pkafei & @olizilla - 2018-12-03

> Visit webui.ipfs.io and find the peer ID of your node

  - _Do they have a daemon running already?_
  - _Do they follow the prompts to start their daemon?_
  - _Do they have to go and download go-ipfs first?_

- no daemon running. go-ipfs was installed.
- copy pasted command and started daemon
- copy and paste multiple lines into terminal requires both technical understanding (these are 2 commands) and physical skill (copy the whole line and scroll to the right.)
- found peer id.

> Are you connected to the IPFS network? How many peers is your node connected to?

  - _Are they and do they say yes?_
  - _Do they find the peer count?_
  - _How do they feel about that?_

- YES! 142!
- slighty confused.. why are go-ipfs and js-ipfs peer counts so different?

> Add a picture you'd like to share to your IPFS node
>
> Copy the share link and send it to me via email _(or whatever works best for you)_

  - _Do they figure out where the add files feature is?_
  - _Do they manage to upload the file?_
  - _Do they find and copy the share link?_
  - _Do they try drag-and-drop? or do they use the add button or..._
  - _Are you able to get the file from the Web UI at your end_

- Took a few scans of the page to find the add button in the top right... it was being obscured by zoom controls.
- Need controls on the file view page! Clicking on the files leaves you with no options.
- Initially went to copy the web-ui url... (can we make that work?)
 - Also checked it worked in another browser tab, which is wise, but as both were pointing to the same ipfs repo, the webui link looked like it would work for other people too. (difficult to tell that it wont)

  https://ipfs.io/ipfs/QmUnuqzGKnyYn6EbT2Erg8C2fvSD6w7g8bt5vw7SuCEwtN (works)
  vs
 https://webui.ipfs.io/#/files/blockchain_explainer_portia_l_burton.jpg (wont work for others)


>   How long do you think that picture will still be available/at that address/at that link?

  - _Do they think they have saved it locally or uploaded to the cloud_
  - _If they answer so that it seems like they understand about the close-the-computer-its-unavailable thing, ask_:
    - How would you make sure that picture is always available?
    - Can anyone find that photo, or just me?

- not sure. I need to pin thing to get them to stick around, but I haven't done that here.
- If i take my node offline then it's gone.

> I'll send you a share link. Download the file to your desktop

> https://share.ipfs.io/#/QmQZdqN99zyFUWdAWfk9iipqqL42sbeDXPAHWYGngzVTSB

  - _Do they find the download link?_
  - _Do they get the file?_

- why have a separate UI for sharing (so we can inform the downloader of file-sizes, show progress and messaging about IPFS)

> Add the file and and explore it the IPLD data behind it. What node type is it?

  - _Does the question make sense to them?_
  - _Do they say `protobuf`, or something else?_

- Where is my CID!?
- Copy and pasted CID from URL to explore bar at the top. (which worked, but isn't the explore / inspect button.)
- Positive reaction to being able to see the IPLD info.
- We talked a lot about graphs / trees / dags and needing arrows to show the direction of the edges of the IPLD Graph, and a label to explain it.

> Explore the "Project Apollo Archives" IPLD dataset, follow the "albums" link, and find picture to view on the IPFS gateway

  - _Do they click through the album link?_
  - _Do they find a jpg?_
  - _Do they find the View on IPFS Gateway link?_

  - Yes! That's excellent!

> Pick a dataset from https://archives.ipfs.io/ and explore it the IPLD structure behind it.

  - _Do they? ...this requires copy and pasting the cid from the website into the explore form_

- No problem copying the cid and pasting it into the explorer.
- Chose presidential briefs. Picked a random PDF, opened it on the IPFS gateway via the link.

General feedback

> pkafei: whats the direction / general purpose of the app
> olizilla: it should be educational / be good at onboarding for new users.
> pkafei: I think it does that!

> pkafei: How do we get new contributors involved
> olizilla: good question! ...long discussion follows...  perhaps we need to say
> up front that there is a lot to learn, so give people the IPFS concetps quick
> guide first... the learn it in a day overview, and then say "pick your quest"
> where we guide people to work on the bit that interests them and focus in on part.
