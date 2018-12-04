# IPFS Web UI Usability Test

@terichadbourne & @olizilla - 2018-12-03

> Visit webui.ipfs.io and find the peer ID of your node

  - _Do they have a daemon running already?_
  - _Do they follow the prompts to start their daemon?_
  - _Do they have to go and download go-ipfs first?_

- no ipfs installed
- this step doesn't work currently as I still need to PR go-ipfs to include a link to http://127.0.0.1:5001/webui
- once installed, the peerID was found, but it wasn't meaningful. We need to explain it.

> Are you connected to the IPFS network? How many peers is your node connected to?

  - _Are they and do they say yes?_
  - _Do they find the peer count?_
  - _How do they feel about that?_

- Dont know, i guess so from the graphs, but I'm not sure.
- Found peer count on the peers page.
- I guess these are people in places but why should i care? It needs introducing.
- What should I be able to do with this page? Clicking peers doesn't do anything.
- How do I find friends in this list?

> Add a picture you'd like to share to your IPFS node
>
> Copy the share link and send it to me via email _(or whatever works best for you)_

  - _Do they figure out where the add files feature is?_
  - _Do they manage to upload the file?_
  - _Do they find and copy the share link?_
  - _Do they try drag-and-drop? or do they use the add button or..._
  - _Are you able to get the file from the Web UI at your end_

- Found the add button on the files page
- "Add by path" was surprising and confusing. Initially assumed it meant "type out a local file path on this machine", not "paste in an IPFS address"
- "copy hash" and "share" feel very similar and it puts cognitive load on the user to figure out which one they need.

>   How long do you think that picture will still be available/at that address/at that link?

  - _Do they think they have saved it locally or uploaded to the cloud_
  - _If they answer so that it seems like they understand about the close-the-computer-its-unavailable thing, ask_:
    - How would you make sure that picture is always available?
    - Can anyone find that photo, or just me?

- While one of us is hosting it you can get it
- I don't know if its public or not. This is messaged more clearly in https://share.ipfs.io

> I'll send you a share link. Download the file to your desktop

  - _Do they find the download link?_
  - _Do they get the file?_

https://share.ipfs.io/#/QmQZdqN99zyFUWdAWfk9iipqqL42sbeDXPAHWYGngzVTSB

- Failed.
- This means the share app tried to connect to a running local api but was blocked by CORS config, and falling back to js-ipfs didn't work.

> Add the file and and explore it the IPLD data behind it. What node type is it?

  - _Does the question make sense to them?_
  - _Do they say `protobuf`, or something else?_

- node type doesn't make sense. File type like "jpg" or "image" makes sense but I dont know what a node type is.
- The data explorer shows the type as "file"

> Explore the "Project Apollo Archives" IPLD dataset, follow the "albums" link, and find picture to view on the IPFS gateway

  - _Do they click through the album link?_
  - _Do they find a jpg?_
  - _Do they find the View on IPFS Gateway link?_

- I don't know what View on IPFS gateway will do. Preview would be more intuitive here.

> Pick a dataset from https://archives.ipfs.io/ and explore it the IPLD structure behind it.

  - _Do they? ...this requires copy and pasting the cid from the website into the explore form_

- got the password database.
- Copying CIDs from https://archives.ipfs.io/ is hard, because they are links. Copying and pasting links is terrible UX.
- it is unclear what to do next.

## Notes

- "does the file name get transmitted if i share a file" - it depends. we need a way to clarify that. For casual users, always wrapping shared things in a directory could help.
- We at least need to say "add by IPFS path" in the add file drop down. "path" could mean local file-system path.
- "Why is there an IPLD explainer on the explore page"
- it's not fine!
- who are the peers? do i have access to my stuff. i have no idea how the whole thing works.
- does it matter how many people i'm connected to? i want to know who is hosting my things.
- Need a better "connection status" symbol
- Consider pulling the "connection info" in to Status page.
- Explore page talks about a box, but it is above the help text. Need to at least say "above". Say "below" for the featured datasets too.
- do peers have files that i can explore?
- peer page doesn't do anything.
- add some introduction to why do peers matter.
- Settings page...when would I need this. The settings page could at least link to settings docs
- i would like to see files as the first thing you see when you land on the app.
