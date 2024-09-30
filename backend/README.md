Backend structure:

screendiaries/
|─backend/
|—— core/ —> user
|—— network/
|   	Models:
|    	|— profiles/ —> userprofile, watchlist, queue, topten, follower
|    	|— activityfeed/  —> comment, reply, reaction 
|   	|— reviews/ —> review, rating
|   	|— messages/
|    	|— content/ —> omdb api, search
|—- screendiaries/
|    	|— settings.py
|─frontend/

MODELS: 

Profile:
bio
profile_picture
profile_cover
user (link to main user model)

Follow:
follower
following
timestamp

Content:
content_type (movie, series, episode)
season (optional)
episode (optional)
title
release_date
director
actors
genre
plot
poster (url link)
runtime

WatchListItem:
status (currently watching or watched)
content
user
timestamp

QueueItem:
user
content
timestamp

TopTen:
user
content (can get the type from here)
ranking (1-10)

Review:
review text
Rating (optional)
content
user
contains_spoiler
timestamp

Rating:
rating
content
user
timestamp

ActivityFeedItem:
activity_type (rating, review, comment, reply)
activity_id (int, not the object)
user
timestamp

ReviewComment:
comment_text
review
user
likes

ReviewReply:
reply_text
review_comment
user
likes

ReviewReaction:
reaction (love, thumbs up, laughing, crying, etc)
review
user

RatingComment:
comment_text
rating
user
likes

RatingReply:
reply_text
rating_comment
user
likes

RatingReaction:
reaction (love, thumbs up, laughing, crying, etc)
rating
user

Message:
message_type (content share, activity feed share, text)
content_id (int, not the object, optional)
message_text
reaction_emoji (default blank '')
status (unread or read)
sender
recipient
timestamp