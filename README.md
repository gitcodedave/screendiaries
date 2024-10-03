When making search queries for content, the ContentSearchView API utilizes the following query parameters:


type = The type of content (movie, series, episode)
s = Search term
~ Optional
i = A valid IMDB ID for a piece of content
season = The season of the series
episode = The episode of the season

Project structure:

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
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── routes/
│   │   │   └── Routes.js
│   │   ├── pages/
│   │   │   ├── Auth.js
│   │   │   ├── Feed.js
│   │   │   ├── Content.js
│   │   │   ├── Search.js
│   │   │   ├── Profile.js
│   │   │   └── Messages.js
│   │   │   └── NotFound.js
│   │   ├── api/
│   │   │   ├── api.js
│   │   ├── components/
│   │   │   ├── NavBar/
│   │   │   │   ├── NavBar.js
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   ├── Register.js
│   │   │   ├── Feed/
│   │   │   │   ├── ActivityContainer.js
│   │   │   │   ├── UserInfo.js
│   │   │   │   └── Activity.js
│   │   │   ├── Content/
│   │   │   │   ├── ContentContainer.js
│   │   │   │   ├── ContentInfo.js
│   │   │   │   ├── ReviewRating.js
│   │   │   │   ├── FriendsWatchedContainer.js
│   │   │   │   ├── FriendsWatched.js
│   │   │   │   └── FriendActivityContainer.js
│   │   │   │   └── FriendActivity.js
│   │   │   ├── Search/
│   │   │   │   ├── SearchContainer.js
│   │   │   │   ├── SearchTypeSelector.js
│   │   │   │   ├── ResultContainer.js
│   │   │   │   ├── Result.js
│   │   │   │   └── Paginate.js
│   │   │   ├── Profile/
│   │   │   │   ├── ProfileInfoContainer.js
│   │   │   │   ├── ProfileInfo.js
│   │   │   │   ├── ProfileContentContainer.js
│   │   │   │   ├── ProfileContentTypeSelector.js
│   │   │   │   ├── Queue.js
│   │   │   │   ├── TopTen.js
│   │   │   │   ├── ProfileActivityContainer.js
│   │   │   │   └── ProfileActivity.js
│   │   │   ├── Messages/
│   │   │   │   ├── FriendInfoContainer.js
│   │   │   │   ├── MessageFeedContainer.js
│   │   │   │   ├── Message.js
│   │   │   │   └── MessageSendBox.js
│   │   ├── styles/
│   │   ├── index.js
|── .env
|── .gitignore
|── package.json
|── README.md