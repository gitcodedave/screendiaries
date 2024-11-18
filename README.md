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
- Search for content by specifying the type (click for either movies or series) and then submit a search. The results will populate a list. When you click on a piece of content, it will be uploaded to the database first and then you will be redirected to it.

### Content Page
- On the content page, you can 'add it to your queue'. If you add an item, it will appear in the "My Movie/Series Queue" section of your homepage. Clicking the queue button again will remove it from your queue. If you click the "Currently Watching" button, it will be added to your Watchlist as "Currently Watching". The "Watched" button adds it to your Watchlist under the "Watched" status.
- If you click on the "Who's Watching" button, it will display a list of users that you follow that are either Currently Watching or have already Watched the content.
- Now you can rate the content from 1 to 5 stars, or write a review which includes an option to add a Spoiler Warning.
- Ratings and Reviews will create new "Activity" on your homepage and the homepages of your followers. If you have already Reviewed an item, you cannot review it again (I will be adding an edit-Review feature), but if you have already Rated an item, you can Rate it again and it will simply update your previous Rating.
- The area underneath the 'Leave a review...' section displays any reviews created by you or other users. It will be empty if no one has reviewed it yet.

*Dev: Feel free to try this with several movies or TV shows, add them to your queue, or leave ratings/reviews to populate the activity feed on your homepage.

### Home Page/Activity
- You can return to the homepage by clicking on your profile image in the (top left) navbar.
- On the homepage, any content added to your queue will be displayed in the "My Movie/Series Queue" section. You can click on the content images to go directly to the content page, or click the "x" to remove it from your queue.
- Any reviews/ratings you made will be added to your "Reviews" and "Ratings" counter at the top. You can then click on those stats to get a list of either your Reviews or Ratings. In that list, you can click on either of the Reviews or Ratings to go directly to each Activity.
- If you added anything to your Watchlist, click the "My Watchlist" button to view all items you've either "Watched" (checkmark) or are "Currently Watching" (clock).
- The activity feed on the homepage will show your activity and the activity of users you follow.
- If you click on the "Like" or "'Thumbs Up" icon, it will create a reaction to the Activity. You will notice the reaction counter go up by +1. You can then click on the number to see who else has reacted to the Activity.
- If you click on the "Comment" icon, it will open a small text area for you to add a new comment. After clicking Submit, it will add the comment to the bottom of the Activity.
- You will see that each Comment has its own "Like" icon so that you can React to it, and its own "Comment" icon so that you can reply directly to each Comment.
*The "Send To Friend" functionality is still under development.

### Following
- To see other user activity, let's create a mock user to follow. First, log out by clicking the "Logout" button at the bottom of your profile homepage. Then, register a new user with a unique email and username.
- After being redirected to the homepage, use the search bar in the top left corner (in the navbar) to find friends by searching for the first name, last name, or username of the first user profile you created. The user should appear in the list.
- You can now view the other user's Queue, Watchlist, Reviews, Ratings, or who they're Following. Click the "Follow" button to follow them. (Clicking it again would unfollow them).
- Return to the homepage. Your second, mock user's "Following" counter will increase, and you can click on it to see the users they now follow.
- You will also see the activity feed of the user they have now followed. You can add that content to the mock-user's queue, as well as "Like" their activity and "Comment" on it.
- Back on your homepage, you can now click the "Friends WatchList" button to see all of the content users you've followed have added to their own Watchlists.
- If the other user you are following has added any content to your Watchlist, when you go to the content and click on the "Who's Watching" button, you will see them on the list of users who are also Watching the content.

### Updates
- Now that you've "Followed" the original user, "Liked", and "Commented" on some of their Activity with the mock-user account, Logout at the bottom of the profile homepage and Login again as the original user.
- You will now see that the "Updates" button in the navbar (the envelope) has new items in it. If you click on the envelope, you will see that a user has followed you, has reacted to your activities, and/or commented on them. You will notice that any unread updates are highlighted. Each time you click on one of your updates, it will mark it as "Read" and will no longer be highlighted. Clicking on the updates will take you to more info on that single activity.
- Once you've "Read" an item, the "Updates" counter will decrement. 

## Roadmap
- **Messaging Users**: A direct messaging feature between users will be added.
- **Engagement Functionality**: The Send To Friends option in the activity feed will allow users to send content to other users items.
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