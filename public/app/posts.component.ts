/// <reference path="../../typings/socket.io/socket.io-client.d.ts" />
import {Component, OnInit} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {SocketService} from './services/socket.service.js';
import {AddPostComponent} from './add-post.component.js';

@Component({
    templateUrl: "static/views/posts.html",
    directives: [AddPostComponent]
})
export class PostsComponent implements OnInit{
    socket: SocketIOClient.Socket;
    ch:string;
    posts: Array<Post> = [];
    commentText:string = "";
    
    constructor(
        private _routeParams: RouteParams,
        private _socketService:SocketService){
        
        this.socket = this._socketService.getSocket();
        this.socket.on('new-post', data => {
            this.AddPost(new Post(data.id, data.text,[]));
        });
        
        this.socket.on('new-comment', data => {
            for(var i = 0; i <this.posts.length;i++){
                if(this.posts[i].id == data.postId){
                    this.posts[i].AddComment(data.text);
                    return;
                }
            }
        });

        //this.AddPost(new Post(0,"BOOM BOOM", [new Comment(5, 2, "Hey guise lel don't go to school tmrw")]));
    }
    
    ngOnInit(){
        this.ch = this._routeParams.get('ch');
        this.socket.emit('join',{name:this.ch});
        
        this.socket.on('posts', arr=> arr.forEach(data => this.AddPost(new Post(data.id, data.text,[]))));
        // TODO load posts from mongo?
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
        this.commentText = "";
    }
    
    public SendComment(postId:number) {
        if (this.commentText.trim() === "") return;
        this.socket.emit("send-comment",{text:this.commentText,postId:postId,channel:this.ch});
        this.commentText="";
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
        this.comments.push(new Comment(0, 0, txt));
        this.typedComment = "";
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
    localState: number = CommentState.NONE;
    
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