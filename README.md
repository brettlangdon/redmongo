redmongo
========

The native MongoDB client backed by a Redis client for caching.

This is mainly a for fun project. Combining the native MongoDB client with
a Redis client in front for caching of queries.

Right now it just caches simple `findOne` queries. In the future maybe I'll have it cache
larger queries and cache result sets. I also plan on having it use TTL for the cached results.