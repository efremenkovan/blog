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
* [ ] Visitors car only see the recent posts page
  * [ ] isLoggedIn middleware
  * [ ] Redirect to login form
* [ ] Logged in users can only see their saved posts
  * [ ] allowAcces middleware
    * [ ] id in url must match id in req.user
    * [ ] send an unauthorized error message
  * [ ] redirect to user page if they visit the homepage
    * [ ] set user_id to localStorage aftter login/signup
* [x] add GET /logout/ to clear user_id cookie
  * [x] redirect to login page  


### UX/UI
* [x] Create post form
  * [x] Custom select
  * [x] Errors handler
  * [x] Editor
    * [x] Cover

* [x] Post preview
  * [ ] Edit page
* [ ] Post read page
  * [ ] Rate post
* [ ] User page
* [ ] Saved posts
* [ ] Archive
* [ ] hepler for checked label