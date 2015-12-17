import {Component} from 'angular2/core';
interface Hero {
    id: number;
    name: string;
}
@Component({
    selector: 'my-app',
    templateUrl: 'views/main.html'
})
export class AppComponent {
    posts: Array<Post>;
    channels: Array<Channel>;
    typedPost: string;
    showDescription: boolean;
    availableTags: Array<string> = ["123"];

    constructor() {
        this.posts = [];
        this.AddPost(new Post("BOOM BOOM", [new Description(5, 2, "Hey guise lel don't go to school tmrw"), new Description(10, 2, "fake fake fake fake fake fake fake"), new Description(0, 7, "YEAH RIGHT I DARE U!!!")]));
        this.AddPost(new Post("GTFO newfags", [new Description(5, 2, "Cry moar plz")]));
        this.AddPost(new Post("Plz say somethign smart", [new Description(5, 2, "l2spell newb")]));
        this.AddPost(new Post("SPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM", [new Description(5, 2, "AAAAAAAAAAAAAAAAAAAAAAAMmmmmmm mmmmmmmmm aaaaaaaaa mmmmmmmmmmmmmb")]));
        this.typedPost = "";
        this.showDescription = false;
        
        this.channels = [new Channel("random","b"), new Channel("anime","a"),new Channel("music","m")];
        
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
    public ToggleDescs(post: Post) {
        post.areDescsVisible = !post.areDescsVisible;
        for (var i = 0; i < this.posts.length; i++) {
            if (this.posts[i] == post) continue;
            this.posts[i].areDescsVisible = false;
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
    descriptions: Array<Description>;
    firstDescription: Description;
    areDescsVisible: boolean;
    typedDescription: string = "";
    constructor(txt: string, descs: Array<Description>) {
        this.image = "123";
        if (descs.length == 0) {
            this.firstDescription = new Description(0, 0, "No description available... Write one yourself!");
        }
        else {
            this.firstDescription = descs[0];
        }
        this.areDescsVisible = false;
        this.text = txt;
        this.descriptions = descs;
    }
    public AddDescription(txt: string) {
        console.log("clicked_" + txt);
        this.descriptions.push(new Description(0, 0, txt));
        this.typedDescription = "";
    }
    public AddTypedDescription() {
        if (this.typedDescription.trim() == "") return;
        this.descriptions.push(new Description(0, 0, this.typedDescription));
        this.typedDescription = "";
    }
    public ButtonPressed($event: any) {
        if ($event.which == 13) {
            this.AddTypedDescription();
        }
    }
}
class Description {
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