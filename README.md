# University practice blog project.

## Authentication:
* [x] Create server
* [x] Add auth routes
* [x] Create user with POST /auth/signup
  * [x] Validate required fields
  * [x] Check is user already exists
  * [x] Hash password with bcrypt
  * [x] Save user to db
  * [x] Create a session
    * [ ] Save session to database
 * [x] Login user with POST /auth/signin
  * [x] Check if user exists
    * [x] Compare provided pass with saved hash
    * [x] Create a session
      * [ ] Save session to database
* [x] Create sign up form; show errors; redirect;
  * [x] Validte required fields
* [x] Create sign in form; show errors; redirect;
  * [x] Validte required fields

### Authorization: 
* [ ] Visitors car only see the recent posts page
  * [x] isLoggedIn middleware
  * [ ] Redirect to login form
* [x] Logged in users can only see their saved posts
  * [ ] allowAcces middleware
    * [ ] id in url must match id in req.user
    * [ ] send an unauthorized error message
  * [ ] redirect to user page if they visit the homepage
    * [ ] set user_id to localStorage aftter login/signup
* [x] add GET /logout/ to clear user_id cookie
  * [x] redirect to login page  


### UX/UI
* [ ] Create post form
  * [ ] Custom select
  * [ ] Errors handler
  * [ ] Editor
    * [ ] Insert image as link
    * [ ] Insert image as file
    * [ ] Insert link

* [ ] Post preview
* [ ] Post read page
  * [ ] Rate post
* [ ] User page
* [ ] Saved posts
