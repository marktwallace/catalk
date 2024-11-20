# catalk
## Client Authoritative Talk Server with Lightweight Public Relays

The goal of this system is to allow users to host their own full-featured public chat server at low cost so that it can fit into the free tier of hosting services like fly.io.

The server is simply a secure relay that authenticates clients and signs messages to prove origin and authenticity. The server does not store chat message history. However, clients do store history, and share it with other clients via WebRTC peer to peer data transfer. The message IDs sort in time order, and an online client can request message history for a given message ID from another client in order to fill in gaps in its own history. As users scroll back in channel history, their client will fill in the history via WebRTC transfers from other online clients. In this way, persistent state in clients acts as a distributed database of channel history, eliminating the need for a centralized server-side database.

## Architecture

### Signed messages

A primary function of the server is to certify the "facts" that are distributed among the client databases so they can be verified when needed. In general, a fact that is obtained from the server relay will be signed but singnature verification may not be needed in every case for facts received over a trusted channel. Facts that are obtained from peer client connections should be verified. Peer client may sign transmissions to peers, but I am not yet certain of the compute overhead of that, and we would not want to unduely burden peer client CPU. In general, transmission between clients will be batches of mutiple messages, and we will avoid frequent transmissions, so maybe a few per minute if at all.

### Login data

Since there is no auth database, the clients must authenticate with their own public key (Ed25519). The server replies to login requests with a nonce to confirm a connecting client's identity. Other clients can confirm that identity from their own message history.

One of the fundamental facts relayed by the server is a list of users currently online. Each item in the list should be a signed message that certifies that the client with a given public key has connected, with a attestation of their current level of privildge. (At this point, it would include whether the user has the ablity to create new message channel, and whether then can post new messages to any channel.)

### Virtual clients

To anticipate situations when only one user is online, and they need recent history, the chat room owner may also choose to host 2 or more "virtual clients" that can share recent history (say 24 hours.) When other clients are online, these virtual clients will be the source of history of "last resort" to avoid running up bandwidth charges in the data center.

## Costs

The costs I see to the distributed database for history is that it may burden battery life for mobile users, and potentially bandwidth charges (if we are not careful), but that will be offset by the lack of advertising and other things that are built into "free" online apps. Most importantly, your communications will never be in the possession of people who are not your friends.


