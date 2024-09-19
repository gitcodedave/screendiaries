Project structure:

screendiaries/
|— core/ —> user
|— profiles/ —> userprofile, watchlist, queue, topten, follower
|— activityfeed/  —> comment, reply, reaction 
|— reviews/ —> review, rating
|— messages/
|— content/ —> omdb api, search
|— screendiaries/
|    |— settings.py

MODELS: 

Profile:
id
bio
profile picture link
profile cover link
user (link to main user model)

TopTen:
user id
content id
type (movie/tvshow) 
ranking (1-10)

Review:
id
review text
Date added
Rating (optional)
content id
user id
contains spoiler

Rating:
content id
rating
user id
date added

WatchListItem:
status (currently watching or watched)
content id
user id
date added

QueueItem:
user id
content id
date added

Follower:
user id
follower id
date followed

ActivityFeedItem:
id
user id
type (rating, review, comment)
content id
date added

ReviewComment:
id
text
review id
user id

ReviewReply:
id
text
review comment id
user id

ReviewReaction:
review id
emoji 
user id

RatingComment:
id
text
rating id
user id

RatingReply:
id
text
rating comment id
user id

RatingReaction:
review id
emoji 
user id

content:
id
type (movie, series, episode)
episode (optional, s? e?)
title
description
release date
director
actors
genre
poster (image link)
plot
runtime

Message:
id
type (content share, activity feed share, text)
content id
text
reaction (default none)
status (unread or read)
date added
sender id
recipient id