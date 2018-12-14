# IPFS Web UI Usability Test

@meiqimichelle & @olizilla - 2018-12-04

> Visit webui.ipfs.io and find the peer ID of your node

  - _Do they have a daemon running already?_
  - _Do they follow the prompts to start their daemon?_
  - _Do they have to go and download go-ipfs first?_


YES! go-ipfs installed. We configured CORS to allow webui.ipfs.io access.

> Are you connected to the IPFS network? How many peers is your node connected to?

  - _Are they and do they say yes?_
  - _Do they find the peer count?_
  - _How do they feel about that?_

"i don't know. i dont know why things are moving. i'm connected to something cos things are moving. found the peer count on the status page. 741 -- Is that the total network size. am i talking to these people?"

> Add a picture you'd like to share to your IPFS node
>
> Copy the share link and send it to me via email _(or whatever works best for you)_

  - _Do they figure out where the add files feature is?_
  - _Do they manage to upload the file?_
  - _Do they find and copy the share link?_
  - _Do they try drag-and-drop? or do they use the add button or..._
  - _Are you able to get the file from the Web UI at your end_


found button easily.

"what is add by path? why are add folder and new folder both there? (_olizilla: We should totally move create dir out of that list_) why are add file and add folder separate?"

>   How long do you think that picture will still be available/at that address/at that link?

  - _Do they think they have saved it locally or uploaded to the cloud_
  - _If they answer so that it seems like they understand about the close-the-computer-its-unavailable thing, ask_:
    - How would you make sure that picture is always available?
    - Can anyone find that photo, or just me?

"the hash exists in the world for all time, but if i close the computer you wont be able. anyone running ipfs can find that photo. if i sent it to my mom i dont think it would work and i dont think this is private."

> I'll send you a share link. Download the file to your desktop

> https://share.ipfs.io/#/QmQZdqN99zyFUWdAWfk9iipqqL42sbeDXPAHWYGngzVTSB

  - _Do they find the download link?_
  - _Do they get the file?_

Yes. "Get files directly from devices" seems wrong. When getting priviledge the get files info over the other info. share via ipfs, not share by ipfs."

> Add the file and and explore it the IPLD data behind it. What node type is it?

  - _Does the question make sense to them?_
  - _Do they say `protobuf`, or something else?_

found the inspect link. "IPLD HAS NODES? no idea."

> Explore the "Project Apollo Archives" IPLD dataset, follow the "albums" link, and find picture to view on the IPFS gateway

  - _Do they click through the album link?_
  - _Do they find a jpg?_
  - _Do they find the View on IPFS Gateway link?_

> Pick a dataset from https://archives.ipfs.io/ and explore it the IPLD structure behind it.

  - _Do they? ...this requires copy and pasting the cid from the website into the explore form_

grabbed the xkcd dataset. failed to load. Refresh worked.

----

usability - in general you are getting there.
overall - pick some key messages to get across.
