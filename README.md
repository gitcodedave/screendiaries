# ScreenDiaries

## Prerequisites
- The app is containerized with Docker, so you will need to have Docker installed to run it:
https://www.docker.com/products/docker-desktop/

## Installation
1. Fork and clone the repository to your local machine.
2. In your terminal, navigate to the main project folder screendiaries:
   ```
   cd screendiaries
   ```
3. Ensure you have Docker running already before proceeding.
4. Build and start the container with the following command in the terminal:
   ```
   docker-compose up --build
   ```
5. Wait until the Docker terminal displays: "Watching for file changes with StatReloader".
6. Open a web browser and go to `http://localhost:3000/login` to start using the app. 
**NOTE this app is currently defaulted to "HTTP" and NOT "HTTPS". Make sure you use HTTP in your localhost link. It will be converted to HTTPS in a future version.

## Development Notes
- This app is in development. Data is saved to the Docker container's DB instance will not persist in any online database. When you create your user account, you will be the first and only user. To see all features, you will need to create one or two additional mock-user accounts.

## Usage

### Registering
- On the landing page, you are prompted to log in or register. Click on the register link and enter your email, username, and password. Note that this is a development environment so none of your data is stored outside of your own local machine. You may use dummy data, but valid email, username, and password formats are required.

### Edit Profile
- Once your account is created, click the "Edit Profile" button to customize your profile with your first name, last name, bio, and upload a profile picture.

### Content Search
- On the home page, you will see that you don't have any content saved in either of your Queues. Click on either the ▶ button at the top right corner (in the navbar), or the search icon in the "My Movie Queue" area.
- Search for content by specifying the type (click for either movies or series) and then submit a search. The results will populate a list. When you click on a piece of content, if it is not already in the database, it will be uploaded first, and then you will be redirected to it.

### Content Page
- On the content page, you can add it to your queue. If you add an item, it will appear in the "My Movie/Series Queue" section of your homepage. Selecting the queue button again will remove it from your queue. If you click the "Currently Watching" button, it will be added to your Watchlist as "Currently Watching". The "Watched" button adds it to your Watchlist under the "Watched" status.
- You can rate the content from 1 to 5 stars or write a review, which includes an option to add a Spoiler Warning.
- Ratings and Reviews will create new "Activity" on your homepage and the homepages of your followers.
- The area underneath the 'Leave a review...' section displays any reviews created by you or other users. It will be empty if no one has reviewed it yet.

*Dev: Feel free to search for several movies or TV shows and add them to your queue or leave ratings/reviews to populate the activity feed on your home page.

### Home Page/Activity
- You can return to the homepage by clicking on your profile image in the navbar.
- On the homepage, any content added to your queue will be displayed in the "My Movie/Series Queue" section. You can click on the content images to go directly to the content page, or click the "x" to remove it from your queue.
- Any reviews/ratings you made will be added to your "Reviews" and "Ratings" counter at the top. You can then click on those stats to get a list of either your Reviews or Ratings.
- If you added anything to your Watchlist, click the "My Watchlist" button to view all items you've either "Watched" (checkmark) or are "Currently Watching" (clock).
- The activity feed on the homepage will show your activity and the activity of users you follow.

### Following
- To see other user activity, let's create a mock user we can follow. First, log out by clicking the "Logout" button at the bottom of your profile homepage. Then, register a new user with a unique email and username.
- After being redirected to the homepage, use the search bar in the top left corner (in the navbar) to find friends by searching for the first name, last name, or username of the original user profile you created. The user should appear in the list.
- You can now view the original user's Queue, Watchlist, Reviews, Ratings, who they're Following, or click the "Follow" button to follow them (clicking it again would unfollow them).
- Return to the homepage. Your mock user's "Following" counter will increase, and you can click on it to see the users they now follow.
- You will also see the activity feed of the user they followed. You can add that content to the mock-user's queue.
- Click the "Friends WatchList" button to see all the content that users they followed have added to their Watchlists.

### Updates
- Now that you've followed the original user with the mock-user account, Logout and the Login again as the original user.
- You will now see that in the "Updates" button in the navbar (the envelope) has a new item in it. If you click on the envelope, you will see that a user has followed you.
- Once you've seen the any new updates, the "Updates" counter will be set back to 0. 

## Roadmap
- **Engagement Functionality**: The React, Comment, and Share options in the activity feed will allow users to interact with feed items.
- **"Friends Watching" - (Content Page Not Homepage) Button**: This feature on the content page will allow you to see which friends have watched or are currently watching the content.
- **Messaging Users**: A direct messaging feature between users will be added.
- **Top Ten**: A customizable "Top Ten" section for favorite movies or TV shows will be added to the homepage.
- **Activity Feed Pagination**: The activity feed will load 10 items at a time, with options to scroll down or click "next page" to load more.
- **Content Result Pagination**: Future updates will add pagination to the content search results to load additional pages.
- **Queue Carousel**: The "My Queue" section will have a carousel style container to display 4-5 items at a time.

## Known Bugs
- Searching for some content (usually when searching specific episodes) may cause the content server to hang or not respond due to API issues beyond my control.

# Thank you for checking out Screendiaries!
Feel free to message me about it, or connect with me on LinkedIn:
https://www.linkedin.com/in/ortega-david-e/


---