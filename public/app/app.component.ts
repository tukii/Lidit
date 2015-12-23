﻿/// <reference path="../../typings/socket.io/socket.io-client.d.ts" />
import {Component} from 'angular2/core';
import {AddPostComponent} from './add-post.component.js';

@Component({
    selector: 'lidit-app',
    templateUrl: '/static/views/main.html',
    directives: [AddPostComponent]
})
export class AppComponent {
    self:AppComponent;
    
    posts: Array<Post>;
    channels: Array<Channel>;
    socket: any;

    constructor() {
        this.socket = io.connect('http://localhost:8000');

        this.socket.on('connect',() => {
            console.log('connected'); 
        });
        
        this.socket.on('new-post',(data) =>{
            this.AddPost(new Post(data.id, data.text,[]))
        });
        
        this.socket.on('new-comment',(data) => {
            for(var i = 0; i <this.posts.length;i++){
                if(this.posts[i].id == data.postId){
                    this.posts[i].comments.push(new Comment(0,0,data.text));
                    return;
                }
            }
        })
        
        this.self = this;
        this.posts = [];
        
        this.AddPost(new Post(0,"BOOM BOOM", [new Comment(5, 2, "Hey guise lel don't go to school tmrw")]));
        /*this.AddPost(new Post(1,"Test test 123", []));
        this.AddPost(new Post(2,"Plz say somethign smart", []));
        this.AddPost(new Post(3,"SPAAAAAAAAAAAAAAAAAM",[]));
        
        
        this.AddPost(new Post(0,"BOOM BOOM", [new Comment(5, 2, "Hey guise lel don't go to school tmrw"), new Comment(10, 2, "fake fake fake fake fake fake fake"), new Comment(0, 7, "YEAH RIGHT I DARE U!!!")]));
        this.AddPost(new Post(1,"Test test 123", [new Comment(5, 2, "Hello worldddddddddddddd")]));
        this.AddPost(new Post(2,"Plz say somethign smart", [new Comment(5, 2, "l2spell newb")]));
        this.AddPost(new Post(3,"SPAAAAAAAAAAAAAAAAAM", [new Comment(5, 2, "AAAAAAAAAAAAAAAAAAAAAAAMmmmmmm mmmmmmmmm aaaaaaaaa mmmmmmmmmmmmmb")]));
        */
        
        this.channels = [new Channel("random","b"), new Channel("anime","a"),new Channel("music","m"),new Channel("random","b"), new Channel("anime","a"),new Channel("music","m"),new Channel("random","b"), new Channel("anime","a"),new Channel("music","m"),new Channel("random","b"), new Channel("anime","a"),new Channel("music","m")];
    }
    public AddPost(post: Post) {
        if (this.posts.length == 0) {
            this.posts.push(post);
            return;
        }
        this.posts.splice(1, 0, post);
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
    id: number;
    image: string;
    text: string;
    comments: Array<Comment> = [];
    firstComment: Comment;
    areCommentsVisible: boolean;
    typedComment: string = "";
    constructor(id:number, txt: string, comments?: Array<Comment>) {
        this.image = "123";
        this.id = id;
        if (comments.length === 0) {
            this.firstComment = new Comment(0, 0, "No comments...");
        }
        else {
            this.firstComment = comments[0];
        }
        this.areCommentsVisible = false;
        this.text = txt;
        this.comments = comments;
    }
    public AddComment(txt: string) {
        console.log("clicked_" + txt);
        this.comments.push(new Comment(0, 0, txt));
        this.typedComment = "";
    }
    public AddTypedComment() {
        if (this.typedComment.trim() === "") return;
        
    }
    public ButtonPressed($event: any) {
        if ($event.which === 13) {
            this.AddTypedComment();
        }
    }
}
class CommentState{
    static NONE:number = 0;
    static UPVOTED:number = 1;
    static DOWNVOTED:number = 2;
}
class Comment {
    id: number;
    thumbUps: number;
    thumbDowns: number;
    text: string;
    localState: number = CommentState.NONE; // compare this with CommentState
    
    constructor(ups: number, downs: number, txt: string) {
        this.thumbDowns = downs;
        this.thumbUps = ups;
        this.text = txt;
    }
    
    public get isUpvoted() : boolean {
        return this.localState === CommentState.UPVOTED;
    }
    
    public get isDownvoted() : boolean {
        return this.localState === CommentState.DOWNVOTED;
    }
    
    public ToggleUpvote() : void{
        //TODO send message to the server
        this.localState = CommentState.UPVOTED;
    }
    
    public ToggleDownvote() : void{
        //TODO send message to the server
        this.localState = CommentState.DOWNVOTED;
    }
        
    public Value(): number {
        return this.thumbUps - this.thumbDowns;
    }
}