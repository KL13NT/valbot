## Play race condition solutions

First case conditions:

- State `queue` is empty
- Two or more async `play` requests are executed at the same time (relative)

Add operation when no track in queue

Second case conditions:

- State `queue` is not empty
- Current track is ending
- One or more async `play` requests are executed at the same time (relative)
- Track being added are coming up right after _currently ending track_

Add operation when current track is last in queue

## Solution 1

Async Mutex lock the queue whenever an add operation is executed. May not be
viable for large queues.

Pros:

- Easy to use
- Logic is simple
- Simplifies code

Cons:

- Can add too many frames in the worst case and cause a stack overflow

## Solution 2

Use a requests message queue to process actual enqueues only when the state is
not locked.

Steps:
0- An interval is initialized on the controller to check the `requests` queue
and `locked` boolean and accordingly process requests to the state.
1- Play command calls `enqueue`
2- `enqueue` sets the `locked` boolean to `true` and modifies the state
3- Any subsequent requests to the queue are to be added to the `requests`
message queue

## Solution 3 (implemented)

Change the ordering of operations regarding state changes. At the time of
writing the bot used to execute `play` before changing the state, which resulted
in two subsequent _async_ requests being executed at the same time, causing the
logic in the `play` method to continue in both cases.

The solution involved changing the conditions order and state changes to make
sure that the first invocation of `play` changes the state and any subsequent
logic to execute _iff_ said state change finishes. Check the
[changes](https://github.com/KL13NT/valbot/commit/b70a354607cc15f6495b7a6586556028b81624fb)
for more detail.
