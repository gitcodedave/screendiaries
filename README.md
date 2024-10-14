# ScreenDiaries

## Prerequisites
- The app is containerized with Docker, so you will need to have Docker installed to run it.

## Installation
1. Fork and clone the repository to your local machine.
2. In your terminal, navigate to the main project folder:
   ```
   cd screendiaries
   ```
3. Ensure you have Docker running already.
4. Build and start the container with the following command:
   ```
   docker-compose up --build
   ```
5. Wait until the Docker terminal displays: "Watching for file changes with StatReloader".
6. Open a web browser and go to `http://localhost:3000/login` to start using the app.

## Development Notes
- This app is still in development. Data is saved to the container's DB instance and will not persist in an online database. When you create your user account, you will be the first and only user. To see all features, you may need to create one or two additional mock user accounts.

## Usage

### Registering
- On the landing page, you are prompted to log in or register. Click on the register link and enter your email, username, and password. Note that this is a development environment, so none of your data is stored outside of your local machine. You can use dummy data, but valid email, username, and password formats are required.

### Edit Profile
- Once your account is created, click the "Edit Profile" button to customize your profile with your first name, last name, bio, and profile picture.

### Content Search
- On the home page, you will see that you don't have any content saved in your Queue. Click on either the ▶ button at the top right corner or the search icon in the "My Queue" area.
- Search for content by specifying the type (either movies or series) and then submit the search. The results will populate a list. When you click on a piece of content, if it is not already in the database, it will be uploaded first, and then you will be directed to it.

### Content Page
- On the content page, you can add items to your queue. If you add an item, it will appear in the "My Queue" section of your homepage. Selecting it again will remove it from your queue. If you click the "Currently Watching" button, it will be added to your "Watchlist". The "Watched" button adds it to your watchlist under a different status.
- You can rate the content from 1 to 5 stars or write a review, which includes an option to add a Spoiler Warning and your rating.
- Ratings and reviews will create new "Activity" on your homepage and the homepages of your followers.
- The area underneath the 'Leave a review...' section will display any reviews created by you or other users. It will be empty if no one has reviewed it yet.
- Feel free to search for several movies or TV shows to add to your queue or leave ratings/reviews to populate the activity feed on your home page.

### Home Page/Activity
- You can return to the homepage by clicking on your profile image at the top left corner.
- On the homepage, any content added to your queue will be displayed in the "My Queue" section. You can click on the content images to go directly to the content page or click the "x" to remove it from your queue. The "Movies/Series" selector separates your queue content by type.
- Any reviews/ratings you made will be added to your "Reviews" and "Ratings" counters at the top.
- If you added anything to your watchlist, click the "My Watchlist" button to view all items you've either watched (checkmark) or are currently watching (clock).
- The activity feed on the homepage will show your activity and the activity of users you follow.

### Following
- To see other user activity, create a mock user to follow. First, log out by clicking the "Logout" button at the bottom of the homepage. Then, register a new user with a unique email and username.
- On the homepage, use the search bar in the top left corner to find friends by entering the first name, last name, or username of the original user. The user should appear in the list.
- You can now view the original user's queue, watchlist, and click the "Follow" button to follow them.
- Return to the homepage. Your "Following" counter will increase, and you can click on it to see the users you follow.
- You will also see the activity feed of users you follow. You can add their content to your queue and see their activities.
- Click the "Friends WatchList" button to see all the content that users you follow have added to their watchlists.

## Roadmap
- **"Friends Watching" Button**: This feature on the content page will allow you to see which friends have watched or are currently watching the content.
- **Activity Feed Pagination**: The activity feed will eventually load up to 10 items at a time, with options to scroll down or click "next page" to load more.
- **Content Result Pagination**: Future updates will add pagination to the content search results to load additional pages.
- **Queue Carousel**: The "My Queue" section will have a carousel style container to display 4-5 items at a time.
- **Review and Ratings List**: The "Reviews" and "Ratings" counters will eventually populate lists of all your past reviews and ratings.
- **Engagement Functionality**: The React, Comment, and Share options in the activity feed will allow users to interact with feed items.
- **Messaging Users**: A direct messaging feature between users will be added.
- **Top Ten**: A customizable "Top Ten" section for favorite movies or TV shows will be added to the homepage.

## Known Bugs
- Adding content to the queue directly from the activity feed does not immediately update the profile queue; a page refresh is required.
- Searching for content, especially specific episodes, may cause the content server to hang or not respond due to API issues beyond our control.

# Thank you for checking out Screendiaries!
Feel free to message me about it, or connect with me on LinkedIn:
https://www.linkedin.com/in/ortega-david-e/


---