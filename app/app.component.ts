import {Component} from 'angular2/core';
interface Hero {
    id: number;
    name: string;
}
@Component({
    selector: 'lidit-app',
    templateUrl: 'views/main.html'
})
export class AppComponent {
    posts: Array<Post>;
    channels: Array<Channel>;
    typedPost: string;
    showComment: boolean;
    availableTags: Array<string> = ["123"];

    constructor() {
        this.posts = [];
        this.AddPost(new Post("BOOM BOOM", [new Comment(5, 2, "Hey guise lel don't go to school tmrw"), new Comment(10, 2, "fake fake fake fake fake fake fake"), new Comment(0, 7, "YEAH RIGHT I DARE U!!!")]));
        this.AddPost(new Post("Test test 123", [new Comment(5, 2, "Hello worldddddddddddddd")]));
        this.AddPost(new Post("Plz say somethign smart", [new Comment(5, 2, "l2spell newb")]));
        this.AddPost(new Post("SPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM", [new Comment(5, 2, "AAAAAAAAAAAAAAAAAAAAAAAMmmmmmm mmmmmmmmm aaaaaaaaa mmmmmmmmmmmmmb")]));
        this.typedPost = "";
        this.showComment = false;
        
        this.channels = [new Channel("random","b"), new Channel("anime","a"),new Channel("music","m"),new Channel("random","b"), new Channel("anime","a"),new Channel("music","m"),new Channel("random","b"), new Channel("anime","a"),new Channel("music","m"),new Channel("random","b"), new Channel("anime","a"),new Channel("music","m")];
        
    }
    public PostEntered($event: any) {
        if ($event.which == 13) {
            for (var i = 0; i < this.posts.length; i++) {
                if (this.posts[i].text === this.typedPost) return;
            }
            this.AddNewPost(this.typedPost);
            this.typedPost = "";
        }
    }
    public AddNewPost(post: string) {
        this.AddPost(new Post(post, []));
    }
    public AddPost(post: Post) {
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
    }
    public ToggleComments(post: Post) {
        post.areCommentsVisible = !post.areCommentsVisible;
        for (var i = 0; i < this.posts.length; i++) {
            if (this.posts[i] == post) continue;
            this.posts[i].areCommentsVisible = false;
        }
    }
}

class Channel {
    Name:string;
    Abbrevation:string;
    constructor(name:string, abbrevation:string) {
        this.Name = name;
        this.Abbrevation = abbrevation;
    }
}

class Post {
    image: string;
    text: string;
    comments: Array<Comment>;
    firstComment: Comment;
    areCommentsVisible: boolean;
    typedComment: string = "";
    constructor(txt: string, descs: Array<Comment>) {
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
    public AddComment(txt: string) {
        console.log("clicked_" + txt);
        this.comments.push(new Comment(0, 0, txt));
        this.typedComment = "";
    }
    public AddTypedComment() {
        if (this.typedComment.trim() == "") return;
        this.comments.push(new Comment(0, 0, this.typedComment));
        this.typedComment = "";
    }
    public ButtonPressed($event: any) {
        if ($event.which == 13) {
            this.AddTypedComment();
        }
    }
}
class Comment {
    thumbUps: number;
    thumbDowns: number;
    downvoted: boolean;
    upvoted: boolean;

    public set Upvoted(b: boolean) {
        if (b == true) this.downvoted = false;
        this.upvoted = b;
    }
    public set Downvoted(b: boolean) {
        if (b == true) this.upvoted = false;
        this.downvoted = b;
    }


    text: string;
    constructor(ups: number, downs: number, txt: string) {
        this.thumbDowns = downs;
        this.thumbUps = ups;
        this.text = txt;
        this.Upvoted = false;
        this.Downvoted = false;
    }
    public Value(): number {
        return this.thumbUps - this.thumbDowns;
    }

    public ToggleUpvote() {
        this.Upvoted = !this.upvoted;
    }
    public ToggleDownvote() {
        this.Downvoted = !this.downvoted;
    }
}