# catalk
### Client Authoritative Talk Server with Lightweight Public Relays

The goal of this system is to allow user to host their own full-featured public chat server at such low cost that it can fit into the free tier of hosting services like fly.io.

In order to do that, the server component is simply a secure relay that authenticates clients and signs messages to prove origin and authenticity. The server does not store chat message history. However, clients do store history, and share it with other clients via WebRTC peer to peer data transfer. The message IDs sort in time order, and an online client can request message history for a given message ID from another client in order to fill in gaps in its own history. As users scroll back in channel history, their client will fill in the history via WebRTC transfers from other online clients. In this way, te collection of clients functions as a distributed database of channel history, eliminating the need for a centralized database (that would drive up hosting costs.)

To anaticipate situations when only one user is online, and they need recent history, the chat room owner may also choose to host 2 or more "virtual clients" that can share recent history (say 24 hours.) When other clients are online, these virtual clients will be the source of history of "last resort" to avoid running up bandwidth charges in the data center.

The downside I see to the distributed database for history is that it may burden battery life for mobile users, but that will be offset by the lack of advertising and other things that "the man" builds into "free" online apps. Most importantly, your communications will never be in the possesion of people who are not your friends.


