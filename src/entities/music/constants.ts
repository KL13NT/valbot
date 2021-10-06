export const YOUTUBE_PLAYLIST_MATCHER = /^.*(youtu.be\/|list=)([^#&?]*).*/;
export const SPOTIFY_PLAYLIST_MATCHER = /^https:\/\/open.spotify.com\/playlist\/([a-zA-Z0-9]+)\??/i;
export const SPOTIFY_ALBUM_MATCHER = /^https:\/\/open.spotify.com\/album\/([a-zA-Z0-9]+)\??/i;
export const SPOTIFY_SINGLE_MATCHER = /^https:\/\/open.spotify.com\/track\/([a-zA-Z0-9]+)\??/i;

export const SINGLE_SYMBOL = Symbol("track-retriever");
export const LIST_SYMBOL = Symbol("single-retriever");
