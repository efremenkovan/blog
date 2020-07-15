# University practice blog project.

### Authentication:
* [x] Create server
* [x] Add auth routes
* [x] Create user with POST /auth/signup
  * [x] Validate required fields
  * [x] Check is user already exists
  * [x] Hash password with bcrypt
  * [x] Save user to db
  * [x] Create a session
    * [x] Save session to database
 * [x] Login user with POST /auth/signin
  * [x] Check if user exists
    * [x] Compare provided pass with saved hash
    * [x] Create a session
      * [x] Save session to database
* [x] Create sign up form; show errors; redirect;
  * [x] Validte required fields
* [x] Create sign in form; show errors; redirect;
  * [x] Validte required fields

### Authorization: 
* [x] Visitors car only see the recent posts page
  * [x] isLoggedIn middleware
  * [x] Redirect to login form
* [x] Logged in users can only see their saved posts
  * [x] redirect to user page if they visit the homepage
* [x] add GET /logout/ to clear user_id cookie
  * [x] redirect to login page  


### UX/UI
* [x] Create post form
  * [x] Custom select
  * [x] Errors handler
  * [x] Editor
    * [x] Cover

* [x] Post preview
  * [x] Edit page
* [x] Post read page
  * [x] Rate post
* [x] User page
* [x] Saved posts
  * [x] Icon in the top right corner on preview
  * [x] Send req on saving with fetch -> update icon | show alert; 
* [x] hepler for checked label
* [x] pagination
* [x] Error page
  * [x] HTML and logic
  * [x] Styles
* [x] Edit icon on the posts