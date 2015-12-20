System.register(['angular2/core'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1;
    var AppComponent, Channel, Post, Comment;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent() {
                    var _this = this;
                    this.availableTags = ["123"];
                    this.addPostText = "";
                    this.isAddPostOpen = true;
                    this.socket = io.connect('http://localhost:8000');
                    this.socket.on('connect', function () {
                        console.log('connected');
                    });
                    this.socket.on('new-post', function (data) {
                        return _this.AddPost(new Post(data.title, [new Comment(0, 0, data.text)]));
                    });
                    this.self = this;
                    this.posts = [];
                    this.AddPost(new Post("BOOM BOOM", [new Comment(5, 2, "Hey guise lel don't go to school tmrw"), new Comment(10, 2, "fake fake fake fake fake fake fake"), new Comment(0, 7, "YEAH RIGHT I DARE U!!!")]));
                    this.AddPost(new Post("Test test 123", [new Comment(5, 2, "Hello worldddddddddddddd")]));
                    this.AddPost(new Post("Plz say somethign smart", [new Comment(5, 2, "l2spell newb")]));
                    this.AddPost(new Post("SPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM", [new Comment(5, 2, "AAAAAAAAAAAAAAAAAAAAAAAMmmmmmm mmmmmmmmm aaaaaaaaa mmmmmmmmmmmmmb")]));
                    this.typedPost = "";
                    this.channels = [new Channel("random", "b"), new Channel("anime", "a"), new Channel("music", "m"), new Channel("random", "b"), new Channel("anime", "a"), new Channel("music", "m"), new Channel("random", "b"), new Channel("anime", "a"), new Channel("music", "m"), new Channel("random", "b"), new Channel("anime", "a"), new Channel("music", "m")];
                }
                AppComponent.prototype.SendPost = function () {
                    if (this.addPostText.trim() === "")
                        return;
                    this.socket.emit("send-post", { text: this.addPostText });
                    this.addPostText = "";
                };
                AppComponent.prototype.PostEntered = function ($event) {
                    if ($event.which == 13) {
                        for (var i = 0; i < this.posts.length; i++) {
                            if (this.posts[i].text === this.typedPost)
                                return;
                        }
                        this.AddNewPost(this.typedPost);
                        this.typedPost = "";
                    }
                };
                AppComponent.prototype.AddNewPost = function (post) {
                    this.AddPost(new Post(post, []));
                };
                AppComponent.prototype.AddPost = function (post) {
                    if (this.posts.length == 0) {
                        this.posts.push(post);
                        this.availableTags.push(post.text);
                        return;
                    }
                    for (var i = 0; i < this.posts.length; i++) {
                        if (this.posts[i].text.localeCompare(post.text) > 0) {
                            this.posts.splice(i, 0, post);
                            this.availableTags.splice(i, 0, post.text);
                            return;
                        }
                    }
                    this.posts.push(post);
                };
                AppComponent.prototype.ToggleComments = function (post) {
                    post.areCommentsVisible = !post.areCommentsVisible;
                    for (var i = 0; i < this.posts.length; i++) {
                        if (this.posts[i] == post)
                            continue;
                        this.posts[i].areCommentsVisible = false;
                    }
                };
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'lidit-app',
                        templateUrl: '/static/views/main.html'
                    }), 
                    __metadata('design:paramtypes', [])
                ], AppComponent);
                return AppComponent;
            })();
            exports_1("AppComponent", AppComponent);
            Channel = (function () {
                function Channel(name, abbrevation) {
                    this.Name = name;
                    this.Abbrevation = abbrevation;
                }
                return Channel;
            })();
            Post = (function () {
                function Post(txt, descs) {
                    this.typedComment = "";
                    this.image = "123";
                    if (descs.length == 0) {
                        this.firstComment = new Comment(0, 0, "No comments...");
                    }
                    else {
                        this.firstComment = descs[0];
                    }
                    this.areCommentsVisible = false;
                    this.text = txt;
                    this.comments = descs;
                }
                Post.prototype.AddComment = function (txt) {
                    console.log("clicked_" + txt);
                    this.comments.push(new Comment(0, 0, txt));
                    this.typedComment = "";
                };
                Post.prototype.AddTypedComment = function () {
                    if (this.typedComment.trim() == "")
                        return;
                    this.comments.push(new Comment(0, 0, this.typedComment));
                    this.typedComment = "";
                };
                Post.prototype.ButtonPressed = function ($event) {
                    if ($event.which == 13) {
                        this.AddTypedComment();
                    }
                };
                return Post;
            })();
            Comment = (function () {
                function Comment(ups, downs, txt) {
                    this.thumbDowns = downs;
                    this.thumbUps = ups;
                    this.text = txt;
                    this.Upvoted = false;
                    this.Downvoted = false;
                }
                Object.defineProperty(Comment.prototype, "Upvoted", {
                    set: function (b) {
                        if (b == true)
                            this.downvoted = false;
                        this.upvoted = b;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Comment.prototype, "Downvoted", {
                    set: function (b) {
                        if (b == true)
                            this.upvoted = false;
                        this.downvoted = b;
                    },
                    enumerable: true,
                    configurable: true
                });
                Comment.prototype.Value = function () {
                    return this.thumbUps - this.thumbDowns;
                };
                Comment.prototype.ToggleUpvote = function () {
                    this.Upvoted = !this.upvoted;
                };
                Comment.prototype.ToggleDownvote = function () {
                    this.Downvoted = !this.downvoted;
                };
                return Comment;
            })();
        }
    }
});
//# sourceMappingURL=app.component.js.map